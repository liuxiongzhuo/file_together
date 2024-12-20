const express = require('express');
const httpProxy = require('http-proxy');
const config = require('./config.json')

const app = express();
const port = 3000;
const proxy = httpProxy.createProxyServer({});
const servers = config.servers

// 反向代理
app.use((req, res, next) => {
  if (req.url.startsWith('/i/')) {
    const fileName = req.url.substring(3);
    const timestamp = parseInt(fileName.split('.')[0], 10); 
    const targetServer = servers.find(server => {
      return timestamp >= server.startTime && timestamp <= server.endTime;
    });
    
    if (!targetServer) {
      return res.status(404).send('Server Not Found for Timestamp');
    }
    const targetUrl = `https://${targetServer.host}`;
    proxy.web(req, res, {
      target: targetUrl,
      changeOrigin: true,
    }, (err) => {
      console.error(`Proxy error to ${targetUrl}:`, err);
      res.status(500).send('Proxy Error');
    });
    return; 
  }
  return next();
});

// 启动
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});