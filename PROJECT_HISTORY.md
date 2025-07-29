# Basak Chicken 프로젝트 히스토리 및 현재 상황

## 📋 프로젝트 개요

**Basak Chicken 운영 시스템**은 치킨점 운영을 위한 종합적인 체크리스트 관리 시스템입니다.

### 🏗️ 기술 스택
- **프론트엔드**: Next.js 15.3.5 + TypeScript + Tailwind CSS
- **백엔드**: Next.js API Routes + Prisma ORM
- **데이터베이스**: PostgreSQL
- **배포**: PM2 (3001 포트, crew.basak-chicken.com 도메인)
- **인증**: Cookie 기반 세션 관리

### 🎯 시스템 목적
치킨점의 일일 운영 체크리스트를 체계적으로 관리하여:
- 업무 표준화 및 품질 관리
- 재고 관리 및 구매 요청 자동화
- 주의사항 및 메뉴얼 체계적 관리
- 직원 업무 효율성 증대

---

## 🔄 시스템 컨셉 변화 히스토리

### Phase 1: 기존 방식 (2024년 12월 27일 이전)
**컨셉**: 사용자가 직접 체크리스트를 작성하는 방식
- 사용자가 체크리스트에 들어가서 직접 작성
- 임시 저장하면서 점진적으로 작성
- 최종 제출 시 완료

### Phase 2: 새로운 방식 (2024년 12월 27일 이후)
**컨셉**: 미리 생성된 체크리스트를 업데이트하는 방식
- **자동 생성**: 하루에 한 시간대, 한 장소의 체크리스트가 미리 자동 생성
- **선택 기반**: 직원이 자신과 관련된 체크리스트 선택
- **업데이트 방식**: 기존 체크리스트를 업데이트하는 방식
- **최종 제출**: 완료/보고 시 더 이상 수정 불가

---

## 📊 데이터베이스 스키마 진화

### 초기 모델 (완료됨)
```prisma
- Admin, Employee (사용자 관리)
- ChecklistTemplate, ChecklistSubmission, ChecklistItemResponse (체크리스트)
- ChecklistTag, TemplateTagRelation (태그 시스템)
- Workplace, Category, TimeSlot (열거형)
```

### 확장 모델 (2024년 12월 27일 추가)
```prisma
- Precaution (주의사항 관리)
- Manual (메뉴얼 관리)
- InventoryItem, InventoryCheck (재고 관리)
- PurchaseRequest, PurchaseRequestItem (구매 관리)
- ChecklistItem (체크리스트 항목 확장)
```

### 최신 모델 (2024년 12월 27일 추가)
```prisma
- ChecklistInstance (통합 체크리스트 인스턴스)
- ConnectedItemProgress (연결된 항목 진행 상태)
- TimeSlotChecklistStatus (시간대별 잠금 상태)
```

---

## 🚀 개발 진행 상황

### ✅ 완료된 단계

#### 1. 데이터베이스 스키마 확장 (100% 완료)
- 모든 새로운 모델 구현됨
- 데이터베이스 동기화 완료
- Prisma Client v6.12.0 최신 버전

#### 2. 관리자 페이지 구현 (100% 완료)
**구현된 페이지들:**
1. **체크리스트 관리** (`/admin/checklists`)
   - 템플릿 CRUD
   - 체크리스트 항목 관리 API
   - 항목별 타입 설정 (일반 체크, 재고 확인/보충, 메뉴얼 참조, 주의사항 확인)
   - 순서 및 필수 여부 설정
   - 주의사항/메뉴얼/재고와 실제 연동

2. **주의사항 관리** (`/admin/precautions`)
   - Precaution CRUD API
   - 근무처/시간대별 주의사항 관리
   - 우선순위 설정 (HIGH, MEDIUM, LOW)
   - 필터링 및 검색 기능

3. **메뉴얼 관리** (`/admin/manuals`)
   - Manual CRUD API
   - 근무처/시간대별 메뉴얼 관리
   - 카테고리별 분류 (메뉴얼, 절차, 가이드, 교육)
   - 버전 관리

4. **재고/구매 관리** (`/admin/inventory`)
   - InventoryItem CRUD API
   - 재고 현황 대시보드
   - 부족 재고 알림
   - 구매 요청 관리 API
   - 구매 요청 승인/거부 시스템

