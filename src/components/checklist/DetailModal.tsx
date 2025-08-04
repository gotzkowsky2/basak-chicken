"use client";
import { ChecklistItem } from "@/types/checklist";

interface DetailModalProps {
  item: ChecklistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}

export default function DetailModal({
  item,
  isOpen,
  onClose,
  onComplete,
  isCompleted
}: DetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">상세 정보</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="space-y-4">
          {/* 제목 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{item.content}</h3>
            {item.isRequired && (
              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                필수 항목
              </span>
            )}
          </div>

          {/* 지시사항 */}
          {item.instructions && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">지시사항</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{item.instructions}</p>
            </div>
          )}

          {/* 연결된 항목들 */}
          {item.connectedItems && item.connectedItems.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                연결된 항목 ({item.connectedItems.length}개)
              </h4>
              <div className="space-y-2">
                {item.connectedItems.map((connection) => (
                  <div key={connection.id} className="bg-blue-50 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {connection.itemType === 'inventory' && '📦'}
                        {connection.itemType === 'precaution' && '⚠️'}
                        {connection.itemType === 'manual' && '📖'}
                      </span>
                      <span className="text-sm text-gray-700">
                        {connection.itemType === 'inventory' && '재고'}
                        {connection.itemType === 'precaution' && '주의사항'}
                        {connection.itemType === 'manual' && '메뉴얼'}
                      </span>
                      <span className="text-xs text-gray-500">ID: {connection.itemId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 하위 항목들 */}
          {item.children && item.children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                하위 항목 ({item.children.length}개)
              </h4>
              <div className="space-y-2">
                {item.children.map((child) => (
                  <div key={child.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                    <h5 className="font-medium text-gray-900">{child.content}</h5>
                    {child.instructions && (
                      <p className="text-sm text-gray-600 mt-1">{child.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메타 정보 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">순서:</span> {item.order}
              </div>
              <div>
                <span className="font-medium">활성화:</span> {item.isActive ? '예' : '아니오'}
              </div>
              <div>
                <span className="font-medium">유형:</span> {item.type}
              </div>
              <div>
                <span className="font-medium">템플릿 ID:</span> {item.templateId}
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            닫기
          </button>
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              완료 처리
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 