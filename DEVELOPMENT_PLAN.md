# Basak Chicken 시스템 확장 개발 계획서

## 📋 현재 환경 상태 (2025-07-28)

### ✅ 안정적인 상태
- **서버**: PM2로 3001 포트에서 정상 실행 중 (업그레이드 완료)
- **데이터베이스**: PostgreSQL 연결 정상, 스키마 완전 동기화
- **기본 구조**: Next.js + TypeScript + Prisma + Tailwind CSS
- **Git**: 최신 커밋 완료 (서버 안정성 및 모바일 터치 피드백 개선)

### 🏗️ 현재 데이터베이스 구조 (완료됨)
```
✅ 완료된 모델들:
- Admin, Employee (사용자 관리)
- ChecklistTemplate, ChecklistSubmission, ChecklistItemResponse (체크리스트)
- ChecklistTag, TemplateTagRelation (태그 시스템)
- Workplace, Category, TimeSlot (열거형)

✅ 새로 추가된 모델들 (스키마 확장 완료):
- Precaution (주의사항 관리)
- Manual (메뉴얼 관리)
- InventoryItem, InventoryCheck (재고 관리)
- PurchaseRequest, PurchaseRequestItem (구매 관리)
- ChecklistItem (체크리스트 항목 확장)

현재 카테고리:
- CHECKLIST, PRECAUTIONS, SUPPLIES, INGREDIENTS, COMMON, MANUAL (HYGIENE 제거됨)

현재 상태:
- Prisma Client v6.12.0 최신 버전
- 데이터베이스 완전 동기화됨
- 마이그레이션 히스토리 체계적 관리
```

## 🎯 현재 진행 상황

### ✅ 1단계: 데이터베이스 스키마 확장 (완료)
**상태**: 100% 완료
- 모든 새로운 모델 구현됨
- 데이터베이스 동기화 완료
- Prisma Client 최신 버전으로 생성됨

### ✅ 2단계: 관리자 페이지 구현 (완료)
**목표**: 직관적이고 편리한 관리자 인터페이스

#### 주요 개선사항 (2025-07-28 최신):
1. **✅ 체크리스트 항목 연결 시스템 구현** (완료)
   - 기존 체크리스트에 새로운 항목을 추가하는 기능 구현
   - "+ 항목 추가" 버튼으로 기존 체크리스트에 연결된 항목들을 추가할 수 있음
   - 각 항목의 "수정" 버튼 제거 (불필요한 기능)
   - "삭제" 버튼만 유지하여 연결 해제 가능
   - `addItemsToExistingChecklist` 함수로 실제 API 호출하여 항목 추가
   - 선택된 항목들을 실제로 체크리스트에 연결하는 기능 완성

2. **✅ 직원 페이지 체크리스트 표시 개선** (완료)
   - 직원 API (`/api/employee/checklists/route.ts`) 수정하여 연결된 항목들 포함
   - `ChecklistItem` 인터페이스 확장 (관리자와 동일한 구조)
   - 직원 페이지에서 연결된 항목들이 하위에 표시되도록 UI 개선
   - 각 연결된 항목의 타입별 아이콘 및 색상 표시
   - 연결된 세부 항목들 (재고, 주의사항, 메뉴얼) 표시

3. **✅ 서버 안정성 개선** (완료)
   - 빌드 캐시 문제 해결 (`.next` 폴더 삭제 후 재빌드)
   - Prisma 스키마 불일치 문제 해결 (`tags` 필드 제거)
   - PM2 프로세스 안정화
   - Git 커밋으로 모든 변경사항 저장

