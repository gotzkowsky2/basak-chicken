# 현재 프로젝트 상태 (2025-07-30)

## 🎯 현재 작업 중인 문제
**체크리스트 구조가 완전히 잘못되어 있음**

### 📝 체크리스트 구조 (2025-07-30)

#### 올바른 체크리스트 구조:
```
체크리스트 이름: "주방, 준비" (템플릿 이름)
├── 체크리스트 항목 1: "재료 준비" (직접 입력)
│   └── 연결 항목들: "닭고기 재고 확인", "재료 세척 방법" 등 (재고/메뉴얼/주의사항에서 선택)
├── 체크리스트 항목 2: "조리대 정리" (직접 입력)
│   └── 연결 항목들: "정리 절차", "청소도구 재고" 등
└── 체크리스트 항목 3: "바닥 청소" (직접 입력)
    └── 연결 항목들: "청소 방법", "청소도구 확인" 등
```

#### 현재 문제점 (2025-07-30):
1. **체크리스트 항목들이 "연결 항목" 섹션에 잘못 들어가 있음**
2. **구조가 완전히 뒤바뀌어 있음**
3. **구분 옵션이 잘못됨** (체크리스트, 공통 등이어야 함)
4. **새 체크리스트 항목 등록에서도** 연결 항목에 체크리스트를 추가하게 되어 있음

#### 수정해야 할 것:
1. **체크리스트 항목들**을 위로 올리고 직접 입력할 수 있게 만들기
2. **각 체크리스트 항목을 클릭하면** 그 항목에 연결 항목을 추가할 수 있게 만들기
3. **구분 옵션**을 원래대로 복원 (체크리스트, 공통 등)
4. **UI 구조 수정**: 체크리스트 내용 → 체크리스트 항목들 → 각 항목별 연결 항목

## 🎯 이전 작업 중이던 문제
**태그 필터링이 즉시 반응하지 않는 문제**

### 문제 상황
- 태그 선택 시 즉시 필터링이 안됨
- 태그 선택 해제 시에만 필터링이 작동함
- 사용자 피드백: "태그가 적용되는것 같긴 한데 선택을 하면 소팅이 안되고 선택하고 다시 선택을 눌러서 선택을 취소하면 소팅이 돼"

### 시도한 해결책들
1. **첫 번째 시도**: `setTimeout` 사용 → 실패
2. **두 번째 시도**: `async/await`로 즉시 API 호출 → 여전히 문제 있음

## 📁 오늘 완료된 작업들

### 1. 체크리스트 관리 페이지 리팩토링
- **파일**: `src/app/admin/checklists/page.tsx`
- **변경사항**:
  - 등록 폼 제거
  - 검색/필터 섹션 제거
  - "+" 아이콘 버튼 추가 (새 등록 페이지로 이동)
  - 텍스트 제거 (아이콘만 표시)
  - 수정 폼을 새 등록 폼과 동일하게 변경

### 2. 새 체크리스트 등록 페이지 생성
- **파일**: `src/app/admin/checklists/new/page.tsx` (새로 생성)
- **변경사항**:
  - 기존 등록 폼을 별도 페이지로 이동
  - "목록으로 돌아가기" 버튼 추가 (아이콘만 표시)
  - 텍스트 제거

### 3. ItemAddModal 컴포넌트 분리 및 개선
- **파일**: `src/components/ItemAddModal.tsx` (새로 생성)
- **변경사항**:
  - 체크리스트 페이지들에서 모달 컴포넌트 분리
  - "항목 내용" 입력 필드 제거
  - "체크리스트 항목" → "연결 항목"으로 변경
  - "체크리스트 항목이 없습니다" → "연결된 항목이 없습니다"로 변경
  - 카테고리 드롭다운 추가 (전체/재고/주의사항/메뉴얼)
  - 태그 다중 선택 기능 추가
  - 클라이언트 사이드 필터링 구현

### 4. API 개선
- **파일**: `src/app/api/admin/search-connections/route.ts`
- **변경사항**:
  - 빈 쿼리 시 모든 항목 반환하도록 수정
  - `take` 제한을 100으로 증가
  - 태그 필터링 로직 추가 (서버 사이드)

