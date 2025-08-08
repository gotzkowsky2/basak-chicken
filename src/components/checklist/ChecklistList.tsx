"use client";
import { memo, useMemo } from "react";
// @ts-ignore - types provided via custom d.ts
import { FixedSizeList as VirtualList } from 'react-window';
import { ChecklistTemplate } from "@/types/checklist";
import StatusDisplay from "./StatusDisplay";

interface ChecklistListProps {
  checklists: ChecklistTemplate[];
  onChecklistSelect: (checklist: ChecklistTemplate) => void;
  getChecklistStatus: (checklist: any) => any;
  connectedItemsStatus: any;
  checklistItems: any;
  getWorkplaceLabel: (value: string) => string;
  getTimeSlotLabel: (value: string) => string;
  getCategoryLabel: (value: string) => string;
}

function ChecklistList({
  checklists,
  onChecklistSelect,
  getChecklistStatus,
  connectedItemsStatus,
  checklistItems,
  getWorkplaceLabel,
  getTimeSlotLabel,
  getCategoryLabel
}: ChecklistListProps) {
  const pendingList = useMemo(() => checklists.filter(c => !c.isSubmitted), [checklists]);
  const useVirtual = pendingList.length > 30;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const checklist = pendingList[index];
    const status = getChecklistStatus(checklist);
    return (
      <div style={style}>
        <div 
          key={checklist.id} 
          className={`border rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
            status.status === '제출 완료' 
              ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
              : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
          onClick={() => {
            if (status.status !== '제출 완료') {
              onChecklistSelect(checklist);
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* 메인 제목과 상태 */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                      {checklist.name || checklist.content}
                    </h3>
                    <StatusDisplay 
                      status={status.status} 
                      progress={status.progress}
                    />
                  </div>
                  
                  {/* 하위항목 종류별 정보 - 모바일에서 간소화 */}
                  {status.connectedItems && (
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {status.connectedItems.inventory > 0 && (
                        <span className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs">
                          <span className="hidden sm:inline">📦</span>
                          <span className="hidden md:inline">재고</span>
                          <span>{status.connectedItems.inventory}</span>
                        </span>
                      )}
                      {status.connectedItems.precaution > 0 && (
                        <span className="flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs">
                          <span className="hidden sm:inline">⚠️</span>
                          <span className="hidden md:inline">주의</span>
                          <span>{status.connectedItems.precaution}</span>
                        </span>
                      )}
                      {status.connectedItems.manual > 0 && (
                        <span className="flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full px-2 py-1 text-xs">
                          <span className="hidden sm:inline">📖</span>
                          <span className="hidden md:inline">매뉴얼</span>
                          <span>{status.connectedItems.manual}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* 위치 및 시간대 정보 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{getWorkplaceLabel(checklist.workplace)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{getTimeSlotLabel(checklist.timeSlot)}</span>
                    </div>
                  </div>

                  {/* 진행 상황 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="hidden sm:inline">체크 항목:</span>
                        <span>{(() => {
                          const totalItems = checklist.items?.length || 0;
                          const completedItems = checklist.items?.filter(item => {
                            if (item.connectedItems && item.connectedItems.length > 0) {
                              // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
                              return item.connectedItems.every(connection => 
                                connectedItemsStatus[connection.id]?.isCompleted
                              );
                            } else {
                              // 연결된 항목이 없는 경우, 메인 항목만 체크
                              return checklistItems[item.id]?.isCompleted;
                            }
                          }).length || 0;
                          return `${completedItems}/${totalItems}개`;
                        })()}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      {/* 미완료 체크리스트 */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        {pendingList.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">진행 중인 체크리스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {useVirtual ? (
              <VirtualList height={600} width={'100%'} itemSize={110} itemCount={pendingList.length}>
                {Row}
              </VirtualList>
            ) : (
              pendingList.map((_, i) => <Row key={pendingList[i].id} index={i} style={{}} />)
            )}
            {/* fallback(가상화 해제 시) */}
            {!useVirtual && pendingList
              .map((checklist) => {
              const status = getChecklistStatus(checklist);
              
              return (
                <div 
                  key={checklist.id} 
                  className={`border rounded-lg p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    status.status === '제출 완료' 
                      ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => {
                    if (status.status !== '제출 완료') {
                      onChecklistSelect(checklist);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 메인 제목과 상태 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                              {checklist.name || checklist.content}
                            </h3>
                            <StatusDisplay 
                              status={status.status} 
                              progress={status.progress}
                            />
                          </div>
                          
                          {/* 하위항목 종류별 정보 - 모바일에서 간소화 */}
                          {status.connectedItems && (
                            <div className="flex items-center gap-1 flex-wrap mb-2">
                              {status.connectedItems.inventory > 0 && (
                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs">
                                  <span className="hidden sm:inline">📦</span>
                                  <span className="hidden md:inline">재고</span>
                                  <span>{status.connectedItems.inventory}</span>
                                </span>
                              )}
                              {status.connectedItems.precaution > 0 && (
                                <span className="flex items-center gap-1 bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs">
                                  <span className="hidden sm:inline">⚠️</span>
                                  <span className="hidden md:inline">주의</span>
                                  <span>{status.connectedItems.precaution}</span>
                                </span>
                              )}
                              {status.connectedItems.manual > 0 && (
                                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full px-2 py-1 text-xs">
                                  <span className="hidden sm:inline">📖</span>
                                  <span className="hidden md:inline">매뉴얼</span>
                                  <span>{status.connectedItems.manual}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {/* 위치 및 시간대 정보 */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{getWorkplaceLabel(checklist.workplace)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{getTimeSlotLabel(checklist.timeSlot)}</span>
                            </div>
                          </div>

                          {/* 진행 상황 */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="hidden sm:inline">체크 항목:</span>
                                <span>{(() => {
                                  const totalItems = checklist.items?.length || 0;
                                  const completedItems = checklist.items?.filter(item => {
                                    if (item.connectedItems && item.connectedItems.length > 0) {
                                      // 연결된 항목이 있는 경우, 모든 연결된 항목이 완료되어야 함
                                      return item.connectedItems.every(connection => 
                                        connectedItemsStatus[connection.id]?.isCompleted
                                      );
                                    } else {
                                      // 연결된 항목이 없는 경우, 메인 항목만 체크
                                      return checklistItems[item.id]?.isCompleted;
                                    }
                                  }).length || 0;
                                  return `${completedItems}/${totalItems}개`;
                                })()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 완료된 체크리스트 */}
      {checklists.filter(c => c.isSubmitted).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">완료된 체크리스트</h3>
          <div className="space-y-3">
            {checklists
              .filter(checklist => checklist.isSubmitted)
              .map((checklist) => {
              const status = getChecklistStatus(checklist);
              
              return (
                <div 
                  key={checklist.id} 
                  className="border rounded-lg p-3 md:p-4 bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate">
                          {checklist.name || checklist.content}
                        </h3>
                        <StatusDisplay 
                          status={status.status} 
                          progress={status.progress}
                        />
                      </div>
                      
                      {/* 위치 및 시간대 정보 */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{getWorkplaceLabel(checklist.workplace)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{getTimeSlotLabel(checklist.timeSlot)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 

export default memo(ChecklistList);