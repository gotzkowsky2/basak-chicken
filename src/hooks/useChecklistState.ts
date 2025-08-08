import { useState, useEffect } from 'react';
import { 
  ChecklistTemplate, 
  ChecklistItemResponse, 
  ConnectedItemStatus, 
  ConnectedItemDetails,
  Employee 
} from '@/types/checklist';

export const useChecklistState = () => {
  // 체크리스트 목록
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistTemplate | null>(null);
  
  // 체크리스트 항목 상태
  const [checklistItems, setChecklistItems] = useState<{[key: string]: ChecklistItemResponse}>({});
  
  // 연결된 항목 상태
  const [connectedItemsStatus, setConnectedItemsStatus] = useState<{[key: string]: ConnectedItemStatus}>({});
  const [connectedItemDetails, setConnectedItemDetails] = useState<{[key: string]: ConnectedItemDetails}>({});
  
  // UI 상태
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  const [showMemoInputs, setShowMemoInputs] = useState<{[key: string]: boolean}>({});
  
  // 현재 직원 정보
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 체크리스트 선택
  const handleChecklistSelect = (checklist: ChecklistTemplate) => {
    setSelectedChecklist(checklist);
    
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
        const connectedStatus: {[key: string]: ConnectedItemStatus} = {};
        existingInstance.connectedItemsProgress.forEach((connectedItem) => {
          const key = connectedItem.connectionId || connectedItem.itemId;
          connectedStatus[key] = {
            connectionId: connectedItem.connectionId,
            itemId: connectedItem.itemId,
            isCompleted: connectedItem.isCompleted,
            completedBy: connectedItem.completedBy,
            completedAt: connectedItem.completedAt,
            notes: connectedItem.notes || "",
            currentStock: connectedItem.currentStock,
            updatedStock: connectedItem.updatedStock
          };
        });
        setConnectedItemsStatus(connectedStatus);
      }
    } else {
      // 기존 인스턴스가 없는 경우 상태 초기화
      setChecklistItems((prev) => ({
        ...prev,
        [checklist.id]: {
          id: '',
          content: checklist.content,
          isCompleted: false,
          completedBy: undefined,
          completedAt: undefined,
          notes: ""
        }
      }));
      setConnectedItemsStatus({});
    }
  };

  // 체크박스 변경
  const handleCheckboxChange = async (id: string) => {
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
    
    setChecklistItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        id: id,
        content: item?.content || '',
        isCompleted: isCompleted,
        completedBy: isCompleted ? currentEmployee?.name : undefined,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      }
    }));
  };

  // 연결된 항목 체크박스 변경
  const handleConnectedItemCheckboxChange = async (connectionId: string, parentItemId: string) => {
    const isCompleted = !connectedItemsStatus[connectionId]?.isCompleted;
    
    // 먼저 연결항목 상태 업데이트
    const newConnectedStatus = {
      ...connectedItemsStatus,
      [connectionId]: {
        ...connectedItemsStatus[connectionId],
        itemId: connectedItemsStatus[connectionId]?.itemId || connectionId,
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
        if (allConnectedCompleted) {
          // 연결된 항목 중 가장 최근에 완료된 항목의 completedBy 정보 사용
          const lastCompletedItem = parentItem.connectedItems
            ?.map((connection) => ({
              connection,
              status: newConnectedStatus[connection.id]
            }))
            ?.filter((item) => item.status?.isCompleted)
            ?.sort((a, b) => {
              const dateA = a.status.completedAt ? new Date(a.status.completedAt).getTime() : 0;
              const dateB = b.status.completedAt ? new Date(b.status.completedAt).getTime() : 0;
              return dateB - dateA; // 최신 날짜가 앞으로
            })[0];

          return {
            ...prev,
            [parentItemId]: {
              ...prev[parentItemId],
              isCompleted: true,
              completedBy: lastCompletedItem?.status?.completedBy || currentEmployee?.name,
              completedAt: lastCompletedItem?.status?.completedAt || new Date().toISOString()
            }
          };
        } else {
          return {
            ...prev,
            [parentItemId]: {
              ...prev[parentItemId],
              isCompleted: false,
              completedBy: undefined,
              completedAt: undefined
            }
          };
        }
      });
    }
  };

  // 항목 접기/펼치기 토글
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 메모 입력 토글
  const toggleMemoInput = (id: string) => {
    setShowMemoInputs((prev: {[key: string]: boolean}) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 메모 변경
  const handleNotesChange = (id: string, notes: string) => {
    // 메인 항목인지 연결 항목인지 확인
    const isConnectedItem = connectedItemsStatus[id];
    
    if (isConnectedItem) {
      // 연결 항목의 메모 업데이트
      setConnectedItemsStatus((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          notes
        }
      }));
    } else {
      // 메인 항목의 메모 업데이트
      setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => ({
        ...prev,
        [id]: {
          ...prev[id],
          notes
        }
      }));
    }
  };

  // 현재 직원 정보 가져오기
  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch('/api/employee/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          setCurrentEmployee(data);
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

  return {
    // 상태
    checklists,
    setChecklists,
    selectedChecklist,
    setSelectedChecklist,
    checklistItems,
    setChecklistItems,
    connectedItemsStatus,
    setConnectedItemsStatus,
    connectedItemDetails,
    setConnectedItemDetails,
    expandedItems,
    setExpandedItems,
    showMemoInputs,
    setShowMemoInputs,
    currentEmployee,
    setCurrentEmployee,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    submitting,
    setSubmitting,
    
    // 핸들러
    handleChecklistSelect,
    handleCheckboxChange,
    handleConnectedItemCheckboxChange,
    toggleItemExpansion,
    toggleMemoInput,
    handleNotesChange,
    fetchCurrentEmployee
  };
};
