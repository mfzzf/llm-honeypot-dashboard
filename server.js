const express = require('express');
const cors = require('cors');
const { Client } = require('@elastic/elasticsearch');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
// 使用环境变量获取端口或默认使用3001
const port = process.env.PORT || 3001;

// 配置跨域
app.use(cors());
app.use(bodyParser.json());

// Elasticsearch配置
const elasticConfig = {
  node: process.env.ELASTIC_NODE || 'http://10.255.248.65:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME || 'elastic',
    password: process.env.ELASTIC_PASSWORD || 'H3JIfzF2Ic*dbRj4c5Kd'
  },
  indices: {
    honeypot: process.env.HONEYPOT_INDEX || 'honeypot-logs*',
    llm: process.env.LLM_INDEX || 'llm-logs*'
  }
};

// GPU 监控配置
const gpuConfig = {
  metricsUrl: process.env.GPU_METRICS_URL || 'http://10.255.248.65:9835/metrics'
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
    
    // 设置默认大小和最大限制
    if (body) {
      // 如果未指定size参数或为0，设置默认值
      if (body.size === undefined || body.size === 0) {
        body.size = 100; // 默认获取100条记录
      } else if (body.size > 10000) {
        body.size = 10000; // 最大限制10000条记录
      }
      
      // 如果未指定from参数，设置默认值
      if (body.from === undefined && body.from !== 0) {
        body.from = 0;
      }
    }
    
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

// 滚动搜索路由 - 获取所有日志
app.post('/api/elasticsearch/scroll-search', async (req, res) => {
  try {
    const { index, body, scrollTime = '1m' } = req.body;
    let allResults = [];
    
    // 设置初始滚动搜索
    let response = await client.search({
      index,
      scroll: scrollTime,
      body
    });
    
    // 收集第一批结果
    allResults = [...response.hits.hits];
    
    // 继续滚动直到没有更多结果
    while (response.hits.hits && response.hits.hits.length > 0) {
      response = await client.scroll({
        scroll_id: response._scroll_id,
        scroll: scrollTime
      });
      
      if (response.hits.hits && response.hits.hits.length > 0) {
        allResults = [...allResults, ...response.hits.hits];
      }
    }
    
    // 清理滚动上下文
    try {
      if (response._scroll_id) {
        await client.clearScroll({ 
          scroll_id: response._scroll_id 
        });
      }
    } catch (clearError) {
      console.error('清理滚动上下文失败:', clearError);
    }
    
    // 返回带有所有结果的响应
    res.json({
      took: allResults.length,
      hits: {
        total: { value: allResults.length },
        hits: allResults
      }
    });
  } catch (error) {
    console.error('Elasticsearch滚动搜索失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// GPU 指标代理路由
app.get('/api/gpu/metrics', async (req, res) => {
  try {
    // console.log('正在获取GPU指标...');
    const response = await axios.get(gpuConfig.metricsUrl);
    // console.log('GPU指标获取成功');
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