4. **✅ UI/UX 개선 - 홈 아이콘 크기 문제 해결** (2025-07-28 완료)
   - **문제**: 모바일 터치 피드백 CSS로 인해 홈 아이콘이 엄청 크게 표시됨
   - **원인**: `min-height: 44px; min-width: 44px;`가 모든 링크에 적용되어 홈 아이콘도 영향을 받음
   - **해결책**: 
     - `globals.css`에서 홈 아이콘을 제외하는 CSS 규칙 추가
     - 홈 아이콘 크기를 `w-7 h-7`에서 `w-5 h-5`로 축소
     - 패딩을 `p-2 -m-2`에서 `p-1 -m-1`로 축소
     - `home-icon` 클래스 추가하여 CSS에서 제외
   - **적용된 파일들**:
     - `src/app/globals.css` - 모바일 터치 피드백 CSS 개선
     - `src/app/employee/layout.tsx` - 직원 홈 아이콘 크기 조정
     - `src/app/admin/layout.tsx` - 관리자 홈 아이콘 크기 조정
   - **결과**: 홈 아이콘이 적절한 크기로 표시되며, 다른 터치 요소들은 여전히 모바일 친화적

5. **🔄 체크리스트 시스템 구조 개선** (2025-07-28 진행 중)
   - **문제**: 현재 체크리스트 시스템이 실제 업무 흐름과 맞지 않음
     - 개별 항목들을 하나씩 관리해야 함
     - "홀, 준비" 같은 하나의 체크리스트로 묶는 개념이 없음
     - 개발용 생성기에서 모든 항목이 섞여서 나와서 어떤 템플릿인지 모름
   - **개선 방향**:
     - **템플릿 중심 구조**: "홀, 준비" 템플릿 → 12개 항목을 포함하는 하나의 템플릿
     - **자동 이름 생성**: 위치 + 시간으로 "홀, 준비" 형태 자동 생성
     - **템플릿 단위 선택**: 개발용 생성기에서 템플릿 단위로 선택 가능
   - **구현된 기능**:
     - `generateTemplateName` 함수 개선: "홀, 준비" 형태로 자동 생성
     - 템플릿 이름 필드 추가: 자동 생성된 이름 표시 및 수정 가능
     - 개발용 생성기 개선: 템플릿만 필터링하여 표시, 위치별 그룹화
   - **적용된 파일들**:
     - `src/app/admin/checklists/page.tsx` - 템플릿 이름 자동 생성 및 필드 추가
     - `src/app/admin/dev-checklist-generator/page.tsx` - 템플릿 단위 선택 및 그룹화
   - **다음 단계**: 
     - 직원 페이지에서 템플릿 단위로 체크리스트 표시
     - 보고서 형태의 체크리스트 작성 시스템 구현

#### 구현된 페이지들:
1. **✅ 체크리스트 관리** (완료)
   - 템플릿 CRUD ✅
   - 체크리스트 항목 관리 API ✅ (`/api/admin/checklist-items`)
   - 항목별 타입 설정 (일반 체크, 재고 확인/보충, 메뉴얼 참조, 주의사항 확인, 부대용품/재료 확인) ✅
   - 순서 및 필수 여부 설정 ✅
   - 주의사항/메뉴얼/재고와 실제 연동 구현 ✅
   - 카테고리 정리 (HYGIENE 제거, COMMON으로 통합) ✅
   - 항목 관리 모달 개선 (양쪽 분할 레이아웃, 연결 데이터 표시) ✅

2. **✅ 주의사항 관리** (완료)
   - Precaution CRUD API ✅ (`/api/admin/precautions`)
   - 근무처/시간대별 주의사항 관리 ✅
   - 우선순위 설정 (HIGH, MEDIUM, LOW) ✅
   - 필터링 및 검색 기능 ✅
   - 체크리스트와 연동 준비 ✅

3. **✅ 메뉴얼 관리** (완료)
   - Manual CRUD API ✅ (`/api/admin/manuals`)
   - 근무처/시간대별 메뉴얼 관리 ✅
   - 카테고리별 분류 (메뉴얼, 절차, 가이드, 교육) ✅
   - 버전 관리 ✅
   - 미디어 URL 지원 (추후 구현 예정) ✅
   - 필터링 및 검색 기능 ✅

4. **✅ 재고/구매 관리** (완료)
   - InventoryItem CRUD API ✅ (`/api/admin/inventory`)
   - 재고 현황 대시보드 ✅
   - 부족 재고 알림 ✅
   - 구매 요청 관리 API ✅ (`/api/admin/purchase-requests`)
   - 구매 요청 승인/거부 시스템 ✅
   - 상태별 필터링 (대기중, 승인됨, 거부됨, 구매됨, 입고됨) ✅
   - 우선순위별 필터링 (낮음, 보통, 높음, 긴급) ✅

