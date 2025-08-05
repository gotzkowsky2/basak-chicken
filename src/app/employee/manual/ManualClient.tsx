"use client";
import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Manual {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  category: string;
  version: string;
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function ManualClient() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkplace, setFilterWorkplace] = useState('ALL');
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const workplaceOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'COMMON', label: '공통' },
    { value: 'KITCHEN', label: '주방' },
    { value: 'COUNTER', label: '카운터' },
    { value: 'DELIVERY', label: '배달' }
  ];

  const timeSlotOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'ALL_DAY', label: '전일' },
    { value: 'MORNING', label: '오전' },
    { value: 'AFTERNOON', label: '오후' },
    { value: 'EVENING', label: '저녁' },
    { value: 'NIGHT', label: '야간' }
  ];

  const categoryOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'MANUAL', label: '메뉴얼' },
    { value: 'PROCEDURE', label: '절차' },
    { value: 'GUIDE', label: '가이드' },
    { value: 'TRAINING', label: '교육' }
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employee/manuals`, { 
        credentials: "include" 
      });
      
      if (response.ok) {
        const data = await response.json();
        setManuals(data.manuals || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "메뉴얼 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("메뉴얼 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error("태그 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const handleTagFilterToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 클라이언트 사이드 필터링
  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = !searchTerm || 
      manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manual.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkplace = filterWorkplace === 'ALL' || manual.workplace === filterWorkplace;
    const matchesTimeSlot = filterTimeSlot === 'ALL' || manual.timeSlot === filterTimeSlot;
    const matchesCategory = filterCategory === 'ALL' || manual.category === filterCategory;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tagId => 
        manual.tags?.some(tag => tag.id === tagId)
      );
    
    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesCategory && matchesTags;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterWorkplace('ALL');
    setFilterTimeSlot('ALL');
    setFilterCategory('ALL');
    setSelectedTags([]);
  };

  const getWorkplaceLabel = (value: string) => {
    const option = workplaceOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getTimeSlotLabel = (value: string) => {
    const option = timeSlotOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  const getCategoryLabel = (value: string) => {
    const option = categoryOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">업무 매뉴얼</h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              필터 초기화
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showFilters ? "접기" : "필터"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목 또는 내용으로 검색..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 필터 */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="space-y-4">

              {/* 필터 옵션들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">근무처</label>
                  <select
                    value={filterWorkplace}
                    onChange={(e) => setFilterWorkplace(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    {workplaceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                  <select
                    value={filterTimeSlot}
                    onChange={(e) => setFilterTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    {timeSlotOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 태그 필터 */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">태그 필터</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagFilterToggle(tag.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'text-white shadow-md'
                            : 'hover:shadow-md'
                        }`}
                        style={{
                          backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                          color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                          border: selectedTags.includes(tag.id) ? `2px solid ${tag.color}` : `1px solid ${tag.color}40`
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메뉴얼 목록 */}
        {filteredManuals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">메뉴얼이 없습니다</h3>
            <p className="text-gray-500">현재 표시할 메뉴얼이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredManuals.map((manual) => (
              <div key={manual.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">{manual.title}</h2>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        v{manual.version}
                      </span>
                    </div>
                    
                    {/* 태그 표시 */}
                    {manual.tags && manual.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {manual.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                    {manual.content}
                  </p>
                  {manual.content.length > 200 && (
                    <button 
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                      onClick={() => setSelectedManual(selectedManual?.id === manual.id ? null : manual)}
                    >
                      {selectedManual?.id === manual.id ? '접기' : '전체 내용 보기'}
                    </button>
                  )}
                  
                  {selectedManual?.id === manual.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {manual.content}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {getWorkplaceLabel(manual.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {getTimeSlotLabel(manual.timeSlot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="w-4 h-4" />
                    {getCategoryLabel(manual.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(manual.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 