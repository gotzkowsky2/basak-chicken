"use client";
import React from 'react';

const categoryLabel: Record<string,string> = { INGREDIENTS:'식자재', SUPPLIES:'소모품', HYGIENE:'위생', CHECKLIST:'체크리스트', PRECAUTIONS:'주의사항', COMMON:'공통', MANUAL:'메뉴얼' };

export default function AdminStaleInventoryPage() {
  const [data, setData] = React.useState<any>({ items: [], stats: { total: 0, lowStock: 0, averageDaysStale: 0 } });
  const [days, setDays] = React.useState(2);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [sortKey, setSortKey] = React.useState<'name'|'category'|'currentStock'|'minStock'|'unit'|'lastUpdated'|'daysSinceUpdate'>('daysSinceUpdate');
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any|null>(null);
  const [updateQty, setUpdateQty] = React.useState<number>(0);
  const [saving, setSaving] = React.useState(false);

  const load = async (d:number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/inventory/stale?days=${d}`, { credentials: 'include', cache: 'no-store' });
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  React.useEffect(()=>{ load(days); },[]);

  const filtered = data.items.filter((i:any)=>{
    const keyword = search.trim();
    if (keyword && !(i.name.includes(keyword) || (i.supplier||'').includes(keyword))) return false;
    if (selectedTags.length>0) {
      const names = (i.tags||[]).map((t:any)=>t.name);
      return selectedTags.every(t=>names.includes(t));
    }
    return true;
  }).sort((a:any,b:any)=>{
    const dir = sortAsc?1:-1;
    const va = sortKey==='lastUpdated'? new Date(a.lastUpdated||a.createdAt).getTime() : (a[sortKey]??'');
    const vb = sortKey==='lastUpdated'? new Date(b.lastUpdated||b.createdAt).getTime() : (b[sortKey]??'');
    if (va<vb) return -1*dir; if (va>vb) return 1*dir; return 0;
  });

  const onSort = (key:any) => { if (sortKey===key) setSortAsc(a=>!a); else { setSortKey(key); setSortAsc(true);} };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900">재고 업데이트 필요 목록</h1>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">기준 일수</span>
            <input type="number" min={1} value={days} onChange={e=>setDays(parseInt(e.target.value||'2'))} className="w-24 px-3 py-2 border rounded font-semibold text-gray-900" />
            <button onClick={()=>load(days)} className="px-4 py-2 bg-gray-900 text-white rounded font-semibold">적용</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-orange-100 rounded p-3"><div className="text-3xl font-bold text-orange-800">{data.stats.total}</div><div className="text-sm text-gray-900 font-medium">업데이트 필요</div></div>
          <div className="bg-red-100 rounded p-3"><div className="text-3xl font-bold text-red-800">{data.stats.lowStock}</div><div className="text-sm text-gray-900 font-medium">재고 부족</div></div>
          <div className="bg-blue-100 rounded p-3"><div className="text-3xl font-bold text-blue-800">{data.stats.averageDaysStale}일</div><div className="text-sm text-gray-900 font-medium">평균 경과</div></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="단어 검색(이름/공급처)" className="flex-1 px-4 py-3 border-2 rounded text-gray-900 font-semibold placeholder-gray-700" />
          <input onKeyDown={e=>{ if(e.key==='Enter') load(days); }} className="hidden" />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-600">로딩중...</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('name')}>이름</th>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('category')}>카테고리</th>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('currentStock')}>현재/최소</th>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('unit')}>단위</th>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('lastUpdated')}>마지막 업데이트</th>
                  <th className="p-2 text-left cursor-pointer" onClick={()=>onSort('daysSinceUpdate')}>경과일</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i:any)=>(
                  <tr key={i.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={()=>{ setSelectedItem(i); setUpdateQty(i.currentStock); }}>
                    <td className="p-2 font-semibold text-gray-900">{i.name}</td>
                    <td className="p-2 text-gray-800">{categoryLabel[i.category] || i.category}</td>
                    <td className="p-2 text-gray-800">{i.currentStock} / {i.minStock}</td>
                    <td className="p-2 text-gray-800">{i.unit}</td>
                    <td className="p-2 text-gray-800">{new Date(i.lastUpdated || i.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td className="p-2 text-orange-800 font-semibold">{i.daysSinceUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 빠른 업데이트 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-extrabold text-gray-900">재고 업데이트</h3>
              <button onClick={()=>setSelectedItem(null)} className="text-gray-500">✕</button>
            </div>
            <div className="space-y-3">
              <div className="font-extrabold text-gray-900">{selectedItem.name}</div>
              <div className="text-sm text-gray-900">현재/기준: <b>{selectedItem.currentStock}</b> / <b>{selectedItem.minStock}</b> {selectedItem.unit}</div>
              <div className="text-xs text-gray-800">최근 업데이트: {new Date(selectedItem.lastUpdated || selectedItem.createdAt).toLocaleString('ko-KR')} {selectedItem.lastCheckedBy? `• ${selectedItem.lastCheckedBy}`: ''}</div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">새 재고 수량</label>
                <input type="number" value={updateQty} onChange={e=>setUpdateQty(parseFloat(e.target.value||'0'))} className="w-full px-4 py-3 border-2 rounded text-gray-900 font-semibold placeholder-gray-700" placeholder="수량을 입력하세요" />
              </div>
              <div className="flex gap-2">
                <button disabled={saving} onClick={async()=>{
                  try {
                    setSaving(true);
                    const res = await fetch('/api/admin/inventory', { method:'PUT', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: selectedItem.id, currentStock: updateQty })});
                    if(res.ok){ await load(days); setSelectedItem(null);} else { const e = await res.json().catch(()=>({})); alert(e.error||'실패'); }
                  } finally { setSaving(false); }
                }} className="px-4 py-2 bg-gray-900 text-white rounded font-semibold disabled:opacity-50">{saving? '저장 중...':'바로 업데이트'}</button>
                <button onClick={()=>setSelectedItem(null)} className="px-4 py-2 bg-gray-600 text-white rounded">닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


