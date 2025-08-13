"use client";

import { useState, useEffect } from "react";
export const dynamic = 'force-dynamic';
import { useRouter } from "next/navigation";

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingColor, setEditingColor] = useState("#3B82F6");
  const router = useRouter();

  // 태그 목록 조회
  const fetchTags = async () => {
    try {
      const query = search ? `?q=${encodeURIComponent(search)}` : "";
      const response = await fetch(`/api/admin/tags${query}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      } else {
        setError("태그 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("태그 목록을 불러오는데 실패했습니다.");
    }
  };

  // 새 태그 생성
  const createTag = async () => {
    if (!newTagName.trim()) {
      setError("태그 이름을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
      });

      if (response.ok) {
        setNewTagName("");
        setNewTagColor("#3B82F6");
        fetchTags();
      } else {
        const data = await response.json();
        setError(data.error || "태그 생성에 실패했습니다.");
      }
    } catch (error) {
      setError("태그 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 태그 삭제
  const deleteTag = async (tagId: string) => {
    if (!confirm("이 태그를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/tags/${tagId}`, {
        method: "DELETE",
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        fetchTags();
      } else {
        setError("태그 삭제에 실패했습니다.");
      }
    } catch (error) {
      setError("태그 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchTags();
  }, [search]);

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingColor("#3B82F6");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`/api/admin/tags/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: editingName, color: editingColor })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '태그 수정에 실패했습니다.');
        return;
      }
      cancelEdit();
      fetchTags();
    } catch (e) {
      setError('태그 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin")}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">태그 관리</h1>
          </div>
        </div>

        {/* 새 태그 생성/검색 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">태그 생성/검색</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="태그 검색"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-40 sm:w-60"
              />
              <button
                onClick={() => fetchTags()}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >검색</button>
            </div>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="태그 이름 (예: 닭고기, 소스, 청소용품)"
              className="flex-1 min-w-[160px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <button
              onClick={createTag}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* 태그 목록 */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900">등록된 태그 ({tags.length}개)</h2>
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">등록된 태그가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 gap-2"
                >
                  {editingId === tag.id ? (
                    <div className="flex-1 flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded w-24 sm:w-40"
                        />
                        <input
                          type="color"
                          value={editingColor}
                          onChange={(e) => setEditingColor(e.target.value)}
                          className="w-8 h-8 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <button onClick={saveEdit} className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs sm:text-sm">저장</button>
                        <button onClick={cancelEdit} className="px-2 sm:px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs sm:text-sm">취소</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="font-medium text-gray-800 truncate">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <button onClick={() => startEdit(tag)} className="px-2 py-1 text-xs sm:text-sm text-gray-600 hover:text-blue-700">수정</button>
                        <button
                          onClick={() => deleteTag(tag.id)}
                          className="p-1 rounded hover:bg-red-50"
                          aria-label="삭제"
                        >
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 사용 예시 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">태그 사용 예시</h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>재료 관련:</strong> 닭고기, 소스, 양념, 채소, 기름</p>
            <p>• <strong>부대용품:</strong> 청소용품, 조리도구, 포장재, 안전용품</p>
            <p>• <strong>매뉴얼:</strong> 조리법, 청소법, 안전수칙, 고객응대</p>
            <p>• <strong>기타:</strong> 긴급, 중요, 일일, 주간</p>
          </div>
        </div>
      </div>
    </div>
  );
} 