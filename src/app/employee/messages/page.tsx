"use client";
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function EmployeeMessagesPage() {
  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  const [sentCursor, setSentCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [tab, setTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [modal, setModal] = useState<{open:boolean, msg:any, thread:any[]}|null>(null);

  const fetchMessages = async (reset = true) => {
    try {
      setLoading(true);
      const url = new URL('/api/messages', window.location.origin);
      url.searchParams.set('limit', '20');
      url.searchParams.set('box', tab === 'sent' ? 'sent' : 'inbox');
      if (!reset && cursor) url.searchParams.set('cursor', cursor);
      const res = await fetch(url.toString(), { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
        setCursor(data.nextCursor || null);
        const merged = reset ? data.messages : [...messages, ...data.messages];
        const byThread: Record<string, any> = {};
        for (const m of merged) {
          const key = m.threadId || m.id;
          if (!byThread[key] || new Date(byThread[key].createdAt) < new Date(m.createdAt)) {
            byThread[key] = m;
          }
        }
        setMessages(Object.values(byThread).sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
      } else {
        setError('메시지 조회에 실패했습니다.');
      }
    } catch (e) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(true); }, [tab]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/employee/me', { credentials: 'include', cache: 'no-store' });
        if (r.ok) {
          const j = await r.json();
          setMe(j);
          if (j?.isSuperAdmin) {
            window.location.replace('/admin/messages');
          }
        }
      } catch {}
    })();
  }, []);

  const fetchSent = async (reset = true) => {
    const url = new URL('/api/messages', window.location.origin);
    url.searchParams.set('box', 'sent');
    url.searchParams.set('limit', '20');
    if (!reset && sentCursor) url.searchParams.set('cursor', sentCursor);
    const res = await fetch(url.toString(), { credentials: 'include', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const merged = reset ? data.messages : [...sent, ...data.messages];
      const byThread: Record<string, any> = {};
      for (const m of merged) {
        const key = m.threadId || m.id;
        if (!byThread[key] || new Date(byThread[key].createdAt) < new Date(m.createdAt)) {
          byThread[key] = m;
        }
      }
      setSent(Object.values(byThread).sort((a:any,b:any)=> new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()));
      setSentCursor(data.nextCursor || null);
    }
  };

  const sendMessage = async () => {
    if (!subject.trim() || !content.trim()) return;
    const res = await fetch('/api/messages', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, content }) });
    if (res.ok) {
      setSubject('');
      setContent('');
      setTab('sent');
      fetchSent(true);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/read`, { method: 'PATCH', credentials: 'include' });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
        setUnreadCount(c => Math.max(0, c - 1));
      }
    } catch {}
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">메시지</h1>
          <div className="flex gap-2">
            <button onClick={() => { setTab('inbox'); fetchMessages(true); }} className={`px-3 py-1 rounded ${tab==='inbox' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>받은함</button>
            <button onClick={() => { setTab('sent'); fetchSent(true); }} className={`px-3 py-1 rounded ${tab==='sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>보낸함</button>
            <button onClick={() => setTab('compose')} className={`px-3 py-1 rounded ${tab==='compose' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>작성</button>
          </div>
        </div>
        {tab==='inbox' && (
          <>
            <div className="text-sm text-gray-600 mb-4">미읽음: <b className="text-red-600">{unreadCount}</b>건</div>
            <div className="bg-white rounded-lg shadow divide-y">
              {messages.length === 0 && !loading && (
                <div className="p-6 text-center text-gray-500">메시지가 없습니다.</div>
              )}
              {messages.map(m => (
                <div key={m.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!m.isRead ? <span className="inline-block w-2 h-2 bg-red-500 rounded-full" /> : <span className="inline-block w-2 h-2 bg-gray-300 rounded-full" />}
                      <button onClick={async ()=>{ 
                          const threadKey = m.threadId || m.id; 
                          const tRes = await fetch(`/api/messages?threadId=${encodeURIComponent(threadKey)}`, { credentials: 'include', cache: 'no-store' });
                          let thread:any[] = [];
                          if (tRes.ok) { const jd = await tRes.json(); thread = jd.messages || []; }
                          setModal({open:true, msg:m, thread}); 
                          if(!m.isRead) markAsRead(m.id); 
                        }} className="text-left text-sm font-semibold text-gray-900 hover:underline">
                        {m.subject}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString('ko-KR')}</div>
                  </div>
                  {/* 목록에 본문은 미노출 (아웃룩/지메일 스타일) */}
                </div>
              ))}
              {cursor && (
                <div className="p-4 text-center">
                  <button onClick={() => fetchMessages(false)} disabled={loading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                    {loading ? '로딩 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {tab==='sent' && (
          <div className="bg-white rounded-lg shadow divide-y">
            {sent.length === 0 && (
              <div className="p-6 text-center text-gray-500">보낸 메시지가 없습니다.</div>
            )}
            {sent.map(m => (
              <div key={m.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{m.subject}</div>
                  <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString('ko-KR')}</div>
                </div>
                <div className="mt-1 text-xs text-gray-500">읽음 여부: {m.isRead ? '읽음' : '미읽음'}{m.readAt ? ` (${new Date(m.readAt).toLocaleString('ko-KR')})` : ''}</div>
                {/* 목록에 본문은 미노출 */}
              </div>
            ))}
            {sentCursor && (
              <div className="p-4 text-center">
                <button onClick={() => fetchSent(false)} disabled={loading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </div>
        )}
        {tab==='compose' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-900 mb-1">제목</label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full border rounded px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="제목" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-900 mb-1">내용</label>
              <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full border rounded px-3 py-2 h-40 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="메시지 내용을 입력하세요" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={()=>{setSubject(''); setContent(''); setTab('inbox');}} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">취소</button>
              <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">보내기</button>
            </div>
          </div>
        )}

        {modal?.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4" onClick={()=>setModal(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-xl w-full" onClick={e=>e.stopPropagation()}>
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-bold text-gray-900">{modal.msg.subject}</div>
                <button onClick={()=>setModal(null)} className="p-2 text-gray-500 hover:text-gray-800">✕</button>
              </div>
              <div className="p-4">
                <div className="space-y-3 max-h-[60vh] overflow-auto">
                  {(modal.thread || []).map((t:any) => (
                    <div key={t.id} className="border rounded p-2">
                      <div className="text-xs text-gray-500 mb-1">{new Date(t.createdAt).toLocaleString('ko-KR')}</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{t.content}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-900 mb-1">답장</label>
                  <textarea className="w-full border rounded px-3 py-2 h-32 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="답장 내용을 입력하세요" value={content} onChange={e=>setContent(e.target.value)} />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={()=>setModal(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">닫기</button>
                    <button onClick={async ()=>{ if(!content.trim()) return; await fetch('/api/messages', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ subject: `RE: ${modal.msg.subject}`, content, threadId: modal.msg.threadId || modal.msg.id }) }); setContent(''); setTab('sent'); await fetchSent(true); const threadKey = modal.msg.threadId || modal.msg.id; const tRes = await fetch(`/api/messages?threadId=${encodeURIComponent(threadKey)}`, { credentials: 'include', cache: 'no-store' }); let thread:any[]=[]; if (tRes.ok) { const jd = await tRes.json(); thread = jd.messages||[]; } setModal({open:true, msg: modal.msg, thread}); }} className="px-4 py-2 bg-blue-600 text-white rounded">답장 보내기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      </div>
    </main>
  );
}


