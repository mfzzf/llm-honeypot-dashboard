import moment from 'moment';

// 处理时间序列数据
export const processTimeSeriesData = (data, interval = 'hour') => {
  if (!data || !data.aggregations || !data.aggregations.request_by_hour) {
    return { timestamps: [], counts: [] };
  }

  const buckets = data.aggregations.request_by_hour.buckets;
  const timestamps = buckets.map(bucket => moment(bucket.key_as_string).format('MM-DD HH:mm'));
  const counts = buckets.map(bucket => bucket.doc_count);

  return { timestamps, counts };
};

// 处理分类数据，如按模型、状态等
export const processCategoryData = (data, categoryField) => {
  if (!data || !data.aggregations || !data.aggregations[categoryField]) {
    return [];
  }

  const buckets = data.aggregations[categoryField].buckets;
  return buckets.map(bucket => ({
    name: bucket.key,
    value: bucket.doc_count
  }));
};

// 从LLM日志中提取请求类型统计
export const getLlmRequestTypeStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { types: [], counts: [] };
  }

  const typeCountMap = {};
  data.hits.hits.forEach(hit => {
    const type = hit._source.type || 'unknown';
    typeCountMap[type] = (typeCountMap[type] || 0) + 1;
  });

  const types = Object.keys(typeCountMap);
  const counts = types.map(type => typeCountMap[type]);

  return { types, counts };
};

// 从蜜罐日志中提取日志级别统计
export const getLogLevelStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return [];
  }

  const levelCountMap = {};
  data.hits.hits.forEach(hit => {
    const level = hit._source.level || 'unknown';
    levelCountMap[level] = (levelCountMap[level] || 0) + 1;
  });

  return Object.entries(levelCountMap).map(([name, value]) => ({ name, value }));
};

// 获取LLM模型使用统计
export const getLlmModelStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { models: [], counts: [] };
  }

  const modelCountMap = {};
  data.hits.hits.forEach(hit => {
    const model = hit._source.model || 'unknown';
    modelCountMap[model] = (modelCountMap[model] || 0) + 1;
  });

  const models = Object.keys(modelCountMap);
  const counts = models.map(model => modelCountMap[model]);

  return { models, counts };
};

// 获取蜜罐IP地址统计
export const getHoneypotIpStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { ips: [], counts: [] };
  }

  const ipCountMap = {};
  data.hits.hits.forEach(hit => {
    // 支持多种可能的IP字段命名
    const ip = hit._source.remote_addr || hit._source.client_ip || hit._source.host || 'unknown';
    if (ip !== 'unknown') {
      ipCountMap[ip] = (ipCountMap[ip] || 0) + 1;
    }
  });

  // 按访问次数排序
  const sortedEntries = Object.entries(ipCountMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const ips = sortedEntries.map(entry => entry[0]);
  const counts = sortedEntries.map(entry => entry[1]);

  return { ips, counts };
};

// 获取LLM事件类型统计
export const getLlmEventTypeStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { eventTypes: [], counts: [] };
  }

  const eventTypeCountMap = {};
  data.hits.hits.forEach(hit => {
    const eventType = hit._source.type || 'unknown';
    eventTypeCountMap[eventType] = (eventTypeCountMap[eventType] || 0) + 1;
  });

  const eventTypes = Object.keys(eventTypeCountMap);
  const counts = eventTypes.map(eventType => eventTypeCountMap[eventType]);

  return { eventTypes, counts };
};

// 获取LLM状态统计
export const getLlmStatusStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { statuses: [], counts: [] };
  }

  const statusCountMap = {};
  data.hits.hits.forEach(hit => {
    const status = hit._source.status || 'unknown';
    statusCountMap[status] = (statusCountMap[status] || 0) + 1;
  });

  const statuses = Object.keys(statusCountMap);
  const counts = statuses.map(status => statusCountMap[status]);

  return { statuses, counts };
};

// 从蜜罐日志中提取事件类型统计
export const getHoneypotEventTypeStats = (data) => {
  if (!data || !data.hits || !data.hits.hits) {
    return { eventTypes: [], counts: [] };
  }

  const eventTypeCountMap = {};
  data.hits.hits.forEach(hit => {
    const eventType = hit._source.event_type || hit._source.type || 'unknown';
    eventTypeCountMap[eventType] = (eventTypeCountMap[eventType] || 0) + 1;
  });

  // 按出现次数排序
  const sortedEntries = Object.entries(eventTypeCountMap).sort((a, b) => b[1] - a[1]);
  const eventTypes = sortedEntries.map(entry => entry[0]);
  const counts = sortedEntries.map(entry => entry[1]);

  return { eventTypes, counts };
}; 