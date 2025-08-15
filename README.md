# Basak Chicken 운영 시스템

## ⚠️ 중요: 포트 설정 ⚠️
# 이 프로젝트는 반드시 3001 포트에서 실행되어야 합니다.
# 도메인 crew.basak-chicken.com이 3001 포트로 연결됩니다.
# 절대 3000 포트로 실행하지 마세요!
# 
# package.json의 dev 스크립트: "dev": "next dev -H 0.0.0.0 -p 3001"
# PM2 실행 시 ecosystem.config.js 사용 권장

## 📝 체크리스트 구조 (2025-07-30)

### 올바른 체크리스트 구조:
```
체크리스트 이름: "주방, 준비" (템플릿 이름)
├── 체크리스트 항목 1: "재료 준비" (직접 입력)
│   └── 연결 항목들: "닭고기 재고 확인", "재료 세척 방법" 등 (재고/메뉴얼/주의사항에서 선택)
├── 체크리스트 항목 2: "조리대 정리" (직접 입력)
│   └── 연결 항목들: "정리 절차", "청소도구 재고" 등
└── 체크리스트 항목 3: "바닥 청소" (직접 입력)
    └── 연결 항목들: "청소 방법", "청소도구 확인" 등
```

### 현재 문제점 (2025-07-30):
1. **체크리스트 항목들이 "연결 항목" 섹션에 잘못 들어가 있음**
2. **구조가 완전히 뒤바뀌어 있음**
3. **구분 옵션이 잘못됨** (체크리스트, 공통 등이어야 함)
4. **새 체크리스트 항목 등록에서도** 연결 항목에 체크리스트를 추가하게 되어 있음

### 수정해야 할 것:
1. **체크리스트 항목들**을 위로 올리고 직접 입력할 수 있게 만들기
2. **각 체크리스트 항목을 클릭하면** 그 항목에 연결 항목을 추가할 수 있게 만들기
3. **구분 옵션**을 원래대로 복원 (체크리스트, 공통 등)
4. **UI 구조 수정**: 체크리스트 내용 → 체크리스트 항목들 → 각 항목별 연결 항목

## 🛡️ 서버 안정성 설정
# - PM2 ecosystem.config.js에 안정성 설정 적용됨
# - 메모리 제한: 512MB
# - 최대 재시작 횟수: 10회
# - 파일 변경 감지 비활성화로 안정성 향상
# - 모니터링 스크립트: monitor.sh (30초마다 상태 체크)

## 🔧 서버 관리 명령어
# PM2 시작: pm2 start ecosystem.config.js
# PM2 재시작: pm2 restart basak-chicken-app
# PM2 상태 확인: pm2 status
# PM2 로그 확인: pm2 logs basak-chicken-app

## 🚀 배포/운영 절차 요약

1) 클린 빌드 (청크 누락/캐시 이슈 예방)
```bash
pm2 stop basak-chicken-app || true
rm -rf .next .next/cache
npm ci --no-audit --no-fund
npm run build
pm2 start npm --name basak-chicken-app -- start
pm2 status
```

2) 헬스체크(내부)
```bash
curl -sI http://127.0.0.1:3001/ | cat
curl -sI http://127.0.0.1:3001/employee | cat
curl -sI http://127.0.0.1:3001/admin | cat
```

3) 문제 발생 시
- `Cannot find module './XXXX.js'` → `.next` 폴더 삭제 후 재빌드/재시작
- CSS 미적용으로 “아이콘만 큼직하게” 보일 때 → 강력 새로고침 또는 1회 자동 리로드(`CssGuard`) 동작 확인
- 세션 이슈(로그인 유지 안됨) → `__Host-*` 쿠키 포함 확인, 브라우저 쿠키 삭제 후 재로그인

4) 포트/환경
- 반드시 3001 포트 사용 (`npm start`는 `-p 3001`)
- 도메인 `crew.basak-chicken.com` 3001 포트 매핑

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
