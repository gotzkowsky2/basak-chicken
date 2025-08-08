'use client';

import { useState, useEffect, useRef } from 'react';
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
    order: number;
  }>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
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

  // 태그 관련 상태
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // 주의사항 관련 상태
  const [precautions, setPrecautions] = useState<any[]>([]);
  const [showPrecautionModal, setShowPrecautionModal] = useState(false);
  const [loadingPrecautions, setLoadingPrecautions] = useState(false);
  const [showNewPrecautionModal, setShowNewPrecautionModal] = useState(false);
  const [newPrecautionData, setNewPrecautionData] = useState({
    title: '',
    content: '',
    workplace: 'COMMON',
    timeSlot: 'COMMON',
    priority: 1,
    tags: []
  });
  const [precautionSearchTerm, setPrecautionSearchTerm] = useState('');
  const [precautionFilterWorkplace, setPrecautionFilterWorkplace] = useState('ALL');
  const [precautionFilterTimeSlot, setPrecautionFilterTimeSlot] = useState('ALL');
  const [precautionFilterTags, setPrecautionFilterTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  
  // 주의사항 수정 모달 상태
  const [showEditPrecautionModal, setShowEditPrecautionModal] = useState(false);
  const [editingPrecaution, setEditingPrecaution] = useState<any>(null);
  const [editPrecautionData, setEditPrecautionData] = useState({
    title: '',
    content: '',
    workplace: 'COMMON',
    timeSlot: 'COMMON',
    priority: 1,
    tags: [] as string[]
  });

  // 폼 데이터
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    workplace: string;
    timeSlot: string;
    category: string;
    version: string;
    mediaUrls: string[];
    tags: string[];
    precautions: Array<{ 
      title: string; 
      content: string; 
      workplace: string;
      timeSlot: string;
      priority: number;
    }>;
    selectedPrecautions: string[];
  }>({
    title: '',
    content: '',
    workplace: 'COMMON',
    timeSlot: 'COMMON',
    category: 'MANUAL',
    version: '1.0',
    mediaUrls: [],
    tags: [],
    precautions: [],
    selectedPrecautions: []
  });

  // 옵션 데이터
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

  // 태그 목록 조회
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

  const fetchPrecautions = async () => {
    try {
      setLoadingPrecautions(true);
      const response = await fetch("/api/admin/precautions", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        // API 응답이 배열인지 확인
        if (Array.isArray(data)) {
          setPrecautions(data);
        } else if (data.precautions && Array.isArray(data.precautions)) {
          setPrecautions(data.precautions);
        } else {
          console.error("주의사항 데이터 형식이 올바르지 않습니다:", data);
          setPrecautions([]);
        }
      } else {
        console.error("주의사항 목록을 불러오는데 실패했습니다.");
        setPrecautions([]);
      }
    } catch (error) {
      console.error("주의사항 목록을 불러오는데 실패했습니다:", error);
      setPrecautions([]);
    } finally {
      setLoadingPrecautions(false);
    }
  };

  // 태그 토글
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 편집 태그 토글
  const handleEditTagToggle = (tagId: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      const isSelected = currentTags.includes(tagId);
      return {
        ...prev,
        tags: isSelected 
          ? currentTags.filter(id => id !== tagId)
          : [...currentTags, tagId]
      };
    });
  };

  // 태그 생성
  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        setNewTagName('');
        setNewTagColor('#3B82F6');
        setShowTagModal(false);
        setSuccess('태그가 성공적으로 생성되었습니다.');
        await fetchTags();
      } else {
        const error = await response.json();
        setError(error.error || '태그 생성 실패');
      }
    } catch (error) {
      console.error('태그 생성 실패:', error);
      setError('태그 생성 중 오류가 발생했습니다.');
    }
  };

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
      // 메뉴얼에 필요한 필드만 추출
      const manualData = {
        title: formData.title,
        content: formData.content,
        workplace: formData.workplace,
        timeSlot: formData.timeSlot,
        category: formData.category,
        version: formData.version,
        mediaUrls: formData.mediaUrls,
        tags: formData.tags || [],
        precautions: formData.precautions || [],
        selectedPrecautions: formData.selectedPrecautions || []
      };

      const body = editingId ? { ...manualData, id: editingId } : manualData;
      
      console.log('formData 전체:', JSON.stringify(formData, null, 2));
      console.log('전송할 데이터:', JSON.stringify(body, null, 2));

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
        timeSlot: 'COMMON',
        category: 'MANUAL',
        version: '1.0',
        mediaUrls: [],
        tags: [],
        precautions: [],
        selectedPrecautions: []
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
      mediaUrls: manual.mediaUrls || [],
      tags: manual.tags?.map(tag => tag.id) || [],
      precautions: [],
      selectedPrecautions: manual.precautions?.map(p => p.id) || []
    });
    
    // 주의사항 목록을 미리 로드하여 편집 모드에서 표시할 수 있도록 함
    fetchPrecautions();
    
    // 디버깅을 위한 로그
    console.log('편집할 매뉴얼의 주의사항:', manual.precautions);
    console.log('선택된 주의사항 IDs:', manual.precautions?.map(p => p.id) || []);

    // 모바일: 편집 클릭 시 폼으로 자동 스크롤 및 포커스
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        try {
          (titleInputRef.current as any)?.focus?.({ preventScroll: true });
        } catch {}
      }, 200);
    });
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      workplace: 'COMMON',
      timeSlot: 'COMMON',
      category: 'MANUAL',
      version: '1.0',
      mediaUrls: [],
      tags: [],
      precautions: [],
      selectedPrecautions: []
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

  // 클라이언트 사이드 필터링
  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = !filters.search || 
      manual.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      manual.content.toLowerCase().includes(filters.search.toLowerCase());
    const matchesWorkplace = filters.workplace === 'ALL' || manual.workplace === filters.workplace;
    const matchesTimeSlot = filters.timeSlot === 'ALL' || manual.timeSlot === filters.timeSlot;
    const matchesCategory = filters.category === 'ALL' || manual.category === filters.category;
    
    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesCategory;
  });

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

  // 주의사항 추가
  const addPrecaution = () => {
    setFormData(prev => ({
      ...prev,
      precautions: [...prev.precautions, { 
        title: '', 
        content: '', 
        workplace: 'COMMON',
        timeSlot: 'COMMON',
        priority: 1
      }]
    }));
  };

  // 주의사항 삭제
  const removePrecaution = (index: number) => {
    setFormData(prev => ({
      ...prev,
      precautions: prev.precautions.filter((_, i) => i !== index)
    }));
  };

  // 주의사항 업데이트
  const updatePrecaution = (index: number, field: 'title' | 'content', value: string) => {
    setFormData(prev => ({
      ...prev,
      precautions: prev.precautions.map((precaution, i) => 
        i === index ? { ...precaution, [field]: value } : precaution
      )
    }));
  };

  // 기존 주의사항 선택 토글
  const handlePrecautionToggle = (precautionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPrecautions: prev.selectedPrecautions.includes(precautionId)
        ? prev.selectedPrecautions.filter(id => id !== precautionId)
        : [...prev.selectedPrecautions, precautionId]
    }));
  };

  // 주의사항 클릭 핸들러
  const handlePrecautionClick = (precaution: any) => {
    setEditingPrecaution(precaution);
    setEditPrecautionData({
      title: precaution.title,
      content: precaution.content,
      workplace: precaution.workplace,
      timeSlot: precaution.timeSlot,
      priority: precaution.priority,
      tags: precaution.tags?.map((tag: any) => tag.id) || []
    });
    setShowEditPrecautionModal(true);
  };

  // 주의사항 수정 제출
  const handleEditPrecautionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPrecaution) return;
    
    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/precautions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id: editingPrecaution.id,
          ...editPrecautionData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '주의사항 수정에 실패했습니다.');
      }

      setSuccess('주의사항이 수정되었습니다.');
      setShowEditPrecautionModal(false);
      setEditingPrecaution(null);
      fetchManuals(); // 매뉴얼 목록 새로고침
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 주의사항 필터링
  const filteredPrecautions = Array.isArray(precautions) ? precautions.filter(precaution => {
    const matchesSearch = !precautionSearchTerm || 
      precaution.title.toLowerCase().includes(precautionSearchTerm.toLowerCase()) ||
      precaution.content.toLowerCase().includes(precautionSearchTerm.toLowerCase());
    const matchesWorkplace = precautionFilterWorkplace === 'ALL' || precaution.workplace === precautionFilterWorkplace;
    const matchesTimeSlot = precautionFilterTimeSlot === 'ALL' || precaution.timeSlot === precautionFilterTimeSlot;
    const matchesTag = precautionFilterTags.length === 0 || 
      (precaution.tags && precautionFilterTags.every(selectedTagId => 
        precaution.tags.some(tag => tag.id === selectedTagId)
      ));
    
    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesTag;
  }) : [];

  useEffect(() => {
    fetchManuals();
    fetchTags();
    fetchPrecautions();
  }, []); // 초기 로드만 실행

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
              <h2 className="text-xl font-bold text-gray-900 mb-4">
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
                    rows={12}
                    placeholder="메뉴얼 내용을 상세히 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 resize-y"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    긴 내용을 입력할 수 있습니다. Ctrl+Enter로 줄바꿈을 추가할 수 있습니다.
                  </p>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      태그
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowTagModal(true)}
                      className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>태그 추가</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px]">
                    {tags.length === 0 ? (
                      <p className="text-gray-500 text-sm">등록된 태그가 없습니다.</p>
                    ) : (
                      tags.map((tag) => {
                        const isSelected = (formData.tags || []).includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleEditTagToggle(tag.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? 'text-white shadow-md'
                                : 'hover:shadow-md'
                            }`}
                            style={{
                              backgroundColor: isSelected ? tag.color : `${tag.color}20`,
                              color: isSelected ? 'white' : tag.color,
                              border: isSelected ? `2px solid ${tag.color}` : `1px solid ${tag.color}40`
                            }}
                          >
                            {tag.name}
                          </button>
                        );
                      })
                    )}
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

                {/* 주의사항 섹션 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      주의사항 (선택사항)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPrecautionModal(true)}
                        className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>기존 주의사항 선택</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewPrecautionModal(true)}
                        className="flex items-center space-x-1 px-2 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>새 주의사항 생성</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* 선택된 기존 주의사항 표시 */}
                  {formData.selectedPrecautions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">선택된 기존 주의사항:</h4>
                      <div className="space-y-2">
                        {formData.selectedPrecautions.map((precautionId) => {
                          const precaution = precautions.find(p => p.id === precautionId);
                          return precaution ? (
                            <div key={precautionId} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{precaution.title}</p>
                                <p className="text-xs text-gray-600">{precaution.content.substring(0, 50)}...</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePrecautionToggle(precautionId)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                제거
                              </button>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* 새로운 주의사항 입력 */}
                  {formData.precautions.length === 0 ? (
                    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                      <p className="text-gray-500 text-sm text-center">새로운 주의사항이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">새로운 주의사항:</h4>
                      {formData.precautions.map((precaution, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">새 주의사항 {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removePrecaution(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                제목
                              </label>
                              <input
                                type="text"
                                value={precaution.title}
                                onChange={(e) => updatePrecaution(index, 'title', e.target.value)}
                                placeholder="주의사항 제목을 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 font-medium"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                내용
                              </label>
                              <textarea
                                value={precaution.content}
                                onChange={(e) => updatePrecaution(index, 'content', e.target.value)}
                                placeholder="주의사항 내용을 입력하세요"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-gray-900 font-medium resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                {filteredManuals.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {manuals.length === 0 ? "메뉴얼이 없습니다" : "필터 조건에 맞는 메뉴얼이 없습니다"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {manuals.length === 0 ? "새로운 메뉴얼을 생성해보세요." : "다른 검색 조건을 시도해보세요."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredManuals.map((manual) => (
                      <div key={manual.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex-1 min-w-0 truncate pr-2">{manual.title}</h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  v{manual.version}
                                </span>
                                {manual.precautions && manual.precautions.length > 0 && (
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span>{manual.precautions.length}</span>
                                  </div>
                                )}
                                {manual.mediaUrls && manual.mediaUrls.length > 0 && (
                                  <span className="inline-flex items-center text-gray-500">
                                    {getFileIcon(manual.mediaUrls)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-gray-600 text-sm mb-3">
                              <p className="line-clamp-3 whitespace-pre-wrap">
                                {manual.content}
                              </p>
                              {manual.content.length > 200 && (
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-xs mt-1"
                                  onClick={() => {
                                    // 전체 내용 보기 기능 (추후 구현)
                                    alert('전체 내용 보기 기능은 추후 구현 예정입니다.');
                                  }}
                                >
                                  전체 내용 보기
                                </button>
                              )}
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
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{getWorkplaceLabel(manual.workplace)}</span>
                              <span>{getTimeSlotLabel(manual.timeSlot)}</span>
                              <span>{getCategoryLabel(manual.category)}</span>
                              <span>{new Date(manual.createdAt).toLocaleDateString()}</span>
                            {manual.precautions && manual.precautions.length > 0 && (
                              <span className="text-orange-600 hidden sm:inline">
                                ⚠️ {manual.precautions.length}개 주의사항
                              </span>
                            )}
                            </div>
                            
                            {/* 연결된 주의사항 표시 */}
                            {manual.precautions && manual.precautions.length > 0 && (
                              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <span className="text-xs font-medium text-red-800">연결된 주의사항</span>
                                  <span className="px-1 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800">
                                    {manual.precautions.length}개
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {manual.precautions.slice(0, 3).map((precaution, index) => (
                                    <div 
                                      key={index} 
                                      className="text-xs cursor-pointer hover:bg-red-100 p-2 rounded transition-colors"
                                      onClick={() => handlePrecautionClick(precaution)}
                                    >
                                      <div className="font-medium text-red-900">{precaution.title}</div>
                                      <div className="text-red-700 text-xs leading-relaxed">
                                        {precaution.content.length > 20 
                                          ? precaution.content.substring(0, 20) + '...' 
                                          : precaution.content
                                        }
                                      </div>
                                    </div>
                                  ))}
                                  {manual.precautions.length > 3 && (
                                    <div className="text-xs text-red-600">
                                      + {manual.precautions.length - 3}개 더...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2 sm:ml-4 self-start">
                            <button
                              onClick={() => handleEdit(manual)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(manual.id)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
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

      {/* 태그 생성 모달 */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">새 태그 생성</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 이름 *
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  placeholder="태그 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 색상
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createTag}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  생성
                </button>
                <button
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 주의사항 선택 모달 */}
      {showPrecautionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">기존 주의사항 선택</h3>
              <button
                onClick={() => setShowPrecautionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="mb-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={precautionSearchTerm}
                  onChange={(e) => setPrecautionSearchTerm(e.target.value)}
                  placeholder="제목 또는 내용으로 검색..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={precautionFilterWorkplace}
                  onChange={(e) => setPrecautionFilterWorkplace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="ALL">전체 근무처</option>
                  {workplaceOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={precautionFilterTimeSlot}
                  onChange={(e) => setPrecautionFilterTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="ALL">전체 시간대</option>
                  {timeSlotOptions.slice(1).map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 태그 필터 (접었다 폈다 가능) */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowTagFilter(!showTagFilter)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>태그 필터 {precautionFilterTags.length > 0 && `(${precautionFilterTags.length}개 선택)`}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showTagFilter ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTagFilter && (
                  <div className="mt-2 p-3 border border-gray-300 rounded-lg bg-white">
                    <div className="max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              setPrecautionFilterTags(prev => 
                                prev.includes(tag.id)
                                  ? prev.filter(id => id !== tag.id)
                                  : [...prev, tag.id]
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              precautionFilterTags.includes(tag.id)
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }`}
                            style={{ backgroundColor: precautionFilterTags.includes(tag.id) ? tag.color + '20' : undefined }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {!precautions || precautions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {loadingPrecautions ? "주의사항을 불러오는 중..." : "등록된 주의사항이 없습니다."}
                </p>
              ) : filteredPrecautions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  검색 조건에 맞는 주의사항이 없습니다.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredPrecautions.map((precaution) => {
                    const isSelected = formData.selectedPrecautions.includes(precaution.id);
                    return (
                      <div
                        key={precaution.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => handlePrecautionToggle(precaution.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{precaution.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{precaution.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>📍 {getWorkplaceLabel(precaution.workplace)}</span>
                              <span>⏰ {getTimeSlotLabel(precaution.timeSlot)}</span>
                              <span>🔥 우선순위: {precaution.priority}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isSelected ? (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPrecautionModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 주의사항 생성 모달 */}
      {showNewPrecautionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">새 주의사항 생성</h3>
              <button
                onClick={() => setShowNewPrecautionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              console.log('폼 제출 시작:', newPrecautionData);
              try {
                const requestBody = {
                  title: newPrecautionData.title,
                  content: newPrecautionData.content,
                  workplace: newPrecautionData.workplace,
                  timeSlot: newPrecautionData.timeSlot,
                  priority: newPrecautionData.priority,
                  tags: newPrecautionData.tags
                };
                console.log('요청 데이터:', requestBody);
                
                const response = await fetch('/api/admin/precautions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(requestBody)
                });

                console.log('응답 상태:', response.status);
                
                if (response.ok) {
                  const result = await response.json();
                  console.log('성공 응답:', result);
                  
                  // 새로 생성된 주의사항을 메뉴얼에 자동 선택
                  if (result.precaution && result.precaution.id) {
                    setFormData(prev => ({
                      ...prev,
                      selectedPrecautions: [...prev.selectedPrecautions, result.precaution.id]
                    }));
                  }
                  
                  setSuccess('주의사항이 생성되었습니다.');
                  setShowNewPrecautionModal(false);
                  setNewPrecautionData({
                    title: '',
                    content: '',
                    workplace: 'COMMON',
                    timeSlot: 'COMMON',
                    priority: 1,
                    tags: []
                  });
                  fetchPrecautions(); // 주의사항 목록 새로고침
                } else {
                  const errorData = await response.json();
                  console.error('API 오류:', errorData);
                  setError(errorData.error || '주의사항 생성에 실패했습니다.');
                }
              } catch (error) {
                console.error('주의사항 생성 오류:', error);
                setError('주의사항 생성 중 오류가 발생했습니다.');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
                <input
                  type="text"
                  value={newPrecautionData.title}
                  onChange={(e) => setNewPrecautionData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder="주의사항 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
                <textarea
                  value={newPrecautionData.content}
                  onChange={(e) => setNewPrecautionData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 font-medium resize-y"
                  placeholder="주의사항 내용을 입력하세요"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">근무처</label>
                  <select
                    value={newPrecautionData.workplace}
                    onChange={(e) => setNewPrecautionData(prev => ({ ...prev, workplace: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    {workplaceOptions.slice(1).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간대</label>
                  <select
                    value={newPrecautionData.timeSlot}
                    onChange={(e) => setNewPrecautionData(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="PREPARATION">준비</option>
                    <option value="IN_PROGRESS">진행</option>
                    <option value="CLOSING">마감</option>
                    <option value="COMMON">공통</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select
                    value={newPrecautionData.priority}
                    onChange={(e) => setNewPrecautionData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value={1}>낮음</option>
                    <option value={2}>보통</option>
                    <option value={3}>높음</option>
                  </select>
                </div>
              </div>

              {/* 태그 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setNewPrecautionData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag.id)
                            ? prev.tags.filter(id => id !== tag.id)
                            : [...prev.tags, tag.id]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        newPrecautionData.tags.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{ backgroundColor: newPrecautionData.tags.includes(tag.id) ? tag.color + '20' : undefined }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  생성
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewPrecautionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 주의사항 수정 모달 */}
      {showEditPrecautionModal && editingPrecaution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">주의사항 수정</h3>
              <button
                onClick={() => {
                  setShowEditPrecautionModal(false);
                  setEditingPrecaution(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditPrecautionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editPrecautionData.title}
                  onChange={(e) => setEditPrecautionData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="주의사항 제목을 입력하세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={editPrecautionData.content}
                  onChange={(e) => setEditPrecautionData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="주의사항 내용을 입력하세요"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">근무처</label>
                  <select
                    value={editPrecautionData.workplace}
                    onChange={(e) => setEditPrecautionData(prev => ({ ...prev, workplace: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    {workplaceOptions.slice(1).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">시간대</label>
                  <select
                    value={editPrecautionData.timeSlot}
                    onChange={(e) => setEditPrecautionData(prev => ({ ...prev, timeSlot: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value="PREPARATION">준비</option>
                    <option value="IN_PROGRESS">진행</option>
                    <option value="CLOSING">마감</option>
                    <option value="COMMON">공통</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                  <select
                    value={editPrecautionData.priority}
                    onChange={(e) => setEditPrecautionData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  >
                    <option value={1}>낮음</option>
                    <option value={2}>보통</option>
                    <option value={3}>높음</option>
                  </select>
                </div>
              </div>

              {/* 태그 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setEditPrecautionData(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag.id)
                            ? prev.tags.filter(id => id !== tag.id)
                            : [...prev.tags, tag.id]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        editPrecautionData.tags.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{ backgroundColor: editPrecautionData.tags.includes(tag.id) ? tag.color + '20' : undefined }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? '수정 중...' : '수정'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditPrecautionModal(false);
                    setEditingPrecaution(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 