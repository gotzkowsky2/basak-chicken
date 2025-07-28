module.exports = {
  apps: [
    {
      name: 'basak-chicken-app',
      script: './node_modules/.bin/next',
      args: 'dev -H 0.0.0.0 -p 3001',
      cwd: '/root/basak-chicken-app',
      instances: 1,
      autorestart: true,
      watch: false, // 파일 변경 감지 비활성화로 안정성 향상
      max_memory_restart: '512M', // 메모리 제한 낮춤
      max_restarts: 10, // 최대 재시작 횟수 제한
      min_uptime: '10s', // 최소 실행 시간
      restart_delay: 4000, // 재시작 지연
      kill_timeout: 5000, // 종료 대기 시간
      env: {
        NODE_ENV: 'development',
        PORT: '3001' // 환경변수로 포트 명시
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // 추가 안정성 설정
      node_args: '--max-old-space-size=512', // Node.js 메모리 제한
      exp_backoff_restart_delay: 100 // 재시작 지연 시간
    }
  ]
}; 