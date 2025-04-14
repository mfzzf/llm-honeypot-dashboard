/**
 * GPU历史数据存储工具函数
 * 用于在localStorage中保存和读取GPU历史数据
 */

// 存储键名
const GPU_HISTORY_KEY = 'gpu_metrics_history';

/**
 * 保存GPU历史数据到localStorage
 * @param {Array} historyData - GPU历史数据数组
 */
export const saveGpuHistoryData = (historyData) => {
  try {
    localStorage.setItem(GPU_HISTORY_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error('保存GPU历史数据失败:', error);
    // 如果存储失败（例如存储空间已满），尝试清理一部分旧数据
    try {
      // 只保留最近的数据（假设每个GPU有15个数据点）
      const gpuCount = new Set(historyData.map(item => item.gpuIndex)).size;
      const trimmedData = historyData.slice(-15 * gpuCount);
      localStorage.setItem(GPU_HISTORY_KEY, JSON.stringify(trimmedData));
    } catch (cleanupError) {
      console.error('即使清理后仍无法保存GPU历史数据:', cleanupError);
    }
  }
};

/**
 * 从localStorage加载GPU历史数据
 * @returns {Array} 保存的GPU历史数据，如果没有则返回空数组
 */
export const loadGpuHistoryData = () => {
  try {
    const savedData = localStorage.getItem(GPU_HISTORY_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error('加载GPU历史数据失败:', error);
    return [];
  }
};

/**
 * 清除存储的GPU历史数据
 */
export const clearGpuHistoryData = () => {
  try {
    localStorage.removeItem(GPU_HISTORY_KEY);
  } catch (error) {
    console.error('清除GPU历史数据失败:', error);
  }
};

/**
 * 获取历史数据的存储大小（字节）
 * @returns {number} 存储大小（字节）
 */
export const getHistoryStorageSize = () => {
  try {
    const savedData = localStorage.getItem(GPU_HISTORY_KEY);
    return savedData ? new Blob([savedData]).size : 0;
  } catch (error) {
    console.error('获取历史数据存储大小失败:', error);
    return 0;
  }
}; 