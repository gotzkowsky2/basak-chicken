# 2025-08-18(월) 시스템 정비/성능개선/안정화 계획

본 문서는 다음 주 월요일(2025-08-18)에 진행할 정비 작업의 전체 목록, 목적, 상세 절차, 영향 범위, 검증/롤백 계획을 포함합니다. 이 문서만 보고도 바로 수행/복구가 가능하도록 작성했습니다.

## 1) 목표 및 기대효과
- DB 커넥션/메모리 안정화(PrismaClient 싱글톤화)
- API 응답/쿼리 성능 개선(DB 인덱스/Select 최소화)
- 런타임/빌드 잔여 이슈 사전 차단(캐시/프로세스/로그 체계)
- UX 일관성 및 모바일 가독성 추가 개선

## 2) 변경/정비 항목(세부)

### A. PrismaClient 싱글톤 도입 (최우선)
- 문제: 각 API/레이아웃에서 `new PrismaClient()` 반복 생성 → 커넥션/메모리 낭비 가능성
- 조치:
  1. `src/lib/prisma.ts` 신규 생성
     ```ts
     import { PrismaClient } from '@prisma/client';
     const globalForPrisma = global as unknown as { prisma?: PrismaClient };
     export const prisma = globalForPrisma.prisma || new PrismaClient();
     if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
     export default prisma;
     ```
  2. 모든 API/서버 코드에서 `import prisma from '@/lib/prisma';` 로 교체
  3. 생성자 직접 호출 제거
- 영향: 전 API 파일(검색 기준: `new PrismaClient(`)
- 검증: `/api/test-prisma`, 주요 API 5종 샘플 호출 200 확인
- 리스크: 타입 경로 문제 → 절대경로(`@/lib/prisma`) 확인, 빌드로 사전 검증

### B. DB 인덱스 추가
- 대상 및 효과:
  - `InventoryItem(lastUpdated, createdAt, isActive)` → ‘업데이트 필요’ 조회 가속
  - `InventoryCheck(itemId, checkedAt)` → 최근 체크 조회 가속
  - `PurchaseRequest(status, priority, requestedAt)` 점검 후 필요 시 추가
- 절차:
  1. Prisma 스키마에 @@index 추가 또는 SQL migration 작성
  2. `npx prisma migrate dev --name add_perf_indexes` (운영은 `prisma migrate deploy`)
- 검증: 관리자/직원 ‘업데이트 필요’ 페이지 로딩시간 체감, 쿼리 플랜 확인(Optional)
- 리스크: 대용량 인덱스 생성 시간 → 야간/저부하 시간 수행

### C. SELECT 슬림화/응답 정제
- 점검: 목록 API에서 불필요 필드 제외(이미 일부 적용). 응답 크기/직렬화 비용 감소
- 우선 후보: 직원/관리자 인벤토리 목록, 피드 API

### D. 미들웨어/쿠키 루틴 단순화
- 현상: 로그인 페이지 진입 시 다중 도메인/경로/옵션 조합으로 쿠키 제거 루프가 큼
- 조치: 실제 사용 도메인/경로 위주로 축소(테스트 후 단계적 축소)

### E. 빌드/실행 환경 정리
- `next.config.js` vs `next.config.ts` 혼재 → JS 하나만 유지(현재 JS 사용)
- PM2 항상 단일 인스턴스 유지(fork 1)
- 전역 CSS 미적용 대비 `CssGuard` 유지

### F. 로깅/보안
- 운영에서 과도한 console.log 제거(민감정보/대량 로깅)
- 에러/헬스 모니터링 단순 엔드포인트 추가(`/api/healthz` → 200 OK)
- 레이트리밋(선택): 인증/업데이트 API에 소프트 제한(과도 트래픽 방지)

### G. 모바일/UX 추가 개선(선택)
- 직원 메인 카드 수/그리드 간격 재조정(초소형 단말 기준)
- ‘업데이트 필요’ 위젯 skeleton/empty-state 문구 보강

## 3) 작업 순서(체크리스트)
1. 브랜치 생성: `git checkout -b chore/maintenance-2025-08-18`
2. Prisma 싱글톤 도입 → 전 파일 치환 → 빌드
3. 인덱스 마이그레이션 추가 → 로컬/스테이징 검증
4. 미들웨어 쿠키 정리 축소 → QA
5. 로그 레벨 조정 및 과도로그 제거 → QA
6. 선택 UX 개선 사항 적용
7. 병합/배포: `main` 병합, 클린 빌드, PM2 재기동, 헬스체크

## 4) 배포/롤백
- 배포 절차(요약):
  ```bash
  pm2 stop basak-chicken-app || true
  rm -rf .next .next/cache
  npm ci --no-audit --no-fund
  npm run build
  pm2 start npm --name basak-chicken-app -- start
  pm2 status && pm2 logs basak-chicken-app --lines 50 | cat
  ```
- DB 마이그레이션: 운영은 `prisma migrate deploy` 사용. 롤백은 백업/리스토어 또는 down 스크립트 준비(사전 백업 필수)

## 5) 검증 항목(필수)
- 관리자/직원 주요 페이지 최초 로드 < 1.5s(내부망 기준) 목표
- ‘업데이트 필요’ 페이지 로딩시간 체감 확인
- 로그인/쿠키 플로우 정상(관리자→직원 전환 포함)
- 에러로그/경고로그 급증 없음

## 6) 참고/검색 키워드
- 코드 검색 키: `new PrismaClient(`, `console.log(`, `__Host-employee_auth`
- 주요 파일: `src/middleware.ts`, `next.config.js`, `src/app/**/route.ts`

---
작성: 2025-08-15, 다음 실행일: 2025-08-18(월)
