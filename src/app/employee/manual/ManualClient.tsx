"use client";
import { useState, useEffect } from "react";

interface Manual {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  author: string;
  isImportant: boolean;
}

export default function ManualClient() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);

  // 임시 데이터 (나중에 API로 교체)
  useEffect(() => {
    const mockManuals: Manual[] = [
      {
        id: "1",
        title: "치킨 튀김 기본 매뉴얼",
        category: "조리법",
        content: `1. 기름 온도 확인 (170-180도)
2. 닭고기 해동 완료 확인
3. 튀김가루를 골고루 묻히기
4. 8-10분간 튀기기
5. 기름이 완전히 빠질 때까지 건지기
6. 소스 선택하여 제공

주의사항:
- 기름 온도는 반드시 확인
- 과도한 튀김은 피하기
- 위생장갑 착용 필수`,
        lastUpdated: "2024-01-15",
        author: "주방장",
        isImportant: true
      },
      {
        id: "2",
        title: "고객 응대 매뉴얼",
        category: "서비스",
        content: `1. 고객 입장 시 "어서오세요" 인사
2. 주문 확인 시 메뉴와 수량 정확히 확인
3. 대기 시간 안내 (15-20분)
4. 주문 완료 시 "잠시만 기다려주세요"
5. 음식 제공 시 "맛있게 드세요"
6. 계산 완료 시 "감사합니다, 또 오세요"

주의사항:
- 항상 친절한 미소 유지
- 고객 질문에 정확히 답변
- 불만 사항 발생 시 관리자 호출`,
        lastUpdated: "2024-01-14",
        author: "매니저",
        isImportant: true
      },
      {
        id: "3",
        title: "위생 관리 매뉴얼",
        category: "위생",
        content: `1. 출근 시 위생복 착용
2. 작업 전 손 씻기 (30초 이상)
3. 장갑 착용 후 작업
4. 작업대 정리정돈
5. 폐기물 분리수거
6. 퇴근 전 청소 완료

주의사항:
- 식품 취급 전 반드시 손 씻기
- 장갑은 1회용 사용
- 위생복은 매일 세탁`,
        lastUpdated: "2024-01-13",
        author: "위생관리자",
        isImportant: true
      },
      {
        id: "4",
        title: "포스기 사용법",
        category: "시스템",
        content: `1. 출근 시 포스기 로그인
2. 주문 입력 시 메뉴 선택
3. 수량 입력 후 확인
4. 결제 방법 선택
5. 영수증 출력
6. 퇴근 시 로그아웃

주의사항:
- 주문 입력 시 정확히 확인
- 결제 오류 시 관리자 호출
- 영수증은 반드시 제공`,
        lastUpdated: "2024-01-12",
        author: "시스템관리자",
        isImportant: false
      }
    ];
    
    setTimeout(() => {
      setManuals(mockManuals);
      setLoading(false);
    }, 500);
  }, []);

  const categories = ["all", "조리법", "서비스", "위생", "시스템"];
  
  const filteredManuals = selectedCategory === "all" 
    ? manuals 
    : manuals.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">업무 매뉴얼</h1>
          <p className="text-gray-600">업무 수행에 필요한 매뉴얼을 확인하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 사이드바 - 매뉴얼 목록 */}
          <div className="lg:col-span-1">
            {/* 카테고리 필터 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">카테고리</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === "all" ? "전체" : category}
                  </button>
                ))}
              </div>
            </div>

            {/* 매뉴얼 목록 */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">매뉴얼 목록</h3>
              <div className="space-y-2">
                {filteredManuals.map((manual) => (
                  <button
                    key={manual.id}
                    onClick={() => setSelectedManual(manual)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedManual?.id === manual.id
                        ? 'bg-indigo-50 border border-indigo-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {manual.title}
                          {manual.isImportant && (
                            <span className="ml-2 text-red-500 text-xs">중요</span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{manual.category}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 - 매뉴얼 상세 */}
          <div className="lg:col-span-2">
            {selectedManual ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {selectedManual.title}
                        {selectedManual.isImportant && (
                          <span className="ml-2 text-red-500 text-sm font-medium">중요</span>
                        )}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>카테고리: {selectedManual.category}</span>
                        <span>작성자: {selectedManual.author}</span>
                        <span>최종 수정: {selectedManual.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {selectedManual.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">매뉴얼을 선택하세요</h3>
                <p className="text-gray-500">왼쪽 목록에서 확인하고 싶은 매뉴얼을 선택하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 