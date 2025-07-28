# Basak Chicken 운영 시스템

## ⚠️ 중요: 포트 설정 ⚠️
# 이 프로젝트는 반드시 3001 포트에서 실행되어야 합니다.
# 도메인 crew.basak-chicken.com이 3001 포트로 연결됩니다.
# 절대 3000 포트로 실행하지 마세요!
# 
# package.json의 dev 스크립트: "dev": "next dev -H 0.0.0.0 -p 3001"
# PM2 실행 시 ecosystem.config.js 사용 권장

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