### 🔄 3단계: 직원 페이지 개선 (진행 중)
**목표**: 효율적인 업무 수행을 위한 직원 인터페이스

#### 현재 구현된 기능:
1. **✅ 체크리스트 표시** (완료)
   - 연결된 항목들이 하위에 표시됨
   - 타입별 아이콘 및 색상 표시
   - 체크박스로 완료 여부 표시

#### 다음 구현할 기능 (우선순위):
1. **🔄 연결된 항목 상세 작업 시스템** (진행 예정)
   - 재고 확인: 현재 수량과 부족한 수량 표시
   - 수량 업데이트: 재고 수량을 직접 수정할 수 있음
   - 구매 요청: 부족한 재료에 대해 구매 요청을 넣을 수 있음
   - 체크 완료: 위 작업들을 모두 완료해야만 해당 항목을 체크할 수 있음
   - 임시 저장: 작성 중인 내용이 자동으로 저장되어 나중에 이어서 작업할 수 있음
   - 페이지 이동 시에도 임시 저장된 내용 유지

2. **🔄 보고서 시스템** (진행 예정)
   - 미완성 보고서 자동 저장
   - 다른 페이지 이동 후 돌아와도 이어서 작업 가능
   - 완전한 보고서 (모든 항목 체크) 제출 시스템

### ⏳ 4단계: 연동 및 자동화 (예정)
**목표**: 시스템 간 원활한 연동과 자동화

## 🔧 현재 개발 환경 설정

### 서버 상태 확인 명령어:
```bash
# PM2 상태 확인
pm2 status

# 포트 확인
netstat -tlnp | grep :3001

# 서버 응답 확인
curl -f http://localhost:3001

# 데이터베이스 동기화 확인
npx prisma db push

# Prisma Client 생성
npx prisma generate
```

### 현재 작업 디렉토리:
```bash
cd /root/basak-chicken-app
```

### 프로젝트 구조:
```
basak-chicken-app/
├── prisma/
│   ├── schema.prisma (✅ 완료 - 모든 모델 구현됨)
│   └── migrations/ (✅ 체계적 관리됨)
├── src/
│   ├── app/ (Next.js 앱 라우터)
│   ├── components/ (React 컴포넌트)
│   └── lib/ (유틸리티 함수)
├── package.json
└── DEVELOPMENT_PLAN.md (이 파일)
```

## 🎯 다음 작업 우선순위

### 즉시 시작 가능한 작업들:

#### 1. ✅ 관리자 체크리스트 관리 페이지 (완료)
**파일 위치**: `src/app/admin/checklists/`
**구현 내용**:
- 체크리스트 템플릿 CRUD ✅
- ChecklistItem API 구현 ✅ (`/api/admin/checklist-items`)
- 항목별 타입 설정 (일반 체크, 재고 체크, 메뉴얼 참조, 주의사항) ✅
- 순서 및 필수 여부 설정 ✅
- Precaution/Manual/InventoryItem 연동 준비 ✅
- 태그 시스템 활용 ✅

#### 2. ✅ 관리자 주의사항 관리 페이지 (완료)
**파일 위치**: `src/app/admin/precautions/`
**구현 내용**:
- Precaution 모델 CRUD ✅
- 근무처/시간대별 필터링 ✅
- 우선순위 설정 (HIGH, MEDIUM, LOW) ✅
- 체크리스트 연동 준비 ✅

#### 3. ✅ 관리자 메뉴얼 관리 페이지 (완료)
**파일 위치**: `src/app/admin/manuals/`
**구현 내용**:
- Manual 모델 CRUD ✅
- 근무처/시간대별 분류 ✅
- 카테고리별 분류 (메뉴얼, 절차, 가이드, 교육) ✅
- 버전 관리 ✅
- 미디어 URL 지원 (추후 구현 예정) ✅
- 체크리스트 연동 준비 ✅

