import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Progress, 
  Statistic, 
  Spin, 
  Typography, 
  Badge, 
  Space, 
  Divider,
  Tag,
  Button,
  Tooltip,
  message
} from 'antd';
import {
  ThunderboltOutlined,
  HeatMapOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SyncOutlined,
  ClearOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getGpuMetrics, parseGpuMetrics } from '../services/gpuService';
import { loadGpuHistoryData, saveGpuHistoryData, clearGpuHistoryData, getHistoryStorageSize } from '../lib/storageUtils';

const { Title, Text } = Typography;

// NVIDIA SVG 图标组件
const NvidiaIcon = ({ size = 20, color = "#75B800" }) => (
  <svg 
    viewBox="0 0 1496 1024" 
    width={size} 
    height={size * (1024/1496)} 
    style={{ verticalAlign: 'middle', marginRight: '8px' }}
  >
    <path 
      d="M564.145231 335.005538V248.516923c8.664615-0.472615 17.092923-1.024 25.678769-1.024 236.859077-7.483077 392.113231 203.776 392.113231 203.776s-167.542154 232.605538-347.372308 232.605539c-23.945846 0-47.497846-3.702154-69.868308-11.185231V410.230154c92.317538 11.185231 111.064615 51.751385 165.96677 144.068923l123.195077-103.502769S763.746462 332.878769 612.194462 332.878769a363.047385 363.047385 0 0 0-48.049231 2.126769z m0-285.932307V178.018462l25.678769-1.575385c329.176615-11.185231 544.137846 270.020923 544.137846 270.020923S887.492923 746.338462 630.941538 746.338462c-22.370462 0-44.268308-2.126769-66.166153-5.828924v79.95077c18.116923 2.126769 36.785231 3.780923 54.980923 3.780923 238.985846 0 411.884308-122.249846 579.426461-266.24 27.648 22.370462 141.312 76.327385 164.785231 99.800615-158.956308 133.356308-529.723077 240.561231-739.958154 240.561231-20.322462 0-39.463385-1.024-58.683077-3.150769v112.56123h908.051693V48.994462H564.145231z m0 623.616v68.292923c-220.868923-39.463385-282.151385-269.390769-282.151385-269.390769s106.102154-117.366154 282.151385-136.585847V409.6h-0.472616c-92.317538-11.185231-164.864 75.224615-164.864 75.224615s41.038769 145.644308 165.415385 187.785847zM172.032 461.981538s130.756923-193.142154 392.664615-213.464615v-70.419692C274.432 201.649231 23.709538 447.015385 23.709538 447.015385s141.942154 410.860308 540.435693 448.196923v-74.752c-292.312615-36.233846-392.113231-358.4-392.113231-358.4z" 
      fill={color} 
    />
  </svg>
);

// GPU状态颜色映射
const getStatusColor = (value, thresholds = { warning: 70, critical: 90 }) => {
  if (value >= thresholds.critical) return '#ff4d4f';
  if (value >= thresholds.warning) return '#faad14';
  return '#52c41a';
};

