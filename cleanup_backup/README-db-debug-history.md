# Basak Chicken 프로젝트 DB/서버 문제 해결 히스토리

## 1. 문제 상황
- 직원 관리 시스템에서 직원 데이터가 조회되지 않고, `/api/employees` 등에서 500 에러가 발생함.
- PostgreSQL DB 연결, 권한, Prisma, Next.js 등 다양한 원인 가능성.

## 2. 주요 점검 및 조치 내역

### 2.1. DB 연결 정보 및 인증 방식 점검
- `.env`의 `DATABASE_URL`이 실제 DB와 일치하는지 확인.
- PostgreSQL의 `pg_hba.conf`에서 인증 방식이 `md5`(비밀번호 인증)으로 되어 있는지 점검.
- DB 비밀번호를 `ALTER USER basak_user WITH PASSWORD 'Sewon2002!';`로 재설정.
- 비밀번호 변경 후 `.env` 파일도 동일하게 수정.

### 2.2. DB 권한 및 소유권 문제
- basak_user로 접속 시 테이블이 보이지 않거나, SELECT 권한이 없다는 에러 발생.
- postgres(관리자) 계정으로 접속해 아래 명령어로 권한 및 소유권 부여:
  ```sql
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO basak_user;
  GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO basak_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO basak_user;
  ALTER TABLE "Admin" OWNER TO basak_user;
  ALTER TABLE "Checklist" OWNER TO basak_user;
  ALTER TABLE "ChecklistItem" OWNER TO basak_user;
  ALTER TABLE "ChecklistItemResponse" OWNER TO basak_user;
  ALTER TABLE "ChecklistSubmission" OWNER TO basak_user;
  ALTER TABLE "Employee" OWNER TO basak_user;
  ALTER TABLE "_prisma_migrations" OWNER TO basak_user;
  ```

### 2.3. DB 테이블/데이터 확인
- psql에서 `\dt`로 테이블 목록 확인, `SELECT * FROM "Employee";` 등으로 데이터 직접 조회.
- 테이블/데이터가 정상적으로 조회되는지 확인.

### 2.4. 서버/프론트엔드 연동
- `.env` 수정 후 Next.js 서버 재시작(`npm run dev`).
- 브라우저에서 http://91.99.75.135 접속, 직원 데이터가 정상적으로 나오는지 확인.

## 3. 결론 및 교훈
- DB 연결/권한/소유권/비밀번호/환경변수/서버 재시작 등 모든 요소가 맞아야 서비스가 정상 동작함.
- 문제 발생 시, DB 직접 접속 → 권한/소유권/데이터 확인 → 환경변수/서버 재시작 순으로 점검할 것.
- 모든 변경/조치 내역은 README-db-debug-history.md에 기록하여 추후 참고.

---

**이 파일은 basak-chicken 프로젝트의 DB/서버 문제 해결 과정을 기록한 히스토리입니다.** 