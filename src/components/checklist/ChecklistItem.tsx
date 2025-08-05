"use client";
import { useState } from "react";
import { ChecklistItem as ChecklistItemType, ChecklistItemConnection } from "@/types/checklist";
import ConnectedItem from "./ConnectedItem";

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
  const [showNotes, setShowNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes || "");

  const handleCheckboxChange = () => {
    if (!isReadOnly) {
      onCheckboxChange(item.id);
    }
  };

  const handleNotesSave = () => {
    if (onNotesChange) {
      onNotesChange(item.id, localNotes);
      setShowNotes(false);
    }
  };

  const hasConnectedItems = item.connectedItems && item.connectedItems.length > 0;
  const isExpanded = expandedItems[item.id] || false;

  const isDisabledByOther = completedBy && completedBy !== currentEmployee?.name;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* 메인 항목 헤더 */}
      <div className={`px-4 py-3 ${isCompleted ? 'bg-green-50 border-b border-green-200' : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={handleCheckboxChange}
              disabled={isDisabledByOther || isReadOnly}
              className={`mt-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                hasConnectedItems ? 'cursor-pointer' : ''
              } ${(isDisabledByOther || isReadOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-gray-800">
                {item.content}
              </h3>
              {item.instructions && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {item.instructions}
                </p>
              )}
              
              {/* 하위항목 종류별 정보 - 모바일 친화적 */}
              {hasConnectedItems && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
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
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 연결항목 개수 표시 */}
            {hasConnectedItems && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                연결항목 {item.connectedItems!.length}개
              </span>
            )}
            
            {/* 펼치기/접기 버튼 */}
            {hasConnectedItems && (
              <button
                onClick={() => onToggleExpansion(item.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            
            {isCompleted && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                완료
              </span>
            )}
          </div>
        </div>
        
        {/* 체크한 사람 이름 표시 */}
        {completedBy && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-gray-500">완료:</span>
            <span className="text-xs font-medium text-green-700">
              {completedBy}
            </span>
          </div>
        )}

        {/* 메모 표시 및 입력 */}
        <div className="mt-2">
          {/* 기존 메모 표시 */}
          {notes && !showMemoInputs?.[item.id] && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-300">
              <div className="font-medium text-gray-800 mb-1">메모:</div>
              <div className="text-gray-700">{notes}</div>
              {toggleMemoInput && (
                <button
                  onClick={() => toggleMemoInput(item.id)}
                  className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                >
                  수정
                </button>
              )}
            </div>
          )}

          {/* 메모 입력창 */}
          {showMemoInputs?.[item.id] && (
            <div className="mt-2">
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

          {/* 메모 추가 버튼 (메모가 없고 입력창이 열려있지 않을 때) */}
          {!notes && !showMemoInputs?.[item.id] && toggleMemoInput && (
            <button
              onClick={() => toggleMemoInput(item.id)}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              메모 추가
            </button>
          )}
        </div>
      </div>

      {/* 연결된 항목들 */}
      {hasConnectedItems && isExpanded && (
        <div className="bg-gray-50 border-t border-gray-200">
          {item.connectedItems!
            .sort((a, b) => a.order - b.order)
            .map((connection) => {
            const key = `${connection.itemType}_${connection.itemId}`;
            const connectionDetails = connectedItemsDetails[key];
            const isConnectionCompleted = connectedItemsStatus[connection.id]?.isCompleted || false;
            
            return (
              <div key={connection.id} className="border-b border-gray-200 last:border-b-0">
                <div className="px-4 py-3">
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
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
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
                        {connection.itemType === 'inventory' && connectionDetails && (
                          <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs font-medium text-gray-700">수량:</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              defaultValue={Math.round(connectionDetails.currentStock) || 0}
                              disabled={isReadOnly}
                              data-inventory-id={connectionDetails.id}
                              className="w-16 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium text-gray-900"
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
                                    onInventoryUpdate(connectionDetails.id, newStock, item.id);
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
                                  await onInventoryUpdate(connectionDetails.id, newStock, item.id);
                                }
                              }}
                              disabled={isReadOnly}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              입력
                            </button>
                          </div>
                        )}
                        
                        {/* 재고 항목 안내 메시지 */}
                        {connection.itemType === 'inventory' && (
                          <div className="mt-1">
                            <p className="text-xs text-orange-600">
                              ⚠️ 재고 항목은 수량 업데이트를 통해 완료됩니다
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {connectionDetails && (
                        <div className="text-xs text-gray-600">
                          {connection.itemType === 'inventory' && (
                            <div>
                              {/* 재고 변경 정보가 있으면 이전 재고를 취소선으로 표시하고 새 재고를 우측에 표시 */}
                              {connectedItemsStatus[connection.id]?.previousStock !== undefined ? (
                                <div className="flex items-center gap-2">
                                  <span className="line-through text-gray-500">
                                    {connectedItemsStatus[connection.id].previousStock} {connectionDetails.unit}
                                  </span>
                                  <span className="text-green-600 font-semibold">
                                    → {connectionDetails.currentStock} {connectionDetails.unit}
                                  </span>
                                  {connectedItemsStatus[connection.id].stockChange > 0 && (
                                    <span className="text-green-600 font-semibold">
                                      (+{connectedItemsStatus[connection.id].stockChange})
                                    </span>
                                  )}
                                  {connectedItemsStatus[connection.id].stockChange < 0 && (
                                    <span className="text-red-600 font-semibold">
                                      ({connectedItemsStatus[connection.id].stockChange})
                                    </span>
                                  )}
                                  {connectedItemsStatus[connection.id].stockChange === 0 && (
                                    <span className="text-gray-600 font-semibold">
                                      (변경 없음)
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  현재 재고: {connectionDetails.currentStock} {connectionDetails.unit}
                                </div>
                              )}
                              
                              {connectionDetails.currentStock <= connectionDetails.minStock && (
                                <span className="ml-2 text-red-600 font-semibold">구매 필요!</span>
                              )}
                            </div>
                          )}
                          {connection.itemType === 'precaution' && (
                            <div>{connectionDetails.content}</div>
                          )}
                          {connection.itemType === 'manual' && (
                            <div>{connectionDetails.content}</div>
                          )}
                        </div>
                      )}

                      {/* 연결된 항목 완료 정보 */}
                      {connectedItemsStatus[connection.id]?.completedBy && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-500">완료:</span>
                          <span className="text-xs font-medium text-green-700">
                            {connectedItemsStatus[connection.id].completedBy}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                  
                  {/* 연결된 항목용 메모 입력 */}
                  <div className="mt-2 ml-5">
                    {/* 기존 메모 표시 */}
                    {connectedItemsStatus[connection.id]?.notes && !showMemoInputs?.[connection.id] && (
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border-l-2 border-blue-300 mb-2">
                        <div className="font-medium text-gray-800 mb-1">메모:</div>
                        <div className="text-gray-700">{connectedItemsStatus[connection.id].notes}</div>
                        {toggleMemoInput && (
                          <button
                            onClick={() => toggleMemoInput(connection.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                          >
                            수정
                          </button>
                        )}
                      </div>
                    )}

                    {/* 메모 입력창 */}
                    {showMemoInputs?.[connection.id] && (
                      <div className="mt-2">
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
                      <button
                        onClick={() => toggleMemoInput(connection.id)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        메모 추가
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 하위 항목이 없을 때 간소화된 메시지 */}
      {(!item.connectedItems || item.connectedItems.length === 0) && (
        <div className="px-4 py-2 bg-gray-50">
          <div className="text-xs text-gray-400 italic">
            연결된 세부항목 없음
          </div>
        </div>
      )}
    </div>
  );
} 