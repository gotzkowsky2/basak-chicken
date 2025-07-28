'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon
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
}

export default function ManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    workplace: 'ALL',
    timeSlot: 'ALL',
    category: 'ALL',
    search: ''
  });

  // 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Manual>>({});

  // 삭제 확인 상태
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    workplace: string;
    timeSlot: string;
    category: string;
    version: string;
    mediaUrls: string[];
  }>({
    title: '',
    content: '',
    workplace: 'COMMON',
    timeSlot: 'ALL_DAY',
    category: 'MANUAL',
    version: '1.0',
    mediaUrls: []
  });

  // 옵션 데이터
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

  // 메뉴얼 목록 조회
  const fetchManuals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.workplace !== 'ALL') params.append('workplace', filters.workplace);
      if (filters.timeSlot !== 'ALL') params.append('timeSlot', filters.timeSlot);
      if (filters.category !== 'ALL') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/manuals?${params}`);
      if (!response.ok) throw new Error('메뉴얼 조회에 실패했습니다.');
      
      const data = await response.json();
      setManuals(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 메뉴얼 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const url = editingId ? `/api/admin/manuals` : `/api/admin/manuals`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '저장에 실패했습니다.');
      }

      setSuccess(editingId ? '메뉴얼이 수정되었습니다.' : '메뉴얼이 생성되었습니다.');
      setFormData({
        title: '',
        content: '',
        workplace: 'COMMON',
        timeSlot: 'ALL_DAY',
        category: 'MANUAL',
        version: '1.0',
        mediaUrls: []
      });
      setEditingId(null);
      fetchManuals();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 편집 시작
  const handleEdit = (manual: Manual) => {
    setEditingId(manual.id);
    setFormData({
      title: manual.title,
      content: manual.content,
      workplace: manual.workplace,
      timeSlot: manual.timeSlot,
      category: manual.category,
      version: manual.version,
      mediaUrls: manual.mediaUrls || []
    });
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      workplace: 'COMMON',
      timeSlot: 'ALL_DAY',
      category: 'MANUAL',
      version: '1.0',
      mediaUrls: []
    });
  };

  // 메뉴얼 삭제
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/manuals?id=${deleteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제에 실패했습니다.');
      }

      setSuccess('메뉴얼이 삭제되었습니다.');
      setDeleteId(null);
      fetchManuals();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 필터 변경
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 헬퍼 함수들
  const getWorkplaceLabel = (workplace: string) => {
    const option = workplaceOptions.find(opt => opt.value === workplace);
    return option ? option.label : workplace;
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const option = timeSlotOptions.find(opt => opt.value === timeSlot);
    return option ? option.label : timeSlot;
  };

  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  const getFileIcon = (mediaUrls: string[]) => {
    if (!mediaUrls || mediaUrls.length === 0) return <DocumentTextIcon className="w-4 h-4" />;
    
    const firstUrl = mediaUrls[0];
    const extension = firstUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <PhotoIcon className="w-4 h-4" />;
    } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) {
      return <VideoCameraIcon className="w-4 h-4" />;
    }
    return <DocumentTextIcon className="w-4 h-4" />;
  };

  useEffect(() => {
    fetchManuals();
  }, [filters]);

  useEffect(() => {
    if (success) {
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [success]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">메뉴얼 관리</h1>
          <p className="text-gray-600">업무 매뉴얼을 생성하고 관리합니다.</p>
        </div>

        {/* 알림 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메뉴얼 생성/수정 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? '메뉴얼 수정' : '새 메뉴얼 생성'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    내용 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      근무처
                    </label>
                    <select
                      value={formData.workplace}
                      onChange={(e) => setFormData(prev => ({ ...prev, workplace: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {workplaceOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      시간대
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeSlot: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {timeSlotOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {categoryOptions.slice(1).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      버전
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>

                <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">
                     미디어 URL (선택사항)
                   </label>
                   <input
                     type="url"
                     placeholder="https://example.com/file.pdf"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     disabled
                   />
                   <p className="text-xs text-gray-500">미디어 URL 기능은 추후 구현 예정입니다.</p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {submitting ? '저장 중...' : (editingId ? '수정' : '생성')}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      취소
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* 메뉴얼 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* 필터 */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">근무처</label>
                    <select
                      value={filters.workplace}
                      onChange={(e) => handleFilterChange('workplace', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {workplaceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">시간대</label>
                    <select
                      value={filters.timeSlot}
                      onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {timeSlotOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="제목 또는 내용 검색"
                        className="w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 메뉴얼 목록 */}
              <div className="p-6">
                {manuals.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">메뉴얼이 없습니다</h3>
                    <p className="mt-1 text-sm text-gray-500">새로운 메뉴얼을 생성해보세요.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {manuals.map((manual) => (
                      <div key={manual.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">{manual.title}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                v{manual.version}
                              </span>
                                                             {manual.mediaUrls && manual.mediaUrls.length > 0 && (
                                 <span className="inline-flex items-center text-gray-500">
                                   {getFileIcon(manual.mediaUrls)}
                                 </span>
                               )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {manual.content}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{getWorkplaceLabel(manual.workplace)}</span>
                              <span>{getTimeSlotLabel(manual.timeSlot)}</span>
                              <span>{getCategoryLabel(manual.category)}</span>
                              <span>{new Date(manual.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEdit(manual)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(manual.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">메뉴얼 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 메뉴얼을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {submitting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 