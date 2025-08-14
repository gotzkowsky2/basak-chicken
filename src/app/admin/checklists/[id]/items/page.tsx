"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Trash2, Link, X } from 'lucide-react';
import ItemAddModal from '@/components/ItemAddModal';
import PrecautionQuickPicker from '@/components/PrecautionQuickPicker';

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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [templateId, setTemplateId] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  // 연결 항목 보기/수정 모달 상태
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerType, setViewerType] = useState<'manual' | 'precaution' | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<any>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerEditMode, setViewerEditMode] = useState(false);
  const [viewerEditTitle, setViewerEditTitle] = useState('');
  const [viewerEditContent, setViewerEditContent] = useState('');
  const [showPrecautionPicker, setShowPrecautionPicker] = useState(false);

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

  const handleSaveItem = async () => {
    if (!newItemContent.trim()) return;

    try {
      if (editingItemId) {
        // 수정
        const response = await fetch(`/api/admin/checklists/${templateId}/items/${editingItemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newItemContent,
            instructions: newItemInstructions
          })
        });
        if (response.ok) {
          setEditingItemId(null);
          setNewItemContent('');
          setNewItemInstructions('');
          await fetchItems(templateId);
        }
      } else {
        // 신규 추가
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
          await fetchItems(templateId);
        }
      }
    } catch (error) {
      console.error('항목 저장 오류:', error);
    }
  };

  const handleEditStart = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setNewItemContent(item.content);
    setNewItemInstructions(item.instructions || '');
    // 상단 폼으로 스크롤
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleEditCancel = () => {
    setEditingItemId(null);
    setNewItemContent('');
    setNewItemInstructions('');
  };

  // 드래그 앤 드롭 정식 도입 전: 간단한 순서 변경은 이후 단계에서 적용 예정

  const openConnectedItemViewer = async (itemType: 'manual'|'precaution', id: string) => {
    try {
      setViewerLoading(true);
      setViewerOpen(true);
      setViewerType(itemType);
      setViewerId(id);
      setViewerEditMode(false);
      setViewerEditTitle('');
      setViewerEditContent('');
      // 직원용 API를 사용해 상세 조회(콘텐츠/태그/연결 주의사항 포함)
      const res = await fetch(`/api/employee/connected-items?type=${itemType}&id=${id}`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setViewerData(data);
        setViewerEditTitle(data.title || data.name || '');
        setViewerEditContent(data.content || '');
      } else {
        setViewerData(null);
      }
    } catch (e) {
      console.error('연결 항목 조회 오류:', e);
      setViewerData(null);
    } finally {
      setViewerLoading(false);
    }
  };

  const saveViewerEdits = async () => {
    if (!viewerType || !viewerId) return;
    try {
      if (viewerType === 'manual') {
        const resp = await fetch('/api/admin/manuals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: viewerId, title: viewerEditTitle, content: viewerEditContent })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || '메뉴얼 수정 실패');
          return;
        }
      } else if (viewerType === 'precaution') {
        const resp = await fetch('/api/admin/precautions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            id: viewerId, 
            title: viewerEditTitle, 
            content: viewerEditContent,
            workplace: viewerData?.workplace || 'COMMON',
            timeSlot: viewerData?.timeSlot || 'COMMON',
            priority: viewerData?.priority ?? 1,
            tags: (viewerData?.tags || []).map((t:any)=>t.id).filter(Boolean)
          })
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          alert(err.error || '주의사항 수정 실패');
          return;
        }
      }
      setViewerEditMode(false);
      await openConnectedItemViewer(viewerType, viewerId);
    } catch (e) {
      console.error('수정 저장 오류:', e);
      alert('수정 저장 중 오류가 발생했습니다.');
    }
  };

  const unlinkManualPrecaution = async (pId: string) => {
    if (!viewerId) return;
    try {
      const current = (viewerData?.precautions || []).map((p:any)=>p.id).filter((id:string)=>id!==pId);
      const resp = await fetch('/api/admin/manuals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: viewerId, selectedPrecautions: current })
      });
      if (!resp.ok) {
        console.error('unlink failed', await resp.text());
      }
      await openConnectedItemViewer('manual', viewerId);
    } catch(e) {
      console.error('unlink error', e);
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
      <div ref={formRef} className="bg-white rounded-lg shadow p-6 mb-6">
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveItem}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {editingItemId ? <Edit size={16} /> : <Plus size={16} />}
              {editingItemId ? '수정 저장' : '항목 추가'}
            </button>
            {editingItemId && (
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            )}
          </div>
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
              <div className="flex flex-col mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.content}
                  </h3>
                  {item.instructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.instructions}
                    </p>
                  )}
                </div>
                {/* 모바일: 아이콘을 하단으로 내려 가로 폭 확보 */}
                <div className="mt-2 flex items-center gap-2 justify-end sm:justify-end">
                  {/* 연결 관리, 수정, 삭제 순서 */}
                  <button
                    onClick={() => handleOpenConnectionModal(item)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-1 py-0.5 rounded hover:bg-blue-50 text-xs sm:text-sm"
                    title="연결 관리"
                  >
                    <Link size={14} />
                  </button>
                  <button
                    onClick={() => handleEditStart(item)}
                    className="flex items-center gap-1 text-gray-700 hover:text-gray-900 px-1 py-0.5 rounded hover:bg-gray-100 text-xs sm:text-sm"
                    title="수정"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-800 px-1 py-0.5 rounded hover:bg-red-50 text-xs sm:text-sm"
                    title="삭제"
                  >
                    <Trash2 size={14} />
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
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => openConnectedItemViewer(connection.connectedItem.type as 'manual'|'precaution', connection.connectedItem.id)}
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

      {/* 연결된 메뉴얼/주의사항 보기/수정 모달 (직원 페이지 스타일) */}
      {viewerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setViewerOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${viewerType==='manual' ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'}`}>
                    {viewerType === 'manual' ? 'M' : 'P'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {viewerEditMode ? (viewerEditTitle || '제목 없음') : (viewerData?.title || viewerData?.name || '제목 없음')}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {!viewerEditMode && viewerType !== 'inventory' && (
                    <button onClick={() => { setViewerEditMode(true); setViewerEditTitle(viewerData?.title || viewerData?.name || ''); setViewerEditContent(viewerData?.content || ''); }} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">수정</button>
                  )}
                  {viewerEditMode && (
                    <>
                      <button onClick={saveViewerEdits} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">저장</button>
                      <button onClick={() => { setViewerEditMode(false); }} className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">취소</button>
                    </>
                  )}
                  <button onClick={() => setViewerOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                {viewerLoading ? (
                  <div className="text-center text-sm text-gray-500">불러오는 중...</div>
                ) : viewerEditMode ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">제목</label>
                      <input value={viewerEditTitle} onChange={(e)=>setViewerEditTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">내용</label>
                      <textarea value={viewerEditContent} onChange={(e)=>setViewerEditContent(e.target.value)} rows={10} className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 bg-white" />
                    </div>
                  </div>
                ) : viewerData ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 text-sm">
                      {viewerData?.content || '내용이 없습니다.'}
                    </div>
                    {/* 메뉴얼의 연결된 주의사항 표시 */}
                    {viewerType==='manual' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-800">연결된 주의사항</div>
                          <button
                            onClick={() => setShowPrecautionPicker(true)}
                            className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            주의사항 추가
                          </button>
                        </div>
                        {viewerData?.precautions && viewerData.precautions.length>0 ? viewerData.precautions.map((p:any, idx:number)=> (
                          <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="text-red-900 text-sm font-medium truncate">{p.title}</div>
                                <div className="text-red-800 text-xs whitespace-pre-wrap mt-1">{p.content}</div>
                              </div>
                              <button
                                onClick={async ()=>{
                                  // 편집 모달 재사용: viewer edit 모드로 전환하여 해당 주의사항을 편집
                                  setViewerType('precaution');
                                  setViewerId(p.id);
                                  setViewerEditTitle(p.title);
                                  setViewerEditContent(p.content);
                                  setViewerEditMode(true);
                                }}
                                className="ml-2 px-2 py-1 text-xs text-red-700 hover:bg-red-100 rounded"
                              >수정</button>
                              <button
                                onClick={()=>unlinkManualPrecaution(p.id)}
                                className="ml-2 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                              >제거</button>
                            </div>
                          </div>
                        )) : (
                          <div className="text-xs text-gray-500">연결된 주의사항이 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">데이터가 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 메뉴얼 팝업에서 주의사항 추가 피커 (간단 버전: 기존 관리자 주의사항 목록 재사용) */}
      {showPrecautionPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={()=>setShowPrecautionPicker(false)} />
          <div className="relative bg-white rounded-lg shadow p-4 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">주의사항 추가</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={()=>setShowPrecautionPicker(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* 간단 구현: 관리자 주의사항 API에서 목록을 가져와 선택 → 메뉴얼에 연결 */}
            <PrecautionQuickPicker manualId={viewerId || ''} selectedPrecautionIds={(viewerData?.precautions||[]).map((p:any)=>p.id)} onClose={()=>setShowPrecautionPicker(false)} onAdded={async ()=>{
              // 다시 로드
              if (viewerType==='manual' && viewerId) await openConnectedItemViewer('manual', viewerId);
              setShowPrecautionPicker(false);
            }} />
          </div>
        </div>
      )}
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