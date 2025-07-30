"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Link } from 'lucide-react';
import ItemAddModal from '@/components/ItemAddModal';

interface ChecklistItem {
  id: string;
  content: string;
  instructions?: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  connectedItems: Array<{
    id: string;
    itemType: string;
    itemId: string;
    order: number;
    connectedItem: {
      id: string;
      name: string;
      type: string;
      tags: string[];
    };
  }>;
}

interface Template {
  id: string;
  name: string;
  workplace: string;
  category: string;
  timeSlot: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function ChecklistItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemInstructions, setNewItemInstructions] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [templateId, setTemplateId] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setTemplateId(resolvedParams.id);
      await fetchTemplate(resolvedParams.id);
      await fetchItems(resolvedParams.id);
      await fetchTags();
    };
    init();
  }, [params]);

  const fetchTemplate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/checklists/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      }
    } catch (error) {
      console.error('템플릿 조회 오류:', error);
    }
  };

  const fetchItems = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/checklists/${id}/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('항목 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/admin/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('태그 조회 오류:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemContent.trim()) return;

    try {
      const response = await fetch(`/api/admin/checklists/${templateId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newItemContent,
          instructions: newItemInstructions,
          isRequired: true
        })
      });

      if (response.ok) {
        setNewItemContent('');
        setNewItemInstructions('');
        fetchItems(templateId);
      }
    } catch (error) {
      console.error('항목 추가 오류:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/checklists/${templateId}/items/${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchItems(templateId);
      }
    } catch (error) {
      console.error('항목 삭제 오류:', error);
    }
  };

  const handleOpenConnectionModal = (item: ChecklistItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleSaveConnections = async (connectedItems: any[]) => {
    if (!selectedItem) return;

    console.log('저장할 연결 항목들:', connectedItems);
    console.log('템플릿 ID:', templateId);
    console.log('선택된 항목 ID:', selectedItem.id);

    try {
      const response = await fetch(`/api/admin/checklists/${templateId}/items/${selectedItem.id}/connections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedItems })
      });

      console.log('API 응답 상태:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('저장 성공:', result);
        setIsModalOpen(false);
        setSelectedItem(null);
        await fetchItems(templateId);
      } else {
        const errorData = await response.json();
        console.error('저장 실패:', errorData);
        alert('연결 항목 저장에 실패했습니다: ' + (errorData.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('연결 항목 저장 오류:', error);
      alert('연결 항목 저장 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            뒤로가기
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {template?.name} - 항목 관리
          </h1>
        </div>
      </div>

      {/* 새 항목 추가 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">새 항목 추가</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              항목 내용
            </label>
            <input
              type="text"
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
              placeholder="예: 재료체크, 청소체크"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={newItemInstructions}
              onChange={(e) => setNewItemInstructions(e.target.value)}
              placeholder="항목에 대한 추가 설명"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              rows={2}
            />
          </div>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            <Plus size={16} />
            항목 추가
          </button>
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">체크리스트 항목</h2>
        </div>
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="p-6">
              {/* 메인 항목 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.content}
                  </h3>
                  {item.instructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.instructions}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenConnectionModal(item)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Link size={16} />
                    연결 관리
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* 연결된 항목들 */}
              {item.connectedItems.length > 0 && (
                <div className="ml-6 border-l-2 border-gray-200 pl-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    연결된 항목들:
                  </h4>
                  <div className="space-y-2">
                    {item.connectedItems.map((connection) => (
                      <div
                        key={connection.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          connection.connectedItem.type === 'inventory' 
                            ? 'bg-green-100 text-green-800'
                            : connection.connectedItem.type === 'precaution'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {connection.connectedItem.type === 'inventory' ? '재고' :
                           connection.connectedItem.type === 'precaution' ? '주의사항' : '메뉴얼'}
                        </span>
                        <span className="text-gray-900">
                          {connection.connectedItem.name}
                        </span>
                        {connection.connectedItem.tags.length > 0 && (
                          <div className="flex gap-1">
                            {connection.connectedItem.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

             {/* 연결 관리 모달 */}
       {isModalOpen && selectedItem && (
         <ItemAddModal
           isOpen={isModalOpen}
           onClose={() => {
             setIsModalOpen(false);
             setSelectedItem(null);
           }}
           onSave={handleSaveConnections}
           editingItem={{
             content: selectedItem.content,
             connectedItems: selectedItem.connectedItems.map(ci => ({
               id: ci.connectedItem.id,
               name: ci.connectedItem.name,
               type: ci.connectedItem.type as 'inventory' | 'precaution' | 'manual'
             }))
           }}
           tags={tags}
         />
       )}
    </div>
  );
} 