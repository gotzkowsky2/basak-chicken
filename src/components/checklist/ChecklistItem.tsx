"use client";

import React from 'react';

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

interface ChecklistItemProps {
  item: ChecklistItemType;
  isCompleted: boolean;
  onCheckboxChange: (id: string) => void;
  connectedItemsStatus: any;
  connectedItemsDetails: any;
  onConnectedItemCheckboxChange: (connectionId: string, parentItemId: string) => Promise<void>;
  expandedItems: {[key: string]: boolean};
  onToggleExpansion: (itemId: string) => void;
  notes?: string;
  onNotesChange?: (id: string, notes: string) => void;
  isReadOnly?: boolean;
  completedBy?: string;
  completedAt?: string;
  showMemoInputs?: any;
  toggleMemoInput?: (id: string) => void;
  saveMemo?: (id: string) => Promise<void>;
  currentEmployee?: any;
  onInventoryUpdate?: (itemId: string, currentStock: number, notes?: string) => Promise<void>;
}

export default function ChecklistItem({
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

  const handleCheckboxChange = () => {
    if (!isReadOnly) {
      onCheckboxChange(item.id);
    }
  };

  const handleNotesSave = () => {
    if (onNotesChange && notes !== undefined) {
      onNotesChange(item.id, notes);
    }
  };

  const isExpanded = expandedItems[item.id] || false;

  const scrollToExpandedContent = () => {
    setTimeout(() => {
      const element = document.getElementById(`detail-${item.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
         <div className="bg-pink-100 border border-pink-300 rounded-lg p-3 sm:p-4 mb-4 transition-all duration-300">
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
            <h3 className="text-lg font-semibold text-gray-800 flex-1">
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
                 <span className="text-sm text-gray-500">✅ 완료자:</span>
                 <span className="text-sm font-medium text-green-700">{completedBy}</span>
               </div>
               {completedAt && (
                 <div className="flex items-center gap-2 mt-1 ml-6 sm:ml-0 sm:mt-0 sm:inline">
                   <span className="text-sm text-gray-400">
                     {new Date(completedAt).toLocaleDateString()}
                   </span>
                   <span className="text-sm text-gray-400">
                     {new Date(completedAt).toLocaleTimeString()}
                   </span>
                 </div>
               )}
             </div>
           )}

          {/* 셋째줄: 메모 (하위 항목이 없을 때만) */}
          {(!item.connectedItems || item.connectedItems.length === 0) && notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-blue-600">📝</span>
                <span className="text-sm font-medium text-blue-700">메모</span>
              </div>
              <div className="text-sm text-gray-700">{notes}</div>
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
             {(!item.connectedItems || item.connectedItems.length === 0) && toggleMemoInput && (
               <button
                 onClick={() => toggleMemoInput(item.id)}
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
              
              return (
                                 <div 
                   key={connection.id} 
                   className={`border-b-2 border-gray-300 last:border-b-0 transition-all duration-300 ease-in-out ${
                     isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                   } bg-yellow-50`}
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
                                                     <h4 className="font-medium text-sm text-gray-800 break-words">
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

                        {/* 재고 항목 전용 정보 */}
                        {connection.itemType === 'inventory' && connectionDetails && (
                          <>
                            {/* 둘째줄: 현재재고와 구매필요 정보 */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">현재재고:</span>
                                <span className="text-sm font-semibold text-gray-800">
                                  {Math.round(connectionDetails.currentStock) || 0} {connectionDetails.unit}
                                </span>
                              </div>
                              {connectionDetails.currentStock <= (connectionDetails.minStock || 0) && (
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
                                   defaultValue={Math.round(connectionDetails.currentStock) || 0}
                                   disabled={isReadOnly}
                                   data-inventory-id={connectionDetails.id}
                                   className="w-16 sm:w-20 text-sm border border-gray-300 rounded px-1 sm:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const newStock = parseInt(e.currentTarget.value) || 0;
                                      console.log('재고 Enter 키 입력:', { 
                                        itemId: connectionDetails.id, 
                                        newStock, 
                                        parentItemId: item.id,
                                        inputValue: e.currentTarget.value,
                                        onInventoryUpdate: !!onInventoryUpdate,
                                        connectionDetails: !!connectionDetails
                                      });
                                      if (onInventoryUpdate && connectionDetails) {
                                        console.log('재고 업데이트 함수 호출 시작');
                                        try {
                                          await onInventoryUpdate(connectionDetails.id, newStock);
                                          console.log('재고 업데이트 함수 호출 완료');
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
                                      console.log('재고 입력 버튼 클릭:', { 
                                        itemId: connectionDetails.id, 
                                        newStock, 
                                        parentItemId: item.id,
                                        inputValue: input.value,
                                        onInventoryUpdate: !!onInventoryUpdate,
                                        connectionDetails: !!connectionDetails
                                      });
                                      console.log('재고 업데이트 함수 호출 시작');
                                      try {
                                        await onInventoryUpdate(connectionDetails.id, newStock);
                                        console.log('재고 업데이트 함수 호출 완료');
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
                                        → {connectedItemsStatus[connection.id].updatedStock || connectionDetails.currentStock} {connectionDetails.unit}
                                      </span>
                                      {connectedItemsStatus[connection.id].stockChange > 0 && (
                                        <span className="text-green-600 font-semibold text-xs">
                                          (+{connectedItemsStatus[connection.id].stockChange})
                                        </span>
                                      )}
                                      {connectedItemsStatus[connection.id].stockChange < 0 && (
                                        <span className="text-red-600 font-semibold text-xs">
                                          ({connectedItemsStatus[connection.id].stockChange})
                                        </span>
                                      )}
                                      {connectedItemsStatus[connection.id].stockChange === 0 && (
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
                                       {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleDateString()}
                                     </span>
                                     <span className="text-xs text-gray-400">
                                       {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleTimeString()}
                                     </span>
                                   </div>
                                 )}
                               </div>
                             )}

                            {/* 일곱째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs text-blue-600">📝</span>
                                  <span className="text-xs font-medium text-blue-700">메모</span>
                                </div>
                                <div className="text-xs text-gray-700">
                                  {connectedItemsStatus[connection.id].notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 주의사항 항목 */}
                        {connectionDetails && connection.itemType === 'precaution' && (
                          <>
                            {/* 둘째줄: 주의사항 내용 */}
                            <div className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                {connectionDetails.content}
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
                                  <span className="text-xs text-gray-500">✅ 완료자:</span>
                                  <span className="text-xs font-medium text-green-700">
                                    {connectedItemsStatus[connection.id].completedBy}
                                  </span>
                                </div>
                                {connectedItemsStatus[connection.id].completedAt && (
                                  <div className="flex items-center gap-2 mt-1 ml-4 sm:ml-0 sm:mt-0 sm:inline">
                                    <span className="text-xs text-gray-400">
                                      {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 다섯째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && (
                              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs text-blue-600">📝</span>
                                  <span className="text-xs font-medium text-blue-700">메모</span>
                                </div>
                                <div className="text-xs text-gray-700">
                                  {connectedItemsStatus[connection.id].notes}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 매뉴얼 항목 */}
                        {connectionDetails && connection.itemType === 'manual' && (
                          <>
                            {/* 둘째줄: 매뉴얼 내용 */}
                            <div className="w-full p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                                {connectionDetails.content}
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
                                  <span className="text-xs text-gray-500">✅ 완료자:</span>
                                  <span className="text-xs font-medium text-green-700">
                                    {connectedItemsStatus[connection.id].completedBy}
                                  </span>
                                </div>
                                {connectedItemsStatus[connection.id].completedAt && (
                                  <div className="flex items-center gap-2 mt-1 ml-4 sm:ml-0 sm:mt-0 sm:inline">
                                    <span className="text-xs text-gray-400">
                                      {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(connectedItemsStatus[connection.id].completedAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 다섯째줄: 메모 정보 */}
                            {connectedItemsStatus[connection.id]?.notes && (
                              <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs text-blue-600">📝</span>
                                  <span className="text-xs font-medium text-blue-700">메모</span>
                                </div>
                                <div className="text-xs text-gray-700">
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-blue-600">📝</span>
                          <span className="text-xs font-medium text-blue-700">메모 입력</span>
                        </div>
                        <textarea
                          value={connectedItemsStatus[connection.id]?.notes || ''}
                          onChange={(e) => onNotesChange?.(connection.id, e.target.value)}
                          placeholder="메모를 입력하세요..."
                          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 font-medium"
                          rows={3}
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
                              onClick={() => toggleMemoInput(connection.id)}
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
                          onClick={() => toggleMemoInput(connection.id)}
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
                onClick={() => toggleMemoInput(item.id)}
                className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 