'use client';

import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier?: string;
  lastUpdated: string;
  lastCheckedBy?: string;
  isActive: boolean;
  tags?: Array<{ id: string; name: string; color?: string }>;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

export default function EmployeeInventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // 필터 상태 (관리자 페이지와 동일한 방식)
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    selectedTags: [] as string[],
    lowStock: false
  });
  
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<{ name: string } | null>(null);

  // 현재 사용자 정보 조회
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/employee/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

  // 태그 목록 조회
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('태그 조회 실패:', error);
    }
  };

  // 재고 목록 조회
  const fetchInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'ALL') params.append('category', filters.category);
      if (filters.lowStock) params.append('lowStock', 'true');
      if (filters.selectedTags.length > 0) {
        filters.selectedTags.forEach(tagId => params.append('tags', tagId));
      }

      const response = await fetch(`/api/admin/inventory?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('재고 목록 조회에 실패했습니다.');
      }

      const data = await response.json();
      
      // 데이터 변환: API 응답을 컴포넌트에서 사용하는 형태로 변환
      const transformedData = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        minStock: item.minStock,
        unit: item.unit,
        supplier: item.supplier,
        lastUpdated: item.checks && item.checks.length > 0 ? item.checks[0].checkedAt : item.updatedAt,
        lastCheckedBy: item.checks && item.checks.length > 0 ? item.checks[0].employee?.name : null,
        isActive: item.isActive,
        tags: item.tagRelations?.map((relation: any) => ({
          id: relation.tag.id,
          name: relation.tag.name,
          color: relation.tag.color
        })) || []
      }));
      
      setInventoryItems(transformedData);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // 재고 업데이트
  const updateStock = async (itemId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/employee/inventory`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemId,
          currentStock: newStock
        })
      });

      if (!response.ok) {
        throw new Error('재고 업데이트에 실패했습니다.');
      }

      // 즉시 UI 업데이트 (새로고침 없이)
      setInventoryItems(prev => prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              currentStock: newStock,
              lastUpdated: new Date().toISOString(),
              lastCheckedBy: currentUser?.name || '나' // 실제 사용자 이름 사용
            }
          : item
      ));

      // 성공 메시지 표시
      setSuccess('재고가 성공적으로 업데이트되었습니다.');
      
      // 업데이트된 아이템 표시
      setUpdatedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(itemId);
        return newSet;
      });

      // 3초 후 성공 메시지와 업데이트 표시 제거
      setTimeout(() => {
        setSuccess('');
        setUpdatedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }, 3000);

      // 업데이트된 아이템의 확장 상태 닫기
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });

    } catch (error: any) {
      setError(error.message);
    }
  };

  // 상세 보기 토글
  const toggleExpansion = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 카테고리 라벨
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'INGREDIENTS': '식자재',
      'SUPPLIES': '부대용품',
      'HYGIENE': '위생용품',
      'COMMON': '공통'
    };
    return labels[category] || category;
  };

  // 재고 상태 확인
  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return { status: 'out', label: '품절', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (current <= min) return { status: 'low', label: '부족', color: 'text-red-600', bgColor: 'bg-red-100' };
    return { status: 'normal', label: '정상', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  // 마지막 업데이트가 4일 이상 지났는지 확인
  const isUpdateOverdue = (lastUpdated: string) => {
    const lastUpdate = new Date(lastUpdated);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 4;
  };

  // 초기 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentUser(), fetchTags(), fetchInventory()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 필터 변경 시 재고 목록 조회
  useEffect(() => {
    fetchInventory();
  }, [filters]);

  // 성공 메시지 자동 제거
  useEffect(() => {
    if (success) {
      setTimeout(() => setSuccess(''), 3000);
    }
  }, [success]);

  // 태그 선택/해제
  const toggleTag = (tagId: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter(id => id !== tagId)
        : [...prev.selectedTags, tagId]
    }));
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 재고/구매관리</h1>
          <p className="text-gray-600">현재 재고 현황을 확인하고 업데이트할 수 있습니다.</p>
        </div>

        {/* 알림 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-green-800 font-semibold">{success}</p>
            </div>
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5" />
              필터
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 검색 */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="재고명 검색..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* 카테고리 */}
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold text-gray-900"
            >
              <option value="ALL">전체 카테고리</option>
              <option value="INGREDIENTS">식자재</option>
              <option value="SUPPLIES">부대용품</option>
              <option value="HYGIENE">위생용품</option>
              <option value="COMMON">공통</option>
            </select>

            {/* 부족 재고만 보기 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowStockOnly"
                checked={filters.lowStock}
                onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="lowStockOnly" className="ml-2 text-sm font-bold text-gray-800">
                부족 재고만
              </label>
            </div>
          </div>

          {/* 태그 필터 */}
          <div className="mt-4">
            <button
              onClick={() => setShowTagFilter(!showTagFilter)}
              className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              <span>태그로 필터링</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTagFilter ? 'rotate-180' : ''}`} />
            </button>
            
            {showTagFilter && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.selectedTags.includes(tag.id)
                          ? 'border-2'
                          : 'border hover:bg-gray-50'
                      }`}
                      style={{
                        backgroundColor: filters.selectedTags.includes(tag.id) 
                          ? (tag.color ? `${tag.color}20` : '#DBEAFE')
                          : '#FFFFFF',
                        color: filters.selectedTags.includes(tag.id)
                          ? (tag.color || '#1D4ED8')
                          : (tag.color || '#374151'),
                        borderColor: filters.selectedTags.includes(tag.id)
                          ? (tag.color || '#3B82F6')
                          : (tag.color || '#D1D5DB')
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
                {filters.selectedTags.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    선택된 태그: {filters.selectedTags.length}개
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 재고 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">재고 현황 ({inventoryItems.length}개)</h2>
          </div>

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {inventoryItems.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">재고 항목이 없습니다.</p>
              </div>
            ) : (
              inventoryItems.map((item) => {
                const stockStatus = getStockStatus(item.currentStock, item.minStock);
                
                return (
                  <div key={item.id} className={`p-6 transition-all duration-500 ${
                    stockStatus.status === 'low' ? 'bg-red-50 border-l-4 border-red-300' : ''
                  } ${
                    updatedItems.has(item.id) ? 'bg-green-50 border-l-4 border-green-300 shadow-lg' : ''
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.status === 'low' ? 'animate-pulse' : ''}`}>
                            {stockStatus.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {getCategoryLabel(item.category)}
                          </span>
                          {stockStatus.status === 'low' && (
                            <span className="text-red-600 text-lg">⚠️</span>
                          )}
                        </div>

                        <div className={`flex items-center gap-4 text-sm mb-3 ${stockStatus.status === 'low' ? 'text-red-700' : 'text-gray-600'}`}>
                          <span>현재: <span className={`font-semibold ${
                            stockStatus.status === 'low' ? 'text-red-800' : 
                            updatedItems.has(item.id) ? 'text-green-800' : ''
                          }`}>{item.currentStock} {item.unit}</span></span>
                          <span>최소: <span className="font-semibold">{item.minStock} {item.unit}</span></span>
                          {item.supplier && <span>공급업체: {item.supplier}</span>}
                          {updatedItems.has(item.id) && (
                            <span className="text-green-600 font-semibold">✓ 업데이트됨</span>
                          )}
                        </div>

                        {/* 태그 */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`text-xs font-medium ${stockStatus.status === 'low' ? 'text-red-600' : 'text-gray-500'}`}>태그:</span>
                            {item.tags.map((tag) => (
                              <span 
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded-full border"
                                style={{
                                  backgroundColor: tag.color ? `${tag.color}20` : '#E5E7EB',
                                  color: tag.color || '#374151',
                                  borderColor: tag.color || '#D1D5DB'
                                }}
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 마지막 업데이트 정보 */}
                        <div className={`text-xs flex items-center justify-between ${isUpdateOverdue(item.lastUpdated) ? 'text-red-600 font-bold' : stockStatus.status === 'low' ? 'text-red-600' : 'text-gray-500'}`}>
                          <span>
                            마지막 업데이트: {new Date(item.lastUpdated).toLocaleString('ko-KR')}
                          </span>
                          {item.lastCheckedBy && (
                            <span className={`font-medium ${isUpdateOverdue(item.lastUpdated) ? 'text-red-600' : stockStatus.status === 'low' ? 'text-red-600' : 'text-blue-600'}`}>
                              (👤 {item.lastCheckedBy})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpansion(item.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          {expandedItems.has(item.id) ? (
                            <MinusIcon className="w-5 h-5" />
                          ) : (
                            <PlusIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                                         {/* 상세 내용 (재고 업데이트) */}
                     {expandedItems.has(item.id) && (
                       <div className="mt-4 pl-8 border-l-2 border-gray-200 transition-all duration-500 ease-in-out">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">재고 업데이트</h4>
                            <div className="flex items-center gap-4">
                                                             <div className="flex items-center gap-2">
                                 <label className="text-sm font-bold text-gray-800">새로운 수량:</label>
                                 <input
                                   type="number"
                                   min="0"
                                   step="1"
                                   defaultValue={item.currentStock}
                                   className="w-20 px-2 py-1 border border-gray-300 rounded text-sm font-bold text-gray-900"
                                   id={`stock-${item.id}`}
                                 />
                                 <span className="text-sm font-bold text-gray-800">{item.unit}</span>
                               </div>
                                                               <button
                                   onClick={() => {
                                     const input = document.getElementById(`stock-${item.id}`) as HTMLInputElement;
                                     const newStock = parseInt(input.value);
                                     if (!isNaN(newStock) && newStock >= 0) {
                                       updateStock(item.id, newStock);
                                     }
                                   }}
                                   className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                 >
                                   업데이트
                                 </button>
                            </div>
                          </div>

                          {/* 경고 메시지 */}
                          {stockStatus.status === 'out' && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                              <span className="text-sm text-red-800 font-medium">
                                재고가 없습니다. 구매 요청이 필요합니다.
                              </span>
                            </div>
                          )}
                          
                                                     {stockStatus.status === 'low' && (
                             <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                               <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                               <span className="text-sm text-red-800 font-bold">
                                 재고가 부족합니다.
                               </span>
                             </div>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 