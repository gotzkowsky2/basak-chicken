"use client";
import Link from "next/link";
import React from "react";
import { useEffect, useState } from "react";
import EmployeeStaleInventory from "./EmployeeStaleInventory";

type Feed = { notices: any[]; updatedManuals: any[]; newPrecautions: any[] };

export default function EmployeeMainClient() {
  const [feed, setFeed] = useState<Feed | null>(null);
  useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/employee/feed',{credentials:'include'}); if(r.ok){ setFeed(await r.json()); } }catch{} })() },[]);

  const [modal, setModal] = useState<null | { type: 'notice'|'manual'|'precaution'|'inventory', data: any }>(null);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4">
      <div className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        {feed && (feed.notices?.length || feed.updatedManuals?.length || feed.newPrecautions?.length) ? (
          <div>
            <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 mb-2"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs">📰</span> 최신 업데이트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded-xl p-3 hover:shadow-sm transition">
                <div className="font-semibold text-red-700 mb-2 text-sm">공지사항</div>
                <div className="space-y-2">
                  {feed.notices?.slice(0,3).map((n:any)=>(
                    <button key={n.id} onClick={()=>setModal({type:'notice', data:n})} className="text-left w-full text-sm hover:bg-red-50 rounded p-1">
                      <div className="font-medium text-gray-900 line-clamp-1">{n.title}</div>
                      <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString('ko-KR')}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border rounded-xl p-3 hover:shadow-sm transition">
                <div className="font-semibold text-indigo-700 mb-2 text-sm">업데이트된 메뉴얼</div>
                <div className="space-y-2">
                  {feed.updatedManuals?.slice(0,3).map((m:any)=>(
                    <button key={m.id} onClick={()=>setModal({type:'manual', data:m})} className="text-left w-full text-sm hover:bg-indigo-50 rounded p-1">
                      <div className="font-medium text-gray-900 line-clamp-1">{m.title}</div>
                      <div className="text-xs text-gray-500">{new Date(m.updatedAt).toLocaleDateString('ko-KR')}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border rounded-xl p-3 hover:shadow-sm transition">
                <div className="font-semibold text-orange-700 mb-2 text-sm">새/수정 주의사항</div>
                <div className="space-y-2">
                  {feed.newPrecautions?.slice(0,3).map((p:any)=>(
                    <button key={p.id} onClick={()=>setModal({type:'precaution', data:p})} className="text-left w-full text-sm hover:bg-orange-50 rounded p-1">
                      <div className="font-medium text-gray-900 line-clamp-1">{p.title}</div>
                      <div className="text-xs text-gray-500">{new Date(p.updatedAt).toLocaleDateString('ko-KR')}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="border rounded-xl p-3 md:col-span-3 hover:shadow-sm transition">
                <Link prefetch={false} href="/employee/inventory/stale" className="font-medium text-teal-700 mb-2 inline-block hover:underline">
                  재고 업데이트 필요
                </Link>
                <div className="text-sm text-gray-600 mb-2">2일 이상 미업데이트 또는 업데이트 기록 없음</div>
                <EmployeeStaleInventory onSelect={(item:any)=>setModal({type:'inventory', data:item})} />
              </div>
            </div>
          </div>
        ) : null}

        {/* 하단 카드 - 모바일 최적화 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link prefetch={false} href="/employee/checklist" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-green-50 active:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-green-700 text-center">오늘의 체크리스트</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">준비/진행/마감, 홀/부엌</span>
          </Link>
          <Link prefetch={false} href="/employee/submissions" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-blue-700 text-center">내 제출 내역</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">체크리스트 제출 기록</span>
          </Link>
          <Link prefetch={false} href="/employee/notices" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-yellow-50 active:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-yellow-700 text-center">주의사항</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">업무 전 꼭 확인!</span>
          </Link>
          <Link prefetch={false} href="/employee/inventory" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-orange-50 active:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-orange-700 text-center">재고관리</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">식자재 및 부대용품 관리</span>
          </Link>
          <Link prefetch={false} href="/employee/inventory/stale" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-blue-700 text-center">재고 업데이트 필요</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">업데이트 필요/전체 보기</span>
          </Link>
          <Link prefetch={false} href="/employee/manual" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-indigo-50 active:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-indigo-700 text-center">메뉴얼</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">업무 가이드 및 매뉴얼</span>
          </Link>
          <Link prefetch={false} href="/employee/favorites" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-lg shadow border hover:bg-pink-50 active:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-150 min-h-[100px] sm:min-h-[120px]">
            <span className="text-base sm:text-lg font-semibold text-pink-700 text-center">즐겨찾기</span>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 text-center">내가 하트한 매뉴얼/주의사항</span>
          </Link>
        </div>
      </div>

      {/* 상세 모달 */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-extrabold text-gray-900">
                {modal.type==='notice' && '공지사항'}
                {modal.type==='manual' && '메뉴얼'}
                {modal.type==='precaution' && '주의사항'}
                {modal.type==='inventory' && '재고 업데이트'}
              </h3>
              <button onClick={()=>setModal(null)} className="text-gray-500">✕</button>
            </div>

            {modal.type==='inventory' ? (
              <InventoryQuickUpdate item={modal.data} onDone={()=>setModal(null)} />
            ) : modal.type==='manual' ? (
              <ManualLikeDetail id={modal.data.id} fallback={modal.data} />
            ) : modal.type==='notice' ? (
              <NoticeDetail fallback={modal.data} />
            ) : (
              <PrecautionDetail id={modal.data.id} fallback={modal.data} />
            )}
          </div>
        </div>
      )}
    </main>
  );
} 

function InventoryQuickUpdate({ item, onDone }: { item: any, onDone: ()=>void }) {
  const [qty, setQty] = useState<number>(item.currentStock || 0);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    setLoading(true);
    const res = await fetch('/api/employee/inventory', { method:'PUT', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ itemId: item.id, currentStock: qty }) });
    setLoading(false);
    if(res.ok){ alert('업데이트 완료'); onDone(); } else { const e = await res.json().catch(()=>({})); alert(e.error||'실패'); }
  };
  return (
    <div className="space-y-3">
      <div className="font-extrabold text-gray-900">{item.name}</div>
      <div className="text-sm text-gray-900">현재/기준: <b>{item.currentStock}</b> / <b>{item.minStock}</b> {item.unit}</div>
      <div className="text-xs text-gray-800">최근 업데이트: {new Date(item.lastUpdated || item.createdAt).toLocaleString('ko-KR')} {item.lastCheckedBy ? `• ${item.lastCheckedBy}` : ''}</div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">새 재고 수량</label>
        <input type="number" value={qty} onChange={e=>setQty(parseFloat(e.target.value||'0'))} className="w-full px-4 py-3 border-2 rounded text-gray-900 font-semibold placeholder-gray-700" placeholder="수량을 입력하세요" />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded disabled:opacity-50">{loading?'저장 중...':'바로 업데이트'}</button>
        <button onClick={onDone} className="px-4 py-2 bg-gray-600 text-white rounded">닫기</button>
      </div>
    </div>
  );
}

function ManualLikeDetail({ id, fallback }: { id: string, fallback: any }) {
  const [data, setData] = useState<any>(fallback);
  useEffect(()=>{ (async()=>{ try{ const r=await fetch(`/api/employee/manuals?manualId=${id}`,{credentials:'include',cache:'no-store'}); if(r.ok){ const d=await r.json(); setData(d.manual); } }catch(e){ console.log('manual detail err', e)} })() },[id]);
  if(!data) return null;
  return (
    <div>
      <div className="text-lg font-extrabold text-gray-900 mb-2">{data.title}</div>
      <div className="text-sm text-gray-800 mb-4">{(data.createdAt||data.updatedAt) && new Date(data.createdAt||data.updatedAt).toLocaleString('ko-KR')}</div>
      <div className="whitespace-pre-wrap text-gray-900 leading-relaxed mb-4">{data.content}</div>
      {data.precautions && data.precautions.length>0 && (
        <div className="mt-4">
          <h4 className="text-base font-bold text-red-800 mb-2">연결된 주의사항</h4>
          <div className="space-y-2">
            {data.precautions.map((p:any)=> (
              <div key={p.id} className="border rounded p-2">
                <div className="font-semibold text-red-900">{p.title}</div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">{p.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NoticeDetail({ fallback }: { fallback: any }) {
  const data = fallback;
  if (!data) return null;
  return (
    <article className="prose prose-sm sm:prose max-w-none">
      <h4 className="!m-0 text-lg sm:text-xl font-extrabold text-gray-900">{data.title}</h4>
      <div className="text-xs sm:text-sm text-gray-500 mt-1">{new Date(data.createdAt).toLocaleString('ko-KR')} • 작성자 {data.author?.name || ''}</div>
      <div className="mt-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm sm:text-base">{data.content}</div>
      </div>
    </article>
  );
}

function PrecautionDetail({ id, fallback }: { id: string, fallback: any }) {
  const [data, setData] = useState<any>(fallback);
  useEffect(()=>{ (async()=>{ try{ const r=await fetch(`/api/employee/precautions?id=${id}`,{credentials:'include',cache:'no-store'}); if(r.ok){ const d=await r.json(); setData(d.precaution); } }catch(e){ console.log('precaution detail err', e)} })() },[id]);
  if (!data) return null;
  return (
    <article className="prose prose-sm sm:prose max-w-none">
      <div className="flex items-center gap-2">
        <h4 className="!m-0 text-lg sm:text-xl font-extrabold text-gray-900">{data.title}</h4>
        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">우선순위 {data.priority}</span>
      </div>
      <div className="text-xs sm:text-sm text-gray-500 mt-1">{new Date(data.updatedAt || data.createdAt).toLocaleString('ko-KR')}</div>
      <div className="mt-3 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm sm:text-base">{data.content}</div>
      </div>
      {Array.isArray(data.tags) && data.tags.length>0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {data.tags.map((t:any)=> (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] sm:text-xs text-white" style={{backgroundColor: t.color||'#999'}}>
              #{t.name}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function EmployeeStaleInventory({ onSelect }: { onSelect?: (item:any)=>void }) {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(()=>{ (async()=>{ try{ const r=await fetch('/api/admin/inventory/stale?days=2',{credentials:'include',cache:'no-store'}); if(r.ok){ setData(await r.json()); } }catch(e){ console.log('stale feed err', e)} })() },[]);
  if(!data || !data.items?.length) return null;
  return (
    <div className="bg-white rounded border p-3">
      <div className="font-semibold text-gray-900 mb-2">경고 항목(상위 5개)</div>
      <div className="space-y-1">
        {data.items.slice(0,5).map((i:any)=>(
          <button key={i.id} onClick={()=>onSelect?.(i)} className="w-full text-left hover:bg-teal-50 rounded p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold">{i.name}</span>
                {i.isLowStock && <span className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded">부족</span>}
              </div>
              <span className="text-gray-900 text-sm font-semibold">{i.daysSinceUpdate}일</span>
            </div>
            <div className="mt-0.5 text-xs text-gray-800 flex items-center gap-3">
              <span>현재/기준: <b className="text-gray-900">{i.currentStock}</b> / <b className="text-gray-900">{i.minStock}</b> {i.unit}</span>
              <span>최근: {new Date(i.lastUpdated || i.createdAt).toLocaleDateString('ko-KR')} {i.lastCheckedBy ? `• ${i.lastCheckedBy}` : ''}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}