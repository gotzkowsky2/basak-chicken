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

### ⏳ 3단계: 직원 페이지 개선 (예정)
**목표**: 효율적인 업무 수행을 위한 직원 인터페이스

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
- 메모리 사용량: 72.7MB (효율적)
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

### 중간 (다음 단계)
1. **직원 페이지 개선** - 통합 대시보드 및 스마트 체크리스트

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

### 다음 작업할 파일들:
- `src/app/employee/` (직원 페이지 개선)

---

**마지막 업데이트**: 2025-07-28
**현재 상태**: 모든 관리자 페이지 구현 완료 (체크리스트, 주의사항, 메뉴얼, 재고/구매 관리)
**다음 단계**: 직원 페이지 개선 및 통합 대시보드 구현 