module.exports = {
  apps: [
    {
      name: "chatgpt-bot",
      script: "bot.js",
      watch: true,
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};