#### 4. ✅ 관리자 재고/구매 관리 페이지 (완료)
**파일 위치**: `src/app/admin/inventory/`
**구현 내용**:
- InventoryItem CRUD ✅
- 재고 현황 대시보드 ✅
- 부족 재고 알림 ✅
- PurchaseRequest 승인 시스템 ✅
- 상태별/우선순위별 필터링 ✅

#### 5. 직원 페이지 개선 (다음 단계)
**파일 위치**: `src/app/employee/`
**구현 내용**:
- 통합 대시보드
- 스마트 체크리스트
- 재고 확인 및 구매 요청
- 메뉴얼 및 주의사항 조회

## ⚠️ 오류 방지 전략

### 1. 데이터베이스 안전성 (현재 안정적)
**상태**: ✅ 안전
- 스키마 완전 동기화됨
- 백업 필요 시: `pg_dump basak_chicken_db > backup_$(date +%Y%m%d_%H%M%S).sql`

### 2. 서버 안정성 (현재 안정적)
**상태**: ✅ 안정
- PM2로 안정적 실행 중
- 메모리 사용량: 75.4MB (효율적)
- CPU 사용량: 0% (매우 안정적)

### 3. 코드 품질 관리
**필수 체크 명령어**:
```bash
# 타입 체크
npx tsc --noEmit

# 린트 체크
npm run lint

# 빌드 테스트
npm run build
```

## 📝 다음 접속 시 확인사항

### 1. 서버 상태 확인
```bash
pm2 status
netstat -tlnp | grep :3001
curl -f http://localhost:3001
```

### 2. 데이터베이스 상태 확인
```bash
npx prisma db push
npx prisma generate
```

### 3. 개발 진행 상황 확인
- 이 파일의 진행 상황 업데이트
- Git 커밋 히스토리 확인
- 오류 로그 확인

### 4. 백업 상태 확인
```bash
ls -la *.sql  # 데이터베이스 백업
pm2 save      # PM2 설정 백업
```

## 🎯 현재 우선순위

### 높음 (즉시 시작)
1. **✅ 관리자 체크리스트 관리 페이지** - 템플릿 CRUD 및 연동 설정 (완료)
2. **✅ 관리자 주의사항 관리 페이지** - 근무처/시간대별 주의사항 관리 (완료)
3. **✅ 관리자 메뉴얼 관리 페이지** - 파일 업로드 및 버전 관리 (완료)
4. **✅ 관리자 재고/구매 관리 페이지** - 대시보드 및 승인 시스템 (완료)

### 중간 (현재 진행 중)
1. **🔄 직원 체크리스트 상세 작업 시스템** - 연결된 항목별 재고 확인/수정/구매요청 기능
2. **🔄 직원 보고서 임시 저장 시스템** - 미완성 보고서 자동 저장 및 이어서 작업 기능

### 낮음 (3-4일 후)
1. **연동 시스템 구현** - 자동화 및 알림 시스템

## 📞 문제 발생 시 대응

### 즉시 대응 필요:
- 서버 다운
- 데이터베이스 연결 실패
- 빌드 오류

### 단계별 대응:
1. 로그 확인
2. 백업 복원
3. 롤백 실행
4. 문제 분석 및 수정

## 🔄 현재 작업 중인 파일들

### 완료된 파일들:
- `prisma/schema.prisma` (✅ 모든 모델 구현 완료)
- `src/app/api/admin/checklist-items/route.ts` (✅ 체크리스트 항목 API 완료)
- `src/app/admin/checklists/page.tsx` (✅ 체크리스트 관리 페이지 확장 완료)
- `src/app/api/admin/precautions/route.ts` (✅ 주의사항 관리 API 완료)
- `src/app/admin/precautions/page.tsx` (✅ 주의사항 관리 페이지 완료)
- `src/app/api/admin/manuals/route.ts` (✅ 메뉴얼 관리 API 완료)
- `src/app/admin/manuals/page.tsx` (✅ 메뉴얼 관리 페이지 완료)
- `src/app/api/admin/inventory/route.ts` (✅ 재고 관리 API 완료)
- `src/app/api/admin/purchase-requests/route.ts` (✅ 구매 요청 관리 API 완료)
- `src/app/admin/inventory/page.tsx` (✅ 재고/구매 관리 페이지 완료)
- `src/app/admin/layout.tsx` (✅ 모든 관리 메뉴 추가 완료)
- `src/app/admin/AdminDashboardClient.tsx` (✅ 모든 관리 카드 추가 완료)
- `src/app/globals.css` (✅ 모바일 터치 피드백 CSS 개선 완료)
- `src/app/employee/layout.tsx` (✅ 홈 아이콘 크기 조정 완료)
- `src/app/admin/layout.tsx` (✅ 홈 아이콘 크기 조정 완료)

