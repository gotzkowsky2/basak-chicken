"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  lastUpdated: string;
  status: 'sufficient' | 'low' | 'out';
}

export default function IngredientsClient() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 임시 데이터 (나중에 API로 교체)
  useEffect(() => {
    const mockIngredients: Ingredient[] = [
      {
        id: "1",
        name: "닭고기",
        category: "육류",
        currentStock: 50,
        unit: "kg",
        lastUpdated: "2024-01-15",
        status: "sufficient"
      },
      {
        id: "2",
        name: "양념소스",
        category: "양념",
        currentStock: 5,
        unit: "L",
        lastUpdated: "2024-01-15",
        status: "low"
      },
      {
        id: "3",
        name: "튀김가루",
        category: "가루류",
        currentStock: 0,
        unit: "kg",
        lastUpdated: "2024-01-14",
        status: "out"
      },
      {
        id: "4",
        name: "감자",
        category: "채소",
        currentStock: 30,
        unit: "kg",
        lastUpdated: "2024-01-15",
        status: "sufficient"
      }
    ];
    
    setTimeout(() => {
      setIngredients(mockIngredients);
      setLoading(false);
    }, 500);
  }, []);

  const categories = ["all", "육류", "양념", "가루류", "채소"];
  
  const filteredIngredients = selectedCategory === "all" 
    ? ingredients 
    : ingredients.filter(item => item.category === selectedCategory);

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

        {/* 카테고리 필터 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === "all" ? "전체" : category}
              </button>
            ))}
          </div>
        </div>

        {/* 재고 현황 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIngredients.map((ingredient) => (
            <div key={ingredient.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{ingredient.name}</h3>
                  <p className="text-sm text-gray-500">{ingredient.category}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ingredient.status)}`}>
                  {getStatusText(ingredient.status)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">현재 재고:</span>
                  <span className="text-sm font-medium text-gray-800">
                    {ingredient.currentStock} {ingredient.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">최종 업데이트:</span>
                  <span className="text-sm text-gray-500">{ingredient.lastUpdated}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm">
                  재고 업데이트
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 식자재가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
} 