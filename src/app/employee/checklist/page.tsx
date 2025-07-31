"use client";
import { useState, useEffect } from "react";

interface ChecklistTemplate {
  id: string;
  name: string; // 템플릿 이름 사용
  content: string;
  workplace: string;
  category: string;
  timeSlot: string;
  items?: ChecklistItem[];
  tags?: Tag[];
  // 그룹화를 위한 추가 속성들
  groupInstances?: any[];
  isCompleted?: boolean;
  notes?: string;
}

interface ChecklistItem {
  id: string;
  templateId: string;
  parentId?: string;
  type: string;
  content: string;
  instructions?: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  children?: ChecklistItem[];
  connectedItems?: ChecklistItemConnection[]; // 연결된 항목들
}

interface ChecklistItemConnection {
  id: string;
  checklistItemId: string;
  itemType: string; // "inventory", "precaution", "manual"
  itemId: string;
  order: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

interface Precaution {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  priority: number;
}

interface Manual {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  workplace: string;
  timeSlot: string;
  category: string;
  version: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface ChecklistItemResponse {
  id: string;
  content: string;
  instructions?: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

const workplaceOptions = [
  { value: "HALL", label: "홀" },
  { value: "KITCHEN", label: "주방" },
  { value: "COMMON", label: "공통" },
];

const timeSlotOptions = [
  { value: "PREPARATION", label: "준비" },
  { value: "IN_PROGRESS", label: "진행" },
  { value: "CLOSING", label: "마감" },
  { value: "COMMON", label: "공통" },
];

const categoryLabels = {
  CHECKLIST: "체크리스트",
  PRECAUTIONS: "주의사항",
  HYGIENE: "위생규정",
  SUPPLIES: "부대용품",
  INGREDIENTS: "재료",
  COMMON: "공통",
};

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistTemplate | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 체크리스트 항목 상태 관리
  const [checklistItems, setChecklistItems] = useState<{[key: string]: ChecklistItemResponse}>({});
  
  // 연결된 항목들의 상태 관리
  const [connectedItemsStatus, setConnectedItemsStatus] = useState<{[key: string]: any}>({});
  
  // 메모 입력 상태
  const [showMemoInputs, setShowMemoInputs] = useState<{[key: string]: boolean}>({});
  
  // 필터 상태
  const [filters, setFilters] = useState({
    workplace: "",
    timeSlot: "",
    category: ""
  });

  // 시간대 잠금 관련 상태
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);

  // 상세 작업 모달 관련 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [itemWorkData, setItemWorkData] = useState<any>({});
  const [savedProgress, setSavedProgress] = useState<{[key: string]: any}>({});

  // 연결된 항목의 실제 내용을 가져오는 함수
  const getConnectedItemDetails = async (itemType: string, itemId: string) => {
    try {
      const response = await fetch(`/api/employee/connected-items?type=${itemType}&id=${itemId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('연결된 항목 상세 정보 조회 오류:', error);
      return null;
    }
  };

  // 연결된 항목 상세 정보 상태
  const [connectedItemDetails, setConnectedItemDetails] = useState<{[key: string]: any}>({});

  // 연결된 항목 상세 정보 로드
  const loadConnectedItemDetails = async (item: any) => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      const details: {[key: string]: any} = {};
      
      for (const connection of item.connectedItems) {
        const key = `${connection.itemType}_${connection.itemId}`;
        if (!connectedItemDetails[key]) {
          const detail = await getConnectedItemDetails(connection.itemType, connection.itemId);
          if (detail) {
            details[key] = detail;
          }
        }
      }
      
      if (Object.keys(details).length > 0) {
        setConnectedItemDetails(prev => ({ ...prev, ...details }));
      }
    }
  };

  // 체크리스트 선택 시 연결된 항목 상세 정보 로드
  useEffect(() => {
    if (selectedChecklist && selectedChecklist.items) {
      selectedChecklist.items.forEach(item => {
        if (item.connectedItems && item.connectedItems.length > 0) {
          loadConnectedItemDetails(item);
        }
      });
    }
  }, [selectedChecklist]);

  // 현재 로그인한 직원 정보
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  // 현재 직원 정보 가져오기
  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch('/api/employee/checklist-progress', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.employee) {
          setCurrentEmployee(data.employee);
        }
      }
    } catch (error) {
      console.error('직원 정보 조회 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 직원 정보 가져오기
  useEffect(() => {
    fetchCurrentEmployee();
  }, []);

  useEffect(() => {
    fetchChecklists();
  }, []);

  // 체크리스트 진행 상태 가져오기
  const fetchProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/employee/checklist-progress?date=${today}`, {
        credentials: "include"
      });

      if (response.ok) {
        const progress = await response.json();
        console.log('기존 진행 상태:', progress);
        
        // 진행 상태를 체크리스트 항목 상태로 변환
        const itemsStatus: {[key: string]: ChecklistItemResponse} = {};
        const connectedStatus: {[key: string]: any} = {};
        
        progress.forEach((instance: any) => {
          itemsStatus[instance.templateId] = {
            id: instance.id,
            content: instance.content,
            isCompleted: instance.isCompleted,
            completedBy: instance.completedBy,
            completedAt: instance.completedAt,
            notes: instance.notes || ""
          };

          // 연결된 항목들의 진행 상태도 로드
          if (instance.connectedItemsProgress) {
            instance.connectedItemsProgress.forEach((connectedItem: any) => {
              connectedStatus[connectedItem.itemId] = {
                isCompleted: connectedItem.isCompleted,
                completedBy: connectedItem.completedBy,
                completedAt: connectedItem.completedAt,
                notes: connectedItem.notes || ""
              };
            });
          }
        });
        
        setChecklistItems(itemsStatus);
        setConnectedItemsStatus(connectedStatus);
      }
    } catch (error) {
      console.error('진행 상태 조회 오류:', error);
    }
  };

