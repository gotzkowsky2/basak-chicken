'use client';

import { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ChevronLeftIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SubmissionHistory } from '@/types/submission';

interface SubmissionDetailViewProps {
  submission: SubmissionHistory;
  onBack: () => void;
}

export default function SubmissionDetailView({ submission, onBack }: SubmissionDetailViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              뒤로가기
            </button>
            <div className="flex items-center gap-2">
              {submission.isCompleted ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500" />
              )}
              <span className="text-sm font-medium text-gray-600">
                {submission.isCompleted ? '완료' : '미완료'}
              </span>
            </div>
          </div>

          {/* 체크리스트 정보 */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.templateName}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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
            <div className="mt-4">
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
        </div>

        {/* 체크리스트 항목들 */}
        <div className="space-y-4">
          {submission.details.mainItems.map((item, index) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
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
                    <div className="text-sm text-green-600 mb-2">
                      ✅ 완료: {new Date(item.completedAt).toLocaleString('ko-KR')}
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
                              {connectedItem.type === 'inventory' && 
                               (connectedItem.previousStock !== undefined || connectedItem.updatedStock !== undefined) && (
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
  );
} 