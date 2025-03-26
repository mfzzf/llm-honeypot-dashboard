import axios from 'axios';

const gpuConfig = {
  baseUrl: 'http://localhost:3001/api/gpu', // 使用代理服务器避免CORS问题
  metricsUrl: '10.255.248.65:9835/metrics'
};

// 创建一个API实例
const api = axios.create({
  baseURL: gpuConfig.baseUrl,
});

// 获取GPU指标数据
export const getGpuMetrics = async () => {
  try {
    const response = await api.get('/metrics');
    return response.data;
  } catch (error) {
    console.error('获取GPU指标数据出错:', error);
    throw error;
  }
};

// 解析GPU指标数据
export const parseGpuMetrics = (metrics) => {
  const lines = metrics.split('\n');
  const gpuData = {
    gpus: []
  };
  
  // 使用uuid跟踪不同的GPU
  const gpuMap = new Map();
  
  lines.forEach(line => {
    // 提取GPU信息
    if (line.startsWith('nvidia_smi_gpu_info')) {
      const match = line.match(/name="([^"]+)",uuid="([^"]+)"/);
      if (match) {
        const uuid = match[2];
        const gpu = {
          name: match[1],
          uuid: uuid,
          temperature: 0,
          memory: {
            total: 0,
            used: 0,
            free: 0
          },
          power: {
            draw: 0,
            limit: 0
          },
          utilization: {
            gpu: 0,
            memory: 0
          },
          clock: {
            graphics: 0,
            memory: 0
          }
        };
        gpuMap.set(uuid, gpu);
      }
    }
    // 提取索引信息，用于确定这是第几个GPU
    else if (line.startsWith('nvidia_smi_index')) {
      const match = line.match(/index{uuid="([^"]+)"} (\d+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          gpu.index = parseInt(match[2]);
        }
      }
    }
    // 温度
    else if (line.startsWith('nvidia_smi_temperature_gpu')) {
      const match = line.match(/temperature_gpu{uuid="([^"]+)"} (\d+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          gpu.temperature = parseInt(match[2]);
        }
      }
    } 
    // 总内存
    else if (line.startsWith('nvidia_smi_memory_total_bytes')) {
      const match = line.match(/memory_total_bytes{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          // 正确处理科学计数法
          const totalBytes = parseFloat(match[2]);
          gpu.memory.total = (totalBytes / (1024 * 1024)).toFixed(2); // 转换为MB并保留两位小数
        }
      }
    }
    // 已用内存
    else if (line.startsWith('nvidia_smi_memory_used_bytes')) {
      const match = line.match(/memory_used_bytes{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          // 正确处理科学计数法
          const usedBytes = parseFloat(match[2]);
          gpu.memory.used = (usedBytes / (1024 * 1024)).toFixed(2); // 转换为MB并保留两位小数
        }
      }
    } 
    // 空闲内存
    else if (line.startsWith('nvidia_smi_memory_free_bytes')) {
      const match = line.match(/memory_free_bytes{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          // 正确处理科学计数法
          const freeBytes = parseFloat(match[2]);
          gpu.memory.free = (freeBytes / (1024 * 1024)).toFixed(2); // 转换为MB并保留两位小数
        }
      }
    }
    // 功耗
    else if (line.startsWith('nvidia_smi_power_draw_watts')) {
      const match = line.match(/power_draw_watts{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          gpu.power.draw = parseFloat(match[2]);
        }
      }
    } 
    // 功耗限制
    else if (line.startsWith('nvidia_smi_power_limit_watts')) {
      const match = line.match(/power_limit_watts{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          gpu.power.limit = parseFloat(match[2]);
        }
      }
    } 

    // GPU利用率
    else if (line.startsWith('nvidia_smi_utilization_gpu_ratio')) {
      const match = line.match(/utilization_gpu_ratio{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          const ratio = parseFloat(match[2]);
          gpu.utilization.gpu = Math.round(ratio * 100); // 转换为百分比并四舍五入
        }
      }
    } 
    // 显存利用率
    else if (line.startsWith('nvidia_smi_utilization_memory_ratio')) {
      const match = line.match(/utilization_memory_ratio{uuid="([^"]+)"} ([0-9.e+]+)/);
      if (match) {
        const uuid = match[1];
        const gpu = gpuMap.get(uuid);
        if (gpu) {
          // 计算显存利用率
          gpu.utilization.memory = ((gpu.memory.used / gpu.memory.total) * 100).toFixed(2); // 转换为百分比并保留两位小数
        }
      }
    }
  });
  
  // 将Map转换为数组并按索引排序
  gpuData.gpus = Array.from(gpuMap.values()).sort((a, b) => a.index - b.index);
  
  return gpuData;
}; 