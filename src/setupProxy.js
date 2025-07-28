const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    ['/generate-image', '/generate-image-to-image', '/generate-story-chapter', '/generate-story-title', '/health'],
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
    })
  );
};