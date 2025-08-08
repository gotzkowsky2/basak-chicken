"use client";

import { useEffect, useState, useRef } from "react";
import { PencilIcon, TrashIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

type Manual = {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  category: string;
  version: string;
  mediaUrls?: string[];
  precautions?: Array<{ id: string; title: string }>;
};

export default function ManualsPage() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/manuals", { credentials: "include", cache: "no-store" });
        if (!res.ok) throw new Error("메뉴얼 조회에 실패했습니다.");
        const data = await res.json();
        setManuals(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message || "메뉴얼 조회 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (m: Manual) => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // 추후 폼 복원 시 데이터 주입
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">메뉴얼 관리</h1>
          <p className="text-sm sm:text-base text-gray-600">업무 매뉴얼을 확인합니다.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div ref={formRef} />

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : manuals.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">메뉴얼이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {manuals.map((manual) => (
                  <div key={manual.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    {/* 1줄: 제목 */}
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 break-words">{manual.title}</h3>
                    {/* 2줄: 버전/주의사항 + 우측 액션 */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">v{manual.version}</span>
                        {manual.precautions && manual.precautions.length > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">⚠️ {manual.precautions.length}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button onClick={() => handleEdit(manual)} className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="수정">
                          <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button onClick={() => alert('삭제 기능은 추후 제공됩니다.')} className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="삭제">
                          <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-gray-600 text-sm mb-2 line-clamp-3 whitespace-pre-wrap">{manual.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}