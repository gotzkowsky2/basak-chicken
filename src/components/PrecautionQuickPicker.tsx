"use client";
import { useEffect, useState } from "react";

interface Props {
  onClose: () => void;
  onAdded: () => Promise<void> | void;
  manualId: string;
  selectedPrecautionIds: string[];
}

export default function PrecautionQuickPicker({ onClose, onAdded, manualId, selectedPrecautionIds }: Props) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/precautions', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setList(Array.isArray(data) ? data : (data.precautions || []));
        setError(null);
      } else {
        setError('목록을 불러오지 못했습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // 간단 구현: 메뉴얼 연결은 상위 호출부에서 API를 통해 처리되므로 여기서는 선택만
  const handleSelect = async (id: string) => {
    try {
      const res = await fetch('/api/admin/manuals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: manualId, selectedPrecautions: Array.from(new Set([...(selectedPrecautionIds||[]), id])) })
      });
      if (!res.ok) {
        console.error('manual link add failed', await res.text());
      }
    } catch (e) {
      console.error('link add error', e);
    } finally {
      await onAdded();
      onClose();
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-sm text-gray-500">불러오는 중...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className="w-full text-left p-3 border rounded hover:bg-gray-50"
            >
              <div className="text-sm font-medium text-gray-900">{p.title}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{p.content}</div>
            </button>
          ))}
          {list.length === 0 && (
            <div className="text-sm text-gray-500">등록된 주의사항이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}


