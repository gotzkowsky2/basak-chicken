"use client";
import { useEffect, useState } from 'react';

export default function AdminMessagesPage() {
  const [sent, setSent] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string|null>(null);
  const [thread, setThread] = useState<any[]|null>(null);
  const [reply, setReply] = useState('');
  const [selected, setSelected] = useState<any|null>(null);

  const fetchSent = async (reset=true) => {
    const url = new URL('/api/admin/messages', window.location.origin);
    url.searchParams.set('box','sent');
    url.searchParams.set('limit','20');
    if (!reset && cursor) url.searchParams.set('cursor', cursor);
    const res = await fetch(url.toString(), { credentials: 'include', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const list = reset ? data.messages : [...sent, ...data.messages];
      const byId:Record<string,any> = {}; list.forEach((m:any)=>byId[m.id]=m);
      setSent(Object.values(byId));
      setCursor(data.nextCursor || null);
    }
  };

  const openThread = async (m:any) => {
    setSelected(m);
    const url = new URL('/api/admin/messages', window.location.origin);
    url.searchParams.set('threadId', m.threadId || m.id);
    const res = await fetch(url.toString(), { credentials: 'include', cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setThread(data.messages);
    }
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    await fetch('/api/admin/messages', { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ recipientId: selected.recipientId, subject: `RE: ${selected.subject}`, content: reply, threadId: selected.threadId || selected.id, sendEmail: false }) });
    setReply('');
    await openThread(selected);
    await fetchSent(true);
  };

  useEffect(()=>{ fetchSent(true); },[]);

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b font-bold">보낸 메시지</div>
          <div className="divide-y">
            {sent.length===0 && (
              <div className="p-6 text-center text-gray-500">보낸 메시지가 없습니다.</div>
            )}
            {sent.map(m => (
              <div key={m.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={()=>openThread(m)}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-gray-900">{m.subject}</div>
                  <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString('ko-KR')}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">보낸이: {m.sender?.name || m.senderId} • 받는이: {m.recipient?.name || m.recipientId} • 읽음: {m.isRead ? 'Y' : 'N'}</div>
                <div className="mt-2 text-sm text-gray-800 line-clamp-2 whitespace-pre-wrap">{m.content}</div>
              </div>
            ))}
            {cursor && (
              <div className="p-4 text-center">
                <button onClick={()=>fetchSent(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded">더 보기</button>
              </div>
            )}
          </div>
        </section>
        <section className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b font-bold">스레드</div>
          <div className="p-4 space-y-3 max-h-[70vh] overflow-auto">
            {!thread && <div className="text-gray-500">왼쪽에서 메시지를 선택하세요.</div>}
            {thread && thread.map((t:any)=>(
              <div key={t.id} className="border rounded p-2">
                <div className="text-xs text-gray-500 mb-1">{new Date(t.createdAt).toLocaleString('ko-KR')} • {t.recipient?.name ? `받는이: ${t.recipient.name}`: ''}</div>
                <div className="text-sm whitespace-pre-wrap">{t.content}</div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <textarea value={reply} onChange={e=>setReply(e.target.value)} className="w-full border rounded px-3 py-2 h-28 mb-2" placeholder="답장 내용을 입력하세요" />
            <div className="flex justify-end">
              <button onClick={sendReply} className="px-4 py-2 bg-blue-600 text-white rounded">답장 보내기</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