### 현재 작업 중인 파일들:
- `src/app/employee/checklist/page.tsx` (직원 체크리스트 페이지 - 연결된 항목 상세 작업 시스템 구현 중)
- `src/app/api/employee/checklists/route.ts` (직원 체크리스트 API - 연결된 항목 포함 완료)

### 다음 작업할 파일들:
- `src/app/api/employee/inventory/route.ts` (직원 재고 확인/수정 API)
- `src/app/api/employee/purchase-requests/route.ts` (직원 구매 요청 API)
- `src/app/employee/checklist/components/` (체크리스트 상세 작업 컴포넌트들)

---

**마지막 업데이트**: 2025-07-28
**현재 상태**: 모든 관리자 페이지 구현 완료 + UI/UX 개선 (홈 아이콘 크기 문제 해결)
**다음 단계**: 직원 페이지 개선 및 통합 대시보드 구현 

---

## 🔄 **체크리스트 시스템 대폭 개선 작업 (2024-12-19)**

### ✅ **완료된 주요 개선사항**

#### **1. 개발용 체크리스트 생성기 완전 개편** ⭐
- **문제**: 개별 항목을 하나씩 선택해야 하는 복잡한 방식
- **해결**: 템플릿 그룹 단위 선택 시스템 구현
- **결과**: "홀, 준비" 템플릿을 클릭하면 모든 항목이 자동 선택

#### **2. 템플릿 그룹화 시스템 구현**
```typescript
// 핵심 로직: 템플릿을 이름별로 그룹화
const getUniqueTemplateGroups = () => {
  const templateGroups = new Map<string, ChecklistTemplate[]>();
  availableTemplates.forEach(template => {
    const templateKey = template.name; // "주방, 준비"
    if (!templateGroups.has(templateKey)) {
      templateGroups.set(templateKey, []);
    }
    templateGroups.get(templateKey)!.push(template);
  });
  return templateGroups;
};
```

#### **3. 직원 체크리스트 페이지 API 변경**
- **이전**: `/api/employee/checklists` (템플릿 조회)
- **개선**: `/api/employee/checklist-progress` (실제 생성된 인스턴스 조회)
- **결과**: 개발용 생성기로 만든 체크리스트가 직원 페이지에 표시됨

---

## ⚠️ **정리해야 할 복잡한 부분들 (높은 우선순위)**

### **1. 코드 복잡성 문제**

#### **1-1. 개발용 체크리스트 생성기 (`/admin/dev-checklist-generator`)**
**현재 문제점**:
- 템플릿 그룹화 로직이 너무 복잡함
- `getUniqueTemplateGroups`, `getGroupedTemplateGroups` 함수 중복
- TypeScript 타입 에러 자주 발생
- 디버깅용 코드가 프로덕션에 남아있음

**정리 방향**:
```typescript
// 현재 복잡한 구조
const getUniqueTemplateGroups = () => { /* 복잡한 로직 */ };
const getGroupedTemplateGroups = () => { /* 중복 로직 */ };

// 개선 방향: 단순화
const getTemplateGroups = () => {
  return groupTemplatesByWorkplace(availableTemplates);
};
```

#### **1-2. 체크리스트 관리 페이지 (`/admin/checklists`)**
**현재 문제점**:
- 상태 변수가 너무 많음 (필터링, 모달, 편집 등)
- `ChecklistTemplate` 인터페이스에 `name` 필드 없음
- 템플릿 이름 생성 로직이 분산됨

**정리 방향**:
- 상태 관리를 커스텀 훅으로 분리
- 인터페이스 통일
- 템플릿 이름 생성 로직 중앙화

