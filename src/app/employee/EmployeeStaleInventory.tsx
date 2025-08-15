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
      {items.slice(0,5).map((i:any) => (
        <button key={i.id} onClick={() => onSelect(i)} className="w-full flex items-center justify-between text-left text-sm hover:bg-teal-50 rounded px-2 py-1">
          <span className="truncate text-gray-900">{i.name}</span>
          <span className="text-xs text-gray-500">{new Date(i.lastUpdated || i.createdAt).toLocaleDateString('ko-KR')}</span>
        </button>
      ))}
      {items.length > 5 && (
        <Link prefetch={false} href="/employee/inventory/stale" className="inline-block text-xs text-teal-700 hover:underline mt-1">전체 보기</Link>
      )}
    </div>
  );
}


