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
    onCheckboxChange(item.id);
  };

  const handleNotesSave = () => {
    // 메모 저장 로직
  };

  const hasConnectedItems = item.connectedItems && item.connectedItems.length > 0;
  const isExpanded = expandedItems[item.id] || false;

  const isDisabledByOther = completedBy && completedBy !== currentEmployee?.name;

  // 자동 스크롤 함수
  const scrollToExpandedContent = () => {
    if (isExpanded && hasConnectedItems) {
      setTimeout(() => {
        const element = document.getElementById(`checklist-item-${item.id}`);
        if (element) {
          // 세부항목 헤더가 보이도록 스크롤 위치 조정
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          // 세부항목 헤더가 상단에 오도록 조정 (더 정확한 위치)
          const targetPosition = scrollTop + rect.top + 120; // 세부항목 헤더 위치
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 400); // 애니메이션 완료 후 스크롤
    }
  };

  // 펼치기/접기 상태 변경 시 자동 스크롤
  React.useEffect(() => {
    if (isExpanded && hasConnectedItems) {
      scrollToExpandedContent();
    }
  }, [isExpanded, hasConnectedItems]);

  return (
    <div 
      id={`checklist-item-${item.id}`}
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow mb-4"
    >
      {/* 메인 항목 헤더 */}
      <div className="px-4 py-3 bg-pink-50 border-b border-pink-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex-shrink-0">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleCheckboxChange}
                  disabled={isDisabledByOther || isReadOnly}
                  className={`w-full h-full text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                    hasConnectedItems ? 'cursor-pointer' : ''
                  } ${(isDisabledByOther || isReadOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {/* 첫째줄: 아이콘과 제목 */}
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-lg">📋</span>
                <h3 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900">
                  {item.content}
                </h3>
                {/* 메모 아이콘 (하위 항목이 없을 때만) */}
                {!hasConnectedItems && toggleMemoInput && (
                  <button
                    onClick={() => toggleMemoInput(item.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50 transition-colors"
                    title="메모 추가"
                  >
                    📝
                  </button>
                )}
              </div>
              
              {/* 연결항목 개수 제거 - 아이콘으로 표시되므로 */}
              
              {/* 셋째줄: 하위항목 종류별 정보 */}
              {hasConnectedItems && (
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const counts = {
                      inventory: 0,
                      precaution: 0,
                      manual: 0
                    };
                    
                    item.connectedItems?.forEach((connection) => {
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
                          <span className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="hidden sm:inline">재고</span>
                            <span>{counts.inventory}</span>
                          </span>
                        )}
                        {counts.precaution > 0 && (
                          <span className="flex items-center gap-1 bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="hidden sm:inline">주의</span>
                            <span>{counts.precaution}</span>
                          </span>
                        )}
                        {counts.manual > 0 && (
                          <span className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span className="hidden sm:inline">매뉴얼</span>
                            <span>{counts.manual}</span>
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
              
              {/* 지시사항 */}
              {item.instructions && (
                <div className="text-xs text-gray-600">
                  {item.instructions}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 펼치기/접기 버튼 */}
            {hasConnectedItems && (
              <button
                onClick={() => onToggleExpansion(item.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메인 항목 메모 입력창 (하위항목이 없을 때만 표시) */}
      {!hasConnectedItems && showMemoInputs?.[item.id] && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
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

      {/* 연결된 항목들 */}
      {hasConnectedItems && (
        <div className={`bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`px-4 py-2 bg-gray-100 border-b border-gray-200 transition-all duration-300 ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}>
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              <span>세부 항목</span>
            </h4>
          </div>
          {item.connectedItems!
            .sort((a, b) => a.order - b.order)
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
                <div className="px-4 py-4 ml-4 border-l-2 border-gray-200 relative">
                  {/* 하위 항목 번호 */}
                  <div className="absolute -left-2 top-4 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <div className="flex items-start gap-3">
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
                    
                    <div className="flex-1 space-y-3">
                      {/* 첫째줄: 아이콘과 이름 */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          connection.itemType === 'inventory' ? 'bg-blue-100 text-blue-700' : 
                          connection.itemType === 'precaution' ? 'bg-orange-100 text-orange-700' : 
                          connection.itemType === 'manual' ? 'bg-green-100 text-green-700' : 
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
                        <h4 className="font-medium text-sm text-gray-800">
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
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-700">수량:</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                defaultValue={Math.round(connectionDetails.currentStock) || 0}
                                disabled={isReadOnly}
                                data-inventory-id={connectionDetails.id}
                                className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const newStock = parseInt(e.currentTarget.value) || 0;
                                    console.log('재고 Enter 키 입력:', { 
                                      itemId: connectionDetails.id, 
                                      newStock, 
                                      parentItemId: item.id,
                                      inputValue: e.currentTarget.value 
                                    });
                                    if (onInventoryUpdate && connectionDetails) {
                                      onInventoryUpdate(connectionDetails.id, newStock);
                                    }
                                  }
                                }}
                                onFocus={(e) => {
                                  // 포커스 시 전체 선택
                                  e.target.select();
                                }}
                              />
                              <span className="text-xs font-medium text-gray-700">{connectionDetails.unit}</span>
                              <button
                                onClick={async () => {
                                  const input = document.querySelector(`input[data-inventory-id="${connectionDetails.id}"]`) as HTMLInputElement;
                                  if (input && onInventoryUpdate && connectionDetails) {
                                    const newStock = parseInt(input.value) || 0;
                                    console.log('재고 입력 버튼 클릭:', { 
                                      itemId: connectionDetails.id, 
                                      newStock, 
                                      parentItemId: item.id,
                                      inputValue: input.value 
                                    });
                                    await onInventoryUpdate(connectionDetails.id, newStock);
                                  }
                                }}
                                disabled={isReadOnly}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                입력
                              </button>
                            </div>
                          </div>

                          {/* 넷째줄: 안내문구 */}
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <p className="text-xs text-orange-700 flex items-center gap-1">
                              <span>⚠️</span>
                              <span>재고 항목은 수량 업데이트를 통해 완료됩니다</span>
                            </p>
                          </div>

                          {/* 다섯째줄: 완료자 정보 */}
                          {connectedItemsStatus[connection.id]?.completedBy && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">✅ 완료자:</span>
                                <span className="text-xs font-medium text-green-700">
                                  {connectedItemsStatus[connection.id].completedBy}
                                </span>
                              </div>
                              {connectedItemsStatus[connection.id].completedAt && (
                                <div className="flex items-center gap-2 ml-4">
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

                          {/* 여섯째줄: 메모 정보 */}
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
                    </div>
                    
                    {/* 재고 변경 정보 표시 */}
                    {connectionDetails && connection.itemType === 'inventory' && connectedItemsStatus[connection.id]?.previousStock !== undefined && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
                        <div className="text-xs text-gray-600 mb-1">재고 변경 내역:</div>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-500 text-xs">
                            {connectedItemsStatus[connection.id].previousStock} {connectionDetails.unit}
                          </span>
                          <span className="text-green-600 font-semibold text-xs">
                            → {connectionDetails.currentStock} {connectionDetails.unit}
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
                        </div>
                      </div>
                    )}

                    {/* 다른 항목 타입의 내용 */}
                    {connectionDetails && connection.itemType !== 'inventory' && (
                      <div className="flex flex-col space-y-3 w-full">
                        {/* 주의사항 항목 */}
                        {connection.itemType === 'precaution' && (
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
                                  <div className="flex items-center gap-2 ml-4">
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
                        {connection.itemType === 'manual' && (
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
                                  <div className="flex items-center gap-2 ml-4">
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
                    )}
                  </div>
                </div>
                
                                                  {/* 연결된 항목용 메모 입력 */}
                <div className="mt-3 ml-5 space-y-2 mb-4">
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
      )}
      
      {/* 하위 항목이 없을 때는 추가 메시지 없음 */}
    </div>
  );
} 