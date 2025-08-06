"use client";
import React, { useState, useEffect } from "react";
import { Search, Tag, Filter } from "lucide-react";

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

interface SearchSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchType: 'all' | 'inventory' | 'precaution' | 'manual';
  setSearchType: (type: 'all' | 'inventory' | 'precaution' | 'manual') => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  allItems: ConnectedItem[];
  setAllItems: (items: ConnectedItem[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  tags: Tag[];
  isTagSectionOpen: boolean;
  setIsTagSectionOpen: (open: boolean) => void;
  onAddItem: (item: ConnectedItem) => void;
}

const categoryOptions = [
  { value: 'all', label: '전체', icon: '📋' },
  { value: 'inventory', label: '재고', icon: '📦' },
  { value: 'precaution', label: '주의사항', icon: '⚠️' },
  { value: 'manual', label: '메뉴얼', icon: '📖' },
];

export default function SearchSection({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  selectedTags,
  setSelectedTags,
  allItems,
  setAllItems,
  isLoading,
  setIsLoading,
  tags,
  isTagSectionOpen,
  setIsTagSectionOpen,
  onAddItem
}: SearchSectionProps) {
  
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
    const timeoutId = setTimeout(() => {
      loadAllItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchType, selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev: string[]) => 
      prev.includes(tagId) 
        ? prev.filter((id: string) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleCategoryChange = (category: 'all' | 'inventory' | 'precaution' | 'manual') => {
    setSearchType(category);
  };

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="항목 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 카테고리 필터 */}
      <div className="flex space-x-2">
        {categoryOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleCategoryChange(option.value as any)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              searchType === option.value
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>

      {/* 태그 필터 */}
      <div className="space-y-2">
        <button
          onClick={() => setIsTagSectionOpen(!isTagSectionOpen)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <Tag className="w-4 h-4" />
          <span>태그 필터 {isTagSectionOpen ? '접기' : '펼치기'}</span>
        </button>
        
        {isTagSectionOpen && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedTags.includes(tag.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  color: selectedTags.includes(tag.id) ? 'white' : undefined
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 검색 결과 */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">검색 중...</div>
        ) : allItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          allItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => onAddItem(item)}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {item.type === 'inventory' ? '📦' : item.type === 'precaution' ? '⚠️' : '📖'}
                  </span>
                  <span className="font-medium text-gray-800">{item.name}</span>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  추가
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 