#### **1-3. 직원 체크리스트 페이지 (`/employee/checklist`)**
**현재 문제점**:
- API 호출이 여러 곳에 분산됨
- ChecklistInstance ↔ ChecklistTemplate 변환 로직 복잡
- 상태 관리가 복잡함

**정리 방향**:
- API 호출 로직 통합
- 데이터 변환 로직 분리
- 상태 관리 단순화

### **2. 불필요한 코드 정리**

#### **2-1. 디버깅 코드 제거**
```typescript
// 제거해야 할 코드들
console.log('템플릿 불러오기 시작...');
console.log('API 응답 데이터:', data);
console.log('그룹화된 데이터:', groupedData);
// ... 기타 디버깅 로그들
```

#### **2-2. 사용하지 않는 함수들**
- `handleTemplateToggle` (개별 템플릿 선택용, 현재 사용 안함)
- `groupedTemplates` (이전 그룹화 방식, 현재 사용 안함)
- `handleSelectAllTemplates` (기존 방식, 새로운 그룹화와 충돌)

#### **2-3. 중복된 타입 정의**
- 여러 파일에서 비슷한 인터페이스 정의
- 통합된 타입 정의 파일 필요

### **3. 데이터베이스 스키마 개선**

#### **3-1. ChecklistTemplate 모델**
**현재 문제**: `name` 필드가 없어서 템플릿 이름을 동적으로 생성
**개선 방향**: `name` 필드를 추가하여 템플릿 이름을 명시적으로 저장

#### **3-2. ChecklistInstance 모델**
**현재 문제**: 템플릿 정보가 중복 저장됨
**개선 방향**: 템플릿과의 관계를 명확히 하고 중복 제거

### **4. API 구조 개선**

#### **4-1. 일관성 없는 API 응답**
**문제**: 각 API마다 응답 구조가 다름
**개선**: 표준화된 응답 구조 정의

#### **4-2. 에러 처리**
**문제**: 에러 처리가 일관되지 않음
**개선**: 통일된 에러 처리 방식 적용

---

## 📝 **다음 단계 우선순위**

### **1단계: 코드 정리 (즉시 필요)**
1. ✅ 디버깅 코드 제거
2. ✅ 사용하지 않는 함수 제거
3. ✅ TypeScript 타입 에러 수정
4. ✅ 중복 코드 제거

### **2단계: 구조 개선 (1-2일 내)**
1. ✅ 상태 관리 단순화
2. ✅ API 응답 구조 표준화
3. ✅ 타입 정의 통합

### **3단계: 기능 개선 (3-4일 내)**
1. ✅ 데이터베이스 스키마 개선
2. ✅ 성능 최적화
3. ✅ 사용자 경험 개선

---

## 🎯 **현재 작동하는 기능들**

### **관리자 기능**
- ✅ 체크리스트 템플릿 관리 (`/admin/checklists`)
- ✅ 개발용 체크리스트 생성 (`/admin/dev-checklist-generator`)
- ✅ 템플릿 그룹 단위 선택 및 생성

### **직원 기능**
- ✅ 체크리스트 조회 (`/employee/checklist`)
- ✅ 생성된 체크리스트 인스턴스 표시
- ✅ 체크리스트 완료 기능

### **시스템 기능**
- ✅ 서버 안정적 운영
- ✅ 메모리 사용량 최적화 (38.3MB)

---

## 📊 **기술적 부채 (Technical Debt)**

1. **코드 복잡성**: 높음 ⚠️ (즉시 정리 필요)
2. **타입 안정성**: 보통 ⚠️ (TypeScript 에러 수정 필요)
3. **성능**: 양호 ✅
4. **유지보수성**: 낮음 ⚠️ (리팩토링 필요)
5. **확장성**: 보통 ⚠️ (구조 개선 필요)

---

**최종 업데이트**: 2024-12-19
**현재 상태**: 체크리스트 시스템 기능 완료, 코드 정리 필요
**다음 단계**: 코드 복잡성 해결 및 구조 개선 

---

## 🚨 **현재 상태 완전 문서화 (2024-12-19)**

