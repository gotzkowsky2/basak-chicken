"use client";

import React, { memo, useCallback, useMemo, useState } from 'react';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ChecklistItemType {
  id: string;
  content: string;
  instructions?: string;
  connectedItems?: Array<{
    id: string;
    itemId: string;
    itemType: 'inventory' | 'precaution' | 'manual';
    order: number;
  }>;
}

import { ConnectedItemStatus, ConnectedItemDetails, Employee } from "@/types/checklist";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isCompleted: boolean;
  onCheckboxChange: (id: string) => void;
  connectedItemsStatus: {[key: string]: ConnectedItemStatus};
  connectedItemsDetails: {[key: string]: ConnectedItemDetails};
  onConnectedItemCheckboxChange: (connectionId: string, parentItemId: string) => Promise<void>;
  expandedItems: {[key: string]: boolean};
  onToggleExpansion: (itemId: string) => void;
  notes?: string;
  onNotesChange?: (id: string, notes: string) => void;
  isReadOnly?: boolean;
  completedBy?: string;
  completedAt?: string;
  showMemoInputs?: {[key: string]: boolean};
  toggleMemoInput?: (id: string) => void;
  saveMemo?: (id: string) => Promise<void>;
  currentEmployee?: Employee;
  onInventoryUpdate?: (itemId: string, currentStock: number, notes?: string) => Promise<void>;
}

