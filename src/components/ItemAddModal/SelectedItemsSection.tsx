"use client";
import { X } from "lucide-react";

interface ConnectedItem {
  type: 'inventory' | 'precaution' | 'manual';
  id: string;
  name: string;
}

interface SelectedItemsSectionProps {
  connectedItems: ConnectedItem[];
  onRemoveItem: (item: ConnectedItem) => void;
  onAddItem: (item: ConnectedItem) => void;
}

export default function SelectedItemsSection({
  connectedItems,
  onRemoveItem,
  onAddItem
}: SelectedItemsSectionProps) {
  
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'inventory': return '📦';
      case 'precaution': return '⚠️';
      case 'manual': return '📖';
      default: return '📋';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'inventory': return '재고';
      case 'precaution': return '주의사항';
      case 'manual': return '메뉴얼';
      default: return '기타';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">연결된 항목</h3>
      
      {connectedItems.length === 0 ? (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
          연결된 항목이 없습니다.
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {connectedItems.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getItemIcon(item.type)}</span>
                <div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-xs text-gray-500">{getItemTypeLabel(item.type)}</div>
                </div>
              </div>
              <button
                onClick={() => onRemoveItem(item)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 