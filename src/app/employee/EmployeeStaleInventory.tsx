"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function EmployeeStaleInventory({ onSelect }: { onSelect: (item:any)=>void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/employee/inventory/stale?days=2', { credentials: 'include', cache: 'no-store' });
        if (r.ok) {
          const d = await r.json();
          setItems(d.items || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">불러오는 중...</div>;
  if (!items.length) return <div className="text-sm text-gray-500">업데이트 필요 항목이 없습니다.</div>;

  return (
    <div className="space-y-2">
      {items.slice(0,5).map((i:any) => {
        const last = i.lastUpdated || i.createdAt;
        const categoryIcon: Record<string,string> = { INGREDIENTS:'🥬', SUPPLIES:'📦', HYGIENE:'🧼', CHECKLIST:'✅', PRECAUTIONS:'⚠️', COMMON:'📁', MANUAL:'📘' };
        const catIcon = categoryIcon[i.category] || '📁';
        return (
          <button
            key={i.id}
            onClick={() => onSelect(i)}
            className="w-full text-left bg-white border border-teal-100 hover:border-teal-300 hover:bg-teal-50/60 rounded-lg px-3 py-2 transition"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <span className="shrink-0 text-base sm:text-lg" aria-hidden>{catIcon}</span>
                <span className="truncate font-semibold text-gray-900">{i.name}</span>
                {i.isLowStock && (
                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] sm:text-xs bg-red-600 text-white rounded">부족</span>
                )}
              </div>
              <span className="shrink-0 text-[10px] sm:text-xs text-gray-700 font-semibold">{i.daysSinceUpdate}일</span>
            </div>
            <div className="mt-1 grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-1.5 sm:gap-3 text-[11px] sm:text-xs text-gray-700">
              <span className="inline-flex items-center gap-1"><span aria-hidden>📦</span><span className="hidden sm:inline text-gray-500">재고</span><b className="text-gray-900">{i.currentStock}</b>/<b className="text-gray-900">{i.minStock}</b><span className="text-gray-500">{i.unit}</span></span>
              <span className="inline-flex items-center gap-1"><span aria-hidden>⏰</span><span className="hidden sm:inline text-gray-500">최근</span>{new Date(last).toLocaleDateString('ko-KR')}</span>
              {i.lastCheckedBy && (
                <span className="inline-flex items-center gap-1"><span aria-hidden>👤</span><span className="hidden sm:inline text-gray-500">업데이트</span>{i.lastCheckedBy}</span>
              )}
              <span className="inline-flex items-center gap-1"><span aria-hidden>🏷️</span><span className="hidden sm:inline text-gray-500">카테고리</span>{i.category}</span>
            </div>
          </button>
        );
      })}
      {items.length > 5 && (
        <Link prefetch={false} href="/employee/inventory/stale" className="inline-block text-xs text-teal-700 hover:underline mt-1">전체 보기</Link>
      )}
    </div>
  );
}


