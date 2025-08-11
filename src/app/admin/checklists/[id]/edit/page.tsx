"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

interface Template {
  id: string;
  name: string;
  content?: string;
  workplace: string;
  category: string;
  timeSlot: string;
  isActive: boolean;
  autoGenerateEnabled?: boolean;
  recurrenceDays?: number[];
  generationTime?: string | null;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

const workplaceOptions = [
  { value: "HALL", label: "홀" },
  { value: "KITCHEN", label: "주방" },
  { value: "COMMON", label: "공통" },
];

const categoryOptions = [
  { value: "CHECKLIST", label: "체크리스트" },
  { value: "PRECAUTIONS", label: "주의사항" },
  { value: "HYGIENE", label: "위생규정" },
  { value: "SUPPLIES", label: "부대용품" },
  { value: "INGREDIENTS", label: "재료" },
  { value: "COMMON", label: "공통" },
  { value: "MANUAL", label: "매뉴얼" },
];

const timeSlotOptions = [
  { value: "PREPARATION", label: "준비" },
  { value: "IN_PROGRESS", label: "진행" },
  { value: "CLOSING", label: "마감" },
  { value: "COMMON", label: "공통" },
];

export default function EditChecklistTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const templateId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/checklists/${templateId}`, { credentials: "include" });
      if (!res.ok) throw new Error("템플릿을 불러오지 못했습니다.");
      const data = await res.json();
      setTemplate({
        id: data.id,
        name: data.name,
        content: data.content,
        workplace: data.workplace,
        category: data.category,
        timeSlot: data.timeSlot,
        isActive: data.isActive,
        autoGenerateEnabled: data.autoGenerateEnabled ?? false,
        recurrenceDays: data.recurrenceDays ?? [],
        generationTime: data.generationTime ?? null,
      });

      // 기존 태그 관계가 API에 포함되어 있지 않을 수 있으므로, 템플릿의 태그 관계를 별도 확장 시까지 비움
      setSelectedTags([]);
    } catch (e: any) {
      setError(e.message || "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/tags", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
      fetchTags();
    }
  }, [templateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      // API는 content 필드를 기대하므로, 비어 있으면 name을 대입하여 일관성 유지
      const payload = {
        content: template.content && template.content.trim().length > 0 ? template.content : template.name,
        workplace: template.workplace,
        category: template.category,
        timeSlot: template.timeSlot,
        isActive: template.isActive,
        selectedTags: selectedTags,
        autoGenerateEnabled: !!template.autoGenerateEnabled,
        recurrenceDays: Array.isArray(template.recurrenceDays) ? template.recurrenceDays : [],
        generationTime: template.generationTime || null,
      };

      const res = await fetch(`/api/admin/checklists/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "수정에 실패했습니다.");
      }

      setSuccess("수정되었습니다.");
      setTimeout(() => setSuccess(""), 2000);
      // 목록으로 이동 또는 상세/항목관리로 유도
      router.push("/admin/checklists");
    } catch (e: any) {
      setError(e.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700">템플릿을 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">템플릿 수정</h1>
          <p className="text-gray-600 mt-1">기본 정보를 수정합니다. (이름은 목록에서 사용됩니다)</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-4 rounded border border-green-200 bg-green-50 text-green-700">{success}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름(읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input
                type="text"
                value={template.name}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
            </div>

            {/* 설명(content) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명(선택)</label>
              <textarea
                value={template.content || ""}
                onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                rows={4}
                placeholder="템플릿 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            {/* 위치/구분/시간 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                <select
                  value={template.workplace}
                  onChange={(e) => setTemplate({ ...template, workplace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {workplaceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
                <select
                  value={template.category}
                  onChange={(e) => setTemplate({ ...template, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                <select
                  value={template.timeSlot}
                  onChange={(e) => setTemplate({ ...template, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {timeSlotOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 사용 여부 */}
            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={template.isActive}
                onChange={(e) => setTemplate({ ...template, isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">사용 중</label>
            </div>

            {/* 태그 선택(선택) */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">태그(선택)</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const active = selectedTags.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                          active ? "ring-2 ring-blue-500" : "hover:bg-gray-100"
                        }`}
                        style={{
                          backgroundColor: active ? tag.color : `${tag.color}20`,
                          color: active ? "white" : tag.color,
                          borderColor: `${tag.color}30`,
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/checklists")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>

        {/* 반복 생성 설정 */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">반복 생성 설정</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!template.autoGenerateEnabled}
                onChange={(e) => setTemplate({ ...template, autoGenerateEnabled: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">자동 생성 활성화</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">반복 요일</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { idx: 0, label: '일' },
                  { idx: 1, label: '월' },
                  { idx: 2, label: '화' },
                  { idx: 3, label: '수' },
                  { idx: 4, label: '목' },
                  { idx: 5, label: '금' },
                  { idx: 6, label: '토' },
                ].map((d) => {
                  const active = (template.recurrenceDays || []).includes(d.idx);
                  return (
                    <button
                      key={d.idx}
                      type="button"
                      disabled={!template.autoGenerateEnabled}
                      onClick={() => {
                        const cur = new Set(template.recurrenceDays || []);
                        if (cur.has(d.idx)) cur.delete(d.idx); else cur.add(d.idx);
                        setTemplate({ ...template, recurrenceDays: Array.from(cur).sort() });
                      }}
                      className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">생성 시각 (선택)</label>
              <input
                type="time"
                disabled={!template.autoGenerateEnabled}
                value={template.generationTime || ''}
                onChange={(e) => setTemplate({ ...template, generationTime: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <p className="text-xs text-gray-500">저장 버튼을 눌러야 설정이 반영됩니다. 시각 미설정 시 기본 00:05에 생성됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


