'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { SubmissionHistory, SubmissionFilter } from '@/types/submission';
import SubmissionModal from '@/components/submissions/SubmissionModal';

export default function EmployeeSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<SubmissionFilter>({});
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 제출내역 조회
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.date) params.append('date', filters.date);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/submissions?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('제출내역 조회에 실패했습니다.');
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 상세 보기 토글
  const toggleExpansion = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 체크리스트 형태로 보기
  const viewAsChecklist = (submission: SubmissionHistory) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  // 통계 계산
  const calculateStats = () => {
    const total = submissions.length;
    const completed = submissions.filter(s => s.isCompleted).length;
    const today = submissions.filter(s => s.date === new Date().toISOString().split('T')[0]).length;
    
    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      today
    };
  };

  // 상태 아이콘 및 색상
  const getStatusIcon = (isCompleted: boolean, isSubmitted: boolean) => {
    if (isCompleted) {
      return { icon: CheckCircleIcon, color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (isSubmitted) {
      return { icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else {
      return { icon: XCircleIcon, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  // 위치 및 시간대 라벨
  const getWorkplaceLabel = (workplace: string) => {
    const labels: Record<string, string> = {
      'HALL': '홀',
      'KITCHEN': '주방',
      'COMMON': '공통'
    };
    return labels[workplace] || workplace;
  };

  const getTimeSlotLabel = (timeSlot: string) => {
    const labels: Record<string, string> = {
      'MORNING': '오전',
      'AFTERNOON': '오후',
      'EVENING': '저녁',
      'COMMON': '공통'
    };
    return labels[timeSlot] || timeSlot;
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 내 제출내역</h1>
          <p className="text-gray-600">내가 제출한 체크리스트 내역을 확인할 수 있습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 제출</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}개</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료율</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">오늘 제출</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}개</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 항목</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}개</p>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">필터</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">시작 날짜</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">종료 날짜</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* 제출내역 목록 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">제출내역</h2>
          </div>

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {submissions.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">제출내역이 없습니다.</p>
              </div>
            ) : (
              submissions.map((submission) => {
                const statusInfo = getStatusIcon(submission.isCompleted, submission.isSubmitted);
                const StatusIcon = statusInfo.icon;
                const progressRate = submission.progress.totalMainItems > 0 
                  ? Math.round((submission.progress.mainItems / submission.progress.totalMainItems) * 100)
                  : 0;

                return (
                  <div key={submission.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {/* 날짜 - 가장 눈에 띄게 */}
                        <div className="mb-3">
                          {(() => {
                            const today = new Date().toISOString().split('T')[0];
                            const isToday = submission.date === today;
                            const isPast = submission.date < today;
                            
                            return (
                              <div className={`text-2xl font-bold ${
                                isToday ? 'text-blue-600' : 
                                isPast ? 'text-gray-500' : 'text-gray-700'
                              }`}>
                                {new Date(submission.date).toLocaleDateString('ko-KR', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric',
                                  weekday: 'long'
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* 템플릿 정보 */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {submission.templateName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              📍 {getWorkplaceLabel(submission.workplace)} • ⏰ {getTimeSlotLabel(submission.timeSlot)}
                            </p>
                          </div>
                        </div>

                        {/* 제출 시간 */}
                        <div className="mb-3">
                          {submission.submittedAt ? (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">제출 시간:</span> {new Date(submission.submittedAt).toLocaleString('ko-KR')}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              아직 제출하지 않음
                            </div>
                          )}
                        </div>

                        {/* 함께 작업한 직원들 */}
                        {submission.collaboratingEmployees.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">참여 직원:</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {submission.collaboratingEmployees.map((emp, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full"
                                >
                                  <UserIcon className="w-3 h-3" />
                                  {emp.name} ({emp.count}개)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">진행률:</span>
                            <span className="text-sm text-gray-600">
                              {submission.progress.mainItems}/{submission.progress.totalMainItems} 항목 완료
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{progressRate}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => viewAsChecklist(submission)}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                        체크리스트 보기
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 제출내역 모달 */}
      <SubmissionModal
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
} 