### **📁 파일명**: `DEVELOPMENT_PLAN.md`

이 파일을 백업 후 복구 시 참고하여 현재 상태를 완전히 파악할 수 있습니다.

---

## 🎯 **현재 구현된 기능들**

### **1. 관리자 기능**
- ✅ 체크리스트 템플릿 관리 (`/admin/checklists`)
- ✅ 개발용 체크리스트 생성 (`/admin/dev-checklist-generator`)
- ✅ 템플릿 그룹 단위 선택 및 생성
- ✅ 주의사항 관리 (`/admin/precautions`)
- ✅ 메뉴얼 관리 (`/admin/manuals`)
- ✅ 재고/구매 관리 (`/admin/inventory`)

### **2. 직원 기능**
- ✅ 체크리스트 조회 (`/employee/checklist`)
- ✅ 템플릿 그룹별 목록 표시
- ✅ 상세 화면으로 이동 (작성 중)
- ✅ 체크리스트 완료 기능

### **3. 시스템 기능**
- ✅ 서버 안정적 운영
- ✅ 메모리 사용량 최적화 (39.9MB)

---

## 🔧 **현재 작업 중인 문제**

### **직원 체크리스트 상세 화면 문제**
- **문제**: 상세 화면에서 체크리스트 항목들이 보이지 않음
- **원인**: `selectedChecklist.items`가 비어있음
- **해결 중**: `groupInstances`에서 항목들을 `items`에 제대로 설정하는 작업 진행 중

### **디버깅 정보**
```
- selectedChecklist.id: 홀, 준비
- selectedChecklist.items 길이: 0
- groupInstances 길이: 1
```

---

## 📊 **데이터베이스 구조 (현재)**

### **현재 모델들**
```prisma
model ChecklistTemplate {
  id          String   @id @default(cuid())
  content     String
  workplace   String
  category    String
  timeSlot    String
  items       ChecklistItem[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ChecklistItem {
  id            String   @id @default(cuid())
  templateId    String
  type          String
  content       String
  instructions  String?
  order         Int
  isRequired    Boolean  @default(true)
  isActive      Boolean  @default(true)
  template      ChecklistTemplate @relation(fields: [templateId], references: [id])
  inventoryItem InventoryItem?
  precautions   Precaution[]
  manuals       Manual[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ChecklistInstance {
  id          String   @id @default(cuid())
  templateId  String
  employeeId  String
  date        DateTime
  isCompleted Boolean  @default(false)
  notes       String?
  template    ChecklistTemplate @relation(fields: [templateId], references: [id])
  employee    Employee @relation(fields: [employeeId], references: [id])
  connectedItemsProgress ConnectedItemProgress[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔄 **현재 데이터 흐름**

### **1. 관리자에서 체크리스트 생성**
```
관리자 → /admin/dev-checklist-generator → 템플릿 그룹 선택 → ChecklistInstance 생성
```

### **2. 직원에서 체크리스트 조회**
```
직원 → /employee/checklist → /api/employee/checklist-progress → ChecklistInstance 조회 → 템플릿 그룹화 → 목록 표시
```

### **3. 직원에서 체크리스트 작성**
```
직원 → 체크리스트 선택 → 상세 화면 → 항목 체크 → 저장
```

---

## 🐛 **현재 발생한 문제들**

### **1. 직원 상세 화면 문제**
- **파일**: `src/app/employee/checklist/page.tsx`
- **문제**: `selectedChecklist.items`가 비어있음
- **해결 중**: `fetchChecklists` 함수에서 `groupInstances`의 항목들을 `items`에 설정하는 작업

### **2. 코드 복잡성 문제**
- **파일**: `src/app/admin/dev-checklist-generator/page.tsx`
- **문제**: 템플릿 그룹화 로직이 복잡함
- **상태**: 작동하지만 리팩토링 필요

### **3. API 구조 문제**
- **문제**: 여러 API가 비슷한 역할을 함
- **상태**: 작동하지만 일관성 부족

---

## 📝 **리팩토링 계획**

### **1단계: 데이터베이스 스키마 재설계**
```sql
-- 새로운 구조
ChecklistTemplateGroup {
  id: string
  name: string          // "홀, 준비"
  workplace: string     // "HALL"
  timeSlot: string      // "PREPARATION"
  description: string
  isActive: boolean
}