// GPU卡片组件
const GpuCard = ({ gpu, index }) => {
  const memoryUtilization = parseFloat(gpu.utilization.memory);
  const memoryUsed = parseFloat(gpu.memory.used);
  const memoryTotal = parseFloat(gpu.memory.total);
  
  // 计算各项指标的颜色
  const tempColor = getStatusColor(gpu.temperature, { warning: 70, critical: 85 });
  const powerColor = getStatusColor(gpu.power.draw / gpu.power.limit * 100, { warning: 75, critical: 90 });
  const gpuUtilColor = getStatusColor(gpu.utilization.gpu);
  const memUtilColor = getStatusColor(memoryUtilization);

  const progressSize = 100; // Size for dashboard progress

  return (
    <Card 
      title={
        <Space>
          <Badge status={gpu.utilization.gpu > 50 ? "processing" : "default"} />
          <NvidiaIcon size={22} /> {/* 添加 NVIDIA 图标 */}
          <Text strong>{`GPU ${index}: ${gpu.name}`}</Text>
        </Space>
      }
      bordered={false}
      hoverable
      className="gpu-card"
      extra={<Tag color="blue">{`${memoryTotal} MB`}</Tag>}
    >
      <Row gutter={[16, 16]} align="middle">
        {/* 温度和功耗 - Side by side */}
        <Col xs={24} sm={12} md={24} lg={12} style={{ textAlign: 'center' }}>
          <Statistic
            title={<Space><HeatMapOutlined /> 温度</Space>}
            value={gpu.temperature}
            suffix="°C"
            valueStyle={{ color: tempColor, fontSize: '20px', fontWeight: 500 }}
          />
        </Col>
        <Col xs={24} sm={12} md={24} lg={12} style={{ textAlign: 'center' }}>
          <Statistic
            title={<Space><ThunderboltOutlined /> 功耗</Space>}
            value={gpu.power.draw}
            suffix={`/ ${gpu.power.limit} W`}
            precision={1}
            valueStyle={{ color: powerColor, fontSize: '20px', fontWeight: 500 }}
          />
        </Col>

        <Col span={24}><Divider style={{ margin: '12px 0'}} /></Col>

        {/* GPU 利用率 - Dashboard Progress */}
        <Col xs={12} style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            <BarChartOutlined /> GPU Util
          </Text>
          <Progress 
            type="dashboard"
            percent={gpu.utilization.gpu} 
            strokeColor={gpuUtilColor}
            size={progressSize}
            format={(percent) => `${percent}%`}
            strokeWidth={8}
          />
        </Col>
        
        {/* 显存利用率 - Dashboard Progress */}
        <Col xs={12} style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
            <DatabaseOutlined /> Mem Util
          </Text>
          <Progress 
            type="dashboard"
            percent={memoryUtilization} 
            strokeColor={memUtilColor}
            size={progressSize}
            format={(percent) => `${percent}%`}
            strokeWidth={8}
          />
        </Col>

        {/* 显存使用 - Below progress bars */}
        <Col span={24} style={{ marginTop: '16px', textAlign: 'center'}}>
          <Text type="secondary">显存使用:</Text>
          <Text strong style={{ marginLeft: 8 }}>{`${memoryUsed} MB`}</Text>
          <Text type="secondary">{` / ${memoryTotal} MB`}</Text>
        </Col>
      </Row>
    </Card>
  );
};

