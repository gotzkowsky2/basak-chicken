# 현재 상태 및 작업 기록

## 2025-07-31 작업 완료 ✅

### 주요 개선사항
1. **체크리스트 UI/UX 대폭 개선**
   - 접기/펼치기 기능 구현
   - 연결항목이 있는 체크리스트는 연결항목 모두 체크해야 상위 항목 체크
   - 진행중 상태에 완료 개수 표시 (예: 진행중 (3/5))
   - 제출 완료된 체크리스트는 클릭 불가능하게 처리

2. **데이터베이스 스키마 업데이트**
   - ChecklistInstance에 completedBy, completedAt 필드 추가
   - ConnectedItemProgress에 completedBy, completedAt 필드 추가

3. **체크한 사람 이름 표시 기능**
   - 체크한 사람 이름을 각 항목에 표시
   - 여러 명이 체크리스트 작성 가능

4. **상태 관리 개선**
   - 연결항목 체크 시 상위 항목 자동 체크
   - 페이지 이동 시 체크 상태 유지 (일부 해결됨)

5. **UI 디자인 개선**
   - 위치/시간대/구분 정보 제거로 간소화
   - 모바일 친화적인 반응형 체크박스 크기
   - 체크된 항목 시각적 강조

### 수정된 파일들
- `src/app/employee/checklist/page.tsx` - 메인 체크리스트 페이지
- `src/app/api/employee/checklist-progress/route.ts` - 체크리스트 진행 상태 API
- `src/app/api/employee/connected-items/route.ts` - 연결된 항목 조회 API (신규)
- `prisma/schema.prisma` - 데이터베이스 스키마
- `check-template-structure.js` - 템플릿 구조 확인 스크립트 (신규)
- `debug-cookies.js` - 쿠키 디버깅 스크립트 (신규)

---

## 2025-08-11 작업 기록 ✅

### 로그인/세션 안정화
- 직원 로그인 직후 SPA 내비게이션 대신 강제 페이지 이동으로 전환 (`window.location.href`) → 즉시 쿠키 반영
- 운영 환경 쿠키 `secure: true` 정렬 및 미들웨어 동기 쿠키 발급도 `secure` 반영
- 로그아웃 API 단순화: NextResponse.cookies 사용으로 Set-Cookie 헤더 폭주 방지 (502 완화)

### CPU 스파이크 완화
- 직원 메인 `Link` 프리패치 비활성화(prefetch=false)로 동시 프리패치 제거
- Prisma Client 재생성(`npx prisma generate`) 및 클린 빌드 진행

### 체크리스트/제출내역 개선
- 제출내역 API 필터 강화: 비관리자는 기본적으로 본인 데이터만, 그리고 "내가 체크에 참여한" 인스턴스만 표시
- 직원 체크리스트 목록/복원 로직은 기존 동작 유지(확인 완료)

### 재고/구매관리
- 직원 재고 API 응답에 태그 포함 및 평탄화(`tags`)하여 직원 페이지에서 태그 표시/검색 가능
- 직원 재고 업데이트 시 `lastCheckedBy`를 직원 이름으로 저장/표시
- 관리자 재고 API의 태그 필터를 AND 조건으로 변경
 - 관리자 재고 직원 필터 강화: "최근 업데이트한 직원" 기준으로 필터되도록 수정(최신 체크의 직원이 선택값과 일치하는 항목만 반환)
 - 관리자 재고 직원 선택 목록 동적 로딩: `/api/admin/employees` 연동(직원 ID 기준으로 필터 적용)

### 즐겨찾기(직원) 기능 추가
- DB: `Favorite` 모델 추가(직원별 MANUAL/PRECAUTION 즐겨찾기), 마이그레이션 적용 완료
- API: `GET/POST /api/employee/favorites` 구현(즐겨찾기 조회/토글)
- UI: 직원 메인(`employee/EmployeeMainClient.tsx`) 카드에 즐겨찾기 바로가기 추가
- 페이지: `employee/favorites` 신설
  - 메뉴얼/주의사항 즐겨찾기 목록 동시 표기, 클릭 시 상세 모달(연결 주의사항, 우선순위/태그 포함)
