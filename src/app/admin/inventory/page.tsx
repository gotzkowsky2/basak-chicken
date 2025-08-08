"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PencilIcon, TrashIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Tag = { id: string; name: string; color: string };

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier?: string | null;
  tagRelations?: Array<{ id: string; tag: Tag }>;
  lastUpdated?: string;
};

export default function InventoryPage() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "INGREDIENTS",
    currentStock: "",
    minStock: "",
    unit: "",
    supplier: ""
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/inventory", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("재고 조회에 실패했습니다.");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || "재고 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const lowStockIds = useMemo(() => new Set(items.filter(i => i.currentStock <= i.minStock).map(i => i.id)), [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">재고/구매 관리</h1>
          <p className="text-sm sm:text-base text-gray-600">재고 현황을 확인합니다.</p>
        </div>

        {/* 알림 */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">{success}</div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 등록/수정 폼 */}
        <div ref={formRef} className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{editingId ? "재고 수정" : "새 재고 등록"}</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                setSubmitting(true);
                setSuccess("");
                setError("");
                const payload = {
                  name: formData.name.trim(),
                  category: formData.category,
                  currentStock: parseFloat(formData.currentStock || "0"),
                  minStock: parseFloat(formData.minStock || "0"),
                  unit: formData.unit,
                  supplier: formData.supplier || null
                };
                const method = editingId ? "PUT" : "POST";
                const url = "/api/admin/inventory" + (editingId ? "" : "");
                const body = editingId ? { ...payload, id: editingId } : payload;
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  cache: "no-store",
                  body: JSON.stringify(body)
                });
                if (!res.ok) {
                  const er = await res.json().catch(() => ({}));
                  throw new Error(er.error || "저장에 실패했습니다.");
                }
                setSuccess(editingId ? "수정되었습니다." : "등록되었습니다.");
                setFormData({ name: "", category: "INGREDIENTS", currentStock: "", minStock: "", unit: "", supplier: "" });
                setEditingId(null);
                await fetchItems();
              } catch (e: any) {
                setError(e.message || "저장 중 오류가 발생했습니다.");
              } finally {
                setSubmitting(false);
              }
            }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            <input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="이름*" className="px-3 py-2 border rounded" required />
            <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} className="px-3 py-2 border rounded">
              <option value="INGREDIENTS">재료</option>
              <option value="SUPPLIES">용품</option>
              <option value="COMMON">기타</option>
            </select>
            <input value={formData.currentStock} onChange={(e) => setFormData((p) => ({ ...p, currentStock: e.target.value }))} placeholder="현재수량*" className="px-3 py-2 border rounded" required />
            <input value={formData.minStock} onChange={(e) => setFormData((p) => ({ ...p, minStock: e.target.value }))} placeholder="최소수량*" className="px-3 py-2 border rounded" required />
            <input value={formData.unit} onChange={(e) => setFormData((p) => ({ ...p, unit: e.target.value }))} placeholder="단위(예: 개, kg)" className="px-3 py-2 border rounded" />
            <input value={formData.supplier} onChange={(e) => setFormData((p) => ({ ...p, supplier: e.target.value }))} placeholder="공급처" className="px-3 py-2 border rounded" />
            <div className="col-span-2 sm:col-span-3 flex gap-2 justify-end">
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setFormData({ name: "", category: "INGREDIENTS", currentStock: "", minStock: "", unit: "", supplier: "" }); }} className="px-4 py-2 border rounded">취소</button>
              )}
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{submitting ? "저장 중..." : (editingId ? "수정" : "등록")}</button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-white rounded-lg shadow animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">재고 아이템이 없습니다.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className={`border rounded-lg p-4 bg-white ${lowStockIds.has(item.id) ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
                <div className="flex flex-col gap-1">
                  {/* 1줄: 제목 + 우측 액션 */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate pr-2">{item.name}</h4>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="수정" onClick={() => { setEditingId(item.id); setFormData({ name: item.name, category: item.category, currentStock: String(item.currentStock ?? ""), minStock: String(item.minStock ?? ""), unit: item.unit ?? "", supplier: item.supplier ?? "" }); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}> 
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="삭제" onClick={async () => { if (!confirm("삭제하시겠습니까?")) return; try { const res = await fetch(`/api/admin/inventory?id=${encodeURIComponent(item.id)}`, { method: "DELETE", credentials: "include" }); if (!res.ok) { const er = await res.json().catch(() => ({})); throw new Error(er.error || "삭제 실패"); } await fetchItems(); } catch (e: any) { alert(e.message || "삭제 중 오류"); } }}> 
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 2줄: 보조정보 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                    {lowStockIds.has(item.id) && <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />}
                    <span>{item.category}</span>
                    {item.lastUpdated && <span className="opacity-60">· {new Date(item.lastUpdated).toLocaleDateString("ko-KR")}</span>}
                  </div>

                  {/* 수량 */}
                  <div className="text-sm text-gray-600">
                    <span className={lowStockIds.has(item.id) ? "text-red-600 font-medium" : ""}>
                      {item.currentStock} {item.unit}
                    </span>
                    <span className="text-gray-400"> / 최소 {item.minStock} {item.unit}</span>
                    {item.supplier && <span className="ml-2">• {item.supplier}</span>}
                  </div>

                  {/* 태그 */}
                  {item.tagRelations && item.tagRelations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tagRelations.map((tr) => (
                        <span key={tr.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: `${tr.tag.color}15`, color: tr.tag.color, borderColor: `${tr.tag.color}30` }}>{tr.tag.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
