"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { 
  ChecklistTemplate, 
  ChecklistItem, 
  ChecklistItemConnection, 
  InventoryItem, 
  Precaution, 
  Manual, 
  Tag, 
  Employee, 
  ChecklistItemResponse,
  ConnectedItemStatus,
  ConnectedItemDetails,
  ChecklistInstance,
  ChecklistStatus,
  TimeSlotStatus
} from "@/types/checklist";
import { workplaceOptions, timeSlotOptions, categoryLabels } from "@/constants/checklist";

import { 
  ChecklistList, 
  ChecklistItem as ChecklistItemComponent, 
  ConnectedItem, 
  StatusDisplay, 
  DetailModal,
  ChecklistDetailView,
  ChecklistProgressBar,
  ChecklistActions
} from "@/components/checklist";
import Toast from "@/components/ui/Toast";

// 동적 렌더링 강제 설정 - prerendering 완전 비활성화
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default function ChecklistPage() {
  const router = useRouter();
  const DEBUG_LOG = false;
  const dbg = (...args: any[]) => { if (DEBUG_LOG) console.log(...args); };
  
  // searchParams를 안전하게 사용
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrlParams(new URLSearchParams(window.location.search));
    }
  }, []);
  
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
  const [connectedItemsStatus, setConnectedItemsStatus] = useState<{[key: string]: ConnectedItemStatus}>({});
  
  // 메모 입력 상태
  const [showMemoInputs, setShowMemoInputs] = useState<{[key: string]: boolean}>({});
  
  // 필터 상태
  const [filters, setFilters] = useState({
    workplace: "",
    timeSlot: "",
    category: ""
  });

  // 시간대 잠금 관련 상태
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlotStatus | null>(null);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);

  // 상세 작업 모달 관련 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [itemWorkData, setItemWorkData] = useState<any>({});
  const [savedProgress, setSavedProgress] = useState<{[key: string]: any}>({});

  // 토스트 알림 상태
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    show: boolean;
  } | null>(null);

  // 연결된 항목 상세 정보 캐시/인플라이트 관리
  const connectedItemCacheRef = useRef<{ [key: string]: { data: ConnectedItemDetails | null; ts: number } }>({});
  const connectedItemInFlightRef = useRef<{ [key: string]: Promise<ConnectedItemDetails | null> }>({});
  const CONNECTED_ITEM_TTL_MS = 5 * 60 * 1000; // 5분 TTL

  // 연결된 항목의 실제 내용을 가져오는 함수 (캐싱 + 인플라이트 결합)
  const getConnectedItemDetails = async (itemType: string, itemId: string) => {
    const key = `${itemType}_${itemId}`;
    // 캐시 히트 시 즉시 반환
    const cached = connectedItemCacheRef.current[key];
    if (cached) {
      if (Date.now() - cached.ts < CONNECTED_ITEM_TTL_MS) {
        return cached.data ?? null;
      }
      // TTL 만료 시 캐시 삭제
      delete connectedItemCacheRef.current[key];
    }
    // 인플라이트 요청 재사용
    const inFlight = connectedItemInFlightRef.current[key];
    if (inFlight !== undefined) {
      return inFlight;
    }
    const requestPromise = (async (): Promise<ConnectedItemDetails | null> => {
      try {
        const response = await fetch(`/api/employee/connected-items?type=${itemType}&id=${itemId}`, {
          credentials: 'include',
          cache: 'no-store'
        });
        if (!response.ok) return null;
        const data = await response.json();
        connectedItemCacheRef.current[key] = { data, ts: Date.now() };
        return data;
      } catch (error) {
        console.error('연결된 항목 상세 정보 조회 오류:', error);
        return null;
      } finally {
        delete connectedItemInFlightRef.current[key];
      }
    })();
    connectedItemInFlightRef.current[key] = requestPromise;
    return requestPromise;
  };

  // 캐시 무효화: 재고 업데이트 성공 시 해당 inventory 연결 캐시 삭제
  const invalidateConnectedItemCache = (itemType: string, itemId: string) => {
    const key = `${itemType}_${itemId}`;
    delete connectedItemCacheRef.current[key];
  };

  // 연결된 항목 상세 정보 상태
  const [connectedItemDetails, setConnectedItemDetails] = useState<{[key: string]: ConnectedItemDetails}>({});

  // 토스트 알림 표시 함수
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, show: true });
  };

  // URL 상태 관리 함수들
  const updateURL = (view: 'list' | 'detail', checklistId?: string) => {
    const params = new URLSearchParams();
    if (view === 'detail' && checklistId) {
      params.set('view', 'detail');
      params.set('checklist', checklistId);
    }
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/employee/checklist${newURL}`, { scroll: false });
  };

  const restoreFromURL = () => {
    if (!urlParams) return;
    
    const view = urlParams.get('view');
    const checklistId = urlParams.get('checklist');
    
    if (view === 'detail' && checklistId) {
      setCurrentView('detail');
      // 체크리스트 ID로 체크리스트 찾기
      const checklist = checklists.find(c => c.id === checklistId);
      if (checklist) {
        setSelectedChecklist(checklist);
      }
    } else {
      setCurrentView('list');
      setSelectedChecklist(null);
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
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // 현재 직원 정보 가져오기
  const fetchCurrentEmployee = async () => {
    dbg('fetchCurrentEmployee 함수 호출됨');
    try {
      const response = await fetch('/api/employee/me', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      dbg('API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        dbg('API 응답 데이터:', data);
        // API는 employee 객체를 직접 반환하므로 data.employee가 아닌 data를 사용
        if (data && data.id) {
          setCurrentEmployee(data);
          dbg('현재 직원 정보 설정됨:', data);
        } else {
          dbg('직원 데이터가 유효하지 않음:', data);
        }
      } else {
        console.error('직원 정보 조회 실패:', response.status);
        const errorText = await response.text();
        console.error('에러 응답:', errorText);
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

  // 체크리스트 로드 후 URL에서 상태 복원
  useEffect(() => {
    if (checklists.length > 0 && urlParams) {
      restoreFromURL();
    }
  }, [checklists, urlParams]);

  // 체크리스트 진행 상태 가져오기
  const fetchProgress = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/employee/checklist-progress?date=${today}`, {
          credentials: "include",
          cache: 'no-store'
        });

      if (response.ok) {
        const progress = await response.json();
        console.log('기존 진행 상태:', progress);
        
        // 진행 상태를 체크리스트 항목 상태로 변환
        const itemsStatus: {[key: string]: ChecklistItemResponse} = {};
        const connectedStatus: {[key: string]: any} = {};
        
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
            dbg('=== 연결된 항목 진행 상태 로드 시작 ===');
            dbg('instance.connectedItemsProgress:', instance.connectedItemsProgress);
            instance.connectedItemsProgress.forEach((connectedItem: any) => {
              // connectionId를 키로 사용 (connection.id와 일치해야 함)
              const key = connectedItem.connectionId;
              connectedStatus[key] = {
                itemId: connectedItem.itemId, // itemId 추가
                isCompleted: connectedItem.isCompleted,
                completedBy: connectedItem.completedBy,
                completedAt: connectedItem.completedAt,
                notes: connectedItem.notes || "",
                currentStock: connectedItem.currentStock,
                updatedStock: connectedItem.updatedStock
              };
              dbg(`연결된 항목 ${key} 로드: isCompleted=${connectedItem.isCompleted}, completedBy=${connectedItem.completedBy}`);
            });
            dbg('최종 connectedStatus:', connectedStatus);
          } else {
            dbg('connectedItemsProgress가 없습니다.');
          }

          // 연결된 항목들의 상태를 기반으로 상위 체크리스트 항목들의 상태를 계산
          if (instance.template?.items) {
            instance.template.items.forEach((item: any) => {
              if (item.connectedItems && item.connectedItems.length > 0) {
                dbg(`=== 상위 항목 ${item.id} (${item.content}) 처리 중 ===`);
                dbg('연결된 항목들:', item.connectedItems);
                
                // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되었는지 확인
                const allConnectedCompleted = item.connectedItems.every((connection: any) => {
                  const key = connection.id; // connection.id를 키로 사용 (connectedStatus에서도 동일하게 사용)
                  const isCompleted = connectedStatus[key]?.isCompleted === true;
                  dbg(`연결된 항목 ${key}: ${isCompleted ? '완료' : '미완료'}`);
                  return isCompleted;
                });
                
                dbg(`모든 연결된 항목 완료 여부: ${allConnectedCompleted}`);
                
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
                    completedBy: lastCompletedItem?.status?.completedBy || currentEmployee?.name,
                    completedAt: lastCompletedItem?.status?.completedAt || new Date().toISOString(),
                    notes: ''
                  };
                  dbg(`상위 항목 ${item.id} 완료로 설정 (완료자: ${itemsStatus[item.id].completedBy})`);
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
                  dbg(`상위 항목 ${item.id} 미완료로 설정`);
                }
              }
            });
          }
        });
        
        dbg('로드된 메인 항목 상태:', itemsStatus);
        dbg('로드된 연결 항목 상태:', connectedStatus);
        
        setChecklistItems(itemsStatus);
        setConnectedItemsStatus(connectedStatus);
        
        dbg('=== fetchProgress 완료 ===');
        dbg('설정된 checklistItems:', itemsStatus);
        dbg('설정된 connectedItemsStatus:', connectedStatus);
      }
    } catch (error) {
      console.error('진행 상태 조회 오류:', error);
    }
  };

  const fetchTimeSlotStatuses = async () => {
    try {
      // 기본값으로 모든 시간대 상태 조회
      const response = await fetch('/api/employee/timeslot-status?workplace=COMMON&timeSlot=COMMON', {
        credentials: "include",
        cache: 'no-store'
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
      // 템플릿 키 생성
      const templateKey = `${getWorkplaceLabel(instance.workplace)}, ${getTimeSlotLabel(instance.timeSlot)}`;
      itemsStatus[templateKey] = {
        id: instance.id,
        content: instance.content,
        isCompleted: instance.isCompleted,
        completedBy: instance.completedBy,
        completedAt: instance.completedAt,
        notes: instance.notes || ""
      };

      // 연결된 항목들의 진행 상태도 로드
      if (instance.connectedItemsProgress) {
        console.log('연결된 항목 진행 상태 로드:', instance.connectedItemsProgress);
        instance.connectedItemsProgress.forEach((connectedItem: any) => {
          // connectionId를 키로 사용
          const key = connectedItem.connectionId; // connectionId만 사용 (connection.id와 일치해야 함)
          connectedStatus[key] = {
            itemId: connectedItem.itemId, // itemId 추가
            isCompleted: connectedItem.isCompleted,
            completedBy: connectedItem.completedBy,
            completedAt: connectedItem.completedAt,
            notes: connectedItem.notes || "",
            currentStock: connectedItem.currentStock,
            updatedStock: connectedItem.updatedStock
          };
          console.log(`연결된 항목 ${key} 로드: isCompleted=${connectedItem.isCompleted}, completedBy=${connectedItem.completedBy}`);
        });
      }

      // 개별 체크리스트 항목들의 진행 상태 로드 (연결된 항목이 없는 항목만)
      if (instance.checklistItemProgresses) {
        instance.checklistItemProgresses.forEach((itemProgress: any) => {
          // 연결된 항목이 있는지 확인
          const hasConnectedItems = instance.template?.items?.find((item: any) => 
            item.id === itemProgress.itemId && item.connectedItems && item.connectedItems.length > 0
          );
          
          // 연결된 항목이 없는 경우에만 직접 로드
          if (!hasConnectedItems) {
            itemsStatus[itemProgress.itemId] = {
              id: itemProgress.itemId,
              content: '', // API에서 content는 별도로 가져와야 함
              isCompleted: itemProgress.isCompleted,
              completedBy: itemProgress.completedBy,
              completedAt: itemProgress.completedAt,
              notes: itemProgress.notes || ""
            };
          }
        });
      }

      // 연결된 항목들의 상태를 기반으로 상위 체크리스트 항목들의 상태를 계산
      if (instance.template?.items) {
        instance.template.items.forEach((item: any) => {
          if (item.connectedItems && item.connectedItems.length > 0) {
            console.log(`=== 상위 항목 ${item.id} (${item.content}) 처리 중 ===`);
            console.log('연결된 항목들:', item.connectedItems);
            
            // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되었는지 확인
            const allConnectedCompleted = item.connectedItems.every((connection: any) => {
              const key = connection.id;
              const isCompleted = connectedStatus[key]?.isCompleted === true;
              console.log(`연결된 항목 ${key}: ${isCompleted ? '완료' : '미완료'}`);
              return isCompleted;
            });
            
            console.log(`모든 연결된 항목 완료 여부: ${allConnectedCompleted}`);
            
            // 상위 항목의 상태를 연결된 항목들의 상태에 따라 설정
            // 모든 연결된 항목이 완료되었을 때만 상위 항목도 완료
            if (allConnectedCompleted) {
              // 연결된 항목 중 가장 최근에 완료된 항목의 정보 사용
              const completedConnectedItems = item.connectedItems
                .map((connection: any) => ({
                  connection,
                  status: connectedStatus[connection.id]
                }))
                .filter((item: any) => item.status?.isCompleted)
                .sort((a: any, b: any) => {
                  const dateA = a.status.completedAt ? new Date(a.status.completedAt).getTime() : 0;
                  const dateB = b.status.completedAt ? new Date(b.status.completedAt).getTime() : 0;
                  return dateB - dateA; // 최신 날짜가 앞으로
                });
              
              const lastCompletedItem = completedConnectedItems[0];
              
              itemsStatus[item.id] = {
                id: item.id,
                content: item.content || '',
                isCompleted: true,
                completedBy: lastCompletedItem?.status?.completedBy || currentEmployee?.name,
                completedAt: lastCompletedItem?.status?.completedAt || new Date().toISOString(),
                notes: ''
              };
              console.log(`상위 항목 ${item.id} 완료로 설정 (completedBy: ${lastCompletedItem?.status?.completedBy})`);
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
        
        // 템플릿 그룹별로 그룹화 (고유 템플릿 ID 기준으로 분리)
        const templateGroups = new Map<string, any[]>();
        
        instances.forEach((instance: any) => {
          const groupKey = String(instance.template?.id || instance.id);
          if (!templateGroups.has(groupKey)) {
            templateGroups.set(groupKey, []);
          }
          templateGroups.get(groupKey)!.push(instance);
        });
        
        // 그룹화된 데이터를 체크리스트 형태로 변환
        const checklistsData = Array.from(templateGroups.entries()).map(([groupKey, groupInstances]) => {
          // 첫 번째 인스턴스를 기준으로 템플릿 정보 생성
          const firstInstance = groupInstances[0];
          
          dbg('=== 그룹 처리 중 ===');
          dbg('그룹 키:', groupKey);
          dbg('그룹 인스턴스 수:', groupInstances.length);
          dbg('첫 번째 인스턴스:', firstInstance);
          dbg('첫 번째 인스턴스 template:', firstInstance.template);
          dbg('첫 번째 인스턴스 template.items:', firstInstance.template?.items);
          
          // 모든 인스턴스의 항목들을 하나로 합침 (중복 제거)
          const allItems = groupInstances.flatMap((instance: any) => {
            dbg('인스턴스 처리 중:', instance.id);
            dbg('인스턴스 template.items:', instance.template?.items);
            return instance.template?.items || [];
          });
          
          dbg('모든 항목들 (중복 제거 전):', allItems);
          
          // 중복 제거 (같은 ID를 가진 항목은 하나만 유지)
          const uniqueItems = allItems.filter((item: any, index: number, self: any[]) => 
            index === self.findIndex((t: any) => t.id === item.id)
          );
          
          dbg('중복 제거된 항목들:', uniqueItems);
          
          const displayName = `${getWorkplaceLabel(firstInstance.workplace)}, ${getTimeSlotLabel(firstInstance.timeSlot)}`;
          
          return {
            id: groupKey, // 고유 템플릿 ID로 그룹 식별
            name: displayName, // 표시용 이름은 위치/시간대 라벨 유지
            content: displayName, // 호환성 유지
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
                isLocked: true,
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

  // 재고 업데이트 핸들러
  const handleInventoryUpdate = async (itemId: string, currentStock: number, notes?: string) => {
    // 정수로 변환
    const stockValue = Math.round(currentStock);
    console.log('재고 업데이트 시작:', { itemId, currentStock, stockValue, notes });
    
    // parentItemId 찾기
    let parentItemId: string | null = null;
    for (const item of selectedChecklist?.items || []) {
      if (item.connectedItems?.some(conn => conn.itemType === 'inventory' && conn.itemId === itemId)) {
        parentItemId = item.id;
        break;
      }
    }
    try {
      const response = await fetch('/api/employee/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId,
          currentStock: stockValue,
          notes,
          needsRestock: false // 자동으로 계산됨
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('재고 업데이트 성공:', result);
        console.log('재고 업데이트 상세 정보:', {
          itemId,
          requestedStock: stockValue,
          resultPreviousStock: result.previousStock,
          resultCurrentStock: result.item.currentStock,
          stockChange: result.stockChange,
          response: result
        });
        
        // 업데이트 성공 메시지 표시
        const stockChange = result.stockChange;
        console.log('재고 변경량 계산 (handleInventoryUpdate):', {
          stockChange,
          type: typeof stockChange,
          isPositive: stockChange > 0,
          isNegative: stockChange < 0,
          isZero: stockChange === 0,
          previousStock: result.previousStock,
          currentStock: result.item.currentStock,
          calculatedChange: result.item.currentStock - result.previousStock
        });
        
        const changeText = stockChange > 0 
          ? `+${stockChange}` 
          : stockChange < 0 
            ? `${stockChange}` 
            : '변경 없음';
        
        const message = `재고 업데이트: ${result.previousStock} → ${result.item.currentStock} (${changeText})`;
        showToast(message, 'success');

        // 캐시 무효화 (해당 inventory 연결 항목)
        invalidateConnectedItemCache('inventory', itemId);
        
        // 연결된 항목 상태를 완료로 설정 (재고 업데이트 시 자동 체크)
        // 모든 연결된 항목에서 해당 재고 아이템을 찾아서 체크
        const parentItem = parentItemId ? selectedChecklist?.items?.find(item => item.id === parentItemId) : null;
        let newConnectedStatus = { ...connectedItemsStatus };
        
        if (parentItem && parentItem.connectedItems) {
          const targetConnection = parentItem.connectedItems.find(
            connection => connection.itemType === 'inventory' && connection.itemId === itemId
          );
          
          if (targetConnection) {
            newConnectedStatus = {
              ...connectedItemsStatus,
              [targetConnection.id]: {
                ...connectedItemsStatus[targetConnection.id],
                isCompleted: true,
                completedBy: currentEmployee?.name,
                completedAt: new Date().toISOString(),
                notes: notes,
                previousStock: result.previousStock,
                updatedStock: result.item.currentStock,
                stockChange: result.stockChange
              }
            };
            
            setConnectedItemsStatus(newConnectedStatus);
            
            // 상위 항목 상태 즉시 업데이트
            const updatedParentItem = parentItemId ? selectedChecklist?.items?.find(item => item.id === parentItemId) : null;
            if (updatedParentItem && updatedParentItem.connectedItems) {
              const allConnectedCompleted = updatedParentItem.connectedItems.every(connection => 
                connection.id === targetConnection.id ? true : newConnectedStatus[connection.id]?.isCompleted === true
              );
              
              if (allConnectedCompleted && parentItemId) {
                setChecklistItems((prev: {[key: string]: ChecklistItemResponse}) => ({
                  ...prev,
                  [parentItemId]: {
                    ...prev[parentItemId],
                    isCompleted: true,
                    completedBy: currentEmployee?.name,
                    completedAt: new Date().toISOString()
                  }
                }));
              }
            }
            
            // 재고 업데이트 후 즉시 상태 저장
            if (selectedChecklist?.id) {
              try {
                console.log('재고 업데이트 후 상태 저장 시작');
                await saveProgress(selectedChecklist.id);
                console.log('재고 업데이트 후 상태 저장 완료');
              } catch (error) {
                console.error('재고 업데이트 후 상태 저장 실패:', error);
              }
            }
          }
        }
        
        // 재고 상세 정보 새로고침 (API에서 최신 데이터 가져오기)
        const key = `inventory_${itemId}`;
        const detail = await getConnectedItemDetails('inventory', itemId);
        if (detail) {
          setConnectedItemDetails(prev => ({
            ...prev,
            [key]: detail
          }));
        }

        // 상태를 즉시 저장
        try {
          await saveProgressWithState(selectedChecklist!.id, checklistItems, newConnectedStatus);
          console.log('재고 업데이트 후 상태 저장 완료');
        } catch (error) {
          console.error('재고 업데이트 후 상태 저장 실패:', error);
        }
      } else {
        console.error('재고 업데이트 실패:', response.status);
        showToast('재고 업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
    }
  };

  // 연결된 항목 체크박스 변경 핸들러
  const handleConnectedItemCheckboxChange = async (connectionId: string, parentItemId: string) => {
    const isCompleted = !connectedItemsStatus[connectionId]?.isCompleted;
    
    // 먼저 연결항목 상태 업데이트
    const newConnectedStatus = {
      ...connectedItemsStatus,
      [connectionId]: {
        ...connectedItemsStatus[connectionId],
        itemId: connectedItemsStatus[connectionId]?.itemId || connectionId, // itemId 보존
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
            ?.map((connection: any) => ({
              connection,
              status: newConnectedStatus[connection.id]
            }))
            ?.filter((item: any) => item.status?.isCompleted)
            ?.sort((a: any, b: any) => {
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
    
    // 상태 업데이트 후 즉시 저장
    if (selectedChecklist) {
      try {
        // 업데이트된 checklistItems 상태 계산 (현재 상태를 기반으로)
        const updatedChecklistItems = { ...checklistItems };
        if (parentItem && parentItem.connectedItems) {
          const allConnectedCompleted = parentItem.connectedItems.every(connection => 
            connection.id === connectionId ? isCompleted : newConnectedStatus[connection.id]?.isCompleted === true
          );
          
          if (allConnectedCompleted) {
            // 연결된 항목 중 가장 최근에 완료된 항목의 completedBy 정보 사용
            const lastCompletedItem = parentItem.connectedItems
              ?.map((connection: any) => ({
                connection,
                status: newConnectedStatus[connection.id]
              }))
              ?.filter((item: any) => item.status?.isCompleted)
              ?.sort((a: any, b: any) => {
                const dateA = a.status.completedAt ? new Date(a.status.completedAt).getTime() : 0;
                const dateB = b.status.completedAt ? new Date(b.status.completedAt).getTime() : 0;
                return dateB - dateA; // 최신 날짜가 앞으로
              })[0];

            updatedChecklistItems[parentItemId] = {
              ...updatedChecklistItems[parentItemId],
              id: parentItemId,
              content: parentItem.content || '',
              isCompleted: true,
              completedBy: lastCompletedItem?.status?.completedBy || currentEmployee?.name,
              completedAt: lastCompletedItem?.status?.completedAt || new Date().toISOString(),
              notes: updatedChecklistItems[parentItemId]?.notes || ''
            };
          } else {
            updatedChecklistItems[parentItemId] = {
              ...updatedChecklistItems[parentItemId],
              id: parentItemId,
              content: parentItem.content || '',
              isCompleted: false,
              completedBy: undefined,
              completedAt: undefined,
              notes: updatedChecklistItems[parentItemId]?.notes || ''
            };
          }
        }
        
        console.log('=== 연결항목 체크박스 변경 시 저장 데이터 ===');
        console.log('updatedChecklistItems:', updatedChecklistItems);
        console.log('newConnectedStatus:', newConnectedStatus);
        
        await saveProgressWithState(selectedChecklist.id, updatedChecklistItems, newConnectedStatus);
        console.log('연결항목 체크박스 변경 후 즉시 저장 완료');
        
        // 저장 후 최신 데이터 다시 로드
        await fetchProgress();
      } catch (error) {
        console.error('연결항목 체크박스 변경 후 저장 실패:', error);
        setError('저장 중 오류가 발생했습니다.');
      }
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
        if (allConnectedCompleted) {
          // 연결된 항목 중 가장 최근에 완료된 항목의 completedBy 정보 사용
          const lastCompletedItem = parentItem.connectedItems
            ?.map((connection: any) => ({
              connection,
              status: connectedItemsStatus[connection.id]
            }))
            ?.filter((item: any) => item.status?.isCompleted)
            ?.sort((a: any, b: any) => {
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
    
    // 새로운 상태를 미리 계산
    const newChecklistItems = {
      ...checklistItems,
      [id]: {
        ...checklistItems[id],
        id: id,
        content: item?.content || '',
        isCompleted: isCompleted,
        completedBy: isCompleted ? currentEmployee?.name : undefined,
        completedAt: isCompleted ? new Date().toISOString() : undefined
      }
    };
    
    // 상태 업데이트
    setChecklistItems(newChecklistItems);
    
    // 선택된 체크리스트의 템플릿 ID로 즉시 저장 (업데이트된 상태 사용)
    if (selectedChecklist) {
      try {
        // 임시로 상태를 업데이트하여 저장 함수에서 사용
        const originalChecklistItems = checklistItems;
        // saveProgress 함수에서 새로운 상태를 사용하도록 수정
        await saveProgressWithState(selectedChecklist.id, newChecklistItems, connectedItemsStatus);
        console.log('체크박스 변경 후 즉시 저장 완료');
      } catch (error) {
        console.error('체크박스 변경 후 저장 실패:', error);
        setError('저장 중 오류가 발생했습니다.');
      }
    }
  };

  // 진행상황 계산 함수 (상위+하위 합산 기준)
  const calculateProgress = () => {
    if (!selectedChecklist?.items) return { completed: 0, total: 0 };

    let completed = 0;
    let total = 0;

    selectedChecklist.items.forEach((item) => {
      // 상위 항목은 항상 분모에 포함
      total += 1;
      if (checklistItems[item.id]?.isCompleted) {
        completed += 1;
      }

      // 하위 항목 합산
      const connections = item.connectedItems || [];
      total += connections.length;
      connections.forEach((connection) => {
        if (connectedItemsStatus[connection.id]?.isCompleted) {
          completed += 1;
        }
      });
    });

    return { completed, total };
  };

  // 모든 항목이 완료되었는지 확인하는 함수
  const checkAllItemsCompleted = () => {
    if (!selectedChecklist?.items) return false;
    
    return selectedChecklist.items.every(item => {
      if (item.connectedItems && item.connectedItems.length > 0) {
        // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
        return item.connectedItems.every(connection => 
          connectedItemsStatus[connection.id]?.isCompleted
        );
      } else {
        // 연결된 항목이 없는 경우, 메인 항목만 체크
        return checklistItems[item.id]?.isCompleted;
      }
    });
  };

  const handleNotesChange = (id: string, notes: string) => {
    // 연결 항목 ID인지 체크(connectedItemsStatus에 아직 없더라도 체크리스트 정의에서 판별)
    const isConnectionId = !!selectedChecklist?.items?.some((item:any)=>
      Array.isArray(item.connectedItems) && item.connectedItems.some((c:any)=>c.id === id)
    );

    if (isConnectionId) {
      // 연결 항목의 메모 업데이트 (엔트리가 없으면 생성)
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

  const toggleMemoInput = (id: string) => {
    // 연결 항목이면 메모 엔트리 초기화 보장
    const isConnectionId = !!selectedChecklist?.items?.some((item:any)=>
      Array.isArray(item.connectedItems) && item.connectedItems.some((c:any)=>c.id === id)
    );
    if (isConnectionId && !connectedItemsStatus[id]) {
      setConnectedItemsStatus(prev => ({
        ...prev,
        [id]: { ...(prev[id]||{}), notes: '' }
      }));
    }
    setShowMemoInputs((prev: {[key: string]: boolean}) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 메모 저장 함수
  const saveMemo = async (id: string, notesOverride?: string) => {
    try {
      // 연결 항목 ID인지 체크(connectedItemsStatus에 아직 없더라도 체크리스트 정의에서 판별)
      const isConnectionId = !!selectedChecklist?.items?.some((item:any)=>
        Array.isArray(item.connectedItems) && item.connectedItems.some((c:any)=>c.id === id)
      );

      if (isConnectionId) {
        // 연결 항목의 메모 저장 (엔트리가 없으면 생성)
        const nextConnected = {
          ...connectedItemsStatus,
          [id]: {
            ...connectedItemsStatus[id],
            notes: (notesOverride ?? connectedItemsStatus[id]?.notes ?? '')
          }
        };
        await saveProgressWithState(selectedChecklist?.id || '', checklistItems, nextConnected);
      } else {
        // 메인 항목의 메모 저장
        const nextChecklistItems = {
          ...checklistItems,
          [id]: {
            ...checklistItems[id],
            notes: (notesOverride ?? checklistItems[id]?.notes ?? '')
          }
        } as any;
        await saveProgressWithState(selectedChecklist?.id || '', nextChecklistItems, connectedItemsStatus);
      }
      
      // 성공 메시지 표시
      setSuccess('메모가 저장되었습니다.');
      setTimeout(() => setSuccess(''), 2000);
      
      // 메모 입력창 닫기
      setShowMemoInputs((prev: {[key: string]: boolean}) => ({
        ...prev,
        [id]: false
      }));
    } catch (error) {
      console.error('메모 저장 오류:', error);
      setError('메모 저장에 실패했습니다.');
    }
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
        const result = await response.json();
        
        // 업데이트 성공 메시지 표시
        const stockChange = result.stockChange;
        console.log('재고 변경량 계산 (updateStock):', {
          stockChange,
          type: typeof stockChange,
          isPositive: stockChange > 0,
          isNegative: stockChange < 0,
          isZero: stockChange === 0,
          previousStock: result.previousStock,
          currentStock: result.item.currentStock,
          calculatedChange: result.item.currentStock - result.previousStock
        });
        
        const changeText = stockChange > 0 
          ? `+${stockChange}` 
          : stockChange < 0 
            ? `${stockChange}` 
            : '변경 없음';
        
        const message = `재고 업데이트: ${result.previousStock} → ${result.item.currentStock} (${changeText})`;
        showToast(message, 'success');
        
        // 성공 시 현재 수량 업데이트
        setItemWorkData((prev: any) => ({
          ...prev,
          currentStock: itemWorkData.updatedStock,
          previousStock: result.previousStock,
          stockChange: result.stockChange
        }));
      } else {
        showToast('재고 수량 업데이트에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('재고 업데이트 오류:', error);
      showToast('재고 수량 업데이트 중 오류가 발생했습니다.', 'error');
    }
  };

  const completeItem = () => {
    setItemWorkData((prev: any) => ({
      ...prev,
      isCompleted: !prev.isCompleted
    }));
  };

  const saveProgress = async (templateId: string) => {
    return saveProgressWithState(templateId, checklistItems, connectedItemsStatus);
  };

  const saveProgressWithState = async (templateId: string, currentChecklistItems: any, currentConnectedItemsStatus: any) => {
    try {
      console.log('=== saveProgress 시작 ===');
      console.log('전달받은 templateId:', templateId);
      console.log('현재 체크리스트 항목:', currentChecklistItems);
      console.log('연결된 항목 상태:', currentConnectedItemsStatus);

      // 선택된 체크리스트 그룹 찾기
      let selectedGroup = checklists.find(checklist => checklist.id === templateId) as any;
      if (!selectedGroup) {
        // 상세 화면에서 fallback: 현재 선택된 체크리스트 사용
        if (selectedChecklist && selectedChecklist.id === templateId) {
          selectedGroup = selectedChecklist as any;
        }
      }
      if (!selectedGroup) {
        console.error('선택된 그룹을 찾을 수 없습니다:', templateId);
        return;
      }

      console.log('선택된 그룹:', selectedGroup);

      // 완료 상태 계산
      const calculateCompletionStatus = () => {
        const totalItems = selectedGroup.items?.length || 0;
        if (totalItems === 0) return false;
        
        const completedItems = selectedGroup.items?.filter((item: any) => {
          console.log('항목 확인:', item.id, item.content);
          console.log('항목 상태:', currentChecklistItems[item.id]);
          
          if (item.connectedItems && item.connectedItems.length > 0) {
            // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
            const allConnectedCompleted = item.connectedItems.every((connection: any) => 
              currentConnectedItemsStatus[connection.id]?.isCompleted
            );
            console.log('연결된 항목 완료 상태:', allConnectedCompleted);
            return allConnectedCompleted;
          } else {
            // 연결된 항목이 없는 경우, 메인 항목만 체크
            const isCompleted = currentChecklistItems[item.id]?.isCompleted;
            console.log('메인 항목 완료 상태:', isCompleted);
            return isCompleted;
          }
        }).length || 0;
        
        console.log('완료된 항목 수:', completedItems, '전체 항목 수:', totalItems);
        return completedItems === totalItems;
      };

      const isCompleted = calculateCompletionStatus();
      console.log('계산된 완료 상태:', isCompleted);

      // 저장할 인스턴스들 결정
      let instancesToSave = [];
      
      if (selectedGroup.groupInstances && selectedGroup.groupInstances.length > 0) {
        // 그룹 인스턴스가 있는 경우 (개발용 체크리스트 생성기에서 생성된 경우)
        instancesToSave = selectedGroup.groupInstances;
        console.log('그룹 인스턴스 사용:', instancesToSave);
      } else {
        // 그룹 인스턴스가 없는 경우 (일반적인 경우)
        // 현재 직원과 템플릿 정보로 인스턴스 생성
        instancesToSave = [{
          template: {
            id: templateId,
            workplace: selectedGroup.workplace,
            timeSlot: selectedGroup.timeSlot
          }
        }];
        console.log('새 인스턴스 생성:', instancesToSave);
      }

      // 인스턴스들에 대해 저장
      const savePromises = instancesToSave.map(async (instance: any) => {
        // 모든 연결된 항목에 대해 진행 상태 생성 (체크 해제된 항목도 포함)
        console.log('=== connectedItemsProgress 생성 중 ===');
        console.log('currentConnectedItemsStatus:', currentConnectedItemsStatus);
        
        const connectedItemsProgress = (selectedGroup.items || [])
          ?.flatMap((item: any) => item.connectedItems || [])
          .map((connection: any) => {
            const status = currentConnectedItemsStatus[connection.id];
            const result = {
              connectionId: connection.id,
              itemId: status?.itemId || connection.itemId,
              currentStock: status?.previousStock ?? null, // 이전 재고
              updatedStock: status?.updatedStock ?? null, // 업데이트된 재고
              isCompleted: status ? status.isCompleted : false, // status가 있으면 그 값을, 없으면 false
              notes: (status?.notes ?? ''),
              completedBy: status?.completedBy,
              completedAt: status?.completedAt
            };
            console.log(`연결된 항목 ${connection.id}: status=${JSON.stringify(status)}, isCompleted=${result.isCompleted}`);
            return result;
          }) || [];
        
        console.log('생성된 connectedItemsProgress:', connectedItemsProgress);

        // 실제 템플릿 ID 사용 - instance.templateId 사용
        const actualTemplateId = instance.templateId || instance.template?.id;
        console.log('실제 템플릿 ID:', actualTemplateId);

        if (!actualTemplateId) {
          console.error('템플릿 ID를 찾을 수 없습니다.');
          return { success: false, error: '템플릿 ID를 찾을 수 없습니다.' };
        }

        const saveData = {
          templateId: actualTemplateId, // 실제 템플릿 ID 사용
          isCompleted: isCompleted, // 계산된 완료 상태 사용
          notes: "", // 템플릿 레벨의 메모는 비워둠
          connectedItemsProgress,
          checklistItemsProgress: selectedGroup.items
            ?.filter((item: any) => currentChecklistItems[item.id]?.isCompleted) // 체크된 항목만 필터링
            .map((item: any) => ({
              itemId: item.id, // 실제 ChecklistItem ID 사용
              isCompleted: currentChecklistItems[item.id].isCompleted,
              notes: currentChecklistItems[item.id].notes || "",
              completedBy: currentChecklistItems[item.id].completedBy,
              completedAt: currentChecklistItems[item.id].completedAt
            })) || [],
          completedBy: currentEmployee?.name || "Unknown",
          completedAt: isCompleted ? new Date().toISOString() : null
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
      });

      const results = await Promise.all(savePromises);
      const allSuccess = results.every(result => result.success);
      
      if (allSuccess) {
        console.log('모든 인스턴스가 성공적으로 저장되었습니다.');
        setSuccess('진행 상태가 저장되었습니다.');
        setTimeout(() => setSuccess(''), 3000);
        
        // 저장 후 상태 다시 로드하지 않음 (로컬 상태 유지)
        // await fetchProgress();
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
      if (selectedChecklist) {
        await saveProgress(selectedChecklist.id);
      }

      // 시간대 잠금 해제
      if (filters.workplace && filters.timeSlot) {
        await unlockTimeSlot(filters.workplace, filters.timeSlot);
      }

      // 이메일 발송
      if (selectedChecklist) {
        try {
          // 실제 템플릿 ID 찾기
          const actualTemplateId = selectedChecklist.groupInstances?.[0]?.templateId;
          console.log('실제 템플릿 ID:', actualTemplateId);
          
          const emailData = {
            templateId: actualTemplateId || selectedChecklist.id,
            checklistItemsProgress: selectedChecklist.items
              ?.filter((item: any) => {
                // 실제 ChecklistItem이고 완료된 것만
                return item.id && checklistItems[item.id]?.isCompleted;
              })
              .map((item: any) => ({
                itemId: item.id,
                isCompleted: checklistItems[item.id].isCompleted,
                notes: checklistItems[item.id].notes || "",
                completedBy: checklistItems[item.id].completedBy,
                completedAt: checklistItems[item.id].completedAt
              })) || [],
            connectedItemsProgress: Object.entries(connectedItemsStatus)
              .map(([connectionId, status]: [string, any]) => ({
                connectionId: connectionId,
                itemId: status.itemId,
                isCompleted: status.isCompleted,
                notes: status.notes || "",
                completedBy: status.completedBy,
                completedAt: status.completedAt,
                currentStock: status.currentStock,
                updatedStock: status.updatedStock
              }))
          };

          console.log('=== 이메일 발송 데이터 ===');
          console.log('selectedChecklist 전체:', selectedChecklist);
          console.log('selectedChecklist.id:', selectedChecklist?.id);
          console.log('selectedChecklist.name:', selectedChecklist?.name);
          console.log('emailData:', JSON.stringify(emailData, null, 2));

          // 이메일 발송을 위한 별도 요청
          try {
            console.log('이메일 발송 요청 시작...');
            const emailResponse = await fetch('/api/employee/checklist-progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                ...emailData,
                sendEmail: true // 이메일 발송 플래그 추가
              })
            });

            if (emailResponse.ok) {
              console.log('이메일 발송 성공');
            } else {
              console.error('이메일 발송 실패');
            }
          } catch (emailError) {
            console.error('이메일 발송 오류:', emailError);
          }
        } catch (emailError) {
          console.error('이메일 발송 오류:', emailError);
        }
      }

      // 제출 완료 상태로 업데이트
      if (selectedChecklist) {
        setChecklists(prevChecklists => 
          prevChecklists.map(checklist => 
            checklist.id === selectedChecklist.id 
              ? { ...checklist, isSubmitted: true }
              : checklist
          )
        );
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

  // 체크리스트 상태 계산 함수 (상위+하위 합산 기준)
  const calculateChecklistStatus = (checklist: ChecklistTemplate) => {
    const instance = checklist.groupInstances?.[0];
    if (!instance) return { status: '미시작', color: 'gray', progress: null, connectedItems: null };
    
    if (instance.isSubmitted) {
      return { status: '제출 완료', color: 'green', progress: null, connectedItems: null };
    }
    
    // 진행상황 계산 - 상위+하위 합산 기준
    let totalItems = 0;
    let completedItems = 0;
    
    (checklist.items || []).forEach((item: any) => {
      // 상위 항목
      totalItems += 1;
      if (checklistItems[item.id]?.isCompleted) {
        completedItems += 1;
      }
      // 하위 항목들
      const connections = item.connectedItems || [];
      totalItems += connections.length;
      connections.forEach((connection: any) => {
        if (connectedItemsStatus[connection.id]?.isCompleted) {
          completedItems += 1;
        }
      });
    });
    
    if (totalItems === 0) return { status: '미시작', color: 'gray', progress: null, connectedItems: null };
    
    // 연결된 항목 종류별 개수 계산
    const connectedItemsCount = {
      inventory: 0,
      precaution: 0,
      manual: 0
    };
    
    checklist.items?.forEach((item: any) => {
      if (item.connectedItems && item.connectedItems.length > 0) {
        item.connectedItems.forEach((connection: any) => {
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
    
    // 퍼센트 계산 (합산 기준)
    const progressPercent = Math.round((completedItems / totalItems) * 100);
    
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

  // 상태 정보 가져오기: 사용되지 않는 재귀 함수 제거

  const handleChecklistSelect = (checklist: ChecklistTemplate) => {
    // 연결항목 캐시 초기화 (체크리스트 전환 시 최신화)
    connectedItemCacheRef.current = {} as any;
    setSelectedChecklist(checklist);
    setCurrentView('detail');
    updateURL('detail', checklist.id);
    
    // 기존 진행 상태 로드
    const existingInstance = checklist.groupInstances?.[0];
    if (existingInstance) {
      console.log('기존 인스턴스 로드:', existingInstance);
      
      // 메인 항목 상태 복원 - 체크리스트 ID를 키로 사용
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

      // 연결된 항목 상태 복원 - connectionId를 키로 사용
      if (existingInstance.connectedItemsProgress) {
        const connectedStatus: {[key: string]: any} = {};
        existingInstance.connectedItemsProgress.forEach((connectedItem: any) => {
          // connectionId를 키로 사용
          const key = connectedItem.connectionId || connectedItem.itemId;
          connectedStatus[key] = {
            itemId: connectedItem.itemId, // itemId 추가
            isCompleted: connectedItem.isCompleted,
            completedBy: connectedItem.completedBy,
            completedAt: connectedItem.completedAt,
            notes: connectedItem.notes || "",
            currentStock: connectedItem.currentStock,
            updatedStock: connectedItem.updatedStock
          };
        });
        
        console.log('복원된 연결 항목 상태:', connectedStatus);
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
    
    // 연결된 항목 상세 정보 로드
    if (checklist.items) {
      checklist.items.forEach(item => {
        if (item.connectedItems && item.connectedItems.length > 0) {
          loadConnectedItemDetails(item);
        }
      });
    }
  };

  const handleBackToList = async () => {
    // 화면 전환
    setCurrentView('list');
    setSelectedChecklist(null);
    setExpandedItems({});
    setShowMemoInputs({});
    updateURL('list');
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">체크리스트</h1>
        <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8">{formattedDate}</p>

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
            <ChecklistList
              checklists={checklists}
              onChecklistSelect={handleChecklistSelect}
              getChecklistStatus={calculateChecklistStatus}
              connectedItemsStatus={connectedItemsStatus}
              checklistItems={checklistItems}
              getWorkplaceLabel={getWorkplaceLabel}
              getTimeSlotLabel={getTimeSlotLabel}
              getCategoryLabel={getCategoryLabel}
            />
          </>
        )}

        {/* 상세 화면 */}
        {currentView === 'detail' && selectedChecklist && (
          <ChecklistDetailView
            selectedChecklist={selectedChecklist}
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
            isAllItemsCompleted={checkAllItemsCompleted}
            handleCheckboxChange={handleCheckboxChange}
            handleConnectedItemCheckboxChange={handleConnectedItemCheckboxChange}
            toggleItemExpansion={toggleItemExpansion}
            handleNotesChange={handleNotesChange}
            toggleMemoInput={toggleMemoInput}
            saveMemo={saveMemo}
            saveProgress={saveProgress}
            handleSubmit={handleSubmit}
            onInventoryUpdate={handleInventoryUpdate}
          />
        )}
      </div>

      {/* 토스트 알림 */}
      {toast && toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 