function ChecklistItem({
  item,
  isCompleted,
  onCheckboxChange,
  connectedItemsStatus,
  connectedItemsDetails,
  onConnectedItemCheckboxChange,
  expandedItems,
  onToggleExpansion,
  notes,
  onNotesChange,
  isReadOnly = false,
  completedBy,
  completedAt,
  showMemoInputs,
  toggleMemoInput,
  saveMemo,
  currentEmployee,
  onInventoryUpdate
}: ChecklistItemProps) {

  const handleCheckboxChange = useCallback(() => {
    if (!isReadOnly) {
      onCheckboxChange(item.id);
    }
  }, [isReadOnly, onCheckboxChange, item.id]);

  const handleNotesSave = useCallback(() => {
    if (onNotesChange && notes !== undefined) {
      onNotesChange(item.id, notes);
    }
  }, [onNotesChange, notes, item.id]);

  const isExpanded = expandedItems[item.id] || false;

  const scrollToExpandedContent = () => {
    setTimeout(() => {
      const element = document.getElementById(`detail-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // 팝업 모달 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [expandedPrecautions, setExpandedPrecautions] = useState<Set<number>>(new Set());

  // 팝업 열기
  const openDetailModal = async (itemData: { itemType: string; itemId: string }) => {
    
    // 최신 데이터 가져오기
    try {
      const url = `/api/employee/connected-items?type=${itemData.itemType}&id=${itemData.itemId}`;
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store'
      });
      
      
      
      if (response.ok) {
        const latestData = await response.json();
        
        setSelectedItem({
          ...latestData,
          itemType: itemData.itemType
        });
      } else {
        console.error('데이터 조회 실패:', response.status);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('최신 데이터 조회 오류:', error);
      setSelectedItem(null);
    }
    
    setShowDetailModal(true);
  };

  // 팝업 닫기
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
    setExpandedPrecautions(new Set());
  };

  // 주의사항 접기/펼치기 토글
  const togglePrecautionExpansion = (index: number) => {
    setExpandedPrecautions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return '높음';
      case 2: return '보통';
      case 3: return '낮음';
      default: return `우선순위 ${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-200 text-red-800';
      case 2: return 'bg-yellow-200 text-yellow-800';
      case 3: return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // 미리보기 텍스트 생성 (150자 제한)
  const getPreviewText = (content: string) => {
    if (content.length <= 150) {
      return content;
    }
    return content.substring(0, 150) + '...';
  };

  return (
         <div className={`${
           isCompleted 
             ? 'bg-gray-100 border-gray-300' 
             : 'bg-pink-50 border-pink-200'
         } border rounded-lg p-3 sm:p-4 mb-4 transition-all duration-300`}>
      {/* 메인 항목 */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          disabled={isReadOnly}
          className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        
        <div className="flex-1">
          {/* 첫째줄: 제목과 연결항목 아이콘 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-semibold flex-1 ${
              isCompleted 
                ? 'text-gray-500 line-through' 
                : 'text-gray-800'
            }`}>
              {item.content}
            </h3>
            
                         {/* 연결항목 아이콘들 */}
             {item.connectedItems && item.connectedItems.length > 0 && (
               <div className="flex items-center gap-1 ml-2">
                 {(() => {
                   // 카테고리별 개수 계산
                   const counts = {
                     inventory: 0,
                     precaution: 0,
                     manual: 0
                   };
                   
                   item.connectedItems.forEach((connection) => {
                     if (connection.itemType === 'inventory') {
                       counts.inventory++;
                     } else if (connection.itemType === 'precaution') {
                       counts.precaution++;
                     } else if (connection.itemType === 'manual') {
                       counts.manual++;
                     }
                   });
                   
                   return (
                     <>
                       {counts.inventory > 0 && (
                         <div
                           className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-blue-500 text-white"
                           title={`재고: ${counts.inventory}개`}
                         >
                           {counts.inventory}
                         </div>
                       )}
                       {counts.precaution > 0 && (
                         <div
                           className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-red-500 text-white"
                           title={`주의사항: ${counts.precaution}개`}
                         >
                           {counts.precaution}
                         </div>
                       )}
                       {counts.manual > 0 && (
                         <div
                           className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-purple-500 text-white"
                           title={`매뉴얼: ${counts.manual}개`}
                         >
                           {counts.manual}
                         </div>
                       )}
                     </>
                   );
                 })()}
               </div>
             )}
          </div>

                     {/* 둘째줄: 완료자 정보 */}
           {completedBy && (
             <div className="mb-2">
               <div className="flex items-center gap-2">
                 <span className={`text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>✅ 완료자:</span>
                 <span className={`text-sm font-medium ${isCompleted ? 'text-gray-500' : 'text-green-700'}`}>{completedBy}</span>
               </div>
               {completedAt && (
                 <div className="flex items-center gap-2 mt-1 ml-6 sm:ml-0 sm:mt-0 sm:inline">
                   <span className={`text-sm ${isCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                     {new Date(completedAt).toLocaleDateString()}
                   </span>
                   <span className={`text-sm ${isCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                     {new Date(completedAt).toLocaleTimeString()}
                   </span>
                 </div>
               )}
             </div>
           )}

          {/* 셋째줄: 메모 (하위 항목이 없을 때만) */}
          {(!item.connectedItems || item.connectedItems.length === 0) && notes && !showMemoInputs?.[item.id] && (
            <div className={`${isCompleted ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-2 mb-2`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className={isCompleted ? 'text-gray-500' : 'text-blue-600'}>📝</span>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-gray-500' : 'text-blue-700'}`}>메모</span>
                </div>
                {!isReadOnly && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMemoInput?.(item.id);
                      }}
                      className={`${isCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-blue-600 hover:text-blue-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                      title="수정"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onNotesChange) {
                          onNotesChange(item.id, "");
                        }
                      }}
                      className={`${isCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-red-600 hover:text-red-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                      title="삭제"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
              <div className={`text-sm ${isCompleted ? 'text-gray-500' : 'text-gray-700'}`}>{notes}</div>
            </div>
          )}

                     {/* 넷째줄: 우측 아이콘들 */}
           <div className="flex items-center justify-end gap-2">
             {/* 세부항목 토글 아이콘 (연결된 항목이 있을 때만) */}
             {item.connectedItems && item.connectedItems.length > 0 && (
               <button
                 onClick={() => {
                   onToggleExpansion(item.id);
                   if (!isExpanded) {
                     scrollToExpandedContent();
                   }
                 }}
                 className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                 title="세부 항목"
               >
                 <svg 
                   className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                   fill="none" 
                   stroke="currentColor" 
                   viewBox="0 0 24 24"
                 >
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </button>
             )}

             {/* 메모 아이콘 (하위 항목이 없을 때만) */}
             {(!item.connectedItems || item.connectedItems.length === 0) && !notes && toggleMemoInput && (
               <button
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   toggleMemoInput(item.id);
                 }}
                 className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                 title="메모"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                 </svg>
               </button>
             )}
           </div>
        </div>
      </div>

      {/* 연결된 항목들 */}
      {isExpanded && item.connectedItems && item.connectedItems.length > 0 && (
        <div id={`detail-${item.id}`} className="mt-4 pl-4 sm:pl-8 border-l-2 border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">세부 항목</h4>
          

          
          <div className="space-y-3 sm:space-y-4">
            {item.connectedItems!
              .sort((a, b) => {
                // 먼저 카테고리별로 정렬 (재고 → 주의사항 → 매뉴얼)
                const categoryOrder = { 'inventory': 1, 'precaution': 2, 'manual': 3 };
                const aCategory = categoryOrder[a.itemType as keyof typeof categoryOrder] || 4;
                const bCategory = categoryOrder[b.itemType as keyof typeof categoryOrder] || 4;
                
                if (aCategory !== bCategory) {
                  return aCategory - bCategory;
                }
                
                // 같은 카테고리 내에서는 order로 정렬
                return a.order - b.order;
              })

              .map((connection, index) => {
              const key = `${connection.itemType}_${connection.itemId}`;
              const connectionDetails = connectedItemsDetails[key];
              const isConnectionCompleted = connectedItemsStatus[connection.id]?.isCompleted || false;
              const isConnectionExpanded = expandedItems[`${item.id}_${connection.id}`] || false;
              
              return (
                                 <div 
                   key={connection.id} 
                   className={`border-b-2 border-gray-300 last:border-b-0 transition-all duration-300 ease-in-out ${
                     isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                   } ${isConnectionCompleted ? 'bg-gray-100' : 'bg-pink-50'}`}
                   style={{
                     transitionDelay: isExpanded ? `${index * 100}ms` : '0ms'
                   }}
                 >
                   <div className="px-2 sm:px-4 py-4 sm:py-6 ml-2 sm:ml-4 border-l-2 border-gray-200 relative">
                    {/* 하위 항목 번호 */}
                                         <div className="absolute -left-2 top-4 sm:top-6 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                                         <div className="flex items-start gap-2 sm:gap-3">
                       <input
                         type="checkbox"
                         checked={isConnectionCompleted}
                         onChange={async () => await onConnectedItemCheckboxChange(connection.id, item.id)}
                         disabled={isReadOnly || connection.itemType === 'inventory'}
                         className={`mt-1 w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                           connection.itemType === 'inventory' ? 'opacity-50 cursor-not-allowed' : ''
                         }`}
                         title={connection.itemType === 'inventory' ? '재고 항목은 수량 업데이트를 통해 완료됩니다' : ''}
                       />
                       
                       <div className="flex-1 space-y-3 min-w-0">
                                                 {/* 첫째줄: 아이콘과 이름 */}
                         <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                           <span className={`text-xs px-1 sm:px-2 py-1 rounded flex items-center gap-1 flex-shrink-0 ${
                             connection.itemType === 'inventory' ? 'bg-blue-100 text-blue-700' : 
                             connection.itemType === 'precaution' ? 'bg-red-100 text-red-700' : 
                             connection.itemType === 'manual' ? 'bg-purple-100 text-purple-700' : 
                             'bg-gray-100 text-gray-700'
                           }`}>
                            {connection.itemType === 'inventory' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            )}
                            {connection.itemType === 'precaution' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            )}
                            {connection.itemType === 'manual' && (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            )}
                            {connection.itemType === 'inventory' ? '재고' : 
                             connection.itemType === 'precaution' ? '주의사항' : 
                             connection.itemType === 'manual' ? '메뉴얼' : '연결된 항목'}
                          </span>
                          
                          <div className="w-full">
                            <h4 className={`font-medium text-sm break-words ${
                              isConnectionCompleted 
                                ? 'text-gray-500 line-through' 
                                : 'text-gray-800'
                            }`}>
                              {connectionDetails ? (
                                connection.itemType === 'inventory' ? connectionDetails.name :
                                connection.itemType === 'precaution' ? connectionDetails.title :
                                connection.itemType === 'manual' ? connectionDetails.title :
                                '연결된 항목'
                              ) : (
                                '로딩 중...'
                              )}
                            </h4>
                          </div>
                        </div>

                        {/* 재고 항목 전용 정보 */}
                        {connection.itemType === 'inventory' && connectionDetails && (
                          <>
                            {/* 둘째줄: 현재재고와 구매필요 정보 */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">현재재고:</span>
                                <span className="text-sm font-semibold text-gray-800">
                                 {Math.round(connectionDetails.currentStock ?? 0)} {connectionDetails.unit}
                                </span>
                              </div>
                             {(connectionDetails.currentStock ?? 0) <= (connectionDetails.minStock || 0) && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-red-600 font-medium">🛒</span>
                                  <span className="text-xs text-red-600">구매 필요</span>
                                </div>
                              )}
                            </div>

                                                         {/* 셋째줄: 수량 입력 */}
                             <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                 <span className="text-xs font-medium text-gray-700 flex-shrink-0">수량:</span>
                                 <input
                                   type="number"
                                   min="0"
                                   step="1"
                                  defaultValue={Math.round(connectionDetails.currentStock ?? 0)}
                                   disabled={isReadOnly}
                                   data-inventory-id={connectionDetails.id}
                                   className="w-16 sm:w-20 text-sm border border-gray-300 rounded px-1 sm:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const newStock = parseInt(e.currentTarget.value) || 0;
                                      if (onInventoryUpdate && connectionDetails) {
                                       
                                        try {
                                          await onInventoryUpdate(connectionDetails.id, newStock);
                                        } catch (error) {
                                          console.error('재고 업데이트 함수 호출 실패:', error);
                                        }
                                      } else {
                                        console.error('재고 업데이트 함수가 없거나 connectionDetails가 없음');
                                      }
                                    }
                                  }}
                                  onFocus={(e) => {
                                    // 포커스 시 전체 선택
                                    e.target.select();
                                  }}
                                />
                                                                 <span className="text-xs font-medium text-gray-700 flex-shrink-0">{connectionDetails.unit}</span>
                                 <button
                                   onClick={async () => {
                                    const input = document.querySelector(`input[data-inventory-id="${connectionDetails.id}"]`) as HTMLInputElement;
                                    if (input && onInventoryUpdate && connectionDetails) {
                                      const newStock = parseInt(input.value) || 0;
                                       
                                      try {
                                         await onInventoryUpdate(connectionDetails.id, newStock);
                                      } catch (error) {
                                        console.error('재고 업데이트 함수 호출 실패:', error);
                                      }
                                    } else {
                                      console.error('재고 업데이트 함수가 없거나 connectionDetails가 없음');
                                    }
                                  }}
                                                                     disabled={isReadOnly}
                                   className="px-2 sm:px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
                                 >
                                   입력
                                 </button>
                              </div>
                            </div>

                                                         {/* 넷째줄: 재고 변경 정보 표시 */}
                             {connectionDetails && connection.itemType === 'inventory' && connectedItemsStatus[connection.id]?.isCompleted && (
                               <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                                 <div className="text-xs text-green-700 font-medium mb-1">✅ 재고 업데이트 완료</div>
                                 <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  {connectedItemsStatus[connection.id].previousStock !== undefined ? (
                                    <>
                                      <span className="line-through text-gray-500 text-xs">
                                        {connectedItemsStatus[connection.id].previousStock} {connectionDetails.unit}
                                      </span>
                                      <span className="text-green-600 font-semibold text-xs">
                                       → {(connectedItemsStatus[connection.id].updatedStock ?? connectionDetails.currentStock ?? 0)} {connectionDetails.unit}
                                      </span>
                                      {(connectedItemsStatus[connection.id].stockChange ?? 0) > 0 && (
                                        <span className="text-green-600 font-semibold text-xs">
                                          (+{connectedItemsStatus[connection.id].stockChange})
                                        </span>
                                      )}
                                      {(connectedItemsStatus[connection.id].stockChange ?? 0) < 0 && (
                                        <span className="text-red-600 font-semibold text-xs">
                                          ({connectedItemsStatus[connection.id].stockChange})
                                        </span>
                                      )}
                                      {(connectedItemsStatus[connection.id].stockChange ?? 0) === 0 && (
                                        <span className="text-gray-600 font-semibold text-xs">
                                          (변경 없음)
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-green-600 font-semibold text-xs">
                                      {connectionDetails.currentStock} {connectionDetails.unit} (업데이트 완료)
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 다섯째줄: 안내문구 */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <p className="text-xs text-orange-700 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>재고 항목은 수량 업데이트를 통해 완료됩니다</span>
                              </p>
                            </div>

                                                         {/* 여섯째줄: 완료자 정보 */}
                             {connectedItemsStatus[connection.id]?.completedBy && (
                               <div className="space-y-1">
                                 <div className="flex items-center gap-2">
                                   <span className="text-xs text-gray-500">✅ 완료자:</span>
                                   <span className="text-xs font-medium text-green-700">
                                     {connectedItemsStatus[connection.id].completedBy}
                                   </span>
                                 </div>
                                 {connectedItemsStatus[connection.id].completedAt && (
                                   <div className="flex items-center gap-2 mt-1 ml-4 sm:ml-0 sm:mt-0 sm:inline">
                                     <span className="text-xs text-gray-400">
                                       {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleDateString()}
                                     </span>
                                     <span className="text-xs text-gray-400">
                                       {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleTimeString()}
                                     </span>
                                   </div>
                                 )}
                               </div>
                             )}

                            {/* 일곱째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && !showMemoInputs?.[connection.id] && (
                              <div className={`w-full ${isConnectionCompleted ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-2`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-600'}`}>📝</span>
                                    <span className={`text-xs font-medium ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-700'}`}>메모</span>
                                  </div>
                                  {!isReadOnly && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleMemoInput?.(connection.id);
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-blue-600 hover:text-blue-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="수정"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (onNotesChange) {
                                            onNotesChange(connection.id, "");
                                          }
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-red-600 hover:text-red-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="삭제"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {connectedItemsStatus[connection.id].notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 주의사항 항목 */}
                        {connectionDetails && connection.itemType === 'precaution' && (
                          <>
                            {/* 둘째줄: 주의사항 내용 미리보기 */}
                            <div 
                              onClick={() => openDetailModal({
                                itemType: connection.itemType,
                                itemId: connection.itemId
                              })}
                              className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                            >
                              <div className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                {getPreviewText(connectionDetails.content ?? '')}
                              </div>
                              <div className="mt-2 text-xs text-orange-600 font-medium">
                                클릭하여 전체 내용 보기 →
                              </div>
                            </div>

                            {/* 셋째줄: 안내문구 */}
                            <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                              <p className="text-xs text-yellow-700 flex items-center gap-1">
                                <span>💡</span>
                                <span>주의사항을 확인하고 체크해주세요</span>
                              </p>
                            </div>

                            {/* 넷째줄: 완료자 정보 */}
                            {connectedItemsStatus[connection.id]?.completedBy && (
                              <div className="w-full space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${isConnectionCompleted ? 'text-gray-400' : 'text-gray-500'}`}>✅ 완료자:</span>
                                  <span className={`text-xs font-medium ${isConnectionCompleted ? 'text-gray-500' : 'text-green-700'}`}>
                                    {connectedItemsStatus[connection.id].completedBy}
                                  </span>
                                </div>
                                {connectedItemsStatus[connection.id].completedAt && (
                                  <div className="flex items-center gap-2 mt-1 ml-4 sm:ml-0 sm:mt-0 sm:inline">
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                                   {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                                   {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 다섯째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && !showMemoInputs?.[connection.id] && (
                              <div className={`w-full ${isConnectionCompleted ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-2`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-600'}`}>📝</span>
                                    <span className={`text-xs font-medium ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-700'}`}>메모</span>
                                  </div>
                                  {!isReadOnly && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleMemoInput?.(connection.id);
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-blue-600 hover:text-blue-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="수정"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (onNotesChange) {
                                            onNotesChange(connection.id, "");
                                          }
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-red-600 hover:text-red-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="삭제"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {connectedItemsStatus[connection.id].notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 매뉴얼 항목 */}
                        {connectionDetails && connection.itemType === 'manual' && (
                          <>
                            {/* 둘째줄: 매뉴얼 내용 미리보기 */}
                            <div 
                              onClick={() => openDetailModal({
                                itemType: connection.itemType,
                                itemId: connection.itemId
                              })}
                              className="w-full p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                            >
                              <div className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                {getPreviewText(connectionDetails.content ?? '')}
                              </div>
                              <div className="mt-2 text-xs text-green-600 font-medium">
                                클릭하여 전체 내용 보기 →
                              </div>
                            </div>

                            {/* 셋째줄: 안내문구 */}
                            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2">
                              <p className="text-xs text-blue-700 flex items-center gap-1">
                                <span>📋</span>
                                <span>매뉴얼을 확인하고 체크해주세요</span>
                              </p>
                            </div>

                            {/* 넷째줄: 완료자 정보 */}
                            {connectedItemsStatus[connection.id]?.completedBy && (
                              <div className="w-full space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs ${isConnectionCompleted ? 'text-gray-400' : 'text-gray-500'}`}>✅ 완료자:</span>
                                  <span className={`text-xs font-medium ${isConnectionCompleted ? 'text-gray-500' : 'text-green-700'}`}>
                                    {connectedItemsStatus[connection.id].completedBy}
                                  </span>
                                </div>
                                {connectedItemsStatus[connection.id].completedAt && (
                                  <div className="flex items-center gap-2 mt-1 ml-4 sm:ml-0 sm:mt-0 sm:inline">
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                                   {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleDateString()}
                                    </span>
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                                   {new Date(connectedItemsStatus[connection.id].completedAt ?? '').toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 다섯째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && !showMemoInputs?.[connection.id] && (
                              <div className={`w-full ${isConnectionCompleted ? 'bg-gray-100 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-2`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-600'}`}>📝</span>
                                    <span className={`text-xs font-medium ${isConnectionCompleted ? 'text-gray-500' : 'text-blue-700'}`}>메모</span>
                                  </div>
                                  {!isReadOnly && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          toggleMemoInput?.(connection.id);
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-blue-600 hover:text-blue-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="수정"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (onNotesChange) {
                                            onNotesChange(connection.id, "");
                                          }
                                        }}
                                        className={`${isConnectionCompleted ? 'text-gray-400 hover:text-gray-600' : 'text-red-600 hover:text-red-800'} text-xs p-1 rounded hover:bg-gray-100 transition-colors`}
                                        title="삭제"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <div className={`text-xs ${isConnectionCompleted ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {connectedItemsStatus[connection.id].notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                                     {/* 연결된 항목용 메모 입력 */}
                   <div className="mt-3 ml-2 sm:ml-5 space-y-2 mb-4">
                    {/* 메모 입력창 */}
                    {showMemoInputs?.[connection.id] && (
                      <div
                        className="bg-yellow-100 border-2 border-yellow-600 rounded-lg p-3"
                        onClick={(e)=>e.stopPropagation()}
                        onMouseDown={(e)=>e.stopPropagation()}
                        onPointerDown={(e)=>e.stopPropagation()}
                        style={{ position: 'relative', zIndex: 1 }}
                        role="region"
                        aria-label="연결된 항목 메모 입력"
                      >
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-blue-600">📝</span>
                          <span className="text-xs font-medium text-blue-700">메모 입력</span>
                        </div>
                        <textarea
                          value={connectedItemsStatus[connection.id]?.notes || ''}
                          onChange={(e) => onNotesChange?.(connection.id, e.target.value)}
                          onKeyDown={(e)=>{ e.stopPropagation(); }}
                          onClick={(e)=>{ e.stopPropagation(); }}
                          placeholder="메모를 입력하세요..."
                          className="w-full text-sm border-2 border-yellow-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent text-gray-900 font-semibold bg-white"
                          rows={3}
                          readOnly={false}
                          disabled={false}
                          autoFocus
                          tabIndex={0}
                          style={{ pointerEvents: 'auto', cursor: 'text', position: 'relative', zIndex: 2 }}
                        />
                        <div className="flex gap-2 mt-2">
                          {saveMemo && (
                            <button
                              onClick={async () => await saveMemo(connection.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                              저장
                            </button>
                          )}
                          {toggleMemoInput && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleMemoInput(connection.id);
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                            >
                              취소
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 메모 추가 버튼 (메모가 없고 입력창이 열려있지 않을 때) */}
                    {!connectedItemsStatus[connection.id]?.notes && !showMemoInputs?.[connection.id] && toggleMemoInput && (
                      <div className="flex justify-start">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleMemoInput(connection.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                        >
                          <span>📝</span>
                          <span>메모</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 상위 체크리스트 메모 입력창 (하위 항목이 없을 때만) */}
      {(!item.connectedItems || item.connectedItems.length === 0) && showMemoInputs?.[item.id] && (
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-blue-600">📝</span>
            <span className="text-sm font-medium text-blue-700">메모 입력</span>
          </div>
          <textarea
            value={notes || ''}
            onChange={(e) => onNotesChange?.(item.id, e.target.value)}
            placeholder="메모를 입력하세요..."
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 font-medium"
            rows={3}
          />
          <div className="flex gap-2 mt-2">
            {saveMemo && (
              <button
                onClick={async () => await saveMemo(item.id)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            )}
            {toggleMemoInput && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMemoInput(item.id);
                }}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}

      {/* 상세 내용 팝업 모달 */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeDetailModal}
          ></div>

          {/* 모달 컨테이너 */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedItem.itemType === 'manual' && (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {selectedItem.itemType === 'precaution' && (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {selectedItem.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    selectedItem.itemType === 'manual' ? 'bg-green-100 text-green-800' :
                    selectedItem.itemType === 'precaution' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedItem.itemType === 'manual' ? '📖 매뉴얼' :
                     selectedItem.itemType === 'precaution' ? '⚠️ 주의사항' :
                     '📦 재고'}
                  </span>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* 태그 표시 */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItem.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* 전체 내용 */}
                <div className="prose max-w-none mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {selectedItem.content}
                    </p>
                  </div>
                </div>

                {/* 매뉴얼의 경우 연결된 주의사항 표시 */}
                {selectedItem.itemType === 'manual' && selectedItem.precautions && selectedItem.precautions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">연결된 주의사항</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {selectedItem.precautions.length}개
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedItem.precautions.map((precaution: any, index: number) => {
                        const isExpanded = expandedPrecautions.has(index);
                        
                        return (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-red-900 text-sm sm:text-base">{precaution.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(precaution.priority)}`}>
                                {getPriorityLabel(precaution.priority)}
                              </span>
                            </div>
                            
                            {/* 주의사항 내용 (접기/펼치기) */}
                            <div className="mb-3">
                              <div className="overflow-hidden transition-all duration-300 ease-in-out">
                                <p className="text-red-800 text-sm whitespace-pre-wrap leading-relaxed">
                                  {isExpanded ? precaution.content : (precaution.content.length > 10 ? precaution.content.substring(0, 10) + '...' : precaution.content)}
                                </p>
                              </div>
                              
                              {precaution.content.length > 10 && (
                                <button
                                  onClick={() => togglePrecautionExpansion(index)}
                                  className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm active:scale-95"
                                >
                                  <EyeIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                  {isExpanded ? "내용 접기" : "전체 내용 보기"}
                                </button>
                              )}
                            </div>
                            
                            {/* 주의사항 태그 */}
                            {precaution.tags && precaution.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {precaution.tags.map((tag: any) => (
                                  <span
                                    key={tag.id}
                                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-red-700">
                              <span>근무처: {getWorkplaceLabel(precaution.workplace)}</span>
                              <span>시간대: {getTimeSlotLabel(precaution.timeSlot)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 주의사항 태그 */}
                {selectedItem.itemType === 'precaution' && selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                
                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {getWorkplaceLabel(selectedItem.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getTimeSlotLabel(selectedItem.timeSlot)}
                  </span>
                  {selectedItem.itemType === 'manual' && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {selectedItem.category === 'MANUAL' ? '메뉴얼' : 
                       selectedItem.category === 'PROCEDURE' ? '절차' : 
                       selectedItem.category === 'GUIDE' ? '가이드' : 
                       selectedItem.category === 'TRAINING' ? '교육' : selectedItem.category}
                    </span>
                  )}
                  {selectedItem.itemType === 'precaution' && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedItem.priority)}`}>
                      {getPriorityLabel(selectedItem.priority)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedItem.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ChecklistItem);