"use client";
import { useState, useEffect } from "react";

interface ChecklistTemplate {
  id: string;
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
  inventoryItem?: InventoryItem;
  precautions?: Precaution[];
  manuals?: Manual[];
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
  templateId: string;
  isCompleted: boolean;
  notes: string;
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
  MANUAL: "매뉴얼",
};

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checklistItems, setChecklistItems] = useState<{[key: string]: ChecklistItemResponse}>({});
  const [showMemoInputs, setShowMemoInputs] = useState<{[key: string]: boolean}>({});
  const [selectedDetailItem, setSelectedDetailItem] = useState<ChecklistItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stockUpdateData, setStockUpdateData] = useState({
    itemId: "",
    newStock: 0,
    notes: ""
  });
  const [showStockModal, setShowStockModal] = useState(false);
  const [purchaseRequestData, setPurchaseRequestData] = useState({
    itemId: "",
    quantity: 0,
    reason: ""
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [timeSlotStatuses, setTimeSlotStatuses] = useState<any[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [filters, setFilters] = useState({
    workplace: "",
    timeSlot: "",
    category: "CHECKLIST"
  });

  // 새로운 상태 변수들 추가
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistTemplate | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [checklistStatuses, setChecklistStatuses] = useState<{[key: string]: 'not_started' | 'in_progress' | 'completed'}>({});

  // 누락된 상태 변수들 추가
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [notes, setNotes] = useState("");
  const [connectedItemsStatus, setConnectedItemsStatus] = useState<{[key: string]: {
    currentStock: number;
    updatedStock: number;
    isCompleted: boolean;
    notes: string;
  }}>({});
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [itemWorkData, setItemWorkData] = useState<{
    currentStock?: number;
    updatedStock?: number;
    notes?: string;
    isCompleted?: boolean;
  }>({});
  const [savedProgress, setSavedProgress] = useState<{[key: string]: any}>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  useEffect(() => {
    fetchChecklists();
    fetchProgress();
    fetchTimeSlotStatuses();
  }, [filters]);

  // 체크리스트 항목이나 연결된 항목 상태가 변경될 때 자동 저장
  useEffect(() => {
    console.log('자동 저장 useEffect 트리거됨');
    console.log('체크리스트 개수:', checklists.length);
    console.log('체크리스트 항목:', checklistItems);
    console.log('연결된 항목 상태:', connectedItemsStatus);
    
    if (checklists.length > 0) {
      checklists.forEach(checklist => {
        console.log(`체크리스트 ${checklist.id} 저장 시도`);
        if (checklistItems[checklist.id]) {
          saveProgress(checklist.id);
        } else {
          console.log(`체크리스트 ${checklist.id}에 대한 항목이 없음`);
        }
      });
    }
  }, [checklistItems, connectedItemsStatus]);

  // 진행 상태 불러오기
  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/employee/checklist-progress', {
        credentials: 'include'
      });

      if (response.ok) {
        const progressData = await response.json();
        
        // 체크리스트 항목 상태 복원
        const checklistItemsState: {[key: string]: ChecklistItemResponse} = {};
        const connectedItemsState: {[key: string]: any} = {};
        const savedProgressState: {[key: string]: any} = {};

        progressData.forEach((progress: any) => {
          // 체크리스트 항목 상태
          checklistItemsState[progress.templateId] = {
            templateId: progress.templateId,
            isCompleted: progress.isCompleted,
            notes: progress.notes || ""
          };

          // 연결된 항목들의 상태
          progress.connectedItemsProgress.forEach((itemProgress: any) => {
            connectedItemsState[itemProgress.itemId] = {
              currentStock: itemProgress.currentStock || 0,
              updatedStock: itemProgress.updatedStock || 0,
              isCompleted: itemProgress.isCompleted,
              notes: itemProgress.notes || ""
            };

            savedProgressState[itemProgress.itemId] = {
              currentStock: itemProgress.currentStock || 0,
              updatedStock: itemProgress.updatedStock || 0,
              isCompleted: itemProgress.isCompleted,
              notes: itemProgress.notes || ""
            };
          });
        });

        setChecklistItems(checklistItemsState);
        setConnectedItemsStatus(connectedItemsState);
        setSavedProgress(savedProgressState);
      }
    } catch (error) {
      console.error('진행 상태 불러오기 오류:', error);
    }
  };

  // 시간대별 체크리스트 상태 불러오기
  const fetchTimeSlotStatuses = async () => {
    try {
      const response = await fetch('/api/employee/timeslot-status', {
        credentials: 'include'
      });

      if (response.ok) {
        const statusData = await response.json();
        setTimeSlotStatuses(statusData);
      }
    } catch (error) {
      console.error('시간대별 상태 불러오기 오류:', error);
    }
  };

  // 작성 중인 체크리스트 확인
  const checkExistingProgress = async () => {
    try {
      const response = await fetch('/api/employee/checklist-progress', {
        credentials: 'include'
      });

      if (response.ok) {
        const progressData = await response.json();
        
        // 현재 필터와 일치하는 진행 중인 체크리스트가 있는지 확인
        const existingProgress = progressData.find((progress: any) => {
          return progress.template.workplace === filters.workplace && 
                 progress.template.timeSlot === filters.timeSlot &&
                 !progress.isSubmitted; // 제출되지 않은 것만
        });

        if (existingProgress) {
          // 작성 중인 체크리스트가 있음을 알림
          const shouldContinue = confirm(
            `${getWorkplaceLabel(filters.workplace)} - ${getTimeSlotLabel(filters.timeSlot)} 체크리스트가 작성 중입니다.\n\n이어서 작성하시겠습니까?`
          );

          if (shouldContinue) {
            // 기존 진행 상태를 불러와서 계속 작성
            await loadExistingProgress(existingProgress);
          }
        }
      }
    } catch (error) {
      console.error('기존 진행 상태 확인 오류:', error);
    }
  };

  // 기존 진행 상태 불러오기
  const loadExistingProgress = async (progress: any) => {
    // 체크리스트 항목 상태 복원
    const checklistItemsState: {[key: string]: ChecklistItemResponse} = {};
    const connectedItemsState: {[key: string]: any} = {};
    const savedProgressState: {[key: string]: any} = {};

    // 체크리스트 항목 상태
    checklistItemsState[progress.templateId] = {
      templateId: progress.templateId,
      isCompleted: progress.isCompleted,
      notes: progress.notes || ""
    };

    // 연결된 항목들의 상태
    progress.connectedItemsProgress.forEach((itemProgress: any) => {
      connectedItemsState[itemProgress.itemId] = {
        currentStock: itemProgress.currentStock || 0,
        updatedStock: itemProgress.updatedStock || 0,
        isCompleted: itemProgress.isCompleted,
        notes: itemProgress.notes || ""
      };

      savedProgressState[itemProgress.itemId] = {
        currentStock: itemProgress.currentStock || 0,
        updatedStock: itemProgress.updatedStock || 0,
        isCompleted: itemProgress.isCompleted,
        notes: itemProgress.notes || ""
      };
    });

    setChecklistItems(checklistItemsState);
    setConnectedItemsStatus(connectedItemsState);
    setSavedProgress(savedProgressState);
  };

  const fetchChecklists = async () => {
    try {
      // checklist-progress API를 사용하여 실제 생성된 체크리스트 인스턴스 조회
      const response = await fetch('/api/employee/checklist-progress', { 
        credentials: "include" 
      });
      
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
            content: templateName, // 템플릿 그룹 이름
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
            templateId: group.id,
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
        setError("체크리스트를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error('체크리스트 조회 오류:', error);
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    console.log(`체크박스 변경 호출됨: ${id}`);
    
    setChecklistItems(prev => {
      const newItems = {
        ...prev,
        [id]: {
          ...prev[id],
          isCompleted: !prev[id].isCompleted
        }
      };
      console.log('체크박스 변경 후 새로운 상태:', newItems);
      return newItems;
    });

    // 즉시 진행 상태 저장
    console.log(`체크박스 변경 후 저장 호출: ${id}`);
    saveProgress(id);
  };

  const handleNotesChange = (id: string, notes: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes
      }
    }));
  };

  const toggleMemoInput = (id: string) => {
    setShowMemoInputs(prev => ({
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
        currentStock: item.inventoryItem?.currentStock || 0,
        updatedStock: item.inventoryItem?.currentStock || 0,
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
          itemId: selectedItem.inventoryItem?.id,
          currentStock: itemWorkData.updatedStock
        })
      });

      if (response.ok) {
        // 성공 시 현재 수량 업데이트
        setItemWorkData(prev => ({
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

  // 항목 완료 처리
  const completeItem = () => {
    if (!selectedItem) return;

    // 재고 수량이 업데이트되었는지 확인
    const isStockUpdated = itemWorkData.currentStock === itemWorkData.updatedStock;

    if (!isStockUpdated) {
      alert('재고를 확인하고 수량을 업데이트해주세요.');
      return;
    }

    // 연결된 항목 상태 업데이트
    setConnectedItemsStatus(prev => ({
      ...prev,
      [selectedItem.id]: {
        currentStock: itemWorkData.currentStock || 0,
        updatedStock: itemWorkData.updatedStock || 0,
        isCompleted: true,
        notes: itemWorkData.notes || ""
      }
    }));

    setItemWorkData(prev => ({
      ...prev,
      isCompleted: true
    }));

    alert('항목이 완료되었습니다.');
    closeDetailModal();
  };

  // 진행 상태 저장
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
      } else {
        console.error('일부 인스턴스 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('진행 상태 저장 오류:', error);
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
    setError("");
    setSuccess("");

    const completedItems = Object.values(checklistItems).filter(item => item.isCompleted);

    if (completedItems.length === 0) {
      setError("체크된 항목이 없습니다. 제출할 수 없습니다.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/employee/checklist-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workplace: filters.workplace,
          timeSlot: filters.timeSlot,
          category: filters.category,
          completedItems,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("체크리스트가 성공적으로 제출되었습니다.");
        setNotes("");
        // 체크리스트 항목 초기화
        const initialItems: {[key: string]: ChecklistItemResponse} = {};
        checklists.forEach((item: ChecklistTemplate) => {
          initialItems[item.id] = {
            templateId: item.id,
            isCompleted: false,
            notes: "",
          };
        });
        setChecklistItems(initialItems);
        // 3초 후 성공 메시지 제거
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "체크리스트 제출에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const getWorkplaceLabel = (value: string) => {
    return workplaceOptions.find(option => option.value === value)?.label || value;
  };

  const getTimeSlotLabel = (value: string) => {
    return timeSlotOptions.find(option => option.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return categoryLabels[value as keyof typeof categoryLabels] || value;
  };

  // 체크리스트 상태 계산 함수
  const getChecklistStatus = (checklist: ChecklistTemplate) => {
    const itemResponses = checklistItems[checklist.id];
    if (!itemResponses) return 'not_started';
    
    if (itemResponses.isCompleted) return 'completed';
    return 'in_progress';
  };

  // 체크리스트 선택 함수
  const handleChecklistSelect = (checklist: ChecklistTemplate) => {
    setSelectedChecklist(checklist);
    setCurrentView('detail');
  };

  // 목록으로 돌아가기 함수
  const handleBackToList = () => {
    setSelectedChecklist(null);
    setCurrentView('list');
  };

  // 상태별 색상 및 텍스트
  const getStatusInfo = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'not_started':
        return { color: 'text-gray-500', bgColor: 'bg-gray-100', text: '미시작' };
      case 'in_progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', text: '작성중' };
      case 'completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100', text: '완료' };
    }
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

  // 디버깅용 로그
  console.log('체크리스트 항목 상태:', checklistItems);
  console.log('모든 항목이 체크되었나요?', allItemsChecked);
  console.log('총 항목 수:', Object.values(checklistItems).length);
  console.log('체크된 항목 수:', Object.values(checklistItems).filter(item => item.isCompleted).length);

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
            {/* 필터 */}
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
                    const statusInfo = getStatusInfo(status);
                    
                    return (
                      <div 
                        key={checklist.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleChecklistSelect(checklist)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {checklist.content}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 text-sm text-gray-600">
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {getWorkplaceLabel(checklist.workplace)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {getTimeSlotLabel(checklist.timeSlot)}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 rounded">
                                {getCategoryLabel(checklist.category)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  목록으로 돌아가기
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mt-2">
                  {selectedChecklist.content}
                </h2>
              </div>
              
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {getWorkplaceLabel(selectedChecklist.workplace)}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {getTimeSlotLabel(selectedChecklist.timeSlot)}
                </span>
              </div>
            </div>

            {/* 체크리스트 항목들 */}
            <div className="space-y-4">
              {/* 디버깅 정보 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <div className="text-sm text-yellow-800">
                  <strong>디버깅 정보:</strong><br/>
                  - selectedChecklist.id: {selectedChecklist.id}<br/>
                  - selectedChecklist.items 길이: {selectedChecklist.items?.length || 0}<br/>
                  - groupInstances 길이: {selectedChecklist.groupInstances?.length || 0}<br/>
                  - groupInstances 첫 번째 인스턴스 items 길이: {selectedChecklist.groupInstances?.[0]?.template?.items?.length || 0}<br/>
                  - groupInstances 첫 번째 인스턴스 template ID: {selectedChecklist.groupInstances?.[0]?.template?.id || 'N/A'}
                </div>
              </div>

              {selectedChecklist.items && selectedChecklist.items.length > 0 ? (
                selectedChecklist.items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    {/* 카테고리 헤더 */}
                    <div className="flex items-start gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={checklistItems[item.id]?.isCompleted || false}
                        onChange={() => handleCheckboxChange(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-800 mb-1">
                          {item.content}
                        </div>
                        {item.instructions && (
                          <div className="text-sm text-gray-600 mb-2">
                            {item.instructions}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 하위 항목들 */}
                    {item.children && item.children.length > 0 && (
                      <div className="ml-8 space-y-2">
                        {item.children.map((child) => (
                          <div key={child.id} className="border-l-2 border-gray-200 pl-4 py-2">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checklistItems[child.id]?.isCompleted || false}
                                onChange={() => handleCheckboxChange(child.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 mb-1">
                                  {child.content}
                                </div>
                                {child.instructions && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    {child.instructions}
                                  </div>
                                )}
                                
                                {/* 연결된 항목들 */}
                                {child.inventoryItem && (
                                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                                    <div className="text-sm font-medium text-blue-800 mb-1">
                                      재고 확인: {child.inventoryItem.name}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      현재: {child.inventoryItem.currentStock} {child.inventoryItem.unit}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 카테고리 자체가 항목인 경우 (하위 항목이 없는 경우) */}
                    {(!item.children || item.children.length === 0) && (
                      <div className="ml-8">
                        <div className="text-sm text-gray-500 italic">
                          이 카테고리는 체크만 하면 됩니다.
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>이 체크리스트에는 세부 항목이 없습니다.</p>
                  <p className="text-sm mt-2">groupInstances 데이터를 확인해주세요.</p>
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => saveProgress(selectedChecklist.id)}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 