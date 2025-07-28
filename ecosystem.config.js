module.exports = {
  apps: [
    {
      name: 'basak-chicken-app',
      script: './node_modules/.bin/next',
      args: 'dev -H 0.0.0.0 -p 3001',
      cwd: '/root/basak-chicken-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}; 