#### 3. 서버 안정성 개선 (100% 완료)
- PM2로 안정적 실행 (3001 포트)
- 메모리 사용량 최적화 (39.2MB)
- 빌드 캐시 문제 해결
- Git 커밋으로 모든 변경사항 저장

### 🔄 현재 진행 중인 단계

#### 4. 체크리스트 임시 저장 기능 개발 (진행 중)
**목표**: 체크리스트 작성 중 자동 저장 및 이어서 작성 기능

**구현된 기능들:**
1. **데이터베이스 스키마 추가**
   - `ChecklistProgress`: 체크리스트 진행 상태 저장
   - `ConnectedItemProgress`: 연결된 항목들의 진행 상태 저장
   - `TimeSlotChecklistStatus`: 시간대별 체크리스트 잠금 상태 관리

2. **API 엔드포인트 구현**
   - `/api/employee/checklist-progress` (GET/POST): 체크리스트 진행 상태 저장/조회
   - `/api/employee/timeslot-status` (GET/POST): 시간대별 잠금 상태 관리

3. **프론트엔드 기능 구현**
   - 자동 저장 기능 (체크박스 변경 시 즉시 저장)
   - 기존 진행 상태 불러오기 기능
   - 시간대별 잠금 시스템 (한 명만 편집 가능)
   - 작성 중인 체크리스트 이어서 작성 기능

**현재 문제점:**
- **500 에러**: `Cannot read properties of undefined (reading 'findUnique')`
- Prisma 클라이언트가 새로운 모델들을 인식하지 못함
- 서버가 에러 상태로 실행되지 않음

#### 5. 개발용 체크리스트 생성기 (진행 중)
**목표**: 테스트를 위한 체크리스트 자동 생성 기능

**구현된 기능들:**
1. **관리자 페이지** (`/admin/dev-checklist-generator`)
   - 날짜별 테스트용 체크리스트 생성
   - 기존 체크리스트 조회 및 삭제
   - 직관적인 UI/UX

2. **API 엔드포인트**
   - `/api/admin/dev-generate-checklists` (GET/POST): 체크리스트 생성/조회
   - `/api/admin/dev-delete-checklists` (DELETE): 체크리스트 삭제

**최근 수정사항 (2024년 12월 27일):**
- `ChecklistSubmission` → `ChecklistInstance` 모델 변경
- `submissionDate` → `date` 필드명 변경
- `isSubmitted` 필드 추가
- 중복 생성 방지 로직 추가

**현재 문제점:**
- `findUnique` 오류 발생 (Prisma 클라이언트 재생성 필요)

---

## 🔧 현재 기술적 문제점 및 해결 방안

### 1. Prisma 클라이언트 문제
**문제**: `Cannot read properties of undefined (reading 'findUnique')`
**원인**: 새로운 스키마 변경사항이 Prisma 클라이언트에 반영되지 않음
**해결방안**:
```bash
npx prisma generate
npx prisma db push
pm2 restart basak-chicken-app
```

### 2. 모델 불일치 문제
**문제**: API에서 `ChecklistSubmission`과 `ChecklistInstance` 모델 혼용
**해결방안**: 모든 API를 `ChecklistInstance` 모델로 통일

### 3. 필드명 불일치 문제
**문제**: `submissionDate` vs `date`, `isSubmitted` 필드 누락
**해결방안**: 스키마와 API 코드의 필드명 통일

---

## 📁 현재 파일 구조 및 상태

### 완료된 파일들 (✅)
```
src/app/admin/
├── checklists/page.tsx (체크리스트 관리)
├── precautions/page.tsx (주의사항 관리)
├── manuals/page.tsx (메뉴얼 관리)
├── inventory/page.tsx (재고/구매 관리)
└── dev-checklist-generator/page.tsx (개발용 생성기)

src/app/api/admin/
├── checklist-items/route.ts
├── precautions/route.ts
├── manuals/route.ts
├── inventory/route.ts
├── purchase-requests/route.ts
├── dev-generate-checklists/route.ts
└── dev-delete-checklists/route.ts
```

