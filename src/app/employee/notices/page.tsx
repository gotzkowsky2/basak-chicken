'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface Precaution {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  priority: number;
  isActive: boolean;
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

export default function NoticesPage() {
  const [precautions, setPrecautions] = useState<Precaution[]>([]);
  const [favoritePrecautionIds, setFavoritePrecautionIds] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkplace, setFilterWorkplace] = useState('ALL');
  const [filterTimeSlot, setFilterTimeSlot] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // 팝업 상태
  const [selectedPrecaution, setSelectedPrecaution] = useState<Precaution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const workplaceOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'HALL', label: '홀' },
    { value: 'KITCHEN', label: '부엌' },
    { value: 'COMMON', label: '공통' }
  ];

  const timeSlotOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PREPARATION', label: '준비' },
    { value: 'IN_PROGRESS', label: '진행' },
    { value: 'CLOSING', label: '마감' },
    { value: 'COMMON', label: '공통' }
  ];

  const priorityOptions = [
    { value: 1, label: '낮음', color: 'bg-green-100 text-green-800' },
    { value: 2, label: '보통', color: 'bg-yellow-100 text-yellow-800' },
    { value: 3, label: '높음', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTags();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrecautions();
      fetchFavorites();
    }
  }, [isAuthenticated]);
  const fetchFavorites = async () => {
    const res = await fetch('/api/employee/favorites', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setFavoritePrecautionIds(data.precautionIds || []);
    }
  };

  const toggleFavorite = async (precautionId: string, next: boolean) => {
    const res = await fetch('/api/employee/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ targetType: 'PRECAUTION', targetId: precautionId, favorite: next })
    });
    if (res.ok) {
      setFavoritePrecautionIds(prev => next ? Array.from(new Set([...prev, precautionId])) : prev.filter(id => id !== precautionId));
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/employee/auth-check', { 
        credentials: 'include' 
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        window.location.href = '/employee/login';
      }
    } catch (error) {
      window.location.href = '/employee/login';
    }
  };

  const fetchPrecautions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employee/precautions`, { 
        credentials: "include" 
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrecautions(data.precautions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "주의사항 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("주의사항 목록을 불러오는데 실패했습니다.");
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
  const openModal = (precaution: Precaution) => {
    setSelectedPrecaution(precaution);
    setIsModalOpen(true);
  };

  // 팝업 닫기
  const closeModal = () => {
    setSelectedPrecaution(null);
    setIsModalOpen(false);
  };

  // 클라이언트 사이드 필터링
  const filteredPrecautions = precautions.filter(precaution => {
    const matchesSearch = !searchTerm || 
      precaution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precaution.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWorkplace = filterWorkplace === 'ALL' || precaution.workplace === filterWorkplace;
    const matchesTimeSlot = filterTimeSlot === 'ALL' || precaution.timeSlot === filterTimeSlot;
    // 태그 AND 필터: 선택한 모든 태그를 포함해야 함
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tagId => precaution.tags?.some(tag => tag.id === tagId));
    const matchesFavorite = !showFavoritesOnly || favoritePrecautionIds.includes(precaution.id);
    
    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesTags && matchesFavorite;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterWorkplace('ALL');
    setFilterTimeSlot('ALL');
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

  const getPriorityLabel = (value: number) => {
    const option = priorityOptions.find(opt => opt.value === value);
    return option ? option.label : '알 수 없음';
  };

  const getPriorityColor = (priority: number) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">주의사항</h1>
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
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(prev => !prev)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${showFavoritesOnly ? 'bg-pink-100 text-pink-700 hover:bg-pink-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="즐겨찾기만 보기"
            >
              {showFavoritesOnly ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-pink-600"><path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.173 25.18 25.18 0 01-4.244-2.673C4.688 16.18 2.25 13.514 2.25 9.75 2.25 7.126 4.338 5 6.75 5c1.676 0 3.163.992 3.9 2.41.737-1.418 2.224-2.41 3.9-2.41 2.412 0 4.5 2.126 4.5 4.75 0 3.764-2.438 6.43-4.739 8.3a25.175 25.175 0 01-4.244 2.673 15.247 15.247 0 01-.383.173l-.022.01-.007.003-.003.001a.75.75 0 01-.614 0l-.003-.001z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>
              )}
              <span className="hidden sm:inline">즐겨찾기만</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">근무지</label>
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

        {/* 주의사항 목록 */}
        {filteredPrecautions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">주의사항이 없습니다</h3>
            <p className="text-gray-500">현재 표시할 주의사항이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPrecautions.map((precaution) => (
              <div key={precaution.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-800">{precaution.title}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(precaution.priority)}`}>
                        {getPriorityLabel(precaution.priority)}
                      </span>
                        <button
                          className="p-1 rounded hover:bg-gray-100"
                          aria-label="즐겨찾기"
                          onClick={() => toggleFavorite(precaution.id, !favoritePrecautionIds.includes(precaution.id))}
                        >
                          {favoritePrecautionIds.includes(precaution.id) ? (
                            <HeartSolid className="w-5 h-5 text-red-500" />
                          ) : (
                            <HeartOutline className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                    </div>
                    
                    {/* 태그 표시 */}
                    {precaution.tags && precaution.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
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
                  </div>
                </div>
                
                {/* 내용 미리보기 */}
                <div className="mb-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{getPreviewText(precaution.content)}</p>
                  
                  {/* 전체 보기 버튼 (내용이 길 때만 표시) */}
                  {precaution.content.length > 150 ? (
                    <button
                      onClick={() => openModal(precaution)}
                      className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      전체 내용 보기
                    </button>
                  ) : (
                    <button
                      onClick={() => openModal(precaution)}
                      className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      상세 보기
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {getWorkplaceLabel(precaution.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {getTimeSlotLabel(precaution.timeSlot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(precaution.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 주의사항 상세 팝업 */}
      {isModalOpen && selectedPrecaution && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeModal}
          ></div>

          {/* 모달 컨테이너 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {selectedPrecaution.title}
                  </h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedPrecaution.priority)}`}>
                    {getPriorityLabel(selectedPrecaution.priority)}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-4 sm:p-6">
                {/* 태그 표시 */}
                {selectedPrecaution.tags && selectedPrecaution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPrecaution.tags.map((tag) => (
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
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedPrecaution.content}
                    </p>
                  </div>
                </div>
                
                {/* 메타 정보 */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {getWorkplaceLabel(selectedPrecaution.workplace)}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {getTimeSlotLabel(selectedPrecaution.timeSlot)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(selectedPrecaution.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 