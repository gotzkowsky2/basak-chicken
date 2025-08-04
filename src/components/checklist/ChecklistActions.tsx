"use client";

interface ChecklistActionsProps {
  totalItems: number;
  completedItems: number;
  submitting: boolean;
  isAllItemsCompleted: boolean;
  onSave: () => void;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export default function ChecklistActions({
  totalItems,
  completedItems,
  submitting,
  isAllItemsCompleted,
  onSave,
  onSubmit,
  className = ""
}: ChecklistActionsProps) {
  return (
    <div className={`mt-6 flex items-center justify-between pt-4 border-t border-gray-200 ${className}`}>
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          총 {totalItems}개 항목
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {completedItems}개 완료
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={submitting}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          {submitting ? '저장 중...' : '저장'}
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting || !isAllItemsCompleted}
          className={`px-3 py-1.5 rounded text-xs transition-colors font-medium ${
            isAllItemsCompleted 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {submitting ? '제출 중...' : '제출'}
        </button>
      </div>
    </div>
  );
} 