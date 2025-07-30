"use client";
import { useState, useEffect } from "react";

interface ChecklistTemplate {
  id: string;
  name: string; // 템플릿 이름 (예: "홀, 준비")
  content: string;
  workplace: string;
  category: string;
  timeSlot: string;
  isActive: boolean; // 활성 상태 추가
}

interface ChecklistInstance {
  id: string;
  workplace: string;
  timeSlot: string;
  date: string;
  isCompleted: boolean;
  isSubmitted: boolean;
  employeeId: string;
  template: {
    id: string;
    name: string;
    content: string;
  };
}

export default function DevChecklistGeneratorPage() {
  const [targetDate, setTargetDate] = useState<string>("");
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [existingChecklists, setExistingChecklists] = useState<ChecklistInstance[]>([]);

  // 라벨 함수들을 먼저 정의
  const getWorkplaceLabel = (value: string) => {
    const labels: Record<string, string> = {
      "HALL": "홀",
      "KITCHEN": "주방",
      "COMMON": "공통"
    };
    return labels[value] || value;
  };

  const getTimeSlotLabel = (value: string) => {
    const labels: Record<string, string> = {
      "PREPARATION": "준비",
      "IN_PROGRESS": "진행",
      "CLOSING": "마감",
      "COMMON": "공통"
    };
    return labels[value] || value;
  };

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTargetDate(today);
  }, []);

  // 사용 가능한 템플릿 불러오기
  const fetchTemplates = async () => {
    try {
      console.log('템플릿 불러오기 시작...');
      const response = await fetch('/api/admin/checklists', {
        credentials: 'include'
      });

      console.log('API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API 응답 데이터:', data);
        
        // 활성화된 템플릿만 필터링하고 name을 올바른 형태로 변환
        const templates = (data.checklists || [])
          .filter((template: any) => template.isActive) // 활성화된 템플릿만 선택
          .map((template: any) => {
            console.log('처리 중인 템플릿:', template);
            
            // 템플릿 이름을 올바른 형태로 변환
            const workplaceLabel = getWorkplaceLabel(template.workplace);
            const timeSlotLabel = getTimeSlotLabel(template.timeSlot);
            template.name = `${workplaceLabel}, ${timeSlotLabel}`;
            console.log('변환된 이름:', template.name);
            
            return template;
          });
        
        console.log('최종 템플릿 목록:', templates);
        setAvailableTemplates(templates);
      } else {
        console.error('템플릿 불러오기 실패 - 상태:', response.status);
        const errorText = await response.text();
        console.error('에러 응답:', errorText);
      }
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
    }
  };

  // 기존 체크리스트 불러오기
  const fetchExistingChecklists = async (date: string) => {
    try {
      const response = await fetch(`/api/admin/dev-generate-checklists?date=${date}`, {
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

  // 컴포넌트 마운트 시 템플릿 불러오기
  useEffect(() => {
    fetchTemplates();
  }, []);

  // 날짜 변경 시 기존 체크리스트 확인
  useEffect(() => {
    if (targetDate) {
      fetchExistingChecklists(targetDate);
    }
  }, [targetDate]);

  // 템플릿 선택/해제
  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // 전체 템플릿 선택/해제
  const handleSelectAllTemplates = () => {
    if (selectedTemplates.length === availableTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(availableTemplates.map(template => template.id));
    }
  };

  // 템플릿 이름으로 정렬
  const sortedTemplates = [...availableTemplates].sort((a, b) => a.name.localeCompare(b.name));

  // 템플릿 그룹화 (위치별)
  const groupedTemplates = sortedTemplates.reduce((groups, template) => {
    const workplace = getWorkplaceLabel(template.workplace);
    if (!groups[workplace]) {
      groups[workplace] = [];
    }
    groups[workplace].push(template);
    return groups;
  }, {} as Record<string, ChecklistTemplate[]>);

  // 템플릿 그룹별로 고유한 템플릿 이름 생성
  const getUniqueTemplateGroups = () => {
    console.log('getUniqueTemplateGroups 호출됨, availableTemplates:', availableTemplates);
    const templateGroups = new Map<string, ChecklistTemplate[]>();
    
    availableTemplates.forEach(template => {
      // 템플릿 이름을 키로 사용 (예: "주방, 준비")
      const templateKey = template.name;
      console.log('템플릿 키:', templateKey);
      
      if (!templateGroups.has(templateKey)) {
        templateGroups.set(templateKey, []);
      }
      templateGroups.get(templateKey)!.push(template);
    });
    
    console.log('템플릿 그룹:', templateGroups);
    return templateGroups;
  };

  // 템플릿 그룹을 위치별로 정리
  const getGroupedTemplateGroups = () => {
    console.log('getGroupedTemplateGroups 호출됨');
    const uniqueGroups = getUniqueTemplateGroups();
    const grouped = new Map<string, { name: string; templates: ChecklistTemplate[] }[]>();
    
    uniqueGroups.forEach((templates, templateName) => {
      if (templates.length > 0) {
        try {
          const workplace = getWorkplaceLabel(templates[0].workplace);
          console.log('위치:', workplace, '템플릿명:', templateName, '항목수:', templates.length);
          if (!grouped.has(workplace)) {
            grouped.set(workplace, []);
          }
          grouped.get(workplace)!.push({
            name: templateName,
            templates: templates
          });
        } catch (error) {
          console.error('그룹화 중 에러:', error, '템플릿:', templates[0]);
        }
      }
    });
    
    console.log('최종 그룹화 결과:', grouped);
    return grouped;
  };

  // 템플릿 그룹 선택/해제
  const handleTemplateGroupToggle = (templateName: string) => {
    const uniqueGroups = getUniqueTemplateGroups();
    const templatesInGroup = uniqueGroups.get(templateName) || [];
    const templateIdsInGroup = templatesInGroup.map(t => t.id);
    
    // 현재 선택된 템플릿들 중에서 이 그룹의 템플릿들이 모두 선택되어 있는지 확인
    const allSelected = templateIdsInGroup.every(id => selectedTemplates.includes(id));
    
    if (allSelected) {
      // 모두 선택되어 있으면 그룹의 모든 템플릿 제거
      setSelectedTemplates(prev => prev.filter(id => !templateIdsInGroup.includes(id)));
    } else {
      // 일부만 선택되어 있거나 아무것도 선택되지 않았으면 그룹의 모든 템플릿 추가
      setSelectedTemplates(prev => {
        const newSelection = prev.filter(id => !templateIdsInGroup.includes(id));
        return [...newSelection, ...templateIdsInGroup];
      });
    }
  };

  // 템플릿 그룹이 모두 선택되었는지 확인
  const isTemplateGroupSelected = (templateName: string) => {
    const uniqueGroups = getUniqueTemplateGroups();
    const templatesInGroup = uniqueGroups.get(templateName) || [];
    const templateIdsInGroup = templatesInGroup.map(t => t.id);
    
    return templateIdsInGroup.every(id => selectedTemplates.includes(id));
  };

  // 템플릿 그룹이 부분적으로 선택되었는지 확인
  const isTemplateGroupPartiallySelected = (templateName: string) => {
    const uniqueGroups = getUniqueTemplateGroups();
    const templatesInGroup = uniqueGroups.get(templateName) || [];
    const templateIdsInGroup = templatesInGroup.map(t => t.id);
    
    const selectedCount = templateIdsInGroup.filter(id => selectedTemplates.includes(id)).length;
    return selectedCount > 0 && selectedCount < templateIdsInGroup.length;
  };

  // 체크리스트 생성
  const handleGenerateChecklists = async () => {
    if (!targetDate) {
      setMessage({ type: 'error', text: '날짜를 선택해주세요.' });
      return;
    }

    if (selectedTemplates.length === 0) {
      setMessage({ type: 'error', text: '생성할 템플릿을 하나 이상 선택해주세요.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/dev-generate-checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          targetDate,
          templateIds: selectedTemplates
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `테스트용 체크리스트 생성 완료! ${data.generatedCount}개 생성됨` 
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

    if (!confirm(`정말로 ${targetDate} 날짜의 모든 테스트용 체크리스트를 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/dev-delete-checklists', {
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
          text: `테스트용 체크리스트 삭제 완료! ${data.deletedCount}개 삭제됨` 
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🧪 개발용 체크리스트 생성기</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">테스트용 체크리스트 생성</h2>
          
          {/* 날짜 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              생성할 날짜 *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              required
            />
          </div>

          {/* 템플릿 선택 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-medium text-gray-700">
                생성할 템플릿 선택 *
              </label>
              <button
                type="button"
                onClick={handleSelectAllTemplates}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {selectedTemplates.length === availableTemplates.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            {message && (
              <div className={`p-3 rounded-lg mb-4 ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            {/* 템플릿 그룹별 표시 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const groupedData = getGroupedTemplateGroups();
                return Array.from(groupedData.entries()).map(([workplace, groups]) => (
                  <div key={workplace} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                      {workplace}
                    </h3>
                    <div className="space-y-3">
                      {groups.map((group: { name: string; templates: ChecklistTemplate[] }) => (
                        <div 
                          key={group.name} 
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isTemplateGroupSelected(group.name)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                          onClick={() => handleTemplateGroupToggle(group.name)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={isTemplateGroupSelected(group.name)}
                                  onChange={() => handleTemplateGroupToggle(group.name)}
                                  className="mt-1"
                                />
                                <div className="font-bold text-gray-800">
                                  {group.name}
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  {group.templates.length}개 항목
                                </span>
                              </div>
                              
                              {/* 템플릿 ID 표시 (디버깅용) */}
                              <div className="text-xs text-gray-400 ml-6 mb-2">
                                {group.templates.map((template, index) => (
                                  <div key={template.id} className="text-gray-400">
                                    ID: {template.id.substring(0, 8)}... 
                                    {template.isActive ? ' (활성)' : ' (비활성)'}
                                  </div>
                                ))}
                              </div>
                              
                              {/* 포함된 항목들 미리보기 (최대 3개) */}
                              <div className="text-sm text-gray-600 ml-6 mb-2">
                                {group.templates.slice(0, 3).map((template, index) => (
                                  <div key={template.id} className="text-gray-500">
                                    • {template.content}
                                  </div>
                                ))}
                                {group.templates.length > 3 && (
                                  <div className="text-gray-400 text-xs">
                                    ... 외 {group.templates.length - 3}개 항목
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2 ml-6">
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {getWorkplaceLabel(group.templates[0].workplace)}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {getTimeSlotLabel(group.templates[0].timeSlot)}
                                </span>
                              </div>
                            </div>
                            
                            {isTemplateGroupPartiallySelected(group.name) && (
                              <div className="text-xs text-blue-600 font-medium">
                                일부 선택됨
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            {availableTemplates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>등록된 템플릿이 없습니다.</p>
                <p className="text-sm mt-2">
                  <a href="/admin/checklists" className="text-blue-600 hover:underline">
                    체크리스트 관리 페이지
                  </a>에서 템플릿을 먼저 등록해주세요.
                </p>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleGenerateChecklists}
              disabled={loading || selectedTemplates.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  체크리스트 생성 ({selectedTemplates.length}개 템플릿)
                </>
              )}
            </button>

            <button
              onClick={handleDeleteChecklists}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              전체 삭제
            </button>
          </div>
        </div>

        {/* 기존 체크리스트 목록 */}
        {existingChecklists.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {targetDate} 날짜의 기존 체크리스트 ({existingChecklists.length}개)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {existingChecklists.map((checklist) => (
                <div key={checklist.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-2">
                    {checklist.template.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {checklist.template.content}
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {getWorkplaceLabel(checklist.workplace)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {getTimeSlotLabel(checklist.timeSlot)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    상태: {checklist.isCompleted ? '완료' : '미완료'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}