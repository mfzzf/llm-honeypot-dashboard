const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3001;

// 配置跨域
app.use(cors());
app.use(bodyParser.json());

// Elasticsearch配置
const elasticConfig = {
  node: 'http://10.255.248.65:9200',
  auth: {
    username: 'elastic',
    password: 'H3JIfzF2Ic*dbRj4c5Kd'
  },
  indices: {
    honeypot: 'honeypot-logs*',
    llm: 'llm-logs*'
  }
};

// GPU 监控配置
const gpuConfig = {
  metricsUrl: 'http://10.255.248.65:9835/metrics'
};

// 创建Elasticsearch客户端
const client = new Client(elasticConfig);

// 健康检查路由
app.get('/api/health', async (req, res) => {
  try {
    const health = await client.cluster.health();
    res.json(health);
  } catch (error) {
    console.error('Elasticsearch健康检查失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 搜索路由
app.post('/api/elasticsearch/search', async (req, res) => {
  try {
    const { index, body } = req.body;
    const result = await client.search({
      index,
      body
    });
    
    res.json(result);
  } catch (error) {
    console.error('Elasticsearch搜索失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 索引信息路由
app.get('/api/elasticsearch/indices', async (req, res) => {
  try {
    const result = await client.cat.indices({ format: 'json' });
    res.json(result);
  } catch (error) {
    console.error('获取索引信息失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// GPU 指标代理路由
app.get('/api/gpu/metrics', async (req, res) => {
  try {
    console.log('正在获取GPU指标...');
    const response = await axios.get(gpuConfig.metricsUrl);
    console.log('GPU指标获取成功');
    res.setHeader('Content-Type', 'text/plain');
    res.send(response.data);
  } catch (error) {
    console.error('获取GPU指标失败:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '服务器正常运行' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`代理服务器运行在 http://localhost:${port}`);
  console.log(`连接到Elasticsearch: ${elasticConfig.node}`);
  console.log(`处理索引: ${elasticConfig.indices.honeypot}, ${elasticConfig.indices.llm}`);
  console.log(`GPU监控端点: ${gpuConfig.metricsUrl}`);
}); 