  const fetchTimeSlotStatuses = async () => {
    try {
      const response = await fetch('/api/employee/timeslot-status', {
        credentials: "include"
      });

      if (response.ok) {
        const statuses = await response.json();
        console.log('시간대 상태:', statuses);
      }
    } catch (error) {
      console.error('시간대 상태 조회 오류:', error);
    }
  };

  const checkExistingProgress = async () => {
    try {
      await fetchProgress();
      await fetchTimeSlotStatuses();
    } catch (error) {
      console.error('기존 진행 상태 확인 오류:', error);
    }
  };

  // 기존 진행 상태 로드
  const loadExistingProgress = (progress: any[]) => {
    const itemsStatus: {[key: string]: ChecklistItemResponse} = {};
    const connectedStatus: {[key: string]: any} = {};

    progress.forEach((instance: any) => {
      itemsStatus[instance.templateId] = {
        id: instance.id,
        content: instance.content,
        isCompleted: instance.isCompleted,
        completedBy: instance.completedBy,
        completedAt: instance.completedAt,
        notes: instance.notes || ""
      };

      // 연결된 항목들의 진행 상태도 로드
      if (instance.connectedItemsProgress) {
        instance.connectedItemsProgress.forEach((connectedItem: any) => {
          connectedStatus[connectedItem.itemId] = {
            isCompleted: connectedItem.isCompleted,
            completedBy: connectedItem.completedBy,
            completedAt: connectedItem.completedAt,
            notes: connectedItem.notes || ""
          };
        });
      }
    });

    setChecklistItems(itemsStatus);
    setConnectedItemsStatus(connectedStatus);
  };

