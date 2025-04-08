import axios from 'axios';

// Elasticsearch配置
const elasticConfig = {
  baseUrl: 'http://localhost:3001/api/elasticsearch', // 使用代理服务器避免CORS问题
  elkUrl: '10.255.248.65:9200',
  username: 'elastic',
  password: 'H3JIfzF2Ic*dbRj4c5Kd',
  honeypotIndex: 'honeypot-logs*',
  llmIndex: 'llm-logs*'
};

// 创建一个API实例
const api = axios.create({
  baseURL: elasticConfig.baseUrl,
});

// 获取指定时间范围内的蜜罐日志
export const getHoneypotLogs = async (from, to, size = 100, query = '*') => {
  try {
    const response = await api.post('/search', {
      index: elasticConfig.honeypotIndex,
      body: {
        size,
        query: {
          bool: {
            must: [
              { query_string: { query } },
              {
                range: {
                  '@timestamp': {
                    gte: from,
                    lte: to
                  }
                }
              }
            ]
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ]
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取蜜罐日志出错:', error);
    throw error;
  }
};

// 获取指定时间范围内的LLM日志
export const getLlmLogs = async (from, to, size = 100, query = '*') => {
  try {
    const response = await api.post('/search', {
      index: elasticConfig.llmIndex,
      body: {
        size,
        query: {
          bool: {
            must: [
              { query_string: { query } },
              {
                range: {
                  '@timestamp': {
                    gte: from,
                    lte: to
                  }
                }
              }
            ]
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ]
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取LLM日志出错:', error);
    throw error;
  }
};

// 获取蜜罐日志统计信息
export const getHoneypotStats = async (from, to) => {
  try {
    const response = await api.post('/search', {
      index: elasticConfig.honeypotIndex,
      body: {
        size: 0,
        query: {
          range: {
            '@timestamp': {
              gte: from,
              lte: to
            }
          }
        },
        aggs: {
          request_by_hour: {
            date_histogram: {
              field: '@timestamp',
              calendar_interval: 'hour',
              format: 'yyyy-MM-dd HH:mm:ss'
            }
          },
          top_ips: {
            terms: {
              field: 'remote_addr.keyword',
              size: 10
            }
          },
          by_path: {
            terms: {
              field: 'path.keyword',
              size: 10
            }
          },
          by_event_type: {
            terms: {
              field: 'event_type.keyword',
              size: 10
            }
          },
          by_level: {
            terms: {
              field: 'level.keyword',
              size: 5
            }
          },
          by_protocol: {
            terms: {
              field: 'protocol.keyword',
              size: 5
            }
          },
          by_username: {
            terms: {
              field: 'username.keyword',
              size: 10
            }
          },
          by_type: {
            terms: {
              field: 'type.keyword',
              size: 10
            }
          }
        }
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取蜜罐统计信息出错:', error);
    throw error;
  }
};

// 获取LLM日志统计信息
export const getLlmStats = async (from, to) => {
  try {
    const response = await api.post('/search', {
      index: elasticConfig.llmIndex,
      body: {
        size: 0,
        query: {
          range: {
            '@timestamp': {
              gte: from,
              lte: to
            }
          }
        },
        aggs: {
          request_by_hour: {
            date_histogram: {
              field: '@timestamp',
              calendar_interval: 'hour',
              format: 'yyyy-MM-dd HH:mm:ss'
            }
          },
          by_model: {
            terms: {
              field: 'model.keyword',
              size: 10
            }
          },
          by_status: {
            terms: {
              field: 'status.keyword',
              size: 10
            }
          },
          avg_response_time: {
            avg: {
              field: 'response_time'
            }
          }
        }
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取LLM统计信息出错:', error);
    throw error;
  }
};

// 获取所有蜜罐日志(滚动搜索)
export const getAllHoneypotLogs = async (from, to, query = '*') => {
  try {
    const response = await api.post('/scroll-search', {
      index: elasticConfig.honeypotIndex,
      body: {
        query: {
          bool: {
            must: [
              { query_string: { query } },
              {
                range: {
                  '@timestamp': {
                    gte: from,
                    lte: to
                  }
                }
              }
            ]
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ]
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取所有蜜罐日志出错:', error);
    throw error;
  }
};

// 获取所有LLM日志(滚动搜索)
export const getAllLlmLogs = async (from, to, query = '*') => {
  try {
    const response = await api.post('/scroll-search', {
      index: elasticConfig.llmIndex,
      body: {
        query: {
          bool: {
            must: [
              { query_string: { query } },
              {
                range: {
                  '@timestamp': {
                    gte: from,
                    lte: to
                  }
                }
              }
            ]
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ]
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('获取所有LLM日志出错:', error);
    throw error;
  }
};

// 获取综合仪表盘数据
export const getDashboardData = async (from, to) => {
  try {
    const [honeypotStats, llmStats] = await Promise.all([
      getHoneypotStats(from, to),
      getLlmStats(from, to)
    ]);
    
    return {
      honeypotStats,
      llmStats
    };
  } catch (error) {
    console.error('获取仪表盘数据出错:', error);
    throw error;
  }
}; 