module.exports = {
  apps: [{
    name: 'basak-chicken-app',
    script: 'node_modules/.bin/next',
    args: 'dev -H 0.0.0.0 -p 3001',
    cwd: '/root/basak-chicken-app',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    // 메모리 및 성능 설정
    node_args: '--max-old-space-size=1024', // 메모리 제한을 1GB로 증가
    max_memory_restart: '800M', // 800MB 도달 시 자동 재시작
    
    // 로그 설정 개선
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 자동 재시작 설정
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 크래시 방지
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // 모니터링
    pmx: true,
    
    // 환경 변수
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}; 