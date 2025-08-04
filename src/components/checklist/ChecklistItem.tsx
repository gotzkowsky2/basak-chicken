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
  onConnectedItemCheckboxChange: (connectionId: string, parentItemId: string) => void;
  expandedItems: Set<string>;
  onToggleExpansion: (itemId: string) => void;
  notes?: string;
  onNotesChange?: (id: string, notes: string) => void;
  isReadOnly?: boolean;
  completedBy?: string;
  completedAt?: string;
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
  completedAt
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
  const isExpanded = expandedItems.has(item.id);

  return (
    <div className={`border rounded-lg p-4 ${isCompleted ? 'bg-gray-50' : 'bg-white'} ${isReadOnly ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        {/* 체크박스 */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          disabled={isReadOnly || hasConnectedItems}
          className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {/* 아이템 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-gray-900">{item.content}</h3>
                {hasConnectedItems && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    연결된 항목 {item.connectedItems!.length}개
                  </span>
                )}
                {item.isRequired && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    필수
                  </span>
                )}
              </div>

              {item.instructions && (
                <p className="text-sm text-gray-600 mb-2">{item.instructions}</p>
              )}

              {/* 완료 정보 */}
              {isCompleted && completedBy && (
                <div className="text-xs text-gray-500 mb-2">
                  완료자: {completedBy}
                  {completedAt && ` | 완료시간: ${new Date(completedAt).toLocaleString('ko-KR')}`}
                </div>
              )}

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

            {/* 확장/축소 버튼 */}
            {hasConnectedItems && (
              <button
                onClick={() => onToggleExpansion(item.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
          </div>

          {/* 연결된 항목들 */}
          {hasConnectedItems && isExpanded && (
            <div className="mt-4 space-y-3">
              {item.connectedItems!.map((connection: ChecklistItemConnection) => (
                <ConnectedItem
                  key={connection.id}
                  connection={connection}
                  itemDetails={connectedItemsDetails[connection.id] || null}
                  isCompleted={connectedItemsStatus[connection.id]?.isCompleted || false}
                  onCheckboxChange={onConnectedItemCheckboxChange}
                  parentItemId={item.id}
                  isExpanded={true}
                  onToggleExpansion={() => {}} // 연결된 항목은 항상 확장된 상태
                  notes={connectedItemsStatus[connection.id]?.notes}
                  onNotesChange={onNotesChange ? (connectionId, notes) => onNotesChange(connectionId, notes) : undefined}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 