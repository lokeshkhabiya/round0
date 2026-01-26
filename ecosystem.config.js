module.exports = {
  apps: [
    {
      name: 'admin-dashboard',
      script: '../../node_modules/.bin/next',
      args: ['start', '-p', '3001'],
      cwd: 'apps/admin-dashboard',
      watch: false,
      autorestart: true,
    },
    {
      name: 'recruiter-dashboard',
      script: '../../node_modules/.bin/next',
      args: ['start', '-p', '3000'],
      cwd: 'apps/recruiter-dashboard',
      watch: false,
      autorestart: true,
    },
    {
      name: 'candidate-dashboard',
      script: '../../node_modules/.bin/next',
      args: ['start', '-p', '3002'],
      cwd: 'apps/candidate-dashboard',
      watch: false,
      autorestart: true,
    },
    {
      name: 'backend',
      script: 'bun',
      args: ['run', 'start'],
      cwd: 'apps/backend',
      watch: false,
      autorestart: true,
      env: {
        PORT: 8080,
      },
    },
  ],
}; 