  const fetchChecklists = async () => {
    try {
      // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
      const today = new Date().toISOString().split('T')[0];
      
      console.log('체크리스트 조회 시작, 날짜:', today);
      
      // checklist-progress API를 사용하여 실제 생성된 체크리스트 인스턴스 조회
      const response = await fetch(`/api/employee/checklist-progress?date=${today}`, { 
        credentials: "include" 
      });
      
      console.log('API 응답 상태:', response.status);
      
      if (response.ok) {
        const instances = await response.json();
        console.log('조회된 체크리스트 인스턴스:', instances);
        
        // 템플릿 그룹별로 그룹화
        const templateGroups = new Map<string, any[]>();
        
        instances.forEach((instance: any) => {
          // 템플릿 이름 생성 (위치, 시간대 형태)
          const templateName = `${getWorkplaceLabel(instance.workplace)}, ${getTimeSlotLabel(instance.timeSlot)}`;
          
          if (!templateGroups.has(templateName)) {
            templateGroups.set(templateName, []);
          }
          templateGroups.get(templateName)!.push(instance);
        });
        
        // 그룹화된 데이터를 체크리스트 형태로 변환
        const checklistsData = Array.from(templateGroups.entries()).map(([templateName, groupInstances]) => {
          // 첫 번째 인스턴스를 기준으로 템플릿 정보 생성
          const firstInstance = groupInstances[0];
          
          console.log('=== 그룹 처리 중 ===');
          console.log('템플릿 이름:', templateName);
          console.log('그룹 인스턴스 수:', groupInstances.length);
          console.log('첫 번째 인스턴스:', firstInstance);
          console.log('첫 번째 인스턴스 template:', firstInstance.template);
          console.log('첫 번째 인스턴스 template.items:', firstInstance.template?.items);
          
          // 모든 인스턴스의 항목들을 하나로 합침 (중복 제거)
          const allItems = groupInstances.flatMap((instance: any) => {
            console.log('인스턴스 처리 중:', instance.id);
            console.log('인스턴스 template.items:', instance.template?.items);
            return instance.template?.items || [];
          });
          
          console.log('모든 항목들 (중복 제거 전):', allItems);
          
          // 중복 제거 (같은 ID를 가진 항목은 하나만 유지)
          const uniqueItems = allItems.filter((item: any, index: number, self: any[]) => 
            index === self.findIndex((t: any) => t.id === item.id)
          );
          
          console.log('중복 제거된 항목들:', uniqueItems);
          
          return {
            id: templateName, // 템플릿 그룹 ID로 사용
            name: templateName, // 템플릿 그룹 이름
            content: templateName, // 템플릿 그룹 이름 (호환성)
            workplace: firstInstance.workplace,
            category: firstInstance.template.category,
            timeSlot: firstInstance.timeSlot,
            // 중복 제거된 항목들
            items: uniqueItems,
            tags: [],
            // 그룹 정보
            groupInstances: groupInstances,
            // 그룹의 완료 상태 (모든 인스턴스가 완료되었는지)
            isCompleted: groupInstances.every((instance: any) => instance.isCompleted),
            // 그룹의 메모 (첫 번째 인스턴스의 메모 사용)
            notes: firstInstance.notes || ""
          };
        });
        
        setChecklists(checklistsData);
        
        // 체크리스트 항목 초기화 (그룹 단위로)
        const initialItems: {[key: string]: ChecklistItemResponse} = {};
        checklistsData.forEach((group) => {
          initialItems[group.id] = {
            id: group.id, // 템플릿 그룹 ID로 사용
            content: group.content,
            isCompleted: group.isCompleted || false,
            notes: group.notes || "",
          };
        });
        setChecklistItems(initialItems);
        console.log('그룹화된 체크리스트:', checklistsData);
        console.log('초기화된 체크리스트 항목:', initialItems);

        // 체크리스트가 있으면 시간대 잠금 시도 및 기존 진행 상태 확인
        if (checklistsData.length > 0) {
          const lockResult = await lockTimeSlot(filters.workplace, filters.timeSlot);
          if (!lockResult.success) {
            // 다른 사람이 작성 중인 경우
            if (lockResult.details?.lockedBy) {
              setSelectedTimeSlot({
                workplace: filters.workplace,
                timeSlot: filters.timeSlot,
                lockedBy: lockResult.details.lockedBy,
                department: lockResult.details.department,
                lockedAt: lockResult.details.lockedAt
              });
              setShowTimeSlotModal(true);
            }
          } else {
            // 잠금 성공 시 기존 진행 상태 확인
            await checkExistingProgress();
          }
        }
      } else {
        console.error('체크리스트 불러오기 실패 - 상태:', response.status);
        const errorText = await response.text();
        console.error('에러 응답:', errorText);
        setError(`체크리스트를 불러오는데 실패했습니다. (${response.status})`);
      }
    } catch (error) {
      console.error('체크리스트 조회 오류:', error);
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 연결된 항목 체크박스 변경 핸들러
  const handleConnectedItemCheckboxChange = (connectionId: string, parentItemId: string) => {
    const isCompleted = !connectedItemsStatus[connectionId]?.isCompleted;
    
    // 먼저 연결항목 상태 업데이트
    const newConnectedStatus = {
      ...connectedItemsStatus,
      [connectionId]: {
        ...connectedItemsStatus[connectionId],
        isCompleted: isCompleted,
        completedBy: isCompleted ? currentEmployee?.name : undefined,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      }
    };
    
    setConnectedItemsStatus(newConnectedStatus);
    
    // 상위 항목 상태 즉시 업데이트
    const parentItem = selectedChecklist?.items?.find(item => item.id === parentItemId);
    if (parentItem && parentItem.connectedItems) {
      const allConnectedCompleted = parentItem.connectedItems.every(connection => 
        connection.id === connectionId ? isCompleted : newConnectedStatus[connection.id]?.isCompleted === true
      );
      
      setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => {
        return {
          ...prev,
          [parentItemId]: {
            ...prev[parentItemId],
            isCompleted: allConnectedCompleted,
            completedBy: allConnectedCompleted ? currentEmployee?.name : undefined,
            completedAt: allConnectedCompleted ? new Date().toISOString() : undefined
          }
        };
      });
    }
  };

  // 상위 항목 상태 업데이트
  const updateParentItemStatus = (parentItemId: string) => {
    const parentItem = selectedChecklist?.items?.find(item => item.id === parentItemId);
    if (parentItem && parentItem.connectedItems) {
      const allConnectedCompleted = parentItem.connectedItems.every(connection => 
        connectedItemsStatus[connection.id]?.isCompleted === true
      );
      
      // 모든 연결된 항목이 완료되면 상위 항목도 자동으로 완료
      setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => {
        const newItems = {
          ...prev,
          [parentItemId]: {
            ...prev[parentItemId],
            isCompleted: allConnectedCompleted,
            completedBy: allConnectedCompleted ? currentEmployee?.name : undefined,
            completedAt: allConnectedCompleted ? new Date().toISOString() : undefined
          }
        };
        return newItems;
      });
    }
  };