### 5. 중복 템플릿 이름 문제 해결
- **파일**: `src/app/api/admin/checklists/duplicate-name/route.ts` (새로 생성)
- **변경사항**:
  - 실시간 중복 이름 검사 API
  - 수정 모드에서 현재 ID 제외 기능

### 6. 데이터베이스 정리
- **스크립트**: `cleanup-duplicate-templates.js` (실행 완료)
- **결과**: 비활성화된 중복 템플릿들 삭제

### 7. 태그 연결 상태 확인
- **스크립트**: `check-tag-connections.js` (실행 완료)
- **결과**:
  - 재고 아이템: 7개 항목이 태그와 연결됨
  - 주의사항: 태그 연결 없음
  - 메뉴얼: 태그 연결 없음

## 🔧 현재 태그 필터링 문제 분석

### 현재 구현 상태
```typescript
// ItemAddModal.tsx의 toggleTag 함수
const toggleTag = async (tagId: string) => {
  const newTags = selectedTags.includes(tagId) 
    ? selectedTags.filter(id => id !== tagId)
    : [...selectedTags, tagId];
  
  setSelectedTags(newTags);
  
  // 태그 변경 시 즉시 항목 다시 로드
  setIsLoading(true);
  try {
    const params = new URLSearchParams({
      query: searchTerm,
      type: searchType
    });

    if (newTags.length > 0) {
      params.append('tagId', newTags[0]);
    }

    const response = await fetch(`/api/admin/search-connections?${params}`, {
      credentials: 'include'
    });
    // ... 응답 처리
  } catch (error) {
    // ... 에러 처리
  } finally {
    setIsLoading(false);
  }
};
```

### API 구현 상태
```typescript
// search-connections/route.ts
if (tagId && tagId !== 'all') {
  whereCondition.tagRelations = {
    some: {
      tagId: tagId
    }
  };
}
```

## 🚨 문제점 추정

### 가능한 원인들
1. **React 상태 업데이트 타이밍**: `setSelectedTags(newTags)`와 API 호출 사이의 타이밍 문제
2. **API 응답 캐싱**: 브라우저나 Next.js의 캐싱 문제
3. **Prisma 쿼리 문제**: `tagRelations` 쿼리가 제대로 작동하지 않을 수 있음
4. **상태 동기화 문제**: `selectedTags` 상태와 실제 API 호출 파라미터가 불일치

### 디버깅이 필요한 부분
1. **브라우저 개발자 도구**:
   - Network 탭에서 API 호출 확인
   - 실제 전송되는 파라미터 확인
   - 응답 데이터 확인

2. **서버 로그**:
   - API 엔드포인트에서 받는 파라미터 확인
   - Prisma 쿼리 결과 확인

3. **상태 확인**:
   - `selectedTags` 상태가 제대로 업데이트되는지 확인
   - `allItems` 상태가 제대로 업데이트되는지 확인

## 📋 다음 작업 계획

### 즉시 해결해야 할 문제
1. **태그 필터링 즉시 반응 문제 해결**
2. **디버깅을 위한 로그 추가**
3. **브라우저 캐시 문제 확인**

### 추가 개선사항
1. **다중 태그 선택 지원** (현재는 첫 번째 태그만 사용)
2. **주의사항과 메뉴얼에 태그 연결**
3. **검색 성능 최적화**

## 🔍 디버깅 명령어
```bash
# PM2 로그 확인
pm2 logs basak-chicken

# 빌드 및 재시작
npm run build && pm2 restart basak-chicken

# 태그 연결 상태 확인
node check-tag-connections.js
```

## 📝 사용자 요구사항 요약
- ✅ 체크리스트 관리 페이지 단순화
- ✅ 새 등록 페이지 분리
- ✅ 연결 항목 검색 기능
- ✅ 태그 기반 필터링 (부분 완료)
- ❌ 태그 선택 시 즉시 필터링 (미완료) 