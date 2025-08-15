"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("관리자 로그아웃 fetch 실행 전");
      const res = await fetch("/api/admin/logout", { method: "POST", credentials: "include", keepalive: true });
      console.log("관리자 로그아웃 fetch 실행 후", res);
      window.location.href = "/employee/login";
    } catch (e) {
      setError("서버 오류가 발생했습니다.");
      console.log("관리자 로그아웃 fetch 에러", e);
    } finally {
      setLoading(false);
      console.log("관리자 handleLogout finally");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
        {/* 재고 경고 섹션 */}
        <StaleInventorySection />
        {/* 메인 카드 */}
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        <div className="flex justify-between items-center mb-4">
        </div>
        {error && <div className="text-red-500 text-sm text-center mb-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link href="/admin/employees" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-blue-700">직원 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">직원 추가/수정/삭제</span>
          </Link>
          <Link href="/admin/checklists" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-green-50 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-green-700">체크리스트 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">체크리스트 생성/수정/삭제</span>
          </Link>
          <Link href="/admin/notices" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-red-50 active:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-red-700">공지사항 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">공지 작성/수정</span>
          </Link>
          <Link href="/admin/precautions" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-orange-50 active:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-orange-700">주의사항 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">주의사항 생성/수정/삭제</span>
          </Link>
          <Link href="/admin/manuals" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-indigo-50 active:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-indigo-700">메뉴얼 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">메뉴얼 생성/수정/삭제</span>
          </Link>
          <Link href="/admin/inventory" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-teal-50 active:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-teal-700">재고/구매 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">재고 현황 및 구매 요청</span>
          </Link>
          <Link href="/admin/tags" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-purple-50 active:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-purple-700">태그 관리</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">태그 생성/수정/삭제</span>
          </Link>
          <Link href="/admin/submissions" className="flex flex-col items-center justify-center p-6 rounded-lg shadow border hover:bg-yellow-50 active:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-150 min-h-[120px]">
            <span className="text-lg font-semibold text-yellow-700">제출 현황</span>
            <span className="text-sm text-gray-700 mt-2 font-medium">직원별 체크리스트 제출 내역</span>
          </Link>
        </div>
      </div>
      </div>
    </main>
  );
} 

function StaleInventorySection() {
  const [data, setData] = React.useState<{ stats: { total: number; lowStock: number; averageDaysStale: number }; items: any[] } | null>(null);
  const [filter, setFilter] = React.useState<'all'|'stale'|'low'>('all');
  const [selectedItem, setSelectedItem] = React.useState<any|null>(null);
  const [updateQty, setUpdateQty] = React.useState<number>(0);
  const [saving, setSaving] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inventory/stale?days=2', { credentials: 'include', cache: 'no-store' });
      if (res.ok) { const d = await res.json(); setData({ stats: d.stats, items: d.items || [] }); }
    } catch (e) { console.log('stale fetch error', e)}
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);
  if (!data || data.stats.total === 0) return null;
  const filtered = data.items.filter((i:any)=>{
    if(filter==='low') return i.isLowStock;
    return true;
  });
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-extrabold text-gray-900">재고 업데이트 필요</span>
        <span className="px-2 py-1 text-sm bg-orange-600 text-white rounded-full font-semibold">{data.stats.total}개</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button onClick={()=>setFilter('all')} className={`text-left bg-orange-100 rounded p-3 hover:bg-orange-200 ${filter==='all'?'ring-2 ring-orange-500':''}`}><div className="text-3xl font-bold text-orange-800">{data.stats.total}</div><div className="text-sm text-gray-900 font-medium">업데이트 필요</div></button>
        <button onClick={()=>setFilter('low')} className={`text-left bg-red-100 rounded p-3 hover:bg-red-200 ${filter==='low'?'ring-2 ring-red-500':''}`}><div className="text-3xl font-bold text-red-800">{data.stats.lowStock}</div><div className="text-sm text-gray-900 font-medium">재고 부족</div></button>
        <button onClick={()=>setFilter('stale')} className={`text-left bg-blue-100 rounded p-3 hover:bg-blue-200 ${filter==='stale'?'ring-2 ring-blue-500':''}`}><div className="text-3xl font-bold text-blue-800">{data.stats.averageDaysStale}일</div><div className="text-sm text-gray-900 font-medium">평균 경과</div></button>
      </div>
      <div className="space-y-2">
        {filtered.slice(0,10).map((i:any)=>(
          <button key={i.id} onClick={()=>{ setSelectedItem(i); setUpdateQty(i.currentStock); }} className="w-full text-left flex items-center justify-between p-3 bg-gray-100 rounded hover:bg-gray-200">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">{i.name}</span>
              {i.isLowStock && <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded">재고부족</span>}
              <span className="text-sm text-gray-900">({i.currentStock}{i.unit} / 최소 {i.minStock}{i.unit})</span>
            </div>
            <div className="text-sm font-semibold text-orange-800">{i.daysSinceUpdate}일 경과</div>
          </button>
        ))}
      </div>
      <div className="mt-4 text-center"><Link href="/admin/inventory/stale" className="inline-flex px-5 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black">모든 경고 항목 보기</Link></div>
      {selectedItem && (
        <QuickUpdateModal
          item={selectedItem}
          defaultQty={updateQty}
          onClose={()=>setSelectedItem(null)}
          onSaved={()=>fetchData()}
        />
      )}
    </div>
  )
}

function QuickUpdateModal({ item, onClose, onSaved, defaultQty }: { item:any, onClose:()=>void, onSaved:()=>void, defaultQty:number }){
  const [qty, setQty] = React.useState<number>(defaultQty);
  const [saving, setSaving] = React.useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-extrabold text-gray-900">재고 업데이트</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="space-y-3">
          <div className="font-extrabold text-gray-900">{item.name}</div>
          <div className="text-sm text-gray-900">현재/기준: <b>{item.currentStock}</b> / <b>{item.minStock}</b> {item.unit}</div>
          <div className="text-xs text-gray-800">최근 업데이트: {new Date(item.lastUpdated || item.createdAt).toLocaleString('ko-KR')} {item.lastCheckedBy? `• ${item.lastCheckedBy}`: ''}</div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">새 재고 수량</label>
            <input type="number" value={qty} onChange={e=>setQty(parseFloat(e.target.value||'0'))} className="w-full px-4 py-3 border-2 rounded text-gray-900 font-semibold placeholder-gray-700" placeholder="수량을 입력하세요" />
          </div>
          <div className="flex gap-2">
            <button disabled={saving} onClick={async()=>{
              try{
                setSaving(true);
                const res = await fetch('/api/admin/inventory', { method:'PUT', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: item.id, currentStock: qty })});
                if(res.ok){ onSaved(); onClose(); } else { const e = await res.json().catch(()=>({})); alert(e.error||'실패'); }
              } finally { setSaving(false); }
            }} className="px-4 py-2 bg-gray-900 text-white rounded font-semibold disabled:opacity-50">{saving? '저장 중...':'바로 업데이트'}</button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