  // 접기/펼치기 상태 관리
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  // 항목 접기/펼치기 토글
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 체크박스 변경 핸들러 수정 - 연결항목이 있는 경우 체크 불가
  const handleCheckboxChange = (id: string) => {
    const item = selectedChecklist?.items?.find(item => item.id === id);
    
    // 연결항목이 있는 경우 직접 체크 불가
    if (item && item.connectedItems && item.connectedItems.length > 0) {
      // 연결항목이 펼쳐져 있지 않으면 펼치기
      if (!expandedItems[id]) {
        toggleItemExpansion(id);
      }
      return;
    }
    
    const isCompleted = !checklistItems[id]?.isCompleted;
    
    setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => {
      const newItems = {
        ...prev,
        [id]: {
          ...prev[id],
          isCompleted: isCompleted,
          completedBy: isCompleted ? currentEmployee?.name : undefined,
          completedAt: isCompleted ? new Date().toISOString() : undefined
        }
      };
      return newItems;
    });
    saveProgress(id);
  };

  // 진행상황 계산 함수
  const calculateProgress = () => {
    if (!selectedChecklist?.items) return { completed: 0, total: 0 };
    
    let completed = 0;
    let total = 0;
    
    selectedChecklist.items.forEach(item => {
      if (item.connectedItems && item.connectedItems.length > 0) {
        // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
        const allConnectedCompleted = item.connectedItems.every(connection => 
          connectedItemsStatus[connection.id]?.isCompleted
        );
        if (allConnectedCompleted) completed++;
        total++;
      } else {
        // 연결된 항목이 없는 경우, 메인 항목만 체크
        if (checklistItems[item.id]?.isCompleted) completed++;
        total++;
      }
    });
    
    return { completed, total };
  };

