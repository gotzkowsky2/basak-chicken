"use client";
import { useState, useEffect } from "react";

interface ChecklistTemplate {
  id: string;
  content: string;
  workplace: string;
  category: string;
  timeSlot: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface ChecklistItem {
  templateId: string;
  isCompleted: boolean;
  notes: string;
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

const categoryLabels = {
  CHECKLIST: "체크리스트",
  PRECAUTIONS: "주의사항",
  HYGIENE: "위생규정",
  SUPPLIES: "부대용품",
  INGREDIENTS: "재료",
  COMMON: "공통",
  MANUAL: "매뉴얼",
};

export default function ChecklistPage() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 필터 상태
  const [filters, setFilters] = useState({
    workplace: "HALL",
    timeSlot: "PREPARATION",
    category: "CHECKLIST", // 기본값은 체크리스트
  });

  // 체크리스트 항목 상태 (체크 + 메모)
  const [checklistItems, setChecklistItems] = useState<{[key: string]: ChecklistItem}>({});
  const [notes, setNotes] = useState("");
  const [showMemoInputs, setShowMemoInputs] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetchChecklists();
  }, [filters]);

  const fetchChecklists = async () => {
    try {
      const params = new URLSearchParams({
        workplace: filters.workplace,
        timeSlot: filters.timeSlot,
        category: filters.category,
      });

      const response = await fetch(`/api/employee/checklists?${params}`, { 
        credentials: "include" 
      });
      
      if (response.ok) {
        const data = await response.json();
        const checklistsData = data.checklists || [];
        setChecklists(checklistsData);
        setEmployee(data.employee);
        
        // 체크리스트 항목 초기화
        const initialItems: {[key: string]: ChecklistItem} = {};
        checklistsData.forEach((item: ChecklistTemplate) => {
          initialItems[item.id] = {
            templateId: item.id,
            isCompleted: false,
            notes: "",
          };
        });
        setChecklistItems(initialItems);
        console.log('초기화된 체크리스트 항목:', initialItems);
      } else {
        setError("체크리스트를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isCompleted: !prev[id].isCompleted
      }
    }));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes
      }
    }));
  };

  const toggleMemoInput = (id: string) => {
    setShowMemoInputs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const completedItems = Object.values(checklistItems).filter(item => item.isCompleted);

    if (completedItems.length === 0) {
      setError("체크된 항목이 없습니다. 제출할 수 없습니다.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/employee/checklist-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          workplace: filters.workplace,
          timeSlot: filters.timeSlot,
          category: filters.category,
          completedItems,
          notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("체크리스트가 성공적으로 제출되었습니다.");
        setNotes("");
        // 체크리스트 항목 초기화
        const initialItems: {[key: string]: ChecklistItem} = {};
        checklists.forEach((item: ChecklistTemplate) => {
          initialItems[item.id] = {
            templateId: item.id,
            isCompleted: false,
            notes: "",
          };
        });
        setChecklistItems(initialItems);
        // 3초 후 성공 메시지 제거
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "체크리스트 제출에 실패했습니다.");
      }
    } catch (error) {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const getWorkplaceLabel = (value: string) => {
    return workplaceOptions.find(option => option.value === value)?.label || value;
  };

  const getTimeSlotLabel = (value: string) => {
    return timeSlotOptions.find(option => option.value === value)?.label || value;
  };

  const getCategoryLabel = (value: string) => {
    return categoryLabels[value as keyof typeof categoryLabels] || value;
  };

  // 모든 항목이 체크되었는지 확인
  const allItemsChecked = Object.values(checklistItems).length > 0 && 
    Object.values(checklistItems).every(item => item.isCompleted);

  // 디버깅용 로그
  console.log('체크리스트 항목 상태:', checklistItems);
  console.log('모든 항목이 체크되었나요?', allItemsChecked);
  console.log('총 항목 수:', Object.values(checklistItems).length);
  console.log('체크된 항목 수:', Object.values(checklistItems).filter(item => item.isCompleted).length);

  // 오늘 날짜 포맷팅
  const today = new Date();
  const formattedDate = today.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">체크리스트</h1>
        <p className="text-lg text-gray-600 mb-8">{formattedDate}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">필터 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위치
              </label>
              <select
                value={filters.workplace}
                onChange={(e) => setFilters({ ...filters, workplace: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
                시간대
              </label>
              <select
                value={filters.timeSlot}
                onChange={(e) => setFilters({ ...filters, timeSlot: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
                구분
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
              >
                <option value="CHECKLIST" className="text-gray-800">체크리스트</option>
                <option value="PRECAUTIONS" className="text-gray-800">주의사항</option>
                <option value="HYGIENE" className="text-gray-800">위생규정</option>
                <option value="SUPPLIES" className="text-gray-800">부대용품</option>
                <option value="INGREDIENTS" className="text-gray-800">재료</option>
                <option value="COMMON" className="text-gray-800">공통</option>
                <option value="MANUAL" className="text-gray-800">매뉴얼</option>
              </select>
            </div>
          </div>
        </div>

        {/* 체크리스트 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {getWorkplaceLabel(filters.workplace)} - {getTimeSlotLabel(filters.timeSlot)} {getCategoryLabel(filters.category)}
            </h2>
            {employee && (
              <div className="text-sm text-gray-600">
                {employee.name}님 ({employee.department})
              </div>
            )}
          </div>

          {checklists.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              해당 조건의 체크리스트가 없습니다.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                {checklists.map((checklist) => (
                  <div key={checklist.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3 mb-3">
                      <input
                        type="checkbox"
                        id={checklist.id}
                        checked={checklistItems[checklist.id]?.isCompleted || false}
                        onChange={() => handleCheckboxChange(checklist.id)}
                        className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all duration-150 active:scale-95"
                      />
                      <div className="flex-1">
                        <label htmlFor={checklist.id} className="block text-gray-800 font-medium cursor-pointer">
                          {checklist.content}
                        </label>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {getCategoryLabel(checklist.category)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {getWorkplaceLabel(checklist.workplace)} • {getTimeSlotLabel(checklist.timeSlot)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleMemoInput(checklist.id)}
                            className={`text-xs font-medium px-3 py-2 rounded-lg transition-all duration-150 active:scale-95 min-h-[32px] ${
                              checklistItems[checklist.id]?.notes 
                                ? 'text-green-600 hover:text-green-800 hover:bg-green-50 active:bg-green-100' 
                                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 active:bg-blue-100'
                            }`}
                          >
                            메모 {checklistItems[checklist.id]?.notes && '(있음)'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* 개별 메모 입력 필드 (접을 수 있음) */}
                    {showMemoInputs[checklist.id] && (
                      <div className="ml-7 mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          메모 (선택사항)
                        </label>
                        <textarea
                          value={checklistItems[checklist.id]?.notes || ""}
                          onChange={(e) => handleNotesChange(checklist.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm"
                          rows={2}
                          placeholder="이 항목에 대한 메모를 입력하세요..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전체 메모 (선택사항)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                  rows={3}
                  placeholder="전체 체크리스트에 대한 추가 메모를 입력하세요..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !allItemsChecked}
                className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-150 font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] active:scale-95"
              >
                {submitting ? "제출 중..." : !allItemsChecked ? "모든 항목을 체크해야 제출할 수 있습니다" : "체크리스트 제출"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 