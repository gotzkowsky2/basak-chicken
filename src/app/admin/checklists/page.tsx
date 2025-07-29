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
  tags?: Tag[];
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

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 태그 생성 모달 상태
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [creatingTag, setCreatingTag] = useState(false);

  // 필터링 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([]);
  const [filterWorkplace, setFilterWorkplace] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTimeSlot, setFilterTimeSlot] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 수정 모드 상태
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState({
    content: "",
    workplace: "HALL",
    category: "CHECKLIST",
    timeSlot: "PREPARATION",
    selectedTags: [] as string[],
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
    selectedTags: [] as string[],
  });

  useEffect(() => {
    fetchChecklists();
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
      console.error("태그 로딩 실패:", error);
    }
  };

  // 새 태그 생성
  const createTag = async () => {
    if (!newTagName.trim()) {
      setError("태그 이름을 입력해주세요.");
      return;
    }

    setCreatingTag(true);
    setError("");

    try {
      const response = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newTagName, color: newTagColor }),
      });

      if (response.ok) {
        setNewTagName("");
        setNewTagColor("#3B82F6");
        setShowTagModal(false);
        fetchTags(); // 태그 목록 새로고침
        setSuccess("태그가 성공적으로 생성되었습니다.");
      } else {
        const data = await response.json();
        setError(data.error || "태그 생성에 실패했습니다.");
      }
    } catch (error) {
      setError("태그 생성에 실패했습니다.");
    } finally {
      setCreatingTag(false);
    }
  };

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
          selectedTags: [],
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
      selectedTags: checklist.tags ? checklist.tags.map(tag => tag.id) : [],
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
      selectedTags: [],
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

  const generateTemplateName = (workplace: string, category: string, timeSlot: string) => {
    const workplaceLabel = getWorkplaceLabel(workplace);
    const timeSlotLabel = getTimeSlotLabel(timeSlot);
    
    // "홀, 준비" 형태로 생성
    return `${workplaceLabel}, ${timeSlotLabel}`;
  };

  // 필터링된 체크리스트 목록
  const filteredChecklists = checklists.filter(checklist => {
    // 검색어 필터링
    const matchesSearch = searchTerm === "" || 
      checklist.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      checklist.inputter.toLowerCase().includes(searchTerm.toLowerCase());

    // 위치 필터링
    const matchesWorkplace = filterWorkplace === "" || checklist.workplace === filterWorkplace;

    // 구분 필터링
    const matchesCategory = filterCategory === "" || checklist.category === filterCategory;

    // 시간대 필터링
    const matchesTimeSlot = filterTimeSlot === "" || checklist.timeSlot === filterTimeSlot;

    // 태그 필터링 (AND 조건: 선택된 모든 태그를 포함해야 함)
    const matchesTags = selectedFilterTags.length === 0 || 
      (checklist.tags && selectedFilterTags.every(tagId => 
        checklist.tags!.some(tag => tag.id === tagId)
      ));

    return matchesSearch && matchesWorkplace && matchesCategory && matchesTimeSlot && matchesTags;
  });

  // 필터 초기화
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedFilterTags([]);
    setFilterWorkplace("");
    setFilterCategory("");
    setFilterTimeSlot("");
  };

  // 태그 클릭 시 필터 적용
  const handleTagClick = (tagId: string) => {
    if (selectedFilterTags.includes(tagId)) {
      // 이미 선택된 태그면 제거
      setSelectedFilterTags(selectedFilterTags.filter(id => id !== tagId));
    } else {
      // 선택되지 않은 태그면 추가
      setSelectedFilterTags([...selectedFilterTags, tagId]);
    }
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
                  위치 *
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

            {/* 태그 선택 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  태그 선택 (선택사항)
                </label>
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
              <div className="border border-gray-300 rounded-lg p-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              selectedTags: [...formData.selectedTags, tag.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedTags: formData.selectedTags.filter(id => id !== tag.id)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="text-sm text-gray-700">{tag.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    등록된 태그가 없습니다. 위의 "태그 추가" 버튼을 클릭하여 새 태그를 생성해주세요.
                  </p>
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
              {submitting ? "등록 중..." : "체크리스트 등록"}
            </button>
          </form>
        </div>

        {/* 필터링 섹션 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">필터링</h2>
            <div className="flex items-center gap-2">
              {/* 초기화 버튼 - 항상 표시 */}
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                title="필터 초기화"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                초기화
              </button>
              
              {/* 필터 접기/펼치기 버튼 */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                title={showFilters ? "필터 접기" : "필터 펼치기"}
              >
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
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
            <div className="space-y-4">
              {/* 검색 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="체크리스트 내용 또는 입력자로 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                />
              </div>

              {/* 필터 옵션들 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
                <select
                  value={filterWorkplace}
                  onChange={(e) => setFilterWorkplace(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">구분</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                >
                  <option value="">전체</option>
                  {categoryOptions.map((option) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (모든 선택된 태그를 포함하는 항목만 표시)
                  {selectedFilterTags.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 font-normal">
                      {selectedFilterTags.length}개 선택됨
                      {selectedFilterTags.length > 0 && (
                        <button
                          onClick={() => setSelectedFilterTags([])}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="선택된 태그 모두 해제"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  )}
                </label>
                <div className="border border-gray-300 rounded-lg p-3">
                  <div className={`grid grid-cols-2 gap-2 ${!showAllTags ? 'max-h-24 overflow-hidden' : ''}`}>
                    {tags.map((tag) => (
                      <label key={tag.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedFilterTags.includes(tag.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilterTags([...selectedFilterTags, tag.id]);
                            } else {
                              setSelectedFilterTags(selectedFilterTags.filter(id => id !== tag.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <span className="text-sm text-gray-700">{tag.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {tags.length > 6 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setShowAllTags(!showAllTags)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {showAllTags ? '접기' : `더보기 (${tags.length - 6}개 더)`}
                      </button>
                    </div>
                  )}
                  
                  {/* 선택된 태그 표시 */}
                  {selectedFilterTags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-600 mb-2">선택된 태그:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedFilterTags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${tag.color}40`,
                                color: tag.color,
                                border: `1px solid ${tag.color}40`
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: tag.color }}
                              ></div>
                              {tag.name}
                              <button
                                onClick={() => handleTagClick(tagId)}
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                title="태그 제거"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>


            </div>
          )}
        </div>

        {/* 체크리스트 목록 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">등록된 체크리스트 목록</h2>
            <span className="text-sm text-gray-600">
              총 {filteredChecklists.length}개 (전체 {checklists.length}개)
            </span>
          </div>
          
                      {filteredChecklists.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {checklists.length === 0 ? "등록된 체크리스트가 없습니다." : "필터 조건에 맞는 체크리스트가 없습니다."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChecklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                  {editingId === checklist.id ? (
                    // 수정 모드
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">위치</label>
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

                      {/* 수정 모드에서 태그 선택 */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            태그 선택 (선택사항)
                          </label>
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
                        <div className="border border-gray-300 rounded-lg p-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {tags.map((tag) => (
                              <label key={tag.id} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                                <input
                                  type="checkbox"
                                  checked={editingData.selectedTags.includes(tag.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditingData({
                                        ...editingData,
                                        selectedTags: [...editingData.selectedTags, tag.id]
                                      });
                                    } else {
                                      setEditingData({
                                        ...editingData,
                                        selectedTags: editingData.selectedTags.filter(id => id !== tag.id)
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex items-center space-x-1">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  ></div>
                                  <span className="text-sm text-gray-700">{tag.name}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          {tags.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                              등록된 태그가 없습니다. 위의 "태그 추가" 버튼을 클릭하여 새 태그를 생성해주세요.
                            </p>
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
                          <p className="text-gray-800 font-medium mb-2">{checklist.content}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {getWorkplaceLabel(checklist.workplace)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {getCategoryLabel(checklist.category)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {getTimeSlotLabel(checklist.timeSlot)}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {checklist.inputter}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(checklist.inputDate).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          {/* 태그 표시 */}
                          {checklist.tags && checklist.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {checklist.tags.map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => handleTagClick(tag.id)}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                    selectedFilterTags.includes(tag.id) 
                                      ? 'ring-2 ring-blue-500 ring-offset-1' 
                                      : 'hover:shadow-md'
                                  }`}
                                  style={{
                                    backgroundColor: selectedFilterTags.includes(tag.id) 
                                      ? `${tag.color}40` 
                                      : `${tag.color}20`,
                                    color: tag.color,
                                    border: `1px solid ${tag.color}40`
                                  }}
                                  title={`${tag.name} 태그로 필터링`}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{ backgroundColor: tag.color }}
                                  ></div>
                                  {tag.name}
                                  {selectedFilterTags.includes(tag.id) && (
                                    <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(checklist)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(checklist.id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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

      {/* 태그 생성 모달 */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">새 태그 생성</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 이름 *
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="태그 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 색상
                </label>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={createTag}
                disabled={creatingTag}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creatingTag ? "생성 중..." : "생성"}
              </button>
              <button
                onClick={() => {
                  setShowTagModal(false);
                  setNewTagName("");
                  setNewTagColor("#3B82F6");
                  setError("");
                }}
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