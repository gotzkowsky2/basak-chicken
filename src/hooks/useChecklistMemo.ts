import { useMemo, useCallback } from 'react';
import { 
  ChecklistItem, 
  ConnectedItemStatus, 
  ChecklistTemplate,
  ChecklistStatus 
} from '@/types/checklist';
import { 
  calculateChecklistProgress, 
  isAllItemsCompleted, 
  getChecklistStatus,
  createDependencyArray 
} from '@/utils/checklistHelpers';

// 안전한 메모이제이션을 위한 커스텀 훅
export const useChecklistMemo = (
  items: ChecklistItem[],
  connectedStatus: {[key: string]: ConnectedItemStatus}
) => {
  // 의존성 배열 생성
  const dependencies = useMemo(() => {
    return createDependencyArray(items, connectedStatus);
  }, [items, connectedStatus]);

  // 진행 상태 메모이제이션
  const progress = useMemo(() => {
    return calculateChecklistProgress(items, connectedStatus);
  }, dependencies);

  // 모든 항목 완료 여부 메모이제이션
  const allCompleted = useMemo(() => {
    return isAllItemsCompleted(items, connectedStatus);
  }, dependencies);

  return {
    progress,
    allCompleted,
    dependencies
  };
};

// 체크리스트 상태 메모이제이션
export const useChecklistStatusMemo = (
  checklist: ChecklistTemplate,
  connectedItemsStatus: {[key: string]: ConnectedItemStatus}
) => {
  const status = useMemo(() => {
    return getChecklistStatus(checklist, connectedItemsStatus);
  }, [
    checklist.id,
    checklist.items?.length,
    checklist.groupInstances?.[0]?.isSubmitted,
    Object.keys(connectedItemsStatus).length,
    ...Object.entries(connectedItemsStatus).map(([key, status]) => `${key}:${status.isCompleted}`)
  ]);

  return status;
};

// 안전한 콜백 메모이제이션
export const useSafeCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T => {
  return useCallback(callback, dependencies);
};

// 체크리스트 필터링 메모이제이션
export const useFilteredChecklists = (
  checklists: ChecklistTemplate[],
  filters: { workplace: string; timeSlot: string; category: string }
) => {
  return useMemo(() => {
    return checklists.filter(checklist => {
      if (filters.workplace && checklist.workplace !== filters.workplace) return false;
      if (filters.timeSlot && checklist.timeSlot !== filters.timeSlot) return false;
      if (filters.category && checklist.category !== filters.category) return false;
      return true;
    });
  }, [checklists, filters.workplace, filters.timeSlot, filters.category]);
};