const GpuMetrics = () => {
  const [gpuData, setGpuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    // 从localStorage加载历史数据
    const savedHistoryData = loadGpuHistoryData();
    if (savedHistoryData && savedHistoryData.length > 0) {
      setHistoryData(savedHistoryData);
      setInitialDataLoaded(true);
      
      // 如果有历史数据，也设置一个上次更新时间（使用最新记录的时间戳）
      const timestamps = [...new Set(savedHistoryData.map(item => item.timestamp))];
      if (timestamps.length > 0) {
        setLastUpdated(timestamps[timestamps.length - 1]);
      }
    }

    const fetchData = async () => {
      try {
        const metrics = await getGpuMetrics();
        const parsedData = parseGpuMetrics(metrics);
        setGpuData(parsedData);
        setLastUpdated(new Date().toLocaleTimeString());
        
        // 更新历史数据
        const timestamp = new Date().toLocaleTimeString();
        const newHistoryData = parsedData.gpus.map(gpu => ({
          timestamp,
          gpuIndex: gpu.index,
          temperature: gpu.temperature,
          power: gpu.power.draw,
          gpuUtilization: gpu.utilization.gpu,
          memoryUtilization: parseFloat(gpu.utilization.memory)
        }));
        
        setHistoryData(prev => {
          // 合并现有数据和新数据
          const updated = [...prev, ...newHistoryData];
          // 只保留最近30个数据点（每个GPU）
          const maxPoints = 30 * parsedData.gpus.length;
          const trimmedData = updated.slice(-maxPoints);
          
          // 将更新后的数据保存到localStorage
          saveGpuHistoryData(trimmedData);
          
          return trimmedData;
        });
        
        // 数据加载成功，设置初始加载完成标志
        setInitialDataLoaded(true);
      } catch (err) {
        setError(err.message);
        console.error('获取GPU数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, []);

  // 清除历史数据
  const handleClearHistory = () => {
    clearGpuHistoryData();
    setHistoryData([]);
    message.success('历史数据已清除');
  };

  const getChartOption = (title, dataKey, yAxisTitle, colorMap = {}) => {
    // 如果没有历史数据或GPU数据，则返回基本图表配置
    if (!historyData.length || !gpuData) {
      const emptyOption = {
        title: {
          text: title,
          left: 'center',
          textStyle: {
            fontWeight: 'normal',
            fontSize: 16,
            color: '#595959'
          }
        },
        tooltip: {
          show: false
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: yAxisTitle
        },
        series: []
      };
      
      // 如果有历史数据但没有GPU数据
      if (historyData.length && !gpuData) {
        // 提取GPU索引和时间戳
        const gpuIndices = [...new Set(historyData.map(item => item.gpuIndex))];
        const timestamps = [...new Set(historyData.map(item => item.timestamp))];
        
        // 使用Ant Design颜色
        const antColors = [
          '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
        ];
        
        emptyOption.xAxis.data = timestamps;
        emptyOption.tooltip.show = true;
        emptyOption.series = gpuIndices.map((gpuIndex, index) => {
          const color = colorMap[index] || antColors[index % antColors.length];
          
          return {
            name: `GPU ${gpuIndex}`,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: {
              width: 2.5,
              color: color
            },
            itemStyle: {
              color: color,
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: color + 'B3' },
                  { offset: 1, color: color + '1A' }
                ]
              },
              opacity: 1
            },
            data: historyData
              .filter(item => item.gpuIndex === gpuIndex)
              .map(item => [item.timestamp, item[dataKey]])
          };
        });
      }
      
      return emptyOption;
    }

    // 1. 更新颜色方案 (使用 Ant Design 色彩)
    const antColors = [
      '#1890ff', // blue-6
      '#52c41a', // green-6
      '#faad14', // gold-6
      '#f5222d', // red-6
      '#722ed1', // purple-6
      '#13c2c2', // cyan-6
      '#eb2f96', // magenta-6
      '#fa8c16', // orange-6
    ];
    
    const series = gpuData?.gpus.map((gpu, index) => {
      const color = colorMap[index] || antColors[index % antColors.length];
      
      return {
        name: `GPU ${index}`,
        type: 'line',
        smooth: true,
        // 3. 调整标记点样式: 默认隐藏
        showSymbol: false, 
        symbol: 'circle',
        symbolSize: 8, // 稍微增大悬停时的大小
        lineStyle: {
          // 2. 优化线条样式 (略微加粗)
          width: 2.5,
          color: color
        },
        itemStyle: {
          // 用于图例标记颜色
          color: color,
        },
        // 2. 优化区域样式 (更平滑的渐变)
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + 'B3' }, // 70% opacity
              { offset: 1, color: color + '1A' }  // 10% opacity
            ]
          },
          opacity: 1 // 使用渐变本身的透明度
        },
        emphasis: {
          focus: 'series',
          // 3. 调整标记点样式: 悬停时显示并突出
          symbolSize: 10,
          itemStyle: {
             color: color,
             borderColor: '#fff',
             borderWidth: 2,
             shadowColor: 'rgba(0, 0, 0, 0.2)',
             shadowBlur: 5
          },
          lineStyle: {
            width: 3.5, // 悬停时线条加粗
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5,
            shadowOffsetY: 2
          }
        },
        data: historyData
          .filter(item => item.gpuIndex === index)
          .map(item => [item.timestamp, item[dataKey]])
      }
    });

    return {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 16,
          color: '#595959' // 稍深的灰色
        }
      },
      // 4 & 5. 改进 Tooltip 外观和格式
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          },
          lineStyle: {
             color: '#ccc',
             type: 'dashed'
          }
        },
        backgroundColor: 'rgba(255, 255, 255, 0.98)', // 更接近白色，略透明
        borderColor: '#e8e8e8', // 更浅的边框
        borderWidth: 1,
        borderRadius: 6, // 圆角
        padding: [8, 12], // 内边距
        textStyle: {
          color: '#333',
          fontSize: 13
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: none;', // 阴影，移除默认边框
        // 5. 优化 Tooltip 内容格式
        formatter: (params) => {
          if (!params || params.length === 0) return '';
          let tooltipText = `${params[0].axisValueLabel}<br/>`; // 时间戳
          params.forEach(item => {
            const colorCircle = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${item.color};"></span>`;
            const value = typeof item.value[1] === 'number' ? item.value[1].toFixed(1) : '-'; // 保留一位小数
            const unit = yAxisTitle.includes('°C') ? '°C' : yAxisTitle.includes('(W)') ? 'W' : '%'; // 简单判断单位
            tooltipText += `${colorCircle}${item.seriesName}: <strong>${value} ${unit}</strong><br/>`;
          });
          return tooltipText;
        }
      },
      // 7. 微调图例样式
      legend: {
        data: gpuData?.gpus.map((_, index) => `GPU ${index}`),
        top: 35,
        itemGap: 20, // 增大间距
        textStyle: {
           color: '#595959'
        },
        icon: 'circle' // 使用圆形图例标记
      },
      // 8. 调整网格边距 & 6. 简化坐标轴和网格
      grid: {
        left: '2%',
        right: '5%', // 为 Y 轴名称留出更多空间
        bottom: '3%',
        top: '22%', // 为图例和标题留出空间
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [...new Set(historyData.map(item => item.timestamp))],
        // 6. 简化坐标轴
        axisLine: {
          show: true,
          lineStyle: {
            color: '#e8e8e8' // 更浅的轴线
          }
        },
        axisTick: {
           show: false
        },
        axisLabel: {
           color: '#8c8c8c' // 稍浅的标签颜色
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisTitle,
        nameLocation: 'middle',
        nameGap: 45, // 调整名称间距
        nameTextStyle: {
          color: '#8c8c8c',
          fontSize: 12,
          fontWeight: 'normal'
        },
        // 6. 简化坐标轴
        axisLine: {
          show: false // 隐藏 Y 轴轴线
        },
         axisTick: {
           show: false
        },
        axisLabel: {
           color: '#8c8c8c'
        },
        // 6. 简化网格线
        splitLine: {
          lineStyle: {
            color: '#f0f0f0', // 非常浅的网格线
            type: 'dashed'
          }
        }
      },
      series
    };
  };

  if (loading && !initialDataLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary">正在加载GPU数据，请稍候...</Text>
        </div>
      </div>
    );
  }

  if (error && !initialDataLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <Title level={2}>获取GPU数据失败</Title>
        <Text type="danger">{error}</Text>
      </div>
    );
  }

  // 即使正在加载或有错误，但如果已有历史数据，仍然显示页面
  // 但仅显示历史图表部分，不显示实时GPU卡片（因为这些需要最新数据）
  const showGpuCards = gpuData && gpuData.gpus && gpuData.gpus.length > 0;
  const showCharts = historyData && historyData.length > 0;

  // 如果既没有GPU卡片可显示，又没有图表可显示，则显示空状态
  if (!showGpuCards && !showCharts) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={2}>暂无GPU数据</Title>
        <Text type="secondary">正在等待数据采集，请稍候...</Text>
      </div>
    );
  }

  return (
    <div className="gpu-metrics-container" style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>GPU 监控面板</Title>
        </Col>
        <Col>
          <Space>
            {loading && <SyncOutlined spin />}
            <Text type="secondary">
              {lastUpdated ? `上次更新: ${lastUpdated}` : '等待数据...'}
            </Text>
            {historyData.length > 0 && (
              <Tooltip title="清除存储的历史数据">
                <Button 
                  icon={<ClearOutlined />} 
                  size="small" 
                  onClick={handleClearHistory}
                  style={{ marginLeft: 8 }}
                >
                  清除历史
                </Button>
              </Tooltip>
            )}
          </Space>
        </Col>
      </Row>

      {/* GPU 卡片网格 - 仅在有最新数据时显示 */}
      {showGpuCards && (
        <Row gutter={[16, 16]} className="gpu-cards-grid">
          {gpuData.gpus.map((gpu, index) => (
            <Col xs={24} sm={24} md={12} lg={8} key={gpu.uuid}>
              <GpuCard gpu={gpu} index={index} />
            </Col>
          ))}
        </Row>
      )}

      {showGpuCards && <Divider />}

      {/* 图表网格布局 - 即使没有最新数据，也可以基于历史数据显示 */}
      {showCharts && (
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={24} md={12}>
            <Card bordered={false} className="chart-card">
              <ReactECharts
                option={getChartOption('GPU 温度变化', 'temperature', '温度 (°C)')}
                style={{ width: '100%', height: '350px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Card bordered={false} className="chart-card">
              <ReactECharts
                option={getChartOption('GPU 功耗变化', 'power', '功耗 (W)')}
                style={{ width: '100%', height: '350px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Card bordered={false} className="chart-card">
              <ReactECharts
                option={getChartOption('GPU 利用率变化', 'gpuUtilization', '利用率 (%)')}
                style={{ width: '100%', height: '350px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Card bordered={false} className="chart-card">
              <ReactECharts
                option={getChartOption('显存利用率变化', 'memoryUtilization', '利用率 (%)')}
                style={{ width: '100%', height: '350px' }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  .gpu-card {
    height: 100%;
    transition: all 0.3s ease-in-out;
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: #fff;
    padding: 16px !important;
  }
  
  .gpu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-color: #1890ff;
  }
  
  .gpu-card .ant-progress-dashboard-text {
      font-size: 1.1em !important;
      font-weight: 500;
  }
  
  .memory-usage {
    display: block;
    text-align: center;
    margin-top: 10px;
  }
  
  .chart-card {
    border-radius: 8px;
    border: 1px solid #d9d9d9;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background-color: #fff;
    padding: 16px;
  }
  
  .chart-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-color: #1890ff;
  }
  
  .chart-card .echarts-for-react {
    width: 100% !important; 
  }
`;
document.head.appendChild(style);

export default GpuMetrics;