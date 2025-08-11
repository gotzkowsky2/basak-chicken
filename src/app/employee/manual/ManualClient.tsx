"use client";
import { useState, useEffect } from "react";
import { 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

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
  precautions?: Array<{
    id: string;
    title: string;
    content: string;
    workplace: string;
    timeSlot: string;
    priority: number;
    tags?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function ManualClient() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [favoriteManualIds, setFavoriteManualIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPrecautions, setExpandedPrecautions] = useState<Set<number>>(new Set());
  
  // 주의사항 관련 상태
  const [expandedManualPrecautions, setExpandedManualPrecautions] = useState<Set<string>>(new Set());
  const [selectedPrecaution, setSelectedPrecaution] = useState<any>(null);
  const [showPrecautionModal, setShowPrecautionModal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkplace, setFilterWorkplace] = useState('ALL');
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // 관리자 입력 기준과 동일한 구분 사용
  const workplaceOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'HALL', label: '홀' },
    { value: 'KITCHEN', label: '주방' },
    { value: 'COMMON', label: '공통' }
  ];

  const timeSlotOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PREPARATION', label: '준비' },
    { value: 'IN_PROGRESS', label: '진행' },
    { value: 'CLOSING', label: '마감' },
    { value: 'COMMON', label: '공통' }
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

  useEffect(() => {
    // 즐겨찾기 불러오기
    const loadFavorites = async () => {
      const res = await fetch('/api/employee/favorites', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFavoriteManualIds(data.manualIds || []);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = async (manualId: string, next: boolean) => {
    const res = await fetch('/api/employee/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetType: 'MANUAL', targetId: manualId, favorite: next })
    });
    if (res.ok) {
      setFavoriteManualIds(prev => next ? Array.from(new Set([...prev, manualId])) : prev.filter(id => id !== manualId));
    }
  };

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

  // 미리보기 텍스트 생성 (150자 제한)
  const getPreviewText = (content: string) => {
    if (content.length <= 150) {
      return content;
    }
    return content.substring(0, 150) + '...';
  };

  // 팝업 열기
  const openModal = (manual: Manual) => {
    setSelectedManual(manual);
    setIsModalOpen(true);
  };

  // 팝업 닫기
  const closeModal = () => {
    setSelectedManual(null);
    setIsModalOpen(false);
    setExpandedPrecautions(new Set());
  };

  const closePrecautionModal = () => {
    setShowPrecautionModal(false);
    setSelectedPrecaution(null);
  };

  // 주의사항 접기/펼치기 토글
  const togglePrecautionExpansion = (index: number) => {
    setExpandedPrecautions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // 매뉴얼별 주의사항 접기/펼치기
  const toggleManualPrecautions = (manualId: string) => {
    setExpandedManualPrecautions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(manualId)) {
        newSet.delete(manualId);
      } else {
        newSet.add(manualId);
      }
      return newSet;
    });
  };

  // 개별 주의사항 클릭 핸들러
  const handlePrecautionClick = (precaution: any) => {
    setSelectedPrecaution(precaution);
    setShowPrecautionModal(true);
  };

  // 클라이언트 사이드 필터링
  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = !searchTerm || 
      manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manual.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkplace = filterWorkplace === 'ALL' || manual.workplace === filterWorkplace;
    const matchesTimeSlot = filterTimeSlot === 'ALL' || manual.timeSlot === filterTimeSlot;
    const matchesCategory = filterCategory === 'ALL' || manual.category === filterCategory;
    // 태그 필터는 AND 조건: 선택 수가 늘수록 결과는 줄어들어야 함
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => manual.tags?.some(tag => tag.id === tagId));
    const matchesFavorite = !showFavoritesOnly || favoriteManualIds.includes(manual.id);
    
    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesCategory && matchesTags && matchesFavorite;
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

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return '높음';
      case 2:
        return '보통';
      case 3:
        return '낮음';
      default:
        return `우선순위 ${priority}`;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-200 text-red-800';
      case 2:
        return 'bg-yellow-200 text-yellow-800';
      case 3:
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">메뉴얼을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 최적화된 컨테이너 */}
      <div className="max-w-4xl mx-auto px-3 py-3 sm:px-4 sm:py-6">
        {/* 헤더 섹션 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">업무 매뉴얼</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 sm:flex-none px-3 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors active:scale-95"
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="hidden sm:inline">{showFilters ? "접기" : "필터"}</span>
                <span className="sm:hidden">필터</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFavoritesOnly(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg active:scale-95 ${showFavoritesOnly ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title="즐겨찾기만 보기"
              >
                {showFavoritesOnly ? (
                  <HeartSolid className="w-4 h-4 text-pink-600" />
                ) : (
                  <HeartOutline className="w-4 h-4 text-gray-500" />
                )}
                <span className="hidden sm:inline">즐겨찾기만</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-3 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* 검색 섹션 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목 또는 내용으로 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-base"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 필터 섹션 */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="space-y-4">
              {/* 필터 옵션들 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">근무처</label>
                  <select
                    value={filterWorkplace}
                    onChange={(e) => setFilterWorkplace(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
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
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  >
                    {timeSlotOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
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
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagFilterToggle(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
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
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">메뉴얼이 없습니다</h3>
            <p className="text-gray-500 text-sm">현재 표시할 메뉴얼이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredManuals.map((manual) => (
              <div key={manual.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                {/* 메뉴얼 헤더 */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-2 mb-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex-1 min-w-0 leading-tight">
                          {manual.title}
                        </h2>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            v{manual.version}
                          </span>
                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            aria-label="즐겨찾기"
                            onClick={() => toggleFavorite(manual.id, !favoriteManualIds.includes(manual.id))}
                          >
                            {favoriteManualIds.includes(manual.id) ? (
                              <HeartSolid className="w-5 h-5 text-red-500" />
                            ) : (
                              <HeartOutline className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          {manual.precautions && manual.precautions.length > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span>{manual.precautions.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 태그 표시 */}
                      {manual.tags && manual.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
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
                </div>
                
                {/* 내용 미리보기 */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {getPreviewText(manual.content)}
                  </p>
                  
                  {/* 전체 보기 버튼 */}
                  <button
                    onClick={() => openModal(manual)}
                    className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors active:scale-95"
                  >
                    <EyeIcon className="w-4 h-4" />
                    {manual.content.length > 150 ? "전체 내용 보기" : "상세 보기"}
                  </button>
                </div>

                {/* 연결된 주의사항 표시 */}
                {manual.precautions && manual.precautions.length > 0 && (
                  <div className="mb-3 sm:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div 
                      className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-red-100 p-2 rounded transition-colors active:scale-95"
                      onClick={() => toggleManualPrecautions(manual.id)}
                    >
                      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-sm font-medium text-red-800">연결된 주의사항</span>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                        {manual.precautions.length}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-red-600 transition-transform flex-shrink-0 ${expandedManualPrecautions.has(manual.id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedManualPrecautions.has(manual.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-2 pt-2">
                        {manual.precautions.map((precaution, index) => (
                          <div 
                            key={index} 
                            className="text-sm cursor-pointer hover:bg-red-100 p-2 rounded transition-colors active:scale-95"
                            onClick={() => handlePrecautionClick(precaution)}
                          >
                            <div className="font-medium text-red-900 mb-1">{precaution.title}</div>
                            <div className="text-red-700 text-xs leading-relaxed">
                              {precaution.content.length > 80 
                                ? precaution.content.substring(0, 80) + '...' 
                                : precaution.content
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getWorkplaceLabel(manual.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getTimeSlotLabel(manual.timeSlot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getCategoryLabel(manual.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 메뉴얼 상세 팝업 */}
      {isModalOpen && selectedManual && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeModal}
          ></div>

          {/* 모달 컨테이너 */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <DocumentTextIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {selectedManual.title}
                  </h2>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                    v{selectedManual.version}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* 태그 표시 */}
                {selectedManual.tags && selectedManual.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedManual.tags.map((tag) => (
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
                
                {/* 전체 내용 */}
                <div className="prose max-w-none mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                      {selectedManual.content}
                    </p>
                  </div>
                </div>

                {/* 연결된 주의사항 섹션 */}
                {selectedManual.precautions && selectedManual.precautions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">연결된 주의사항</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {selectedManual.precautions.length}개
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedManual.precautions.map((precaution, index) => {
                        const isExpanded = expandedPrecautions.has(index);
                        const previewText = getPreviewText(precaution.content);
                        
                        return (
                          <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-red-900 text-sm sm:text-base">{precaution.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(precaution.priority)}`}>
                                {getPriorityLabel(precaution.priority)}
                              </span>
                            </div>
                            
                            {/* 주의사항 내용 (접기/펼치기) */}
                            <div className="mb-3">
                              <div className="overflow-hidden transition-all duration-300 ease-in-out">
                                <p className="text-red-800 text-sm whitespace-pre-wrap leading-relaxed">
                                  {isExpanded ? precaution.content : (precaution.content.length > 10 ? precaution.content.substring(0, 10) + '...' : precaution.content)}
                                </p>
                              </div>
                              
                              {precaution.content.length > 10 && (
                                <button
                                  onClick={() => togglePrecautionExpansion(index)}
                                  className="mt-2 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm active:scale-95"
                                >
                                  <EyeIcon className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                  {isExpanded ? "내용 접기" : "전체 내용 보기"}
                                </button>
                              )}
                            </div>
                            
                            {/* 주의사항 태그 */}
                            {precaution.tags && precaution.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {precaution.tags.map((tag) => (
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
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-red-700">
                              <span>근무처: {getWorkplaceLabel(precaution.workplace)}</span>
                              <span>시간대: {getTimeSlotLabel(precaution.timeSlot)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getWorkplaceLabel(selectedManual.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getTimeSlotLabel(selectedManual.timeSlot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    {getCategoryLabel(selectedManual.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedManual.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 주의사항 상세 모달 */}
      {showPrecautionModal && selectedPrecaution && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closePrecautionModal}
          ></div>

          {/* 모달 컨테이너 */}
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {selectedPrecaution.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getPriorityColor(selectedPrecaution.priority)}`}>
                    {getPriorityLabel(selectedPrecaution.priority)}
                  </span>
                </div>
                <button
                  onClick={closePrecautionModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {/* 주의사항 내용 */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">내용</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900 text-sm whitespace-pre-wrap leading-relaxed">
                      {selectedPrecaution.content}
                    </p>
                  </div>
                </div>

                {/* 주의사항 태그 */}
                {selectedPrecaution.tags && selectedPrecaution.tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPrecaution.tags.map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주의사항 메타 정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">근무처:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {getWorkplaceLabel(selectedPrecaution.workplace)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">시간대:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {getTimeSlotLabel(selectedPrecaution.timeSlot)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 