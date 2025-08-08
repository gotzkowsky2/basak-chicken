"use client";
import { useState, useEffect } from "react";

interface Precaution {
  id: string;
  title: string;
  content: string;
  workplace: string;
  timeSlot: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
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

const timeSlotOptions = [
  { value: "PREPARATION", label: "준비" },
  { value: "IN_PROGRESS", label: "진행" },
  { value: "CLOSING", label: "마감" },
  { value: "COMMON", label: "공통" },
];

const priorityOptions = [
  { value: 1, label: "높음" },
  { value: 2, label: "보통" },
  { value: 3, label: "낮음" },
];

export default function PrecautionsPage() {
  const [precautions, setPrecautions] = useState<Precaution[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 필터링 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWorkplace, setFilterWorkplace] = useState("");
  const [filterTimeSlot, setFilterTimeSlot] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 태그 관련 상태
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    title: "",
    content: "",
    workplace: "HALL",
    timeSlot: "PREPARATION",
    priority: 1,
    tags: [] as string[],
  });

  // 삭제 확인 상태
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    workplace: "HALL",
    timeSlot: "PREPARATION",
    priority: 1,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchPrecautions();
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/tags", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error("태그 목록을 불러오는데 실패했습니다:", error);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleEditTagToggle = (tagId: string) => {
    setEditingData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setTags(prev => [...prev, newTag]);
        setNewTagName('');
        setNewTagColor('#3B82F6');
        setShowTagModal(false);
        setSuccess('태그가 성공적으로 생성되었습니다.');
        // 태그 목록 새로고침
        await fetchTags();
      } else {
        const error = await response.json();
        setError(error.error || '태그 생성 실패');
      }
    } catch (error) {
      console.error('태그 생성 실패:', error);
      setError('태그 생성 중 오류가 발생했습니다.');
    }
  };

  const fetchPrecautions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/precautions", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setPrecautions(data.precautions || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "주의사항 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("주의사항 목록을 불러오는데 실패했습니다.");
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
      const response = await fetch("/api/admin/precautions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...formData, tags: selectedTags }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("주의사항이 성공적으로 등록되었습니다.");
        setFormData({
          title: "",
          content: "",
          workplace: "HALL",
          timeSlot: "PREPARATION",
          priority: 1,
          tags: [],
        });
        setSelectedTags([]);
        fetchPrecautions();
      } else {
        setError(data.error || "주의사항 등록에 실패했습니다.");
      }
    } catch (error) {
      setError("주의사항 등록에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (precaution: Precaution) => {
    setEditingId(precaution.id);
    setEditingData({
      title: precaution.title,
      content: precaution.content,
      workplace: precaution.workplace,
      timeSlot: precaution.timeSlot,
      priority: precaution.priority,
      tags: precaution.tags?.map(tag => tag.id) || [],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/precautions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...editingData, id: editingId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("주의사항이 성공적으로 수정되었습니다.");
        setEditingId(null);
        setEditingData({
          title: "",
          content: "",
          workplace: "HALL",
          timeSlot: "PREPARATION",
          priority: 1,
          tags: [],
        });
        fetchPrecautions();
      } else {
        setError(data.error || "주의사항 수정에 실패했습니다.");
      }
    } catch (error) {
      setError("주의사항 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData({
      title: "",
      content: "",
      workplace: "HALL",
      timeSlot: "PREPARATION",
      priority: 1,
      tags: [],
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
      const response = await fetch(`/api/admin/precautions?id=${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("주의사항이 성공적으로 삭제되었습니다.");
        setShowDeleteConfirm(false);
        setDeleteId(null);
        fetchPrecautions();
      } else {
        setError(data.error || "주의사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      setError("주의사항 삭제에 실패했습니다.");
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

  const getTimeSlotLabel = (value: string) => {
    return timeSlotOptions.find(option => option.value === value)?.label || value;
  };

  const getPriorityLabel = (value: number) => {
    return priorityOptions.find(option => option.value === value)?.label || value;
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "text-red-600 bg-red-100";
      case 2: return "text-yellow-600 bg-yellow-100";
      case 3: return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // 필터링된 주의사항 목록
  const filteredPrecautions = precautions.filter(precaution => {
    // 검색어 필터링
    const matchesSearch = searchTerm === "" || 
      precaution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      precaution.content.toLowerCase().includes(searchTerm.toLowerCase());

    // 위치 필터링
    const matchesWorkplace = filterWorkplace === "" || precaution.workplace === filterWorkplace;

    // 시간대 필터링
    const matchesTimeSlot = filterTimeSlot === "" || precaution.timeSlot === filterTimeSlot;

    // 우선순위 필터링
    const matchesPriority = filterPriority === "" || precaution.priority === parseInt(filterPriority);

    return matchesSearch && matchesWorkplace && matchesTimeSlot && matchesPriority;
  });

  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm("");
    setFilterWorkplace("");
    setFilterTimeSlot("");
    setFilterPriority("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">주의사항 관리</h1>

        {/* 주의사항 등록 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">새 주의사항 등록</h2>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          {success && <div className="text-green-500 text-sm mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  근무지 *
                </label>
                <select
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
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
                  시간대 *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  required
                >
                  {timeSlotOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  우선순위 *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 text-sm"
                  required
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm"
                placeholder="주의사항 제목을 입력하세요..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm"
                rows={3}
                placeholder="주의사항 내용을 입력하세요..."
                required
              />
            </div>

            <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  태그
                </label>
                <button
                  type="button"
                  onClick={() => setShowTagModal(true)}
                className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>태그 추가</span>
                </button>
              </div>
            <div className="flex flex-wrap gap-2 p-2 sm:p-3 border border-gray-300 rounded-lg min-h-[52px]">
                {tags.length === 0 ? (
                <p className="text-gray-500 text-xs sm:text-sm">등록된 태그가 없습니다.</p>
                ) : (
                  tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all ${
                          selectedTags.includes(tag.id)
                            ? 'text-white shadow-md'
                            : 'hover:shadow-md'
                        }`}
                        style={{
                          backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                          color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                          border: selectedTags.includes(tag.id) ? `2px solid ${tag.color}` : `1px solid ${tag.color}40`
                        }}
                      >
                        {tag.name}
                      </button>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {submitting ? "등록 중..." : "주의사항 등록"}
            </button>
          </form>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">등록된 주의사항 목록</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                필터 초기화
              </button>
              {/* 필터 접기/펼치기 버튼 */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                title={showFilters ? "필터 접기" : "필터 펼치기"}
              >
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {showFilters ? "접기" : "필터"}
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="space-y-3 sm:space-y-4">
              {/* 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="제목 또는 내용으로 검색..."
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                />
              </div>

              {/* 필터 옵션들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">근무지</label>
                  <select
                    value={filterWorkplace}
                    onChange={(e) => setFilterWorkplace(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                  >
                    <option value="">전체</option>
                    {workplaceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                  <select
                    value={filterTimeSlot}
                    onChange={(e) => setFilterTimeSlot(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                  >
                    <option value="">전체</option>
                    {timeSlotOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm"
                  >
                    <option value="">전체</option>
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 주의사항 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">등록된 주의사항 목록</h2>
            <span className="text-sm text-gray-600">
              총 {filteredPrecautions.length}개 (전체 {precautions.length}개)
            </span>
          </div>
          
          {filteredPrecautions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {precautions.length === 0 ? "등록된 주의사항이 없습니다." : "필터 조건에 맞는 주의사항이 없습니다."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrecautions.map((precaution) => (
                <div key={precaution.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === precaution.id ? (
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
                          <select
                            value={editingData.priority}
                            onChange={(e) => setEditingData({ ...editingData, priority: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                            required
                          >
                            {priorityOptions.map((option) => (
                              <option key={option.value} value={option.value} className="text-gray-800">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                        <input
                          type="text"
                          value={editingData.title}
                          onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                        <textarea
                          value={editingData.content}
                          onChange={(e) => setEditingData({ ...editingData, content: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">태그</label>
                          <button
                            type="button"
                            onClick={() => setShowTagModal(true)}
                            className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>태그 추가</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[60px]">
                          {tags.length === 0 ? (
                            <p className="text-gray-500 text-sm">등록된 태그가 없습니다.</p>
                          ) : (
                            tags.map((tag) => (
                                <button
                                  key={tag.id}
                                  type="button"
                                  onClick={() => handleEditTagToggle(tag.id)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                                    editingData.tags.includes(tag.id)
                                      ? 'text-white shadow-md'
                                      : 'hover:shadow-md'
                                  }`}
                                  style={{
                                    backgroundColor: editingData.tags.includes(tag.id) ? tag.color : `${tag.color}20`,
                                    color: editingData.tags.includes(tag.id) ? 'white' : tag.color,
                                    border: editingData.tags.includes(tag.id) ? `2px solid ${tag.color}` : `1px solid ${tag.color}40`
                                  }}
                                >
                                  {tag.name}
                                </button>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                          title="수정 완료"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {submitting ? "수정 중..." : "완료"}
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
                          title="취소"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          취소
                        </button>
                      </div>
                    </form>
                  ) : (
                    // 보기 모드
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">{precaution.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(precaution.priority)}`}>
                              {getPriorityLabel(precaution.priority)}
                            </span>
                            <div className="ml-auto flex items-center gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEdit(precaution)}
                                className="p-1.5 sm:p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                                title="수정"
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(precaution.id)}
                                className="p-1.5 sm:p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                title="삭제"
                              >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{precaution.content}</p>
                          
                          {/* 태그 표시 */}
                          {precaution.tags && precaution.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {precaution.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600 whitespace-nowrap overflow-x-auto">
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {getWorkplaceLabel(precaution.workplace)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {getTimeSlotLabel(precaution.timeSlot)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(precaution.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">주의사항 삭제</h3>
            <p className="text-gray-600 mb-6">
              이 주의사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

      {/* 태그 생성 모달 */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">새 태그 생성</h3>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 이름 *
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  placeholder="태그 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 색상
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createTag}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  생성
                </button>
                <button
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 