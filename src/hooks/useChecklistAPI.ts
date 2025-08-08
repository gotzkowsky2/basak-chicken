import { useState } from 'react';
import { 
  ChecklistTemplate, 
  ChecklistItemResponse, 
  ConnectedItemStatus,
  ConnectedItemDetails,
  Employee 
} from '@/types/checklist';

export const useChecklistAPI = () => {
  // 연결된 항목 상세 정보를 가져오는 함수
  const getConnectedItemDetails = async (itemType: string, itemId: string): Promise<ConnectedItemDetails | null> => {
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

  // 체크리스트 진행 상태 가져오기
  const fetchProgress = async (date: string = new Date().toISOString().split('T')[0]) => {
    try {
      const response = await fetch(`/api/employee/checklist-progress?date=${date}`, {
        credentials: "include"
      });

      if (response.ok) {
        const progress = await response.json();
        console.log('기존 진행 상태:', progress);
        
        // 진행 상태를 체크리스트 항목 상태로 변환
        const itemsStatus: {[key: string]: ChecklistItemResponse} = {};
        const connectedStatus: {[key: string]: ConnectedItemStatus} = {};
        
        progress.forEach((instance: any) => {
          console.log('인스턴스 처리 중:', instance);
          
          // 개별 항목의 진행 상태 로드 (연결된 항목이 없는 항목만)
          if (instance.checklistItemProgresses) {
            console.log('checklistItemProgresses:', instance.checklistItemProgresses);
            instance.checklistItemProgresses.forEach((itemProgress: any) => {
              console.log('itemProgress:', itemProgress);
              
              // 연결된 항목이 있는지 확인
              const hasConnectedItems = instance.template?.items?.find((item: any) => 
                item.id === itemProgress.itemId && item.connectedItems && item.connectedItems.length > 0
              );
              
              // 연결된 항목이 없는 경우에만 직접 로드
              if (!hasConnectedItems) {
                itemsStatus[itemProgress.itemId] = {
                  id: itemProgress.itemId,
                  content: itemProgress.item?.content || '',
                  isCompleted: itemProgress.isCompleted,
                  completedBy: itemProgress.completedBy,
                  completedAt: itemProgress.completedAt,
                  notes: itemProgress.notes || ""
                };
              }
            });
          }

          // 연결된 항목들의 진행 상태도 로드
          if (instance.connectedItemsProgress) {
            console.log('=== 연결된 항목 진행 상태 로드 시작 ===');
            console.log('instance.connectedItemsProgress:', instance.connectedItemsProgress);
            instance.connectedItemsProgress.forEach((connectedItem: any) => {
              // connectionId를 키로 사용 (connection.id와 일치해야 함)
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
              console.log(`연결된 항목 ${key} 로드: isCompleted=${connectedItem.isCompleted}, completedBy=${connectedItem.completedBy}`);
            });
            console.log('최종 connectedStatus:', connectedStatus);
          } else {
            console.log('connectedItemsProgress가 없습니다.');
          }

          // 연결된 항목들의 상태를 기반으로 상위 체크리스트 항목들의 상태를 계산
          if (instance.template?.items) {
            instance.template.items.forEach((item: any) => {
              if (item.connectedItems && item.connectedItems.length > 0) {
                console.log(`=== 상위 항목 ${item.id} (${item.content}) 처리 중 ===`);
                console.log('연결된 항목들:', item.connectedItems);
                
                // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되었는지 확인
                const allConnectedCompleted = item.connectedItems.every((connection: any) => {
                  const key = connection.id; // connection.id를 키로 사용 (connectedStatus에서도 동일하게 사용)
                  const isCompleted = connectedStatus[key]?.isCompleted === true;
                  console.log(`연결된 항목 ${key}: ${isCompleted ? '완료' : '미완료'}`);
                  return isCompleted;
                });
                
                console.log(`모든 연결된 항목 완료 여부: ${allConnectedCompleted}`);
                
                // 상위 항목의 상태를 연결된 항목들의 상태에 따라 설정
                // 모든 연결된 항목이 완료되었을 때만 상위 항목도 완료
                if (allConnectedCompleted) {
                  // 연결된 항목 중 가장 최근에 완료된 항목의 completedBy 정보 사용
                  const lastCompletedItem = item.connectedItems
                    .map((connection: any) => ({
                      connection,
                      status: connectedStatus[connection.id]
                    }))
                    .filter((item: any) => item.status?.isCompleted)
                    .sort((a: any, b: any) => {
                      const dateA = a.status.completedAt ? new Date(a.status.completedAt).getTime() : 0;
                      const dateB = b.status.completedAt ? new Date(b.status.completedAt).getTime() : 0;
                      return dateB - dateA; // 최신 날짜가 앞으로
                    })[0];

                  itemsStatus[item.id] = {
                    id: item.id,
                    content: item.content || '',
                    isCompleted: true,
                    completedBy: lastCompletedItem?.status?.completedBy,
                    completedAt: lastCompletedItem?.status?.completedAt || new Date().toISOString(),
                    notes: ''
                  };
                  console.log(`상위 항목 ${item.id} 완료로 설정 (완료자: ${itemsStatus[item.id].completedBy})`);
                } else {
                  // 연결된 항목 중 하나라도 완료되지 않았으면 상위 항목도 완료되지 않음
                  itemsStatus[item.id] = {
                    id: item.id,
                    content: item.content || '',
                    isCompleted: false,
                    completedBy: undefined,
                    completedAt: undefined,
                    notes: ''
                  };
                  console.log(`상위 항목 ${item.id} 미완료로 설정`);
                }
              }
            });
          }
        });
        
        console.log('로드된 메인 항목 상태:', itemsStatus);
        console.log('로드된 연결 항목 상태:', connectedStatus);
        
        return { itemsStatus, connectedStatus };
      }
    } catch (error) {
      console.error('진행 상태 조회 오류:', error);
      return { itemsStatus: {}, connectedStatus: {} };
    }
  };

  // 체크리스트 목록 가져오기
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
            // 제출 완료 상태 (모든 인스턴스가 제출되었는지)
            isSubmitted: groupInstances.every((instance: any) => instance.isSubmitted),
            // 그룹의 메모 (첫 번째 인스턴스의 메모 사용)
            notes: firstInstance.notes || ""
          };
        });
        
        console.log('그룹화된 체크리스트:', checklistsData);
        return checklistsData;
      } else {
        console.error('체크리스트 불러오기 실패 - 상태:', response.status);
        const errorText = await response.text();
        console.error('에러 응답:', errorText);
        throw new Error(`체크리스트를 불러오는데 실패했습니다. (${response.status})`);
      }
    } catch (error) {
      console.error('체크리스트 조회 오류:', error);
      throw new Error("서버 오류가 발생했습니다.");
    }
  };

  // 진행 상태 저장
  const saveProgress = async (
    templateId: string, 
    currentChecklistItems: {[key: string]: ChecklistItemResponse}, 
    currentConnectedItemsStatus: {[key: string]: ConnectedItemStatus}
  ) => {
    try {
      console.log('=== saveProgress 시작 ===');
      console.log('전달받은 templateId:', templateId);
      console.log('현재 체크리스트 항목:', currentChecklistItems);
      console.log('연결된 항목 상태:', currentConnectedItemsStatus);

      const saveData = {
        templateId: templateId,
        isCompleted: false, // 계산된 완료 상태 사용
        notes: "", // 템플릿 레벨의 메모는 비워둠
        connectedItemsProgress: Object.entries(currentConnectedItemsStatus)
          .map(([connectionId, status]) => ({
            connectionId: connectionId,
            itemId: status.itemId,
            currentStock: status.currentStock,
            updatedStock: status.updatedStock,
            isCompleted: status.isCompleted,
            notes: status.notes || "",
            completedBy: status.completedBy,
            completedAt: status.completedAt
          })),
        checklistItemsProgress: Object.entries(currentChecklistItems)
          .filter(([_, item]) => item.isCompleted)
          .map(([itemId, item]) => ({
            itemId: itemId,
            isCompleted: item.isCompleted,
            notes: item.notes || "",
            completedBy: item.completedBy,
            completedAt: item.completedAt
          })),
        completedBy: "Unknown",
        completedAt: null
      };

      console.log('=== API에 전달할 데이터 ===');
      console.log('saveData:', JSON.stringify(saveData, null, 2));

      const response = await fetch('/api/employee/checklist-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(saveData)
      });

      console.log('API 응답 상태:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('진행 상태가 저장되었습니다:', result);
        return { success: true, result };
      } else {
        const errorData = await response.json();
        console.error('진행 상태 저장 실패:', errorData);
        return { success: false, error: errorData };
      }
    } catch (error) {
      console.error('진행 상태 저장 오류:', error);
      throw new Error('저장 중 오류가 발생했습니다.');
    }
  };

  // 재고 업데이트
  const updateInventory = async (itemId: string, currentStock: number, notes?: string) => {
    try {
      const response = await fetch('/api/employee/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId,
          currentStock: Math.round(currentStock),
          notes,
          needsRestock: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('재고 업데이트 성공:', result);
        return { success: true, result };
      } else {
        console.error('재고 업데이트 실패:', response.status);
        return { success: false, error: '재고 업데이트에 실패했습니다.' };
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      return { success: false, error: '재고 업데이트 중 오류가 발생했습니다.' };
    }
  };

  // 헬퍼 함수들
  const getWorkplaceLabel = (value: string) => {
    const workplaceOptions = [
      { value: 'KITCHEN', label: '주방' },
      { value: 'COUNTER', label: '카운터' },
      { value: 'STORAGE', label: '창고' },
      { value: 'COMMON', label: '공통' }
    ];
    const option = workplaceOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getTimeSlotLabel = (value: string) => {
    const timeSlotOptions = [
      { value: 'MORNING', label: '오전' },
      { value: 'AFTERNOON', label: '오후' },
      { value: 'EVENING', label: '저녁' },
      { value: 'NIGHT', label: '야간' },
      { value: 'COMMON', label: '공통' }
    ];
    const option = timeSlotOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return {
    getConnectedItemDetails,
    fetchProgress,
    fetchChecklists,
    saveProgress,
    updateInventory,
    getWorkplaceLabel,
    getTimeSlotLabel
  };
};
