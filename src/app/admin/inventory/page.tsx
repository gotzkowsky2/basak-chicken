'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string | null;
  lastUpdated: string;
  lastCheckedBy: string | null;
  isActive: boolean;
  checks: any[];
  tagRelations?: Array<{
    id: string;
    tag: Tag;
  }>;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface PurchaseRequest {
  id: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
  priority: string;
  estimatedCost: number | null;
  approvedBy: string | null;
  approvedAt: string | null;
  employee: {
    name: string;
    department: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number | null;
    notes: string | null;
    item: {
      name: string;
      unit: string;
    };
  }>;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 필터 상태
  const [inventoryFilters, setInventoryFilters] = useState({
    category: 'ALL',
    search: '',
    lowStock: false
  });

  const [purchaseFilters, setPurchaseFilters] = useState({
    status: 'ALL',
    priority: 'ALL'
  });

  // 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    category: 'INGREDIENTS',
    currentStock: '',
    minStock: '',
    unit: '',
    supplier: '',
    selectedTags: [] as string[]
  });

  // 태그 관련 상태
  const [tags, setTags] = useState<Tag[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // 옵션 데이터
  const categoryOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'INGREDIENTS', label: '재료' },
    { value: 'SUPPLIES', label: '용품' },
    { value: 'COMMON', label: '기타' }
  ];

  const unitOptions = [
    { value: 'kg', label: 'kg' },
    { value: 'L', label: 'L' },
    { value: '개', label: '개' },
    { value: '박스', label: '박스' },
    { value: '팩', label: '팩' },
    { value: '병', label: '병' }
  ];

  const statusOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'PENDING', label: '대기중' },
    { value: 'APPROVED', label: '승인됨' },
    { value: 'REJECTED', label: '거부됨' },
    { value: 'PURCHASED', label: '구매됨' },
    { value: 'RECEIVED', label: '입고됨' }
  ];

  const priorityOptions = [
    { value: 'ALL', label: '전체' },
    { value: 'LOW', label: '낮음' },
    { value: 'MEDIUM', label: '보통' },
    { value: 'HIGH', label: '높음' },
    { value: 'URGENT', label: '긴급' }
  ];

  // 재고 아이템 목록 조회
  const fetchInventoryItems = async () => {
    try {
      const params = new URLSearchParams();
      
      if (inventoryFilters.category !== 'ALL') params.append('category', inventoryFilters.category);
      if (inventoryFilters.search) params.append('search', inventoryFilters.search);
      if (inventoryFilters.lowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/admin/inventory?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('재고 조회에 실패했습니다.');
      
      const data = await response.json();
      console.log('재고 데이터:', data); // 태그 구조 확인용
      setInventoryItems(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 구매 요청 목록 조회
  const fetchPurchaseRequests = async () => {
    try {
      const params = new URLSearchParams();
      
      if (purchaseFilters.status !== 'ALL') params.append('status', purchaseFilters.status);
      if (purchaseFilters.priority !== 'ALL') params.append('priority', purchaseFilters.priority);

      const response = await fetch(`/api/admin/purchase-requests?${params}`, { credentials: 'include' });
      if (!response.ok) throw new Error('구매 요청 조회에 실패했습니다.');
      
      const data = await response.json();
      setPurchaseRequests(data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 태그 가져오기
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('태그 로딩 실패:', error);
    }
  };

  // 새 태그 생성
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
      } else {
        const error = await response.json();
        setError(error.error || '태그 생성 실패');
      }
    } catch (error) {
      console.error('태그 생성 실패:', error);
      setError('태그 생성 중 오류가 발생했습니다.');
    }
  };

  // 재고 아이템 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');

      const url = editingId ? `/api/admin/inventory` : `/api/admin/inventory`;
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '저장에 실패했습니다.');
      }

      setSuccess(editingId ? '재고 아이템이 수정되었습니다.' : '재고 아이템이 생성되었습니다.');
      setFormData({
        name: '',
        category: 'INGREDIENTS',
        currentStock: '',
        minStock: '',
        unit: '',
        supplier: '',
        selectedTags: []
      });
      setEditingId(null);
      fetchInventoryItems();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 편집 시작
  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      minStock: item.minStock.toString(),
      unit: item.unit,
      supplier: item.supplier || '',
      selectedTags: item.tagRelations?.map(tagRelation => tagRelation.tag.id) || []
    });
  };

  // 편집 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'INGREDIENTS',
      currentStock: '',
      minStock: '',
      unit: '',
      supplier: '',
      selectedTags: []
    });
  };

  // 재고 아이템 삭제
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/inventory?id=${deleteId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제에 실패했습니다.');
      }

      setSuccess('재고 아이템이 삭제되었습니다.');
      setDeleteId(null);
      fetchInventoryItems();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 구매 요청 상태 변경
  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/purchase-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '상태 변경에 실패했습니다.');
      }

      setSuccess('구매 요청 상태가 변경되었습니다.');
      fetchPurchaseRequests();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 헬퍼 함수들
  const getCategoryLabel = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category);
    return option ? option.label : category;
  };

  const getStatusLabel = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PURCHASED': return 'bg-blue-100 text-blue-800';
      case 'RECEIVED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = (item: InventoryItem) => {
    return item.currentStock <= item.minStock;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchInventoryItems(), fetchPurchaseRequests(), fetchTags()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchInventoryItems();
  }, [inventoryFilters]);

  useEffect(() => {
    fetchPurchaseRequests();
  }, [purchaseFilters]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">재고/구매 관리</h1>
          <p className="text-gray-600">재고 현황을 관리하고 구매 요청을 승인합니다.</p>
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
          {/* 재고 아이템 생성/수정 폼 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? '재고 아이템 수정' : '새 재고 아이템 생성'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리 *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
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
                      단위 *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      required
                    >
                      <option value="">단위 선택</option>
                      {unitOptions.map(option => (
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
                      현재 재고 *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.currentStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      최소 재고 *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minStock}
                      onChange={(e) => setFormData(prev => ({ ...prev, minStock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    공급업체 (선택사항)
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* 태그 선택 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      태그 선택 (선택사항)
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
                  <div className="border border-gray-300 rounded-lg p-3 min-h-[60px]">
                    {formData.selectedTags.length === 0 ? (
                      <p className="text-gray-500 text-sm">선택된 태그가 없습니다.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.selectedTags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                            >
                              {tag.name}
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  selectedTags: prev.selectedTags.filter(id => id !== tag.id)
                                }))}
                                className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">사용 가능한 태그:</p>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (!formData.selectedTags.includes(tag.id)) {
                                setFormData(prev => ({
                                  ...prev,
                                  selectedTags: [...prev.selectedTags, tag.id]
                                }));
                              }
                            }}
                            disabled={formData.selectedTags.includes(tag.id)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                              formData.selectedTags.includes(tag.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-100 cursor-pointer'
                            }`}
                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
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

          {/* 재고 목록 및 구매 요청 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 재고 목록 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">재고 현황</h3>
                
                {/* 필터 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={inventoryFilters.category}
                      onChange={(e) => setInventoryFilters(prev => ({ ...prev, category: e.target.value }))}
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
                        value={inventoryFilters.search}
                        onChange={(e) => setInventoryFilters(prev => ({ ...prev, search: e.target.value }))}
                        placeholder="이름 또는 공급업체 검색"
                        className="w-full pl-10 pr-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={inventoryFilters.lowStock}
                        onChange={(e) => setInventoryFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">부족 재고만</span>
                    </label>
                  </div>
                </div>

                {/* 재고 목록 */}
                <div className="space-y-3">
                  {inventoryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">재고 아이템이 없습니다.</p>
                    </div>
                  ) : (
                    inventoryItems.map((item) => (
                      <div key={item.id} className={`border rounded-lg p-4 ${isLowStock(item) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              {isLowStock(item) && (
                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-sm text-gray-500">{getCategoryLabel(item.category)}</span>
                            </div>
                            {/* 태그 표시 */}
                            {(() => { console.log('태그 관계:', item.tagRelations); return null; })()}
                            {item.tagRelations && item.tagRelations.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {item.tagRelations.map((tagRelation) => (
                                  <span
                                    key={tagRelation.tag.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                      backgroundColor: `${tagRelation.tag.color}20`,
                                      color: tagRelation.tag.color,
                                      border: `1px solid ${tagRelation.tag.color}40`
                                    }}
                                  >
                                    {tagRelation.tag.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="text-sm text-gray-600">
                              <span className={isLowStock(item) ? 'text-red-600 font-medium' : ''}>
                                {item.currentStock} {item.unit}
                              </span>
                              <span className="text-gray-400"> / 최소 {item.minStock} {item.unit}</span>
                              {item.supplier && <span className="ml-2">• {item.supplier}</span>}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 구매 요청 */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">구매 요청</h3>
                
                {/* 필터 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <select
                      value={purchaseFilters.status}
                      onChange={(e) => setPurchaseFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <select
                      value={purchaseFilters.priority}
                      onChange={(e) => setPurchaseFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 구매 요청 목록 */}
                <div className="space-y-4">
                  {purchaseRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">구매 요청이 없습니다.</p>
                    </div>
                  ) : (
                    purchaseRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {request.employee.name} ({request.employee.department})
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {priorityOptions.find(opt => opt.value === request.priority)?.label}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {request.status === 'PENDING' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(request.id, 'APPROVED')}
                                disabled={submitting}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleStatusChange(request.id, 'REJECTED')}
                                disabled={submitting}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                거부
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {request.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.item.name} {item.quantity} {item.item.unit}</span>
                              {item.unitPrice && (
                                <span className="text-gray-500">
                                  {(item.quantity * item.unitPrice).toLocaleString()}원
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {request.estimatedCost && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm font-medium">
                              <span>예상 비용:</span>
                              <span>{request.estimatedCost.toLocaleString()}원</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">재고 아이템 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 재고 아이템을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
    </div>
  );
} 