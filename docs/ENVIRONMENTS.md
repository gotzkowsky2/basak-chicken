# 운영/개발 환경 분리 운영 가이드 (2025-08-19)

## 요약
- 운영(Production)
  - 경로: `/root/basak-chicken-app`
  - 도메인: `https://crew.basak-chicken.com`
  - 포트: 3001 (Next.js `next start -p 3001`)
  - PM2 프로세스: `basak-chicken-app`
  - NODE_ENV: `production`
  - 로그: `/root/basak-chicken-app/logs/*`

- 개발(Dev/Staging)
  - 경로: `/root/basak-chicken-app-dev` (Git worktree, 브랜치 `develop`)
  - 도메인: `https://dev.crew.basak-chicken.com`
  - 포트: 3002 (Next.js `next start -p 3002`)
  - PM2 프로세스: `basak-chicken-app-dev`
  - NODE_ENV: `production` (secure 쿠키 발급 보장)
  - 로그: `/root/basak-chicken-app-dev/logs-dev/*`

- 공통 원칙
  - App Router 쿠키 정책: `__Host-*` secure 쿠키 필요 → 반드시 HTTPS
  - 운영/개발 DB는 분리. 스키마 변경은 dev에서 생성/검증 → 운영에 `migrate deploy`

## 배포/재시작
- 운영 배포
```
cd /root/basak-chicken-app
npm ci --no-audit --no-fund
npm run build
pm2 restart basak-chicken-app
```
- 개발 배포
```
cd /root/basak-chicken-app-dev
npm run build
pm2 restart basak-chicken-app-dev --update-env
```
- 헬스체크
```
curl -sI https://crew.basak-chicken.com/ | cat
curl -sI https://dev.crew.basak-chicken.com/ | cat
```

## Git/브랜치
- 운영 디렉터리: 현재 브랜치(예: `main`)로 운영
- 개발 디렉터리: worktree로 `develop`
- 동기화: dev에서 검증 후 운영으로 merge/rebase/cherry-pick

## Nginx
- 개발 서버블록: `/etc/nginx/sites-available/dev.crew.basak-chicken.com` → enabled 링크
- 프록시 대상: `127.0.0.1:3002`
- 테스트/리로드
```
nginx -t && systemctl reload nginx
```

## SSL (Let’s Encrypt / Certbot)
- 등록 이메일: `info@basak-chicken.com`
- dev 인증서 발급 예시
```
certbot --nginx -d dev.crew.basak-chicken.com \
  --non-interactive --agree-tos --email info@basak-chicken.com \
  --redirect --no-eff-email
nginx -t && systemctl reload nginx
```
- 만료 전 자동 갱신. 알림은 위 이메일로 수신.

## 데이터베이스 정책
- 분리 운영(권장): 운영 DB와 개발 DB를 분리
- 스키마 흐름: dev에서 마이그레이션 생성/검증 → 운영에서 `npx prisma migrate deploy`
- (선택) 개발 DB를 운영 데이터로 주기적으로 갱신 시
  - 운영 덤프(데이터만) → 개발 DB 트렁케이트 → 복원 → PII 마스킹
  - 자동화 스크립트는 `scripts/refresh-staging-from-prod.sh`로 관리 권장

## PM2 치트시트
```
pm2 status
pm2 logs basak-chicken-app
pm2 logs basak-chicken-app-dev
pm2 restart basak-chicken-app
pm2 restart basak-chicken-app-dev --update-env
```

## 비상 수칙
- 빌드/재시작 후 CSS/아이콘 깨짐: 강력 새로고침(Cmd/Ctrl+Shift+R), 정적 캐시 확인
- 로그인 안됨: HTTPS/secure 쿠키, 도메인/서브도메인, `__Host-*` 쿠키 존재 여부 점검
- 대규모 변경 전: 코드/DB 백업 선행 (백업 디렉터리 `/root/basak-chicken-app/backups/` 등)