- 각 리스트 페이지 토글 추가
  - `employee/manual/ManualClient.tsx`: 상단에 "즐겨찾기만" 하트 토글 → 즐겨찾기 필터링
  - `employee/notices/page.tsx`: 상단에 "즐겨찾기만" 하트 토글 → 즐겨찾기 필터링

### 기타
- 로그인/라우팅 안정화, 홈 진입, 태그 AND 필터 통일(직원/관리자/매뉴얼/주의사항) 등 반영 및 배포

### 업무 매뉴얼/주의사항
- 직원 매뉴얼 필터 구분(근무처/시간대/카테고리)을 관리자와 동일한 코드/라벨로 통일
- 매뉴얼/주의사항 태그 필터를 모두 AND 조건으로 변경(선택 수↑ → 결과 수↓)
- 주의사항 시간대 옵션 중복(진행 2개) 제거

### 홈 진입 동작 수정
- 직원 `/employee` 진입 시 더 이상 체크리스트로 리다이렉트하지 않고 홈 화면 렌더
- 관리자 `/admin` 진입 시 대시보드 홈 렌더(자동 리다이렉트 제거)

### 라우팅/빌드 안정화
- `/_not-found` 누락 에러 방지를 위해 `src/app/not-found.tsx` 추가
- 슈퍼관리자 로그인 리다이렉트 `/admin-choose` → `/admin`로 정리
- PM2 실행을 개발용(dev)에서 프로덕션용(next start, `NODE_ENV=production`)으로 전환 준비 및 적용

### 배포
- 프로덕션 빌드 및 PM2 재시작 완료

## 2025-08-01 작업 예정 🔄

### 해결해야 할 문제들
1. **페이지 이동 시 체크 상태가 풀리는 문제**
   - 현재: 체크하고 저장 후 다른 페이지 이동 후 다시 들어오면 상위 항목 체크가 풀림
   - 하위 항목은 그대로 체크되어 있지만 상위 항목만 풀림
   - 원인: 상태 복원 로직에 문제가 있음

2. **체크한 사람 이름이 제대로 표시되지 않는 문제**
   - 현재: 체크한 사람 이름이 저장되지만 UI에 표시되지 않음
   - 원인: UI 렌더링 부분에서 completedBy 정보를 제대로 표시하지 않음

### 해결 방안
1. **상태 복원 로직 개선**
   - `handleChecklistSelect` 함수에서 기존 상태를 더 정확하게 복원
   - 상위 항목과 하위 항목의 상태 동기화 로직 개선
   - 페이지 이동 시 상태 유지 메커니즘 강화

2. **체크한 사람 이름 표시 개선**
   - UI에서 completedBy 정보를 올바르게 렌더링
   - 체크한 시간도 함께 표시 (선택사항)

### 테스트 시나리오
1. 체크리스트 선택 → 하위 항목 체크 → 저장 → 뒤로가기 → 다시 들어가기
2. 여러 명이 같은 체크리스트에 체크했을 때 각각의 이름이 표시되는지 확인
3. 제출 완료된 체크리스트가 클릭되지 않는지 확인

---

## 기술적 세부사항

### 데이터베이스 스키마 변경
```sql
-- ChecklistInstance 테이블에 추가된 필드
ALTER TABLE "ChecklistInstance" ADD COLUMN "completedBy" TEXT;
ALTER TABLE "ChecklistInstance" ADD COLUMN "completedAt" TIMESTAMP;

-- ConnectedItemProgress 테이블에 추가된 필드
ALTER TABLE "ConnectedItemProgress" ADD COLUMN "completedBy" TEXT;
ALTER TABLE "ConnectedItemProgress" ADD COLUMN "completedAt" TIMESTAMP;
```

### 주요 함수들
- `getChecklistStatus()` - 체크리스트 상태 계산
- `handleConnectedItemCheckboxChange()` - 연결항목 체크 처리
- `updateParentItemStatus()` - 상위 항목 상태 업데이트
- `handleChecklistSelect()` - 체크리스트 선택 시 상태 복원

### 상태 관리
- `checklistItems` - 메인 체크리스트 항목 상태
- `connectedItemsStatus` - 연결된 항목 상태
- `expandedItems` - 접기/펼치기 상태
- `connectedItemDetails` - 연결된 항목 상세 정보 