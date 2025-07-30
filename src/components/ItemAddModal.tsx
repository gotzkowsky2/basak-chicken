"use client";
import { useState, useEffect } from "react";
import { X, Search, Tag, Filter } from "lucide-react";

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

const categoryOptions = [
  { value: 'all', label: '전체', icon: '📋' },
  { value: 'inventory', label: '재고', icon: '📦' },
  { value: 'precaution', label: '주의사항', icon: '⚠️' },
  { value: 'manual', label: '메뉴얼', icon: '📖' },
];

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
      loadAllItems();
    }
  }, [isOpen, editingItem]);

  // 모든 항목 로드
  const loadAllItems = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchTerm,
        type: searchType
      });

      // 선택된 모든 태그를 AND 조건으로 전송
      if (selectedTags.length > 0) {
        selectedTags.forEach(tagId => {
          params.append('tagIds', tagId);
        });
      }

      console.log('API 호출 파라미터:', params.toString());
      console.log('선택된 태그들:', selectedTags);

      const response = await fetch(`/api/admin/search-connections?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        setAllItems(data.results || []);
      } else {
        console.error('항목 로드 실패');
        setAllItems([]);
      }
    } catch (error) {
      console.error('항목 로드 오류:', error);
      setAllItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어 변경 시 항목 다시 로드
  useEffect(() => {
    if (isOpen) {
      loadAllItems();
    }
  }, [searchTerm, searchType, selectedTags]);

  // 태그 토글
  const toggleTag = (tagId: string) => {
    console.log('태그 토글:', tagId);
    setSelectedTags(prev => {
      const newTags = prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId];
      console.log('새로운 선택된 태그들:', newTags);
      return newTags;
    });
  };

  // 카테고리 변경
  const handleCategoryChange = (category: 'all' | 'inventory' | 'precaution' | 'manual') => {
    setSearchType(category);
  };

  // 연결 항목 추가
  const addConnectedItem = (item: ConnectedItem) => {
    if (!connectedItems.find(existing => existing.id === item.id && existing.type === item.type)) {
      setConnectedItems([...connectedItems, item]);
    }
  };

  // 연결 항목 제거
  const removeConnectedItem = (itemToRemove: ConnectedItem) => {
    setConnectedItems(connectedItems.filter(item => 
      !(item.id === itemToRemove.id && item.type === itemToRemove.type)
    ));
  };

  // 저장
  const handleSave = () => {
    onSave(connectedItems);
    onClose();
  };

  // 모달이 닫힐 때 상태 초기화
  const handleClose = () => {
    setConnectedItems([]);
    setSearchTerm("");
    setSelectedTags([]);
    setSearchType('all');
    setAllItems([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">연결 항목 관리</h3>
            <p className="text-sm text-gray-600 mt-1">
              체크리스트 항목에 연결할 재고, 주의사항, 메뉴얼을 선택하세요
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(80vh-180px)]">
          {/* 왼쪽: 검색 및 필터 */}
          <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto">
            {/* 검색 */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="항목 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                카테고리
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCategoryChange(option.value as any)}
                    className={`p-2 text-left rounded-lg border transition-colors ${
                      searchType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-base mr-1">{option.icon}</span>
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 태그 필터 */}
            <div className="mb-4">
              <button
                onClick={() => setIsTagSectionOpen(!isTagSectionOpen)}
                className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  태그 (AND 조건) {tags.length > 0 && `(${tags.length}개)`}
                  {selectedTags.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {selectedTags.length}개 선택
                    </span>
                  )}
                </div>
                <span className={`transform transition-transform ${isTagSectionOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              
              {isTagSectionOpen && (
                <div className="mt-2">
                  {tags.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                      {tags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm text-gray-700">{tag.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 border border-gray-200 rounded-lg">
                      <p className="text-sm">사용 가능한 태그가 없습니다.</p>
                    </div>
                  )}
                  {selectedTags.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        선택된 태그: {selectedTags.length}개 (모든 태그를 포함하는 항목만 표시)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 검색 결과 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                검색 결과 ({allItems.length}개)
              </h4>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">검색 중...</p>
                </div>
              ) : allItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>검색 조건에 맞는 항목이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allItems.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => addConnectedItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {item.type === 'inventory' && '📦'}
                            {item.type === 'precaution' && '⚠️'}
                            {item.type === 'manual' && '📖'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.type === 'inventory' && '재고'}
                          {item.type === 'precaution' && '주의사항'}
                          {item.type === 'manual' && '메뉴얼'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 오른쪽: 선택된 항목들 */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              연결된 항목 ({connectedItems.length}개)
            </h4>
            
            {connectedItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>연결된 항목이 없습니다.</p>
                <p className="text-xs mt-1">왼쪽에서 항목을 선택하여 연결하세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedItems.map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {item.type === 'inventory' && '📦'}
                          {item.type === 'precaution' && '⚠️'}
                          {item.type === 'manual' && '📖'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                          {item.type === 'inventory' && '재고'}
                          {item.type === 'precaution' && '주의사항'}
                          {item.type === 'manual' && '메뉴얼'}
                        </span>
                        <button
                          onClick={() => removeConnectedItem(item)}
                          className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            저장 ({connectedItems.length}개 연결)
          </button>
        </div>
      </div>
    </div>
  );
} 