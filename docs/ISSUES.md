# 주요 이슈 기록 및 해결 내역

## 1) 로그아웃 시 쿠키가 삭제 후 재등장하는 문제
- 증상: 로그아웃 시 쿠키가 지워지는 듯 보이나 즉시 재발급되어 로그인 상태로 보이는 현상
- 원인
  - 레거시 `__Host-employee`, `__Host-admin`와 신규 `_auth` 접미사 쿠키 혼재
  - 도메인/경로/secure/SameSite 조합 불일치로 일부 쿠키가 남음
  - 로그인 페이지 접근 시 잔존 쿠키 제거 미흡
- 해결
  - 로그인 발급 쿠키를 `__Host-employee_auth`, `__Host-admin_auth`로 통일
  - 로그아웃 API와 로그인 페이지 진입 미들웨어에서 모든 변형 쿠키를 도메인/경로/SameSite/secure 전 조합으로 만료 처리
  - 미들웨어에서 `Clear-Site-Data: "cookies"` 헤더 추가
  - 인증 확인 시 `__Host-*` 우선 사용
- 참고 파일: `src/app/api/employee/login/route.ts`, `src/app/api/*/logout/route.ts`, `src/middleware.ts`

## 2) 아이콘만 크게 보이는 스타일 깨짐(정적 자산 403)
- 증상: CSS/JS/폰트 403으로 아이콘만 크게 표시
- 원인: Nginx가 `/root` 하위 `.next/static` 읽기 권한 부족
- 해결: `/root`, 앱 디렉터리, `.next`에 실행/읽기 권한 부여, 정적 파일 읽기 권한 부여
- 참고: Nginx 설정 `/_next/static` alias 유지, 퍼미션 조정 커맨드 기록

## 3) 빌드 시 @tailwindcss/postcss 모듈 오류
- 증상: `Cannot find module '@tailwindcss/postcss'`
- 원인: 빌드 전에 `npm prune --omit=dev` 실행하여 devDependencies 제거
- 해결: `npm run build` 이후에 `npm prune --omit=dev` 실행하도록 배포 스크립트 흐름 확인/정렬

## 4) 직원관리 데스크탑에서 목록 미노출
- 증상: 모바일만 보이고 데스크탑에서 비어 보임
- 임시조치: 카드 레이아웃을 강제 노출, 테이블 레이아웃은 원인 정리 후 재활성화 예정
- 참고 파일: `src/components/admin/EmployeeList.tsx`

## 5) 관리자 메뉴얼 팝업에서 연결된 주의사항 미표시
- 증상: 팝업은 뜨나 연결된 주의사항 섹션 없음
- 해결: 직원용 모달 구성과 동일하게 섹션 추가(우선순위/태그/메타 정보/접기·펼치기)
- 참고 파일: `src/app/admin/manuals/page.tsx`

## 6) 태그 선택/필터 UI 과도한 공간 점유(모바일)
- 증상: 태그가 한 줄씩 크게 표시되어 공간 낭비
- 해결: 칩 크기/여백 축소, 스크롤 영역 분리, 검색 입력 추가로 선택성 향상
- 적용 범위: 관리자 주의사항/메뉴얼/재고, 직원 재고/주의사항/메뉴얼


