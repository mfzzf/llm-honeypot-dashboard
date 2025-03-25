const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const bodyParser = require('body-parser');

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

// 启动服务器
app.listen(port, () => {
  console.log(`代理服务器运行在 http://localhost:${port}`);
  console.log(`连接到Elasticsearch: ${elasticConfig.node}`);
  console.log(`处理索引: ${elasticConfig.indices.honeypot}, ${elasticConfig.indices.llm}`);
}); 