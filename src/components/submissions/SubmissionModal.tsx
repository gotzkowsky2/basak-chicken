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
  // 상세 보기용 뷰어 상태 (메뉴얼/주의사항/메인 항목)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerType, setViewerType] = useState<'manual' | 'precaution' | 'main' | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerData, setViewerData] = useState<any>(null);
  const [viewerTitle, setViewerTitle] = useState<string>('');
  const [viewerContent, setViewerContent] = useState<string>('');

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
      return <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />;
    } else {
      return <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />;
    }
  };

  const getConnectedItemIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <span className="text-blue-600">📦</span>;
      case 'precaution':
        return <span className="text-orange-600">⚠️</span>;
      case 'manual':
        return <span className="text-purple-600">📖</span>;
      default:
        return <span className="text-gray-600">🔗</span>;
    }
  };

  const getConnectedItemBadgeStyle = (type: string) => {
    switch (type) {
      case 'inventory':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'precaution':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'manual':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 연결 항목(메뉴얼/주의사항) 상세 보기
  const openConnectedItemViewer = async (itemType: 'manual' | 'precaution', id: string) => {
    try {
      setViewerLoading(true);
      setViewerOpen(true);
      setViewerType(itemType);
      setViewerId(id);
      setViewerData(null);
      setViewerTitle('');
      setViewerContent('');
      const res = await fetch(`/api/employee/connected-items?type=${itemType}&id=${id}`, { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setViewerData(data);
        setViewerTitle(data.title || data.name || '');
        setViewerContent(data.content || '');
      } else {
        setViewerData(null);
      }
    } catch (e) {
      console.error('연결 항목 조회 오류:', e);
      setViewerData(null);
    } finally {
      setViewerLoading(false);
    }
  };

  // 메인 항목 상세 보기 (간단 포맷)
  const openMainItemViewer = (item: { id: string; content: string; isCompleted: boolean; completedAt: string; notes: string; completedBy?: string; }) => {
    setViewerOpen(true);
    setViewerType('main');
    setViewerId(item.id);
    setViewerTitle(item.content);
    setViewerContent('');
    setViewerData({
      isCompleted: item.isCompleted,
      completedAt: item.completedAt,
      completedBy: item.completedBy,
      notes: item.notes
    });
  };

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 배경 오버레이 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* 모달 컨테이너 - 모바일 최적화 */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
          {/* 헤더 - 모바일 최적화 */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {submission.isCompleted ? (
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" />
              )}
              <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {submission.templateName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            >
              <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* 모달 내용 - 모바일 최적화 */}
          <div className="overflow-y-auto max-h-[calc(95vh-60px)] sm:max-h-[calc(90vh-80px)]">
            <div className="p-3 sm:p-6">
              {/* 체크리스트 정보 - 모바일 최적화 */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(submission.date).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{submission.employeeName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span className="truncate">{getWorkplaceLabel(submission.workplace)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏰</span>
                    <span className="truncate">{getTimeSlotLabel(submission.timeSlot)}</span>
                  </div>
                  {submission.submittedAt && (
                    <div className="flex items-center gap-1 sm:col-span-2 lg:col-span-1">
                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        제출: {new Date(submission.submittedAt).toLocaleString('ko-KR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* 진행률 - 모바일 최적화 */}
                <div>
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
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

              {/* 체크리스트 항목들 - 모바일 최적화 */}
              <div className="space-y-3 sm:space-y-4">
                {submission.details.mainItems.map((item, index) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                    {/* 메인 항목 - 모바일 최적화 */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(item.isCompleted)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 break-words cursor-pointer hover:underline"
                          title="상세 보기"
                          onClick={() => openMainItemViewer(item)}
                        >
                          {index + 1}. {item.content}
                        </h3>
                        
                        {item.isCompleted && item.completedAt && (
                          <div className="text-xs sm:text-sm mb-2 text-green-600">
                            <div className="flex flex-wrap items-center gap-1">
                              <span>✅ 완료:</span>
                              <span>{new Date(item.completedAt).toLocaleString('ko-KR')}</span>
                            </div>
                            {item.completedBy && (
                              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
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
                          <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">
                            <div className="flex items-start gap-1">
                              <span>📝</span>
                              <div>
                                <span className="font-medium">메모:</span> 
                                <span className="break-words">{item.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 연결된 항목들 - 모바일 최적화 */}
                    {submission.details.connectedItems.filter(connected => 
                      connected.parentItemId === item.id
                    ).length > 0 && (
                      <div className="ml-6 sm:ml-10">
                        <div className="border-l-2 border-gray-200 pl-3 sm:pl-4">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                            연결된 세부 항목
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            {submission.details.connectedItems
                              .filter(connected => connected.parentItemId === item.id)
                              .map((connectedItem) => (
                                <div
                                  key={connectedItem.id}
                                  className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                                  onClick={() => {
                                    if (connectedItem.type === 'manual' || connectedItem.type === 'precaution') {
                                      openConnectedItemViewer(connectedItem.type, connectedItem.itemId);
                                    }
                                  }}
                                >
                                  <div className="flex-shrink-0 mt-1">
                                    {getStatusIcon(connectedItem.isCompleted)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                                      <span className="text-xs sm:text-sm font-medium text-gray-900 break-words">
                                        {connectedItem.title}
                                      </span>
                                      <span className={`text-xs px-1 sm:px-2 py-1 rounded flex-shrink-0 ${getConnectedItemBadgeStyle(connectedItem.type)}`}>
                                        {getConnectedItemIcon(connectedItem.type)}
                                        <span className="ml-1">
                                          {connectedItem.type === 'inventory' ? '재고' : 
                                           connectedItem.type === 'precaution' ? '주의' : 
                                           connectedItem.type === 'manual' ? '매뉴얼' : '연결'}
                                        </span>
                                      </span>
                                    </div>
                                    
                                    {/* 재고 업데이트 정보 - 모바일 최적화 */}
                                    {connectedItem.type === 'inventory' && (
                                      <div className="text-xs sm:text-sm text-blue-600 mb-1 p-2 bg-blue-50 rounded border border-blue-200">
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span className="text-blue-600">📦</span>
                                          <span className="font-medium text-blue-700">재고 변경:</span> 
                                          <span className="line-through text-gray-500">{connectedItem.previousStock ?? 0}</span> 
                                          <span className="text-blue-600">→</span> 
                                          <span className="font-bold text-blue-800">{connectedItem.updatedStock ?? 0}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {connectedItem.isCompleted && connectedItem.completedAt && (
                                      <div className="text-xs text-green-600">
                                        <div className="flex flex-wrap items-center gap-1">
                                          <span>완료:</span>
                                          <span>{new Date(connectedItem.completedAt).toLocaleString('ko-KR')}</span>
                                        </div>
                                        {connectedItem.completedBy && (
                                          <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
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
                                      <div className="text-xs text-gray-500 mt-1 break-words">
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
    {viewerOpen && (
      <div className="fixed inset-0 z-[60]">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setViewerOpen(false)} />
        <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${viewerType==='manual' ? 'bg-purple-500 text-white' : viewerType==='precaution' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {viewerType === 'manual' ? 'M' : viewerType === 'precaution' ? 'P' : 'C'}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {viewerType === 'main' ? (viewerTitle || '체크리스트 항목') : (viewerTitle || '제목 없음')}
                </h2>
              </div>
              <button onClick={() => setViewerOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {viewerLoading ? (
                <div className="text-center text-sm text-gray-500">불러오는 중...</div>
              ) : viewerType === 'main' ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 text-sm">
                    {viewerTitle}
                  </div>
                  {viewerData?.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-800">
                      <div className="font-medium text-blue-700 mb-1">메모</div>
                      <div className="whitespace-pre-wrap">{viewerData.notes}</div>
                    </div>
                  )}
                  {(viewerData?.completedBy || viewerData?.completedAt) && (
                    <div className="text-xs text-gray-600">
                      {viewerData?.completedBy && <div>✅ 완료자: <span className="font-medium text-green-700">{viewerData.completedBy}</span></div>}
                      {viewerData?.completedAt && <div>⏰ 완료시간: {new Date(viewerData.completedAt).toLocaleString('ko-KR')}</div>}
                    </div>
                  )}
                </div>
              ) : viewerType === 'manual' || viewerType === 'precaution' ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 text-sm">
                    {viewerContent || '내용이 없습니다.'}
                  </div>
                  {viewerType === 'manual' && viewerData?.precautions && (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-800">연결된 주의사항</div>
                      {viewerData.precautions.length > 0 ? viewerData.precautions.map((p: any, idx: number) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                          <div className="text-red-900 text-sm font-medium mb-1">{p.title}</div>
                          <div className="text-red-800 text-xs whitespace-pre-wrap">{p.content}</div>
                        </div>
                      )) : (
                        <div className="text-xs text-gray-500">연결된 주의사항이 없습니다.</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500">데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
} 