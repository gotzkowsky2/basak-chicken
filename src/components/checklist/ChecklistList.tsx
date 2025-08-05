"use client";
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

export default function ChecklistList({
  checklists,
  onChecklistSelect,
  getChecklistStatus,
  connectedItemsStatus,
  checklistItems,
  getWorkplaceLabel,
  getTimeSlotLabel,
  getCategoryLabel
}: ChecklistListProps) {
  return (
    <div className="space-y-4">
      {/* 미완료 체크리스트 */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        {checklists.filter(c => !c.isSubmitted).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">진행 중인 체크리스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checklists
              .filter(checklist => !checklist.isSubmitted)
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
                    <div className="flex-1">
                      {/* 메인 제목과 상태 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 md:mb-2">
                            <h3 className="font-semibold text-sm md:text-base text-gray-900">
                              {checklist.name || checklist.content}
                            </h3>
                            <StatusDisplay 
                              status={status.status} 
                              progress={status.progress}
                            />
                          </div>
                          
                          {/* 하위항목 종류별 정보 - 모바일에서 간소화 */}
                          {status.connectedItems && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {status.connectedItems.inventory > 0 && (
                                <span className="flex items-center gap-1 bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  <span className="hidden md:inline">재고</span>
                                  <span>{status.connectedItems.inventory}</span>
                                </span>
                              )}
                              {status.connectedItems.precaution > 0 && (
                                <span className="flex items-center gap-1 bg-orange-100 text-orange-700 rounded-full px-1.5 py-0.5 text-xs">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <span className="hidden md:inline">주의</span>
                                  <span>{status.connectedItems.precaution}</span>
                                </span>
                              )}
                              {status.connectedItems.manual > 0 && (
                                <span className="flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs">
                                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  <span className="hidden md:inline">매뉴얼</span>
                                  <span>{status.connectedItems.manual}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 추가 정보 - 모바일에서 간소화 */}
                      <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                        <div className="flex items-center gap-2 md:gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              );
            })}
          </div>
        )}
      </div>

      {/* 완료된 체크리스트 */}
      {checklists.filter(c => c.isSubmitted).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <h3 className="font-semibold text-sm md:text-base text-gray-900">
                          {checklist.name || checklist.content}
                        </h3>
                        <StatusDisplay 
                          status={status.status} 
                          progress={status.progress}
                        />
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