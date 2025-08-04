"use client";
import { ChecklistTemplate, ChecklistItem, Employee } from "@/types/checklist";
import { ChecklistItem as ChecklistItemComponent } from "./index";

interface ChecklistDetailViewProps {
  selectedChecklist: ChecklistTemplate;
  currentEmployee: Employee | null;
  checklistItems: {[key: string]: any};
  connectedItemsStatus: {[key: string]: any};
  connectedItemDetails: {[key: string]: any};
  expandedItems: {[key: string]: boolean};
  showMemoInputs: {[key: string]: boolean};
  submitting: boolean;
  getWorkplaceLabel: (value: string) => string;
  getTimeSlotLabel: (value: string) => string;
  handleBackToList: () => void;
  calculateProgress: () => { completed: number; total: number };
  isAllItemsCompleted: () => boolean;
  handleCheckboxChange: (id: string) => Promise<void>;
  handleConnectedItemCheckboxChange: (connectionId: string, parentItemId: string) => Promise<void>;
  toggleItemExpansion: (itemId: string) => void;
  handleNotesChange: (id: string, notes: string) => void;
  toggleMemoInput: (id: string) => void;
  saveMemo: (id: string) => Promise<void>;
  saveProgress: (templateId: string) => Promise<void>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onInventoryUpdate?: (itemId: string, currentStock: number, parentItemId: string, notes?: string) => Promise<void>;
}

export default function ChecklistDetailView({
  selectedChecklist,
  currentEmployee,
  checklistItems,
  connectedItemsStatus,
  connectedItemDetails,
  expandedItems,
  showMemoInputs,
  submitting,
  getWorkplaceLabel,
  getTimeSlotLabel,
  handleBackToList,
  calculateProgress,
  isAllItemsCompleted,
  handleCheckboxChange,
  handleConnectedItemCheckboxChange,
  toggleItemExpansion,
  handleNotesChange,
  toggleMemoInput,
  saveMemo,
  saveProgress,
  handleSubmit,
  onInventoryUpdate
}: ChecklistDetailViewProps) {
  return (
    <>
      {/* 제출 완료된 체크리스트인 경우 알림 */}
      {selectedChecklist.isSubmitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="font-medium">이 체크리스트는 이미 제출 완료되었습니다.</span>
          </div>
          <p className="text-sm mt-1">수정할 수 없으며, 읽기 전용으로 표시됩니다.</p>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-white/90 hover:text-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로
              </button>
              <div className="h-4 w-px bg-white/30"></div>
              <h2 className="text-lg font-bold">
                {selectedChecklist.name || selectedChecklist.content}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-white/90">
                {currentEmployee?.name || '직원'}
              </div>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                  {getWorkplaceLabel(selectedChecklist.workplace)}
                </span>
                <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                  {getTimeSlotLabel(selectedChecklist.timeSlot)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 체크리스트 내용 */}
        <div className="p-4">
          {/* 진행 상황 표시 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">진행 상황</span>
              <span className="text-xs text-gray-500">
                {(() => {
                  const progress = calculateProgress();
                  return `${progress.completed} / ${progress.total} 완료`;
                })()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(() => {
                    const progress = calculateProgress();
                    return progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
                  })()}%` 
                }}
              ></div>
            </div>
          </div>

          {/* 체크리스트 항목들 */}
          <div className="space-y-3">
            {selectedChecklist.items && selectedChecklist.items.length > 0 ? (
              selectedChecklist.items
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <ChecklistItemComponent
                    key={item.id}
                    item={item}
                    isCompleted={checklistItems[item.id]?.isCompleted || false}
                    onCheckboxChange={handleCheckboxChange}
                    connectedItemsStatus={connectedItemsStatus}
                    connectedItemsDetails={connectedItemDetails}
                    onConnectedItemCheckboxChange={handleConnectedItemCheckboxChange}
                    expandedItems={expandedItems}
                    onToggleExpansion={toggleItemExpansion}
                    notes={checklistItems[item.id]?.notes}
                    onNotesChange={handleNotesChange}
                    isReadOnly={selectedChecklist.isSubmitted}
                    completedBy={checklistItems[item.id]?.completedBy}
                    completedAt={checklistItems[item.id]?.completedAt}
                    showMemoInputs={showMemoInputs}
                    toggleMemoInput={toggleMemoInput}
                    saveMemo={saveMemo}
                    currentEmployee={currentEmployee}
                    onInventoryUpdate={onInventoryUpdate}
                  />
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium mb-1">체크리스트 항목이 없습니다</p>
                <p className="text-xs">이 체크리스트에는 아직 항목이 등록되지 않았습니다.</p>
              </div>
            )}
          </div>

          {/* 하단 액션 버튼들 */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                총 {selectedChecklist.items?.length || 0}개 항목
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {(() => {
                  const progress = calculateProgress();
                  return `${progress.completed}개 완료`;
                })()}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => saveProgress(selectedChecklist.id)}
                disabled={submitting}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {submitting ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isAllItemsCompleted()}
                className={`px-3 py-1.5 rounded text-xs transition-colors font-medium ${
                  isAllItemsCompleted() 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {submitting ? '제출 중...' : '제출'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 