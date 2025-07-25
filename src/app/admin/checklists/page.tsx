"use client";
import { useState, useEffect } from "react";

interface ChecklistTemplate {
  id: string;
  content: string;
  inputter: string;
  inputDate: string;
  workplace: string;
  category: string;
  timeSlot: string;
  isActive: boolean;
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

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    content: "",
    workplace: "HALL",
    category: "CHECKLIST",
    timeSlot: "PREPARATION",
  });

  // 삭제 확인 상태
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    content: "",
    workplace: "HALL",
    category: "CHECKLIST",
    timeSlot: "PREPARATION",
  });

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      const response = await fetch("/api/admin/checklists", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setChecklists(data.checklists || []);
      } else {
        setError("체크리스트 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("체크리스트가 성공적으로 등록되었습니다.");
        setFormData({
          content: "",
          workplace: "HALL",
          category: "CHECKLIST",
          timeSlot: "PREPARATION",
        });
        fetchChecklists(); // 목록 새로고침
      } else {
        setError(data.error || "체크리스트 등록에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (checklist: ChecklistTemplate) => {
    setEditingId(checklist.id);
    setEditingData({
      content: checklist.content,
      workplace: checklist.workplace,
      category: checklist.category,
      timeSlot: checklist.timeSlot,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/checklists/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editingData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("체크리스트가 성공적으로 수정되었습니다.");
        setEditingId(null);
        fetchChecklists(); // 목록 새로고침
      } else {
        setError(data.error || "체크리스트 수정에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData({
      content: "",
      workplace: "HALL",
      category: "CHECKLIST",
      timeSlot: "PREPARATION",
    });
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/checklists/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("체크리스트가 성공적으로 삭제되었습니다.");
        setShowDeleteConfirm(false);
        setDeleteId(null);
        fetchChecklists(); // 목록 새로고침
      } else {
        setError(data.error || "체크리스트 삭제에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const getWorkplaceLabel = (value: string) => {
    return workplaceOptions.find(option => option.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(option => option.value === value)?.label || value;
  };

  const getTimeSlotLabel = (value: string) => {
    return timeSlotOptions.find(option => option.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">체크리스트 관리</h1>

        {/* 체크리스트 등록 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">새 체크리스트 등록</h2>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          {success && <div className="text-green-500 text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  근무지 *
                </label>
                <select
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                >
                  {workplaceOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구분 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간 *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  required
                >
                  {timeSlotOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                체크리스트 내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                rows={3}
                placeholder="체크리스트 항목을 입력하세요..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {submitting ? "등록 중..." : "체크리스트 등록"}
            </button>
          </form>
        </div>

        {/* 체크리스트 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">등록된 체크리스트 목록</h2>
          
          {checklists.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              등록된 체크리스트가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {checklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === checklist.id ? (
                    // 수정 모드
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">근무지</label>
                          <select
                            value={editingData.workplace}
                            onChange={(e) => setEditingData({ ...editingData, workplace: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                            required
                          >
                            {workplaceOptions.map((option) => (
                              <option key={option.value} value={option.value} className="text-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">구분</label>
                          <select
                            value={editingData.category}
                            onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                            required
                          >
                            {categoryOptions.map((option) => (
                              <option key={option.value} value={option.value} className="text-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">시간</label>
                          <select
                            value={editingData.timeSlot}
                            onChange={(e) => setEditingData({ ...editingData, timeSlot: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                            required
                          >
                            {timeSlotOptions.map((option) => (
                              <option key={option.value} value={option.value} className="text-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">체크리스트 내용</label>
                        <textarea
                          value={editingData.content}
                          onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {submitting ? "수정 중..." : "수정 완료"}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                          취소
                        </button>
                      </div>
                    </form>
                  ) : (
                    // 보기 모드
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium mb-2">{checklist.content}</p>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>근무지: {getWorkplaceLabel(checklist.workplace)}</span>
                            <span>구분: {getCategoryLabel(checklist.category)}</span>
                            <span>시간: {getTimeSlotLabel(checklist.timeSlot)}</span>
                            <span>입력자: {checklist.inputter}</span>
                            <span>등록일: {new Date(checklist.inputDate).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(checklist)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(checklist.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">체크리스트 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 체크리스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {submitting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 