"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import SearchSection from "./SearchSection";
import SelectedItemsSection from "./SelectedItemsSection";

interface ConnectedItem {
  type: 'inventory' | 'precaution' | 'manual';
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ItemAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connectedItems: ConnectedItem[]) => void;
  editingItem?: {
    content: string;
    connectedItems: ConnectedItem[];
  } | null;
  tags?: Tag[];
}

export default function ItemAddModal({ isOpen, onClose, onSave, editingItem, tags = [] }: ItemAddModalProps) {
  const [connectedItems, setConnectedItems] = useState<ConnectedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<'all' | 'inventory' | 'precaution' | 'manual'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<ConnectedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagSectionOpen, setIsTagSectionOpen] = useState(false);

  console.log('ItemAddModal 렌더링 - 태그 개수:', tags.length);
  console.log('태그들:', tags);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setConnectedItems(editingItem.connectedItems);
      } else {
        setConnectedItems([]);
      }
      setSearchTerm("");
      setSelectedTags([]);
      setSearchType('all');
    }
  }, [isOpen, editingItem]);

  const addConnectedItem = (item: ConnectedItem) => {
    const isAlreadyAdded = connectedItems.some(
      existingItem => existingItem.id === item.id && existingItem.type === item.type
    );
    
    if (!isAlreadyAdded) {
      setConnectedItems(prev => [...prev, item]);
    }
  };

  const removeConnectedItem = (itemToRemove: ConnectedItem) => {
    setConnectedItems(prev => 
      prev.filter(item => !(item.id === itemToRemove.id && item.type === itemToRemove.type))
    );
  };

  const handleSave = () => {
    onSave(connectedItems);
    onClose();
  };

  const handleClose = () => {
    setConnectedItems([]);
    setSearchTerm("");
    setSelectedTags([]);
    setSearchType('all');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingItem ? '항목 편집' : '항목 추가'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 왼쪽: 검색 및 선택 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">항목 검색</h3>
              <SearchSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchType={searchType}
                setSearchType={setSearchType}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                allItems={allItems}
                setAllItems={setAllItems}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                tags={tags}
                isTagSectionOpen={isTagSectionOpen}
                setIsTagSectionOpen={setIsTagSectionOpen}
                onAddItem={addConnectedItem}
              />
            </div>

            {/* 오른쪽: 선택된 항목들 */}
            <div>
              <SelectedItemsSection
                connectedItems={connectedItems}
                onRemoveItem={removeConnectedItem}
                onAddItem={addConnectedItem}
              />
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
} 