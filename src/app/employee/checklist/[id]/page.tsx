"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ChecklistTemplate, 
  ChecklistItemResponse 
} from "@/types/checklist";
import { 
  ChecklistDetailView
} from "@/components/checklist";
import Toast from "@/components/ui/Toast";

export default function ChecklistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const checklistId = params?.id as string;
  
  const [checklist, setChecklist] = useState<ChecklistTemplate | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
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
  
  // 확장 상태
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});
  
  // 연결된 항목 상세 정보 상태
  const [connectedItemDetails, setConnectedItemDetails] = useState<{[key: string]: any}>({});

  // 토스트 알림 상태
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  } | null>(null);

  // 토스트 알림 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, show: true });
  };

  // 라벨 함수들
  const getWorkplaceLabel = (value: string) => {
    const workplaceLabels: {[key: string]: string} = {
      'HALL': '홀',
      'KITCHEN': '주방',
      'COMMON': '공통'
    };
    return workplaceLabels[value] || value;
  };

  const getTimeSlotLabel = (value: string) => {
    const timeSlotLabels: {[key: string]: string} = {
      'PREPARATION': '준비',
      'IN_PROGRESS': '진행',
      'CLOSING': '마감',
      'COMMON': '공통'
    };
    return timeSlotLabels[value] || value;
  };

  // 현재 직원 정보 가져오기
  const fetchCurrentEmployee = async () => {
    try {
      const response = await fetch('/api/employee/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const employee = await response.json();
        setCurrentEmployee(employee);
      }
    } catch (error) {
      console.error('직원 정보 조회 오류:', error);
    }
  };

  // 체크리스트 상세 정보 가져오기
  const fetchChecklistDetail = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // URL 디코딩
      const decodedChecklistId = decodeURIComponent(checklistId);
      
      console.log('상세 페이지 - checklistId:', checklistId);
      console.log('상세 페이지 - decodedChecklistId:', decodedChecklistId);
      console.log('상세 페이지 - today:', today);
      
      // checklist-progress API를 사용하여 실제 생성된 체크리스트 인스턴스 조회
      const response = await fetch(`/api/employee/checklist-progress?date=${today}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('체크리스트 조회에 실패했습니다.');
      }
      
      const instances = await response.json();
      console.log('상세 페이지 - API 응답 instances:', instances);
      
      // 체크리스트 ID로 찾기 (개별 인스턴스 ID 또는 그룹 ID)
      let targetGroup = instances.filter((instance: any) => {
        // 개별 인스턴스 ID로 먼저 확인
        if (instance.id === decodedChecklistId) {
          console.log('인스턴스 ID로 찾음:', instance.id);
          return true;
        }
        // 그룹 ID로 확인
        const groupName = `${getWorkplaceLabel(instance.template.workplace)}, ${getTimeSlotLabel(instance.template.timeSlot)}`;
        console.log('그룹 이름 비교:', groupName, 'vs', decodedChecklistId);
        return groupName === decodedChecklistId;
      });
      
      if (targetGroup.length === 0) {
        throw new Error('해당 체크리스트를 찾을 수 없습니다.');
      }
      
      // 그룹의 첫 번째 인스턴스를 기준으로 체크리스트 데이터 생성
      const firstInstance = targetGroup[0];
      
      // 모든 인스턴스의 항목들을 하나로 합침 (중복 제거)
      const allItems = targetGroup.flatMap((instance: any) => {
        return instance.template?.items || [];
      });
      
      // 중복 제거 (같은 ID를 가진 항목은 하나만 유지)
      const uniqueItems = allItems.filter((item: any, index: number, self: any[]) => 
        index === self.findIndex((t: any) => t.id === item.id)
      );
      
      // 그룹화된 체크리스트 데이터 생성
      const checklistData = {
        ...firstInstance.template,
        id: checklistId, // 그룹 ID 사용 (표시용)
        templateId: firstInstance.template.id, // 실제 템플릿 ID (API용)
        name: firstInstance.template.name || firstInstance.template.content, // 템플릿 이름 사용
        content: firstInstance.template.content, // 템플릿 내용 사용
        items: uniqueItems,
        // 그룹의 완료 상태 (모든 인스턴스가 완료되었는지)
        isCompleted: targetGroup.every((instance: any) => instance.isCompleted),
        // 제출 완료 상태 (모든 인스턴스가 제출되었는지)
        isSubmitted: targetGroup.every((instance: any) => instance.isSubmitted),
        // 그룹의 메모 (첫 번째 인스턴스의 메모 사용)
        notes: firstInstance.notes || "",
        // 그룹 정보
        groupInstances: targetGroup
      };
      
      setChecklist(checklistData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 체크리스트 진행 상태 가져오기
  const fetchProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/employee/checklist-progress?date=${today}`, {
        credentials: "include"
      });

      // URL 디코딩
      const decodedChecklistId = decodeURIComponent(checklistId);

      if (response.ok) {
        const progress = await response.json();
        console.log('기존 진행 상태:', progress);
        
        // 진행 상태를 체크리스트 항목 상태로 변환
        const itemsStatus: {[key: string]: ChecklistItemResponse} = {};
        const connectedStatus: {[key: string]: any} = {};
        
        // 특정 체크리스트의 진행 상태만 로드
        const targetInstance = progress.find((instance: any) => {
          // 개별 인스턴스 ID로 확인
          if (instance.id === decodedChecklistId) {
            return true;
          }
          // 그룹 ID로 확인
          const groupName = `${getWorkplaceLabel(instance.template.workplace)}, ${getTimeSlotLabel(instance.template.timeSlot)}`;
          return groupName === decodedChecklistId;
        });
        
        if (targetInstance) {
          console.log('대상 인스턴스:', targetInstance);
          
          // 체크리스트 항목 진행 상태
          if (targetInstance.checklistItemProgresses) {
            targetInstance.checklistItemProgresses.forEach((itemProgress: any) => {
              console.log('itemProgress:', itemProgress);
              
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

          // 연결된 항목들의 진행 상태도 로드
          if (targetInstance.connectedItemsProgress) {
            console.log('=== 연결된 항목 진행 상태 로드 시작 ===');
            console.log('targetInstance.connectedItemsProgress:', targetInstance.connectedItemsProgress);
            
            targetInstance.connectedItemsProgress.forEach((connectionProgress: any) => {
              console.log('connectionProgress:', connectionProgress);
              
              connectedStatus[connectionProgress.connectionId] = {
                id: connectionProgress.connectionId,
                isCompleted: connectionProgress.isCompleted,
                completedBy: connectionProgress.completedBy,
                completedAt: connectionProgress.completedAt,
                notes: connectionProgress.notes || ""
              };
            });
          }
        }
        
        setChecklistItems(itemsStatus);
        setConnectedItemsStatus(connectedStatus);
      }
    } catch (error) {
      console.error('진행 상태 조회 오류:', error);
    }
  };

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

  // 체크박스 변경 핸들러
  const handleCheckboxChange = async (id: string) => {
    const currentStatus = checklistItems[id]?.isCompleted || false;
    const newStatus = !currentStatus;
    
    // 업데이트된 상태 계산
    const updatedChecklistItems = {
      ...checklistItems,
      [id]: {
        ...checklistItems[id],
        isCompleted: newStatus,
        completedBy: currentEmployee?.name || currentEmployee?.id,
        completedAt: newStatus ? new Date().toISOString() : undefined
      }
    };
    
    // 로컬 상태 업데이트
    setChecklistItems(updatedChecklistItems);

    // 즉시 서버에 저장
    try {
      const templateId = (checklist as any)?.templateId || checklist?.id || '';
      await saveProgressWithState(templateId, updatedChecklistItems, connectedItemsStatus);
    } catch (error) {
      console.error('체크박스 변경 저장 오류:', error);
      showToast('상태 저장에 실패했습니다.', 'error');
    }
  };

  // 연결된 항목 체크박스 변경 핸들러
  const handleConnectedItemCheckboxChange = async (connectionId: string, parentItemId: string) => {
    const currentStatus = connectedItemsStatus[connectionId]?.isCompleted || false;
    const newStatus = !currentStatus;
    
    // 업데이트된 상태 계산
    const updatedConnectedStatus = {
      ...connectedItemsStatus,
      [connectionId]: {
        ...connectedItemsStatus[connectionId],
        isCompleted: newStatus,
        completedBy: currentEmployee?.name || currentEmployee?.id,
        completedAt: newStatus ? new Date().toISOString() : undefined
      }
    };
    
    // 로컬 상태 업데이트
    setConnectedItemsStatus(updatedConnectedStatus);
    
    // 상위 항목 상태 업데이트
    let updatedChecklistItems = { ...checklistItems };
    const parentItem = checklist?.items?.find(item => item.id === parentItemId);
    if (parentItem && parentItem.connectedItems) {
      const allConnectedCompleted = parentItem.connectedItems.every(connection => {
        if (connection.id === connectionId) {
          return newStatus;
        }
        return updatedConnectedStatus[connection.id]?.isCompleted || false;
      });
      
      if (allConnectedCompleted) {
        updatedChecklistItems = {
          ...updatedChecklistItems,
          [parentItemId]: {
            ...updatedChecklistItems[parentItemId],
            isCompleted: true,
            completedBy: currentEmployee?.name || currentEmployee?.id,
            completedAt: new Date().toISOString()
          }
        };
      } else {
        updatedChecklistItems = {
          ...updatedChecklistItems,
          [parentItemId]: {
            ...updatedChecklistItems[parentItemId],
            isCompleted: false,
            completedBy: undefined,
            completedAt: undefined
          }
        };
      }
      
      setChecklistItems(updatedChecklistItems);
    }
    
    // 즉시 서버에 저장
    try {
      const templateId = (checklist as any)?.templateId || checklist?.id || '';
      await saveProgressWithState(templateId, updatedChecklistItems, updatedConnectedStatus);
    } catch (error) {
      console.error('연결된 항목 체크박스 변경 저장 오류:', error);
      showToast('상태 저장에 실패했습니다.', 'error');
    }
  };

  // 진행률 계산
  const calculateProgress = () => {
    if (!checklist || !checklist.items) {
      return { completed: 0, total: 0 };
    }

    const totalItems = checklist.items.length;
    const completedItems = checklist.items.filter(item => {
      if (item.connectedItems && item.connectedItems.length > 0) {
        // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
        return item.connectedItems.every(connection => 
          connectedItemsStatus[connection.id]?.isCompleted
        );
      } else {
        // 연결된 항목이 없는 경우, 메인 항목만 체크
        return checklistItems[item.id]?.isCompleted;
      }
    }).length;

    return { completed: completedItems, total: totalItems };
  };

  // 모든 항목 완료 여부 확인
  const isAllItemsCompleted = () => {
    const progress = calculateProgress();
    return progress.completed === progress.total && progress.total > 0;
  };

  // 메모 변경 핸들러
  const handleNotesChange = (id: string, notes: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes
      }
    }));
  };

  // 메모 입력 토글
  const toggleMemoInput = (id: string) => {
    setShowMemoInputs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 메모 저장
  const saveMemo = async (id: string) => {
    try {
      const notes = checklistItems[id]?.notes || "";
      
      // API 호출하여 메모 저장
      const response = await fetch('/api/employee/checklist-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: checklist?.id,
          itemId: id,
          notes: notes
        })
      });

      if (response.ok) {
        showToast('메모가 저장되었습니다.', 'success');
        toggleMemoInput(id);
      } else {
        showToast('메모 저장에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('메모 저장 오류:', error);
      showToast('메모 저장에 실패했습니다.', 'error');
    }
  };

  // 재고 업데이트 핸들러
  const handleInventoryUpdate = async (itemId: string, currentStock: number, parentItemId: string, notes?: string) => {
    try {
      // 기존 재고 정보 가져오기
      const existingItem = connectedItemDetails[itemId];
      const previousStock = existingItem?.currentStock || 0;
      
      // 재고 업데이트 API 호출
      const response = await fetch('/api/employee/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId: itemId,
          currentStock: currentStock,
          notes: notes || ""
        })
      });

      if (response.ok) {
        // 재고 업데이트 성공 시 연결된 항목 상태 업데이트
        const updatedConnectedStatus = {
          ...connectedItemsStatus,
          [itemId]: {
            ...connectedItemsStatus[itemId],
            isCompleted: true,
            completedBy: currentEmployee?.name || currentEmployee?.id,
            completedAt: new Date().toISOString(),
            previousStock: previousStock, // 기존 재고 저장
            updatedStock: currentStock // 업데이트된 재고 저장
          }
        };

        setConnectedItemsStatus(updatedConnectedStatus);

        // 연결된 항목 상세 정보 업데이트
        setConnectedItemDetails(prev => ({
          ...prev,
          [itemId]: {
            ...prev[itemId],
            currentStock: currentStock,
            previousStock: previousStock
          }
        }));

        // 상위 항목도 자동 완료 처리
        if (parentItemId) {
          const parentItem = checklist?.items?.find(item => item.id === parentItemId);
          if (parentItem && parentItem.connectedItems) {
            const allConnectedCompleted = parentItem.connectedItems.every(connection => {
              if (connection.id === itemId) {
                return true; // 방금 완료된 항목
              }
              return updatedConnectedStatus[connection.id]?.isCompleted || false;
            });
            
            if (allConnectedCompleted) {
              const updatedChecklistItems = {
                ...checklistItems,
                [parentItemId]: {
                  ...checklistItems[parentItemId],
                  isCompleted: true,
                  completedBy: currentEmployee?.name || currentEmployee?.id,
                  completedAt: new Date().toISOString()
                }
              };
              
              setChecklistItems(updatedChecklistItems);
              
              // 상위 항목 완료 시 즉시 서버에 저장
              try {
                const templateId = (checklist as any)?.templateId || checklist?.id || '';
                await saveProgressWithState(templateId, updatedChecklistItems, updatedConnectedStatus);
              } catch (error) {
                console.error('상위 항목 완료 저장 오류:', error);
              }
            }
          }
        }

        // 재고 업데이트 완료 시 즉시 서버에 저장
        try {
          const templateId = (checklist as any)?.templateId || checklist?.id || '';
          await saveProgressWithState(templateId, checklistItems, updatedConnectedStatus);
        } catch (error) {
          console.error('재고 업데이트 저장 오류:', error);
        }

        showToast('재고가 업데이트되었습니다.', 'success');
      } else {
        showToast('재고 업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      showToast('재고 업데이트에 실패했습니다.', 'error');
    }
  };

  // 진행 상태 저장
  const saveProgressWithState = async (templateId: string, currentChecklistItems: any, currentConnectedItemsStatus: any) => {
    try {
      const calculateCompletionStatus = () => {
        const completionStatus: any[] = [];
        
        Object.entries(currentChecklistItems).forEach(([itemId, itemData]: [string, any]) => {
          completionStatus.push({
            itemId: itemId,
            isCompleted: itemData.isCompleted || false,
            completedBy: itemData.completedBy,
            completedAt: itemData.completedAt,
            notes: itemData.notes || ""
          });
        });
        
        return completionStatus;
      };

      const calculateConnectedItemsStatus = () => {
        const connectedItems: any[] = [];
        
        Object.entries(currentConnectedItemsStatus).forEach(([connectionId, connectionData]: [string, any]) => {
          // 연결된 항목의 itemId 찾기 - connectedItemDetails에서 가져오기
          let itemId = null;
          
          // 먼저 connectedItemDetails에서 찾기
          if (connectedItemDetails[connectionId]) {
            itemId = connectedItemDetails[connectionId].id;
          }
          
          // 찾지 못한 경우 checklist.items에서 찾기
          if (!itemId && checklist && checklist.items) {
            for (const item of checklist.items) {
              if (item.connectedItems) {
                const connection = item.connectedItems.find((conn: any) => conn.id === connectionId);
                if (connection) {
                  itemId = connection.itemId;
                  break;
                }
              }
            }
          }
          
          // 여전히 찾지 못한 경우 connectionId를 itemId로 사용 (임시 해결책)
          if (!itemId) {
            itemId = connectionId;
          }
          
          console.log(`연결된 항목 ${connectionId}의 itemId:`, itemId);
          
          connectedItems.push({
            connectionId: connectionId,
            itemId: itemId,
            isCompleted: connectionData.isCompleted || false,
            completedBy: connectionData.completedBy,
            completedAt: connectionData.completedAt,
            notes: connectionData.notes || "",
            currentStock: connectionData.previousStock || 0, // currentStock 필드 추가
            previousStock: connectionData.previousStock,
            updatedStock: connectionData.updatedStock
          });
        });
        
        return connectedItems;
      };

      const requestBody = {
        templateId: templateId,
        checklistItemProgresses: calculateCompletionStatus(),
        connectedItemsProgress: calculateConnectedItemsStatus()
      };
      
      console.log('진행 상태 저장 요청 데이터:', requestBody);
      
      const response = await fetch('/api/employee/checklist-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('진행 상태 저장 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('진행 상태 저장 오류 응답:', errorText);
        throw new Error(`진행 상태 저장에 실패했습니다. (${response.status}): ${errorText}`);
      }

      console.log('진행 상태 저장 완료');
    } catch (error) {
      console.error('진행 상태 저장 오류:', error);
      throw error;
    }
  };

  // 뒤로가기 핸들러
  const handleBackToList = async () => {
    // 뒤로가기 전에 현재 상태 저장
    if (checklist) {
      try {
        const templateId = (checklist as any)?.templateId || checklist.id;
        await saveProgressWithState(templateId, checklistItems, connectedItemsStatus);
        showToast('진행 상태가 저장되었습니다.', 'success');
        
        // 저장 완료 후 잠시 대기 (토스트 메시지가 보이도록)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 새로고침과 함께 리스트 페이지로 이동
        window.location.href = '/employee/checklist';
      } catch (error) {
        console.error('상태 저장 실패:', error);
        showToast('상태 저장에 실패했습니다.', 'error');
        
        // 저장 실패해도 새로고침과 함께 리스트 페이지로 이동
        setTimeout(() => {
          window.location.href = '/employee/checklist';
        }, 2000);
      }
    } else {
      // 체크리스트가 없는 경우에도 새로고침과 함께 리스트 페이지로 이동
      window.location.href = '/employee/checklist';
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (checklistId) {
      fetchCurrentEmployee();
      fetchChecklistDetail();
      fetchProgress();
    }
  }, [checklistId]);

  // 체크리스트 로드 후 연결된 항목 상세 정보 로드
  useEffect(() => {
    if (checklist && checklist.items) {
      checklist.items.forEach(item => {
        if (item.connectedItems && item.connectedItems.length > 0) {
          loadConnectedItemDetails(item);
        }
      });
    }
  }, [checklist]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">체크리스트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로 돌아가기
          </button>
        </div>

        {/* 체크리스트 제목 */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{checklist.name}</h1>
        <p className="text-lg text-gray-600 mb-6">
          {getWorkplaceLabel(checklist.workplace)} • {getTimeSlotLabel(checklist.timeSlot)}
        </p>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* 체크리스트 상세 뷰 */}
        <ChecklistDetailView
          selectedChecklist={checklist}
          currentEmployee={currentEmployee}
          checklistItems={checklistItems}
          connectedItemsStatus={connectedItemsStatus}
          connectedItemDetails={connectedItemDetails}
          expandedItems={expandedItems}
          showMemoInputs={showMemoInputs}
          submitting={submitting}
          getWorkplaceLabel={getWorkplaceLabel}
          getTimeSlotLabel={getTimeSlotLabel}
          handleBackToList={handleBackToList}
          calculateProgress={calculateProgress}
          isAllItemsCompleted={isAllItemsCompleted}
          handleCheckboxChange={handleCheckboxChange}
          handleConnectedItemCheckboxChange={handleConnectedItemCheckboxChange}
          toggleItemExpansion={(itemId) => setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }))}
          handleNotesChange={handleNotesChange}
          toggleMemoInput={toggleMemoInput}
          saveMemo={saveMemo}
          onInventoryUpdate={handleInventoryUpdate}
          saveProgress={async (templateId: string) => {
            const actualTemplateId = (checklist as any)?.templateId || checklist?.id || templateId;
            await saveProgressWithState(actualTemplateId, checklistItems, connectedItemsStatus);
          }}
          handleSubmit={async (e: React.FormEvent) => {
            e.preventDefault();
            // 제출 로직
            showToast('체크리스트가 제출되었습니다.', 'success');
          }}
        />

        {/* 토스트 알림 */}
        {toast && toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
} 