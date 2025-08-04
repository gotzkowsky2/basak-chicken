"use client";
import { ChecklistTemplate } from "@/types/checklist";

interface ChecklistListProps {
  checklists: ChecklistTemplate[];
  onChecklistSelect: (checklist: ChecklistTemplate) => void;
  getChecklistStatus: (checklist: any) => any;
  getStatusInfo: (status: string) => any;
  connectedItemsStatus: any;
  checklistItems: any;
}

export default function ChecklistList({
  checklists,
  onChecklistSelect,
  getChecklistStatus,
  getStatusInfo,
  connectedItemsStatus,
  checklistItems
}: ChecklistListProps) {
  return (
    <div className="space-y-6">
      {/* 미완료 체크리스트 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">진행 중인 체크리스트</h2>
      
        {checklists.filter(c => !c.isSubmitted).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>진행 중인 체크리스트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checklists
              .filter(checklist => !checklist.isSubmitted)
              .map((checklist) => {
              const status = getChecklistStatus(checklist);
              const statusInfo = getStatusInfo(status.status);
              
              return (
                <div 
                  key={checklist.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
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
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {checklist.name || checklist.content}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                              {statusInfo.icon} {statusInfo.label}
                            </span>
                            {status.progress && (
                              <span className="text-sm text-gray-600">
                                ({status.progress})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 추가 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            체크 항목: {(() => {
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
                            })()}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            연결 항목: {(() => {
                              const totalConnections = checklist.items?.reduce((total, item) => {
                                const itemConnections = item.connectedItems?.length || 0;
                                const childConnections = item.children?.reduce((childTotal, child) => 
                                  childTotal + (child.connectedItems?.length || 0), 0) || 0;
                                return total + itemConnections + childConnections;
                              }, 0) || 0;
                              
                              const completedConnections = checklist.items?.reduce((total, item) => {
                                const itemConnections = item.connectedItems?.filter(connection => 
                                  connectedItemsStatus[connection.id]?.isCompleted
                                ).length || 0;
                                const childConnections = item.children?.reduce((childTotal, child) => 
                                  childTotal + (child.connectedItems?.filter(connection => 
                                    connectedItemsStatus[connection.id]?.isCompleted
                                  ).length || 0), 0) || 0;
                                return total + itemConnections + childConnections;
                              }, 0) || 0;
                              
                              return `${completedConnections}/${totalConnections}개`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* 템플릿 정보 */}
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="mr-3">위치: {checklist.workplace}</span>
                        <span className="mr-3">시간대: {checklist.timeSlot}</span>
                        <span>카테고리: {checklist.category}</span>
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
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">완료된 체크리스트</h2>
          <div className="space-y-4">
            {checklists
              .filter(checklist => checklist.isSubmitted)
              .map((checklist) => {
              const status = getChecklistStatus(checklist);
              const statusInfo = getStatusInfo(status.status);
              
              return (
                <div 
                  key={checklist.id} 
                  className="border rounded-lg p-4 bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {checklist.name || checklist.content}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="mr-3">위치: {checklist.workplace}</span>
                        <span className="mr-3">시간대: {checklist.timeSlot}</span>
                        <span>카테고리: {checklist.category}</span>
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