import { 
  ChecklistItem, 
  ConnectedItemStatus, 
  ChecklistStatus,
  ChecklistTemplate,
  ChecklistInstance
} from "@/types/checklist";

// 메모이제이션을 위한 안전한 의존성 배열 생성
export const createDependencyArray = (items: ChecklistItem[], connectedStatus: {[key: string]: ConnectedItemStatus}) => {
  // 체크리스트 항목 ID들의 정렬된 배열
  const itemIds = items?.map(item => item.id).sort() || [];
  
  // 연결된 항목 상태의 키들
  const connectedKeys = Object.keys(connectedStatus).sort();
  
  // 완료된 항목 수
  const completedCount = items?.filter(item => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      return item.connectedItems.every(connection => 
        connectedStatus[connection.id]?.isCompleted
      );
    }
    return false;
  }).length || 0;
  
  return [itemIds.join(','), connectedKeys.join(','), completedCount];
};

// 체크리스트 진행 상태 계산 (메모이제이션 안전)
export const calculateChecklistProgress = (
  items: ChecklistItem[], 
  connectedStatus: {[key: string]: ConnectedItemStatus}
): { completed: number; total: number } => {
  let completed = 0;
  let total = 0;
  
  items.forEach(item => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
      const allConnectedCompleted = item.connectedItems.every(connection => 
        connectedStatus[connection.id]?.isCompleted
      );
      if (allConnectedCompleted) completed++;
      total++;
    } else {
      // 연결된 항목이 없는 경우, 메인 항목만 체크
      total++;
    }
  });
  
  return { completed, total };
};

// 모든 항목이 완료되었는지 확인 (메모이제이션 안전)
export const isAllItemsCompleted = (
  items: ChecklistItem[], 
  connectedStatus: {[key: string]: ConnectedItemStatus}
): boolean => {
  if (!items || items.length === 0) return false;
  
  return items.every(item => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
      return item.connectedItems.every(connection => 
        connectedStatus[connection.id]?.isCompleted
      );
    } else {
      // 연결된 항목이 없는 경우, 항상 true (메인 항목은 직접 체크되지 않음)
      return true;
    }
  });
};

// 체크리스트 상태 계산 (메모이제이션 안전)
export const getChecklistStatus = (
  checklist: ChecklistTemplate,
  connectedItemsStatus: {[key: string]: ConnectedItemStatus}
): ChecklistStatus => {
  const instance = checklist.groupInstances?.[0];
  if (!instance) {
    return { 
      status: '미시작', 
      color: 'gray', 
      progress: undefined, 
      connectedItems: undefined 
    };
  }
  
  if (instance.isSubmitted) {
    return { 
      status: '제출 완료', 
      color: 'green', 
      progress: undefined, 
      connectedItems: undefined 
    };
  }
  
  // 진행상황 계산 - 실제 체크 상태 기반
  const totalItems = checklist.items?.length || 0;
  if (totalItems === 0) {
    return { 
      status: '미시작', 
      color: 'gray', 
      progress: undefined, 
      connectedItems: undefined 
    };
  }
  
  const completedItems = checklist.items?.filter((item: ChecklistItem) => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
      return item.connectedItems.every((connection) => 
        connectedItemsStatus[connection.id]?.isCompleted
      );
    } else {
      // 연결된 항목이 없는 경우, 항상 false (메인 항목은 직접 체크되지 않음)
      return false;
    }
  }).length || 0;
  
  // 연결된 항목 종류별 개수 계산
  const connectedItemsCount = {
    inventory: 0,
    precaution: 0,
    manual: 0
  };
  
  checklist.items?.forEach((item: ChecklistItem) => {
    if (item.connectedItems && item.connectedItems.length > 0) {
      item.connectedItems.forEach((connection) => {
        if (connection.itemType === 'inventory') {
          connectedItemsCount.inventory++;
        } else if (connection.itemType === 'precaution') {
          connectedItemsCount.precaution++;
        } else if (connection.itemType === 'manual') {
          connectedItemsCount.manual++;
        }
      });
    }
  });
  
  // 퍼센트 계산
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  if (completedItems === 0) {
    return { 
      status: '미시작', 
      color: 'gray', 
      progress: `${progressPercent}%`, 
      connectedItems: connectedItemsCount
    };
  } else if (completedItems === totalItems) {
    return { 
      status: '완료', 
      color: 'blue', 
      progress: `${progressPercent}%`, 
      connectedItems: connectedItemsCount
    };
  } else {
    return { 
      status: '진행중', 
      color: 'yellow', 
      progress: `${progressPercent}%`, 
      connectedItems: connectedItemsCount
    };
  }
};

// 상태 정보 가져오기
export const getStatusInfo = (status: string) => {
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

// 연결된 항목 상태 복원
export const restoreConnectedItemsStatus = (
  instances: ChecklistInstance[]
): {[key: string]: ConnectedItemStatus} => {
  const connectedStatus: {[key: string]: ConnectedItemStatus} = {};
  
  instances.forEach((instance) => {
    if (instance.connectedItemsProgress) {
      instance.connectedItemsProgress.forEach((connectedItem) => {
        const key = connectedItem.connectionId;
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
    }
  });
  
  return connectedStatus;
};

// 체크리스트 항목 상태 복원
export const restoreChecklistItemsStatus = (
  instances: ChecklistInstance[]
): {[key: string]: any} => {
  const itemsStatus: {[key: string]: any} = {};
  
  instances.forEach((instance) => {
    if (instance.checklistItemProgresses) {
      instance.checklistItemProgresses.forEach((itemProgress) => {
        itemsStatus[itemProgress.itemId] = {
          id: itemProgress.itemId,
          content: itemProgress.item?.content || '',
          isCompleted: itemProgress.isCompleted,
          completedBy: itemProgress.completedBy,
          completedAt: itemProgress.completedAt,
          notes: itemProgress.notes || ""
        };
      });
    }
  });
  
  return itemsStatus;
};
