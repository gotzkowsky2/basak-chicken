"use client";
import { useState, useEffect } from "react";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface ChecklistSubmission {
  id: string;
  workplace: string;
  timeSlot: string;
  date: string;
  isCompleted: boolean;
  isSubmitted: boolean;
  employeeId: string;
  template: {
    id: string;
    content: string;
  };
}

export default function ChecklistManagementPage() {
  const [targetDate, setTargetDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [existingChecklists, setExistingChecklists] = useState<ChecklistSubmission[]>([]);
  const [showDeleteMode, setShowDeleteMode] = useState(false);

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTargetDate(today);
  }, []);

  // 기존 체크리스트 불러오기
  const fetchExistingChecklists = async (date: string) => {
    try {
      const response = await fetch(`/api/admin/generate-daily-checklists?date=${date}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setExistingChecklists(data.existingSubmissions || []);
      } else {
        console.error('기존 체크리스트 불러오기 실패');
      }
    } catch (error) {
      console.error('기존 체크리스트 불러오기 오류:', error);
    }
  };

  // 날짜 변경 시 기존 체크리스트 확인
  useEffect(() => {
    if (targetDate) {
      fetchExistingChecklists(targetDate);
    }
  }, [targetDate]);

  // 체크리스트 생성
  const handleGenerateChecklists = async () => {
    if (!targetDate) {
      setMessage({ type: 'error', text: '날짜를 선택해주세요.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/generate-daily-checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetDate })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `체크리스트 생성 완료! ${data.generatedCount}개 생성됨` 
        });
        // 기존 체크리스트 목록 새로고침
        fetchExistingChecklists(targetDate);
      } else {
        setMessage({ type: 'error', text: data.error || '체크리스트 생성에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
      console.error('체크리스트 생성 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 체크리스트 삭제
  const handleDeleteChecklists = async () => {
    if (!targetDate) {
      setMessage({ type: 'error', text: '날짜를 선택해주세요.' });
      return;
    }

    if (!confirm(`정말로 ${targetDate} 날짜의 모든 체크리스트를 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/delete-daily-checklists', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetDate })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `체크리스트 삭제 완료! ${data.deletedCount}개 삭제됨` 
        });
        // 기존 체크리스트 목록 새로고침
        fetchExistingChecklists(targetDate);
      } else {
        setMessage({ type: 'error', text: data.error || '체크리스트 삭제에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' });
      console.error('체크리스트 삭제 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkplaceLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "HALL": "홀",
      "KITCHEN": "주방",
      "COMMON": "공통"
    };
    return labels[value] || value;
  };

  const getTimeSlotLabel = (value: string) => {
    const labels: { [key: string]: string } = {
      "PREPARATION": "준비",
      "IN_PROGRESS": "진행",
      "CLOSING": "마감",
      "COMMON": "공통"
    };
    return labels[value] || value;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">체크리스트 관리</h1>
          <p className="text-gray-600">일일 체크리스트를 생성하고 관리할 수 있습니다.</p>
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* 날짜 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">날짜 선택</h2>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setTargetDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              오늘
            </button>
          </div>
        </div>

        {/* 모드 선택 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">작업 모드</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowDeleteMode(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !showDeleteMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              생성 모드
            </button>
            <button
              onClick={() => setShowDeleteMode(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                showDeleteMode
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              삭제 모드
            </button>
          </div>
        </div>

        {/* 작업 버튼 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {showDeleteMode ? '체크리스트 삭제' : '체크리스트 생성'}
          </h2>
          <div className="flex items-center space-x-4">
            {!showDeleteMode ? (
              <button
                onClick={handleGenerateChecklists}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
              >
                {loading ? '생성 중...' : '체크리스트 생성'}
              </button>
            ) : (
              <button
                onClick={handleDeleteChecklists}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
              >
                {loading ? '삭제 중...' : '체크리스트 삭제'}
              </button>
            )}
          </div>
        </div>

        {/* 기존 체크리스트 목록 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {targetDate} 기존 체크리스트 ({existingChecklists.length}개)
          </h2>
          
          {existingChecklists.length === 0 ? (
            <p className="text-gray-500">해당 날짜에 생성된 체크리스트가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingChecklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {getWorkplaceLabel(checklist.workplace)} - {getTimeSlotLabel(checklist.timeSlot)}
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      checklist.isSubmitted 
                        ? 'bg-green-100 text-green-700' 
                        : checklist.isCompleted
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {checklist.isSubmitted ? '제출됨' : checklist.isCompleted ? '진행중' : '미시작'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {checklist.template.content}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {checklist.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}