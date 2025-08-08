module.exports = {
  apps: [{
    name: 'basak-chicken-app',
    script: '.next/standalone/server.js', // 실행 대상 파일
    interpreter: 'node',                  // Node로 실행
    args: '',
    cwd: '/root/basak-chicken-app',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
    node_args: '--max-old-space-size=2048',
    max_memory_restart: '1536M',
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 3000,
    pmx: true,
    env_production: {
      NODE_ENV: 'production',
    },
  }],
}; 