  const handleNotesChange = (id: string, notes: string) => {
    setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes
      }
    }));
  };

  const toggleMemoInput = (id: string) => {
    setShowMemoInputs((prev: {[key: string]: boolean}) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 상세 작업 모달 열기
  const openDetailModal = (item: ChecklistItem) => {
    setSelectedItem(item);
    
    // 저장된 진행 상태에서 데이터 불러오기
    const savedData = savedProgress[item.id];
    if (savedData) {
      setItemWorkData(savedData);
    } else {
      // 초기 데이터 설정
      setItemWorkData({
        currentStock: 0,
        updatedStock: 0,
        notes: "",
        isCompleted: false
      });
    }
    
    setShowDetailModal(true);
  };

  // 상세 작업 모달 닫기 (진행 상태 저장)
  const closeDetailModal = () => {
    if (selectedItem) {
      // 현재 작업 데이터를 저장된 진행 상태에 저장
      setSavedProgress((prev: any) => ({
        ...prev,
        [selectedItem.id]: itemWorkData
      }));
    }
    setShowDetailModal(false);
    setSelectedItem(null);
    setItemWorkData({});
  };

  // 재고 수량 업데이트
  const updateStock = async () => {
    if (!selectedItem || !itemWorkData.updatedStock) return;

    try {
      const response = await fetch('/api/employee/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemId: selectedItem.id,
          currentStock: itemWorkData.updatedStock
        })
      });

      if (response.ok) {
        // 성공 시 현재 수량 업데이트
        setItemWorkData((prev: any) => ({
          ...prev,
          currentStock: itemWorkData.updatedStock
        }));
        alert('재고 수량이 업데이트되었습니다.');
      } else {
        alert('재고 수량 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      alert('재고 수량 업데이트 중 오류가 발생했습니다.');
    }
  };

  const completeItem = () => {
    setItemWorkData((prev: any) => ({
      ...prev,
      isCompleted: !prev.isCompleted
    }));
  };

  const saveProgress = async (templateId: string) => {
    try {
      console.log('저장 시작:', templateId);
      console.log('현재 체크리스트 항목:', checklistItems);
      console.log('연결된 항목 상태:', connectedItemsStatus);

      // 선택된 체크리스트 그룹 찾기
      const selectedGroup = checklists.find(checklist => checklist.id === templateId);
      if (!selectedGroup || !selectedGroup.groupInstances) {
        console.error('선택된 그룹을 찾을 수 없습니다:', templateId);
        return;
      }

      // 그룹의 모든 인스턴스에 대해 저장
      const savePromises = selectedGroup.groupInstances.map(async (instance: any) => {
        const connectedItemsProgress = Object.entries(connectedItemsStatus).map(([itemId, status]) => ({
          itemId,
          currentStock: status.currentStock,
          updatedStock: status.updatedStock,
          isCompleted: status.isCompleted,
          notes: status.notes
        }));

        const saveData = {
          templateId: instance.template.id, // 실제 템플릿 ID 사용
          isCompleted: checklistItems[templateId]?.isCompleted || false,
          notes: checklistItems[templateId]?.notes || "",
          connectedItemsProgress
        };

        console.log('저장할 데이터:', saveData);

        const response = await fetch('/api/employee/checklist-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(saveData)
        });

        if (response.ok) {
          const result = await response.json();
          console.log('진행 상태가 저장되었습니다:', result);
          return { success: true, result };
        } else {
          const errorData = await response.json();
          console.error('진행 상태 저장 실패:', errorData);
          return { success: false, error: errorData };
        }
      });

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        console.log('모든 그룹 인스턴스가 성공적으로 저장되었습니다.');
        setSuccess('진행 상태가 저장되었습니다.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('일부 인스턴스 저장에 실패했습니다.');
        setError('일부 항목 저장에 실패했습니다.');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('진행 상태 저장 오류:', error);
      setError('저장 중 오류가 발생했습니다.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // 시간대별 체크리스트 잠금
  const lockTimeSlot = async (workplace: string, timeSlot: string) => {
    try {
      const response = await fetch('/api/employee/timeslot-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workplace,
          timeSlot,
          action: 'lock'
        })
      });

      if (response.ok) {
        await fetchTimeSlotStatuses();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error, details: errorData };
      }
    } catch (error) {
      console.error('시간대 잠금 오류:', error);
      return { success: false, error: '잠금 중 오류가 발생했습니다.' };
    }
  };

  // 시간대별 체크리스트 잠금 해제
  const unlockTimeSlot = async (workplace: string, timeSlot: string) => {
    try {
      const response = await fetch('/api/employee/timeslot-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workplace,
          timeSlot,
          action: 'unlock'
        })
      });

      if (response.ok) {
        await fetchTimeSlotStatuses();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error('시간대 잠금 해제 오류:', error);
      return { success: false, error: '잠금 해제 중 오류가 발생했습니다.' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 모든 체크리스트 항목 저장
      const savePromises = Object.keys(checklistItems).map(templateId => 
        saveProgress(templateId)
      );

      await Promise.all(savePromises);

      // 시간대 잠금 해제
      if (filters.workplace && filters.timeSlot) {
        await unlockTimeSlot(filters.workplace, filters.timeSlot);
      }

      setSuccess('체크리스트가 성공적으로 제출되었습니다.');
      setTimeout(() => {
        setSuccess('');
        setCurrentView('list');
      }, 2000);
    } catch (error) {
      console.error('체크리스트 제출 오류:', error);
      setError('제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getWorkplaceLabel = (value: string) => {
    const option = workplaceOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getTimeSlotLabel = (value: string) => {
    const option = timeSlotOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getCategoryLabel = (value: string) => {
    return categoryLabels[value as keyof typeof categoryLabels] || value;
  };

  // 체크리스트 상태 계산 함수
  const getChecklistStatus = (checklist: any) => {
    const instance = checklist.groupInstances?.[0];
    if (!instance) return { status: '미시작', color: 'gray', progress: null };
    
    if (instance.isSubmitted) {
      return { status: '제출 완료', color: 'green', progress: null };
    }
    
    if (instance.isCompleted) {
      return { status: '완료', color: 'blue', progress: null };
    }
    
    // 진행상황 계산
    const totalItems = checklist.items?.length || 0;
    if (totalItems === 0) return { status: '미시작', color: 'gray', progress: null };
    
    const completedItems = checklist.items?.filter((item: any) => {
      if (item.connectedItems && item.connectedItems.length > 0) {
        // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
        return item.connectedItems.every((connection: any) => 
          connectedItemsStatus[connection.id]?.isCompleted
        );
      } else {
        // 연결된 항목이 없는 경우, 메인 항목만 체크
        return checklistItems[item.id]?.isCompleted;
      }
    }).length || 0;
    
    if (completedItems === 0) {
      return { status: '미시작', color: 'gray', progress: null };
    } else if (completedItems === totalItems) {
      return { status: '완료', color: 'blue', progress: null };
    } else {
      return { 
        status: '진행중', 
        color: 'yellow', 
        progress: `${completedItems}/${totalItems}`
      };
    }
  };

  // 상태 정보 가져오기
  const getStatusInfo = (status: string) => {
    switch (status) {
      case '미시작':
        return {
          label: '미시작',
          color: 'bg-gray-100 text-gray-800',
          icon: '⭕'
        };
      case '진행중':
        return {
          label: '진행중',
          color: 'bg-yellow-100 text-yellow-800',
          icon: '🔄'
        };
      case '완료':
        return {
          label: '완료',
          color: 'bg-blue-100 text-blue-800',
          icon: '✅'
        };
      case '제출 완료':
        return {
          label: '제출 완료',
          color: 'bg-green-100 text-green-800',
          icon: '📤'
        };
      default:
        return {
          label: '미시작',
          color: 'bg-gray-100 text-gray-800',
          icon: '⭕'
        };
    }
  };

  const handleChecklistSelect = (checklist: ChecklistTemplate) => {
    setSelectedChecklist(checklist);
    setCurrentView('detail');
    
    // 기존 진행 상태 로드
    const existingInstance = checklist.groupInstances?.[0];
    if (existingInstance) {
      // 메인 항목 상태 복원
      setChecklistItems((prev) => ({
        ...prev,
        [checklist.id]: {
          id: existingInstance.id,
          content: checklist.content,
          isCompleted: existingInstance.isCompleted,
          completedBy: existingInstance.completedBy,
          completedAt: existingInstance.completedAt,
          notes: existingInstance.notes || ""
        }
      }));

      // 연결된 항목 상태 복원
      if (existingInstance.connectedItemsProgress) {
        const connectedStatus: {[key: string]: any} = {};
        existingInstance.connectedItemsProgress.forEach((connectedItem: any) => {
          connectedStatus[connectedItem.itemId] = {
            isCompleted: connectedItem.isCompleted,
            completedBy: connectedItem.completedBy,
            completedAt: connectedItem.completedAt,
            notes: connectedItem.notes || ""
          };
        });
        setConnectedItemsStatus(connectedStatus);
      }
    }
    
    // 연결된 항목 상세 정보 로드
    if (checklist.items) {
      checklist.items.forEach(item => {
        if (item.connectedItems && item.connectedItems.length > 0) {
          loadConnectedItemDetails(item);
        }
      });
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedChecklist(null);
    // 상태는 유지 (setChecklistItems와 setConnectedItemsStatus는 초기화하지 않음)
  };

  // 모든 항목이 체크되었는지 확인 (체크리스트 + 연결된 항목들)
  const allItemsChecked = checklists.every(checklist => {
    // 체크리스트 자체가 체크되어야 하고
    const checklistCompleted = checklistItems[checklist.id]?.isCompleted;
    
    // 연결된 항목들이 있다면 모든 항목이 완료되어야 함
    if (checklist.items && checklist.items.length > 0) {
      const allConnectedItemsCompleted = checklist.items.every(item => 
        connectedItemsStatus[item.id]?.isCompleted
      );
      return checklistCompleted && allConnectedItemsCompleted;
    }
    
    return checklistCompleted;
  });



  // 오늘 날짜 포맷팅
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">체크리스트</h1>
        <p className="text-lg text-gray-600 mb-8">{formattedDate}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* 목록 화면 */}
        {currentView === 'list' && (
          <>
            {/* 필터 설정 - 나중에 체크리스트가 많으면 사용 */}
            {/*
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">필터 설정</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위치
                  </label>
                  <select
                    value={filters.workplace}
                    onChange={(e) => setFilters({ ...filters, workplace: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  >
                    <option value="">전체</option>
                    {workplaceOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간대
                  </label>
                  <select
                    value={filters.timeSlot}
                    onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  >
                    <option value="">전체</option>
                    {timeSlotOptions.map((option) => (
                      <option key={option.value} value={option.value} className="text-gray-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구분
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  >
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <option key={value} value={value} className="text-gray-800">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            */}

            {/* 체크리스트 목록 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">오늘의 체크리스트</h2>
              
              {checklists.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>오늘 등록된 체크리스트가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checklists.map((checklist) => {
                    const status = getChecklistStatus(checklist);
                    const statusInfo = getStatusInfo(status.status);
                    
                    return (
                      <div 
                        key={checklist.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                          status.status === '제출 완료' 
                            ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                            : 'bg-white border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => {
                          if (status.status !== '제출 완료') {
                            handleChecklistSelect(checklist);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* 메인 제목과 상태 */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">
                                    {checklist.name || checklist.content}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                                    {statusInfo.icon} {statusInfo.label}
                                  </span>
                                  {status.progress && (
                                    <span className="text-sm text-gray-600">
                                      ({status.progress})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            


                            {/* 추가 정보 */}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  체크 항목: {checklist.items?.length || 0}개
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                  연결 항목: {checklist.items?.reduce((total, item) => {
                                    const itemConnections = item.connectedItems?.length || 0;
                                    const childConnections = item.children?.reduce((childTotal, child) => 
                                      childTotal + (child.connectedItems?.length || 0), 0) || 0;
                                    return total + itemConnections + childConnections;
                                  }, 0) || 0}개
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* 상세 화면 */}
        {currentView === 'detail' && selectedChecklist && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    뒤로
                  </button>
                  <div className="h-4 w-px bg-white/30"></div>
                  <h2 className="text-lg font-bold">
                    {selectedChecklist.name || selectedChecklist.content}
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-white/90">
                    {currentEmployee?.name || '직원'}
                  </div>
                  <div className="flex gap-1">
                    <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                      {getWorkplaceLabel(selectedChecklist.workplace)}
                    </span>
                    <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                      {getTimeSlotLabel(selectedChecklist.timeSlot)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 체크리스트 내용 */}
            <div className="p-4">
              {/* 진행 상황 표시 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">진행 상황</span>
                  <span className="text-xs text-gray-500">
                    {(() => {
                      const progress = calculateProgress();
                      return `${progress.completed} / ${progress.total} 완료`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(() => {
                        const progress = calculateProgress();
                        return progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
                      })()}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* 체크리스트 항목들 */}
              <div className="space-y-3">
                {selectedChecklist.items && selectedChecklist.items.length > 0 ? (
                  // 모든 항목을 표시 (parentId 필터링 제거)
                  selectedChecklist.items
                    .sort((a, b) => a.order - b.order)
                    .map((item) => {
                      const isCompleted = checklistItems[item.id]?.isCompleted || false;
                      
                      return (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                          {/* 메인 항목 헤더 */}
                          <div className={`px-4 py-3 ${isCompleted ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="checkbox"
                                  checked={checklistItems[item.id]?.isCompleted || false}
                                  onChange={() => handleCheckboxChange(item.id)}
                                  className={`mt-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                                    item.connectedItems && item.connectedItems.length > 0 ? 'cursor-pointer' : ''
                                  }`}
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-sm text-gray-800">
                                    {item.content}
                                  </h3>
                                  {item.instructions && (
                                    <p className="text-xs text-gray-600 mt-0.5">
                                      {item.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {/* 연결항목 개수 표시 */}
                                {item.connectedItems && item.connectedItems.length > 0 && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    연결항목 {item.connectedItems.length}개
                                  </span>
                                )}
                                
                                {/* 펼치기/접기 버튼 */}
                                {item.connectedItems && item.connectedItems.length > 0 && (
                                  <button
                                    onClick={() => toggleItemExpansion(item.id)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                  >
                                    <svg 
                                      className={`w-4 h-4 transition-transform ${expandedItems[item.id] ? 'rotate-180' : ''}`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                                
                                {isCompleted && (
                                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    완료
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* 체크한 사람 이름 표시 */}
                            {checklistItems[item.id]?.completedBy && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-gray-500">완료:</span>
                                <span className="text-xs font-medium text-green-700">
                                  {checklistItems[item.id].completedBy}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* 연결된 항목들 (펼쳐졌을 때만 표시) */}
                          {expandedItems[item.id] && item.connectedItems && item.connectedItems.length > 0 && (
                            <div className="bg-white p-4 space-y-3">
                              <div className="text-xs font-medium text-gray-700 mb-2">
                                연결된 세부항목
                              </div>
                              {item.connectedItems.map((connection) => {
                                const key = `${connection.itemType}_${connection.itemId}`;
                                const detail = connectedItemDetails[key];
                                const isDetailLoaded = !!detail;

                                return (
                                  <div key={connection.id} className="border border-gray-200 rounded p-2 bg-gray-50">
                                    <div className="flex items-start gap-2">
                                      <input
                                        type="checkbox"
                                        checked={connectedItemsStatus[connection.id]?.isCompleted || false}
                                        onChange={() => handleConnectedItemCheckboxChange(connection.id, item.id)}
                                        className="mt-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 mb-1">
                                          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                            {connection.itemType === 'inventory' ? '재고' : 
                                             connection.itemType === 'precaution' ? '주의' : '메뉴얼'}
                                          </span>
                                          <span className="font-medium text-xs text-gray-800 truncate">
                                            {isDetailLoaded ? 
                                              (detail.name || detail.title || '제목 없음') : 
                                              '로딩 중...'}
                                          </span>
                                        </div>
                                        
                                        {/* 태그 표시 */}
                                        {isDetailLoaded && detail.tags && detail.tags.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-1">
                                            {detail.tags.map((tag: any) => (
                                              <span 
                                                key={tag.id} 
                                                className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded"
                                              >
                                                {tag.name}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        
                                        {/* 연결된 항목의 상세 정보 */}
                                        <div className="text-xs text-gray-600 line-clamp-2">
                                          {isDetailLoaded ? 
                                            (detail.content || detail.description || '내용 없음') : 
                                            '로딩 중...'}
                                        </div>
                                        
                                        {/* 체크한 사람 이름 표시 */}
                                        {connectedItemsStatus[connection.id]?.completedBy && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <span className="text-xs text-gray-500">완료:</span>
                                            <span className="text-xs font-medium text-green-700">
                                              {connectedItemsStatus[connection.id].completedBy}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* 연결된 항목용 메모 입력 */}
                                    <div className="mt-2 ml-5">
                                      <button
                                        onClick={() => toggleMemoInput(connection.id)}
                                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        메모 {connectedItemsStatus[connection.id]?.notes ? '수정' : '추가'}
                                      </button>
                                      {showMemoInputs[connection.id] && (
                                        <div className="mt-1">
                                          <textarea
                                            value={connectedItemsStatus[connection.id]?.notes || ''}
                                            onChange={(e) => handleNotesChange(connection.id, e.target.value)}
                                            placeholder="메모를 입력하세요..."
                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                                            rows={2}
                                          />
                                        </div>
                                      )}
                                      {connectedItemsStatus[connection.id]?.notes && !showMemoInputs[connection.id] && (
                                        <div className="mt-1 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-700">
                                          {connectedItemsStatus[connection.id].notes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* 하위 항목이 없을 때 간소화된 메시지 */}
                          {(!item.connectedItems || item.connectedItems.length === 0) && (
                            <div className="px-4 py-2 bg-gray-50">
                              <div className="text-xs text-gray-400 italic">
                                연결된 세부항목 없음
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm font-medium mb-1">체크리스트 항목이 없습니다</p>
                    <p className="text-xs">이 체크리스트에는 아직 항목이 등록되지 않았습니다.</p>
                  </div>
                )}
              </div>

              {/* 하단 액션 버튼들 */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    총 {selectedChecklist.items?.length || 0}개 항목
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {(() => {
                      const progress = calculateProgress();
                      return `${progress.completed}개 완료`;
                    })()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => saveProgress(selectedChecklist.id)}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {submitting ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {submitting ? '제출 중...' : '제출'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 