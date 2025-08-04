"use client";
import { useState } from "react";
import { ChecklistItemConnection, InventoryItem, Precaution, Manual } from "@/types/checklist";

interface ConnectedItemProps {
  connection: ChecklistItemConnection;
  itemDetails: InventoryItem | Precaution | Manual | null;
  isCompleted: boolean;
  onCheckboxChange: (connectionId: string, parentItemId: string) => void;
  parentItemId: string;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  notes?: string;
  onNotesChange?: (connectionId: string, notes: string) => void;
  isReadOnly?: boolean;
}

export default function ConnectedItem({
  connection,
  itemDetails,
  isCompleted,
  onCheckboxChange,
  parentItemId,
  isExpanded,
  onToggleExpansion,
  notes,
  onNotesChange,
  isReadOnly = false
}: ConnectedItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(notes || "");

  const handleCheckboxChange = () => {
    if (!isReadOnly) {
      onCheckboxChange(connection.id, parentItemId);
    }
  };

  const handleNotesSave = () => {
    if (onNotesChange) {
      onNotesChange(connection.id, localNotes);
      setShowNotes(false);
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'inventory':
        return '📦';
      case 'precaution':
        return '⚠️';
      case 'manual':
        return '📖';
      default:
        return '🔗';
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case 'inventory':
        return '재고';
      case 'precaution':
        return '주의사항';
      case 'manual':
        return '메뉴얼';
      default:
        return '연결된 항목';
    }
  };

  const renderItemContent = () => {
    if (!itemDetails) {
      return <span className="text-gray-500">항목 정보를 불러오는 중...</span>;
    }

    switch (connection.itemType) {
      case 'inventory':
        const inventory = itemDetails as InventoryItem;
        return (
          <div className="space-y-2">
            <div className="font-medium">{inventory.name}</div>
            <div className="text-sm text-gray-600">
              현재 재고: {inventory.currentStock} {inventory.unit}
              {inventory.currentStock <= inventory.minStock && (
                <span className="ml-2 text-red-600 font-semibold">구매 필요!</span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              최소 재고: {inventory.minStock} {inventory.unit} | 카테고리: {inventory.category}
            </div>
          </div>
        );

      case 'precaution':
        const precaution = itemDetails as Precaution;
        return (
          <div className="space-y-2">
            <div className="font-medium">{precaution.title}</div>
            <div className="text-sm text-gray-600">{precaution.content}</div>
            <div className="text-xs text-gray-500">
              우선순위: {precaution.priority} | 위치: {precaution.workplace}
            </div>
          </div>
        );

      case 'manual':
        const manual = itemDetails as Manual;
        return (
          <div className="space-y-2">
            <div className="font-medium">{manual.title}</div>
            <div className="text-sm text-gray-600">{manual.content}</div>
            <div className="text-xs text-gray-500">
              버전: {manual.version} | 카테고리: {manual.category}
            </div>
            {manual.mediaUrls && manual.mediaUrls.length > 0 && (
              <div className="text-xs text-blue-600">
                📎 첨부파일 {manual.mediaUrls.length}개
              </div>
            )}
          </div>
        );

      default:
        return <span className="text-gray-500">알 수 없는 항목 유형</span>;
    }
  };

  return (
    <div className={`ml-6 border-l-2 border-gray-200 pl-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          disabled={isReadOnly}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {/* 아이템 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{getItemIcon(connection.itemType)}</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              {getItemTypeLabel(connection.itemType)}
            </span>
            <button
              onClick={onToggleExpansion}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-3">
              {renderItemContent()}

              {/* 메모 섹션 */}
              {!isReadOnly && (
                <div className="space-y-2">
                  {showNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder="메모를 입력하세요..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleNotesSave}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setLocalNotes(notes || "");
                            setShowNotes(false);
                          }}
                          className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowNotes(true)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        📝 메모 {notes ? '수정' : '추가'}
                      </button>
                      {notes && (
                        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                          {notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isReadOnly && notes && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                  📝 메모: {notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 