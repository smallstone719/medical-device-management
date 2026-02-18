module.exports = {
  apps: [
    {
      name: "vicas-device-management",
      script: "server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
