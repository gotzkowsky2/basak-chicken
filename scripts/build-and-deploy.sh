#!/bin/bash

echo "🚀 Basak Chicken App 빌드 및 배포 시작..."

# 1. 이전 빌드 캐시 정리
echo "📦 이전 빌드 캐시 정리 중..."
rm -rf .next

# 2. 의존성 확인
echo "📋 의존성 확인 중..."
npm ci --only=production

# 3. 빌드 실행
echo "🔨 프로덕션 빌드 실행 중..."
npm run build

# 4. 빌드 성공 확인
if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공!"
    
    # 5. PM2 재시작 (환경 변수 업데이트 포함)
    echo "🔄 PM2 재시작 중..."
    pm2 restart basak-chicken-app --update-env
    
    # 6. 서버 상태 확인
    echo "🔍 서버 상태 확인 중..."
    sleep 5
    pm2 status
    
    # 7. 헬스 체크
    echo "🏥 헬스 체크 중..."
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        echo "✅ 서버 정상 작동!"
        echo "🌐 접속 URL: http://localhost:3001"
    else
        echo "❌ 서버 응답 없음!"
        echo "📋 로그 확인: pm2 logs basak-chicken-app"
    fi
else
    echo "❌ 빌드 실패!"
    exit 1
fi

echo "🎉 배포 완료!"