ChecklistTemplateItem {
  id: string
  groupId: string       // ChecklistTemplateGroup 참조
  content: string       // "재료 체크"
  instructions: string
  order: number
  isRequired: boolean
  isActive: boolean
  type: string          // "check", "inventory", "manual" 등
}

DailyChecklist {
  id: string
  groupId: string       // ChecklistTemplateGroup 참조
  date: Date
  employeeId: string    // Employee 참조
  status: string        // "not_started", "in_progress", "completed"
  submittedAt: Date
}

DailyChecklistItem {
  id: string
  dailyChecklistId: string  // DailyChecklist 참조
  templateItemId: string    // ChecklistTemplateItem 참조
  isCompleted: boolean
  notes: string
  completedAt: Date
}
```

### **2단계: API 재구성**
```
GET  /api/admin/checklist-groups          # 템플릿 그룹 목록
POST /api/admin/checklist-groups          # 템플릿 그룹 생성
PUT  /api/admin/checklist-groups/:id      # 템플릿 그룹 수정
DEL  /api/admin/checklist-groups/:id      # 템플릿 그룹 삭제

GET  /api/admin/checklist-items           # 템플릿 항목 목록
POST /api/admin/checklist-items           # 템플릿 항목 생성
PUT  /api/admin/checklist-items/:id       # 템플릿 항목 수정
DEL  /api/admin/checklist-items/:id       # 템플릿 항목 삭제

GET  /api/employee/daily-checklists       # 오늘의 체크리스트 목록
GET  /api/employee/daily-checklists/:id   # 체크리스트 상세
POST /api/employee/daily-checklists/:id   # 체크리스트 제출
PUT  /api/employee/daily-checklists/:id   # 체크리스트 저장
```

### **3단계: 프론트엔드 리팩토링**
- 상태 관리 단순화
- 컴포넌트 분리 및 재사용성 향상
- 타입 안정성 강화

### **4단계: 자동화 시스템 구현**
- 자정 자동 체크리스트 생성
- 이메일 알림 시스템
- 관리자 대시보드

---

## 🛠️ **현재 작업 중인 파일들**

### **수정된 파일들**
1. `src/app/employee/checklist/page.tsx` - 템플릿 그룹화 및 상세 화면 구현
2. `src/app/admin/dev-checklist-generator/page.tsx` - 템플릿 그룹 단위 선택
3. `src/app/api/employee/checklist-progress/route.ts` - ChecklistInstance 조회

### **문제가 있는 파일들**
1. `src/app/employee/checklist/page.tsx` - 상세 화면에서 items 로딩 문제
2. `src/app/admin/dev-checklist-generator/page.tsx` - 복잡한 그룹화 로직

---

## 📋 **백업 후 복구 시 확인사항**

### **1. 서버 상태 확인**
```bash
pm2 status
netstat -tlnp | grep :3001
curl -f http://localhost:3001
```

### **2. 데이터베이스 상태 확인**
```bash
npx prisma db push
npx prisma generate
```

### **3. 현재 문제 확인**
- 직원 체크리스트 페이지 접속
- 상세 화면에서 디버깅 정보 확인
- `selectedChecklist.items` 길이 확인

### **4. 다음 단계 결정**
- 현재 문제 해결 후 리팩토링 진행
- 또는 바로 리팩토링 진행

---

## 🎯 **복구 후 우선순위**

### **즉시 해결 필요**
1. 직원 상세 화면 items 로딩 문제 해결
2. 디버깅 코드 제거
3. 서버 안정성 확인

### **단기 계획 (1-2일)**
1. 코드 복잡성 해결
2. API 구조 개선
3. 타입 안정성 강화

### **중기 계획 (1주)**
1. 데이터베이스 스키마 재설계
2. 프론트엔드 리팩토링
3. 자동화 시스템 구현

---

**이 문서를 참고하여 백업 후 복구 시 현재 상태를 완전히 파악할 수 있습니다.** 