### 현재 작업 중인 파일들 (🔄)
```
src/app/employee/checklist/page.tsx (직원 체크리스트 페이지)
src/app/api/employee/checklist-progress/route.ts (진행 상태 API)
src/app/api/employee/timeslot-status/route.ts (시간대 잠금 API)
```

### 다음 작업할 파일들 (⏳)
```
src/app/api/employee/inventory/route.ts (직원 재고 확인/수정 API)
src/app/api/employee/purchase-requests/route.ts (직원 구매 요청 API)
src/app/employee/checklist/components/ (체크리스트 상세 작업 컴포넌트들)
```

---

## 🎯 다음 단계 계획

### 즉시 해결해야 할 문제 (우선순위: 높음)
1. **Prisma 클라이언트 재생성**
   ```bash
   npx prisma generate
   npx prisma db push
   pm2 restart basak-chicken-app
   ```

2. **API 모델 통일**
   - 모든 API를 `ChecklistInstance` 모델로 통일
   - 필드명 일치 확인

3. **개발용 체크리스트 생성기 테스트**
   - 생성/삭제 기능 정상 작동 확인
   - 직원 페이지에서 생성된 체크리스트 확인

### 단기 목표 (1-2일)
1. **체크리스트 임시 저장 기능 완성**
   - 자동 저장 기능 검증
   - 시간대별 잠금 시스템 테스트
   - UI/UX 개선

2. **직원 페이지 개선**
   - 연결된 항목 상세 작업 시스템
   - 재고 확인 및 구매 요청 기능
   - 메뉴얼 및 주의사항 조회

### 중기 목표 (1주)
1. **자동화 시스템 구현**
   - 자정 체크리스트 자동 생성
   - 알림 시스템
   - 보고서 자동 생성

2. **성능 최적화**
   - 불필요한 API 호출 방지
   - 대량 데이터 처리 최적화
   - 캐싱 시스템 구현

---

## 🔍 디버깅 및 모니터링

### 서버 상태 확인 명령어
```bash
# PM2 상태 확인
pm2 status

# 서버 로그 확인
pm2 logs basak-chicken-app --lines 50

# 포트 확인
netstat -tlnp | grep :3001

# 서버 응답 확인
curl -f http://localhost:3001
```

### 데이터베이스 상태 확인 명령어
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 동기화
npx prisma db push

# 데이터베이스 연결 확인
node check-db.js
```

### 개발 환경 설정
```bash
# 현재 작업 디렉토리
cd /root/basak-chicken-app

# 개발 서버 실행 (3001 포트)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

---

## 📝 중요 참고사항

### 1. 포트 설정
- **반드시 3001 포트에서 실행** (crew.basak-chicken.com 도메인 연결)
- 3000 포트 사용 금지

### 2. 데이터베이스 백업
- 정기적 백업 필요: `pg_dump basak_chicken_db > backup_$(date +%Y%m%d_%H%M%S).sql`
- 현재 백업 파일: `backup_before_upgrade_20250728_110159.sql`

### 3. Git 관리
- 모든 변경사항은 Git으로 커밋
- 브랜치 전략: main 브랜치에서 직접 개발
- 커밋 메시지: 명확한 설명 포함

### 4. 에러 대응
- 서버 다운 시: `pm2 restart basak-chicken-app`
- 데이터베이스 오류 시: `npx prisma db push`
- 빌드 오류 시: `.next` 폴더 삭제 후 재빌드

---

## 📞 연락처 및 지원

### 현재 개발 환경
- **서버**: Linux 5.4.0-216-generic
- **작업 디렉토리**: `/root/basak-chicken-app`
- **데이터베이스**: PostgreSQL (localhost:5432)
- **도메인**: crew.basak-chicken.com

### 문제 발생 시 대응 순서
1. 로그 확인 (`pm2 logs basak-chicken-app`)
2. 서버 상태 확인 (`pm2 status`)
3. 데이터베이스 연결 확인 (`node check-db.js`)
4. Prisma 클라이언트 재생성 (`npx prisma generate`)
5. 서버 재시작 (`pm2 restart basak-chicken-app`)

---

**마지막 업데이트**: 2024년 12월 27일
**현재 상태**: 체크리스트 임시 저장 기능 개발 중, Prisma 클라이언트 문제 해결 필요
**다음 단계**: Prisma 클라이언트 재생성 및 API 모델 통일