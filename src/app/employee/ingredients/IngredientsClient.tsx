"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string | null;
  lastUpdated: string;
  status: 'sufficient' | 'low';
  isLowStock: boolean;
}

export default function IngredientsClient() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // 구매 요청 모달 상태
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Ingredient | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: '',
    priority: 'MEDIUM',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // 실제 API에서 데이터 가져오기
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (showLowStockOnly) params.append('lowStock', 'true');

      const response = await fetch(`/api/employee/inventory?${params}`);
      if (!response.ok) throw new Error('재고 조회에 실패했습니다.');
      
      const data = await response.json();
      // INGREDIENTS 카테고리만 필터링
      const ingredientsData = data.filter((item: Ingredient) => 
        item.category === 'INGREDIENTS'
      );
      setIngredients(ingredientsData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [selectedCategory, showLowStockOnly]);

  // 구매 요청 모달 열기
  const handlePurchaseRequest = (item: Ingredient) => {
    setSelectedItem(item);
    setPurchaseForm({
      quantity: '',
      priority: 'MEDIUM',
      notes: ''
    });
    setShowPurchaseModal(true);
  };

  // 구매 요청 제출
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !purchaseForm.quantity) return;

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/employee/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            itemId: selectedItem.id,
            quantity: parseFloat(purchaseForm.quantity),
            notes: purchaseForm.notes || null
          }],
          priority: purchaseForm.priority,
          notes: purchaseForm.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '구매 요청 생성에 실패했습니다.');
      }

      setSuccess('구매 요청이 성공적으로 생성되었습니다.');
      setShowPurchaseModal(false);
      setSelectedItem(null);
      setPurchaseForm({
        quantity: '',
        priority: 'MEDIUM',
        notes: ''
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 구매 요청 모달 닫기
  const handlePurchaseCancel = () => {
    setShowPurchaseModal(false);
    setSelectedItem(null);
    setPurchaseForm({
      quantity: '',
      priority: 'MEDIUM',
      notes: ''
    });
  };

  const categories = [
    { value: "ALL", label: "전체" },
    { value: "INGREDIENTS", label: "재료" }
  ];
  
  const getCategoryLabel = (category: string) => {
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sufficient': return 'text-green-600 bg-green-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'out': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sufficient': return '충분';
      case 'low': return '부족';
      case 'out': return '품절';
      default: return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">식자재 관리</h1>
          <p className="text-gray-600">현재 재고 현황을 확인하고 관리하세요</p>
        </div>

        {/* 알림 메시지 */}
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

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">부족 재고만</span>
              </label>
            </div>
          </div>
        </div>

        {/* 재고 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((ingredient) => (
            <div key={ingredient.id} className={`bg-white rounded-lg shadow-md p-6 ${ingredient.isLowStock ? 'border-2 border-red-200' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{ingredient.name}</h3>
                  <p className="text-sm text-gray-500">{getCategoryLabel(ingredient.category)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ingredient.status)}`}>
                  {getStatusText(ingredient.status)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">현재 재고:</span>
                  <span className={`text-sm font-medium ${ingredient.isLowStock ? 'text-red-600' : 'text-gray-800'}`}>
                    {ingredient.currentStock} {ingredient.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">최소 재고:</span>
                  <span className="text-sm text-gray-500">{ingredient.minStock} {ingredient.unit}</span>
                </div>
                {ingredient.supplier && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">공급업체:</span>
                    <span className="text-sm text-gray-500">{ingredient.supplier}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">최종 업데이트:</span>
                  <span className="text-sm text-gray-500">
                    {ingredient.lastUpdated ? new Date(ingredient.lastUpdated).toLocaleDateString() : '없음'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handlePurchaseRequest(ingredient)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  구매 요청
                </button>
              </div>
            </div>
          ))}
        </div>

        {ingredients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 식자재가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 구매 요청 모달 */}
      {showPurchaseModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">구매 요청</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">아이템: <span className="font-medium">{selectedItem.name}</span></p>
              <p className="text-sm text-gray-600">현재 재고: <span className="font-medium">{selectedItem.currentStock} {selectedItem.unit}</span></p>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구매 수량 *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder={`${selectedItem.unit} 단위로 입력`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  우선순위
                </label>
                <select
                  value={purchaseForm.priority}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="LOW">낮음</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HIGH">높음</option>
                  <option value="URGENT">긴급</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  메모 (선택사항)
                </label>
                <textarea
                  value={purchaseForm.notes}
                  onChange={(e) => setPurchaseForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="구매 요청 사유나 특별한 요구사항을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? '요청 중...' : '구매 요청'}
                </button>
                <button
                  type="button"
                  onClick={handlePurchaseCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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