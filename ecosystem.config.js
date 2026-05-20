module.exports = {
  apps: [{
    name: 'neevara-realty',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/neevara/error.log',
    out_file: '/var/log/neevara/out.log',
    max_memory_restart: '500M'
  }]
};
