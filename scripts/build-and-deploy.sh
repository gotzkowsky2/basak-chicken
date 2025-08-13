#!/bin/bash
set -euo pipefail

echo "🚀 Basak Chicken App 빌드 및 배포 시작..."

# 1. 의존성 설치 (devDependencies 포함) — 빌드에 필요
echo "📋 의존성 설치 중 (npm ci)..."
npm ci

# 2. 프로덕션 빌드
echo "🔨 프로덕션 빌드 실행 중..."
npm run build
echo "✅ 빌드 성공!"

# 3. devDependencies 제거로 런타임 슬림화 (선택)
echo "🧹 devDependencies 정리 중 (npm prune --omit=dev)..."
npm prune --omit=dev || true

# 4. PM2 프로세스 재기동: 개발 서버 잔존 방지 위해 삭제 후 ecosystem으로 기동
echo "🔄 PM2 재기동 (ecosystem) 중..."
pm2 delete basak-chicken-app || true
pm2 start ecosystem.config.js --env production

# 5. 상태 및 헬스체크
echo "🔍 PM2 상태 확인..."
pm2 status | cat

echo "🏥 헬스 체크 중..."
for i in {1..10}; do
  if curl -fsS http://127.0.0.1:3001 > /dev/null; then
    echo "✅ 서버 정상 작동!"
    break
  fi
  echo "⏳ 대기 중 ($i/10)"; sleep 2
done

echo "🎉 배포 완료!"
