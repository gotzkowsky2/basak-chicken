'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Tag { id: string; name: string; color: string }
interface PrecautionTag extends Tag {}

interface Manual {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  category: string;
  version: string;
  tags?: Tag[];
  precautions?: Array<{
    id: string;
    title: string;
    content: string;
    workplace: string;
    timeSlot: string;
    priority: number;
    tags?: Tag[];
  }>;
}

interface Precaution {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  priority: number;
  tags?: PrecautionTag[];
}

export default function EmployeeFavoritesPage() {
  const [manualIds, setManualIds] = useState<string[]>([]);
  const [precautionIds, setPrecautionIds] = useState<string[]>([]);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [precautions, setPrecautions] = useState<Precaution[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [selectedPrecaution, setSelectedPrecaution] = useState<Precaution | null>(null);
  const [expandedPrecautions, setExpandedPrecautions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const favRes = await fetch('/api/employee/favorites', { credentials: 'include' });
        if (favRes.ok) {
          const fav = await favRes.json();
          setManualIds(fav.manualIds || []);
          setPrecautionIds(fav.precautionIds || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadLists = async () => {
      if (manualIds.length === 0 && precautionIds.length === 0) {
        setManuals([]);
        setPrecautions([]);
        return;
      }
      const [manRes, preRes] = await Promise.all([
        fetch('/api/employee/manuals', { credentials: 'include' }),
        fetch('/api/employee/precautions', { credentials: 'include' })
      ]);
      if (manRes.ok) {
        const data = await manRes.json();
        const all = (data.manuals || []) as Manual[];
        setManuals(all.filter(m => manualIds.includes(m.id)));
      }
      if (preRes.ok) {
        const data = await preRes.json();
        const all = (data.precautions || []) as Precaution[];
        setPrecautions(all.filter(p => precautionIds.includes(p.id)));
      }
    };
    loadLists();
  }, [manualIds, precautionIds]);

  const getWorkplaceLabel = (value: string) => {
    switch (value) {
      case 'HALL': return '홀';
      case 'KITCHEN': return '주방';
      case 'COMMON': return '공통';
      default: return value;
    }
  };
  const getTimeSlotLabel = (value: string) => {
    switch (value) {
      case 'PREPARATION': return '준비';
      case 'IN_PROGRESS': return '진행';
      case 'CLOSING': return '마감';
      case 'COMMON': return '공통';
      default: return value;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return '높음';
      case 2: return '보통';
      case 3: return '낮음';
      default: return `우선순위 ${priority}`;
    }
  };
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-200 text-red-800';
      case 2: return 'bg-yellow-200 text-yellow-800';
      case 3: return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">즐겨찾기</h1>
          <div className="text-sm text-gray-500">내가 하트한 항목만 모아보기</div>
        </div>

        {/* 매뉴얼 */}
        <section className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-indigo-700">메뉴얼</h2>
            <Link href="/employee/manual" className="text-sm text-indigo-600 hover:underline">전체 보기</Link>
          </div>
          {manuals.length === 0 ? (
            <p className="text-sm text-gray-500">즐겨찾기한 메뉴얼이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {manuals.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedManual(m)}
                  className="w-full text-left border rounded-lg p-3 hover:bg-indigo-50 active:bg-indigo-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{m.title}</div>
                    <span className="text-xs text-gray-500">v{m.version}</span>
                  </div>
                  {m.tags && m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.tags.map(t => (
                        <span key={t.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${t.color}20`, color: t.color }}>{t.name}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 주의사항 */}
        <section className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-red-700">주의사항</h2>
            <Link href="/employee/notices" className="text-sm text-red-600 hover:underline">전체 보기</Link>
          </div>
          {precautions.length === 0 ? (
            <p className="text-sm text-gray-500">즐겨찾기한 주의사항이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {precautions.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrecaution(p)}
                  className="w-full text-left border rounded-lg p-3 hover:bg-red-50 active:bg-red-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <span className="text-xs text-gray-500">우선순위 {p.priority}</span>
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tags.map(t => (
                        <span key={t.id} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${t.color}20`, color: t.color }}>{t.name}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 메뉴얼 상세 모달 */}
      {selectedManual && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedManual(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">v{selectedManual.version}</span>
                  <h2 className="text-lg font-bold text-gray-900">{selectedManual.title}</h2>
                </div>
                <button onClick={() => setSelectedManual(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                {selectedManual.tags && selectedManual.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedManual.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                    ))}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-gray-800 whitespace-pre-wrap">
                  {selectedManual.content}
                </div>
                {/* 연결된 주의사항 */}
                {selectedManual.precautions && selectedManual.precautions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="text-base font-semibold text-gray-900">연결된 주의사항</h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{selectedManual.precautions.length}개</span>
                    </div>
                    <div className="space-y-3">
                      {selectedManual.precautions.map((precaution, index) => {
                        const isExpanded = expandedPrecautions.has(index);
                        return (
                          <div key={precaution.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-red-900 text-sm">{precaution.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(precaution.priority)}`}>{getPriorityLabel(precaution.priority)}</span>
                            </div>
                            <div className="mb-2">
                              <p className="text-red-800 text-sm whitespace-pre-wrap leading-relaxed">
                                {isExpanded ? precaution.content : (precaution.content.length > 80 ? precaution.content.substring(0, 80) + '...' : precaution.content)}
                              </p>
                              {precaution.content.length > 80 && (
                                <button
                                  onClick={() => setExpandedPrecautions(prev => { const s = new Set(prev); s.has(index) ? s.delete(index) : s.add(index); return s; })}
                                  className="mt-1 inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                                >
                                  <EyeIcon className={`w-3 h-3 ${isExpanded ? 'rotate-180' : ''}`} />
                                  {isExpanded ? '내용 접기' : '전체 내용 보기'}
                                </button>
                              )}
                            </div>
                            {precaution.tags && precaution.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {precaution.tags.map(tag => (
                                  <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-red-700">
                              <span>근무처: {getWorkplaceLabel(precaution.workplace)}</span>
                              <span>시간대: {getTimeSlotLabel(precaution.timeSlot)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 border-t border-gray-200 pt-3">
                  <span>근무처: {getWorkplaceLabel(selectedManual.workplace)}</span>
                  <span>시간대: {getTimeSlotLabel(selectedManual.timeSlot)}</span>
                  <span>카테고리: {selectedManual.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 주의사항 상세 모달 */}
      {selectedPrecaution && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPrecaution(null)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{selectedPrecaution.title}</h2>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">우선순위 {selectedPrecaution.priority}</span>
                </div>
                <button onClick={() => setSelectedPrecaution(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">✕</button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[70vh]">
                {selectedPrecaution.tags && selectedPrecaution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedPrecaution.tags.map(tag => (
                      <span key={tag.id} className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>
                    ))}
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-gray-800 whitespace-pre-wrap">
                  {selectedPrecaution.content}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600 border-t border-gray-200 pt-3">
                  <span>근무처: {getWorkplaceLabel(selectedPrecaution.workplace)}</span>
                  <span>시간대: {getTimeSlotLabel(selectedPrecaution.timeSlot)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


