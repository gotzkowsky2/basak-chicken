'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SubmissionHistory } from '@/types/submission';

interface SubmissionModalProps {
  submission: SubmissionHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionModal({ submission, isOpen, onClose }: SubmissionModalProps) {
  const [currentUser, setCurrentUser] = useState<string>('');

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/employee/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.name);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };

    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  if (!submission || !isOpen) return null;

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

  const getStatusIcon = (isCompleted: boolean) => {
    if (isCompleted) {
      return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
    } else {
      return <XCircleIcon className="w-6 h-6 text-red-500" />;
    }
  };

  const getConnectedItemIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <span className="text-blue-600">📦</span>;
      case 'precaution':
        return <span className="text-yellow-600">⚠️</span>;
      case 'manual':
        return <span className="text-purple-600">📖</span>;
      default:
        return <span className="text-gray-600">🔗</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 모달 컨테이너 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {submission.isCompleted ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
              <h2 className="text-xl font-bold text-gray-900">
                {submission.templateName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* 모달 내용 */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* 체크리스트 정보 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(submission.date).toLocaleDateString('ko-KR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {submission.employeeName}
                  </div>
                  <div className="flex items-center gap-1">
                    📍 {getWorkplaceLabel(submission.workplace)}
                  </div>
                  <div className="flex items-center gap-1">
                    ⏰ {getTimeSlotLabel(submission.timeSlot)}
                  </div>
                  {submission.submittedAt && (
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      제출: {new Date(submission.submittedAt).toLocaleString('ko-KR')}
                    </div>
                  )}
                </div>

                {/* 진행률 */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">전체 진행률</span>
                    <span className="text-gray-600">
                      {submission.progress.mainItems}/{submission.progress.totalMainItems} 항목 완료
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${submission.progress.totalMainItems > 0 
                          ? Math.round((submission.progress.mainItems / submission.progress.totalMainItems) * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 체크리스트 항목들 */}
              <div className="space-y-4">
                {submission.details.mainItems.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    {/* 메인 항목 */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(item.isCompleted)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {index + 1}. {item.content}
                        </h3>
                        
                        {item.isCompleted && item.completedAt && (
                          <div className="text-sm mb-2 text-green-600">
                            ✅ 완료: {new Date(item.completedAt).toLocaleString('ko-KR')}
                            {item.completedBy && (
                              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                item.completedBy === currentUser 
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {item.completedBy}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {item.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            📝 <span className="font-medium">메모:</span> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 연결된 항목들 */}
                    {submission.details.connectedItems.filter(connected => 
                      connected.parentItemId === item.id
                    ).length > 0 && (
                      <div className="ml-10">
                        <div className="border-l-2 border-gray-200 pl-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            연결된 세부 항목
                          </h4>
                          <div className="space-y-3">
                            {submission.details.connectedItems
                              .filter(connected => connected.parentItemId === item.id)
                              .map((connectedItem) => (
                                <div key={connectedItem.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-shrink-0 mt-1">
                                    {getStatusIcon(connectedItem.isCompleted)}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-gray-900">
                                        {connectedItem.title}
                                      </span>
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                        {getConnectedItemIcon(connectedItem.type)}
                                        {connectedItem.type === 'inventory' ? ' 재고' : 
                                         connectedItem.type === 'precaution' ? ' 주의' : 
                                         connectedItem.type === 'manual' ? ' 매뉴얼' : ' 연결'}
                                      </span>
                                    </div>
                                    
                                    {/* 재고 업데이트 정보 */}
                                    {connectedItem.type === 'inventory' && (
                                      <div className="text-sm text-blue-600 mb-1 p-2 bg-blue-50 rounded border border-blue-200">
                                        📦 <span className="font-medium">재고 변경:</span> 
                                        <span className="line-through text-gray-500 ml-1">{connectedItem.previousStock || 0}</span> 
                                        <span className="mx-1">→</span> 
                                        <span className="font-bold text-blue-700">{connectedItem.updatedStock || 0}</span>
                                      </div>
                                    )}
                                    
                                    {connectedItem.isCompleted && connectedItem.completedAt && (
                                      <div className="text-xs text-green-600">
                                        완료: {new Date(connectedItem.completedAt).toLocaleString('ko-KR')}
                                        {connectedItem.completedBy && (
                                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                            connectedItem.completedBy === currentUser 
                                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                              : 'bg-red-100 text-red-700 border border-red-200'
                                          }`}>
                                            {connectedItem.completedBy}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {connectedItem.notes && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        📝 {connectedItem.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 