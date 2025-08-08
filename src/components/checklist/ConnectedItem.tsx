"use client";
import { memo, useMemo, useState } from "react";
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

function ConnectedItem({
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
          <div className="space-y-3">
            <div className="font-medium text-base break-words">{inventory.name}</div>
            <div className="text-sm text-gray-600">
              현재 재고: {inventory.currentStock} {inventory.unit}
              {inventory.currentStock <= inventory.minStock && (
                <div className="mt-1 text-red-600 font-semibold">구매 필요!</div>
              )}
            </div>
            <div className="text-xs text-gray-500 break-words">
              최소 재고: {inventory.minStock} {inventory.unit}
            </div>
            <div className="text-xs text-gray-500 break-words">
              카테고리: {inventory.category}
            </div>
          </div>
        );

      case 'precaution':
        const precaution = itemDetails as Precaution;
        return (
          <div className="space-y-3">
            <div className="font-medium text-base break-words">{precaution.title}</div>
            <div className="text-sm text-gray-600 break-words leading-relaxed">{precaution.content}</div>
            <div className="text-xs text-gray-500 break-words">
              우선순위: {precaution.priority}
            </div>
            <div className="text-xs text-gray-500 break-words">
              위치: {precaution.workplace}
            </div>
          </div>
        );

      case 'manual':
        const manual = itemDetails as Manual;
        return (
          <div className="space-y-3">
            <div className="font-medium text-base break-words">{manual.title}</div>
            <div className="text-sm text-gray-600 break-words leading-relaxed">{manual.content}</div>
            <div className="text-xs text-gray-500 break-words">
              버전: {manual.version}
            </div>
            <div className="text-xs text-gray-500 break-words">
              카테고리: {manual.category}
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
    <div className={`ml-2 sm:ml-4 md:ml-6 border-l-2 border-gray-200 pl-2 sm:pl-3 md:pl-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-1 sm:gap-2 md:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          disabled={isReadOnly}
          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {/* 아이템 내용 */}
        <div className="flex-1 min-w-0">
          {/* 헤더: 체크박스 옆에 아이콘과 라벨만 */}
          <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3 min-w-0">
            <span className="text-base sm:text-lg flex-shrink-0">{getItemIcon(connection.itemType)}</span>
            <span className="text-[11px] sm:text-xs bg-gray-200 text-gray-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
              {getItemTypeLabel(connection.itemType)}
            </span>
            <button
              onClick={onToggleExpansion}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 ml-auto flex-shrink-0"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>

          {isExpanded && (
            <div className="space-y-4">
              {/* 제목과 내용 - 세로 배치 */}
              <div className="space-y-2">
                {renderItemContent()}
              </div>

              {/* 메모 섹션 */}
              {!isReadOnly && (
                <div className="space-y-3">
                  {showNotes ? (
                    <div className="space-y-3">
                      <textarea
                        value={localNotes}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        placeholder="메모를 입력하세요..."
                        className="w-full p-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={handleNotesSave}
                          className="px-2 sm:px-3 py-1 text-[11px] sm:text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => {
                            setLocalNotes(notes || "");
                            setShowNotes(false);
                          }}
                          className="px-2 sm:px-3 py-1 text-[11px] sm:text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowNotes(true)}
                        className="text-[11px] sm:text-xs text-blue-600 hover:text-blue-800"
                      >
                        📝 메모 {notes ? '수정' : '추가'}
                      </button>
                      {notes && (
                        <div className="text-[11px] sm:text-xs text-gray-600 bg-blue-50 p-2 rounded break-words">
                          {notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isReadOnly && notes && (
                <div className="text-[11px] sm:text-xs text-gray-600 bg-blue-50 p-2 rounded">
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

export default memo(ConnectedItem);