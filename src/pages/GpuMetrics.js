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
  Tag
} from 'antd';
import {
  ThunderboltOutlined,
  DashboardOutlined,
  HeatMapOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  SyncOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getGpuMetrics, parseGpuMetrics } from '../services/gpuService';

const { Title, Text } = Typography;

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
  
  return (
    <Card 
      title={
        <Space>
          <Badge status={gpu.utilization.gpu > 50 ? "processing" : "default"} />
          <Text strong>{`GPU ${index + 1}: ${gpu.name}`}</Text>
        </Space>
      }
      bordered={true}
      hoverable
      className="gpu-card"
      extra={<Tag color="blue">{`${memoryTotal} MB`}</Tag>}
    >
      <Row gutter={[16, 24]}>
        {/* 温度和功耗 */}
        <Col span={12}>
          <Card bordered={false} size="small" className="metric-card">
            <Statistic
              title={<Space><HeatMapOutlined /> 温度</Space>}
              value={gpu.temperature}
              suffix="°C"
              valueStyle={{ color: tempColor, fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false} size="small" className="metric-card">
            <Statistic
              title={<Space><ThunderboltOutlined /> 功耗</Space>}
              value={gpu.power.draw}
              suffix="W"
              precision={1}
              valueStyle={{ color: powerColor, fontSize: '24px' }}
            />
          </Card>
        </Col>
        
        {/* GPU 利用率 */}
        <Col span={24}>
          <div className="progress-container">
            <div className="progress-header">
              <Space>
                <BarChartOutlined />
                <Text>GPU 利用率</Text>
              </Space>
              <Text strong style={{ color: gpuUtilColor }}>{`${gpu.utilization.gpu}%`}</Text>
            </div>
            <Progress 
              percent={gpu.utilization.gpu} 
              strokeColor={gpuUtilColor}
              size="small"
              showInfo={false}
              trailColor="#f0f2f5"
              strokeLinecap="round"
            />
          </div>
        </Col>
        
        {/* 显存利用率 */}
        <Col span={24}>
          <div className="progress-container">
            <div className="progress-header">
              <Space>
                <DatabaseOutlined />
                <Text>显存利用率</Text>
              </Space>
              <Text strong style={{ color: memUtilColor }}>{`${memoryUtilization}%`}</Text>
            </div>
            <Progress 
              percent={memoryUtilization} 
              strokeColor={memUtilColor}
              size="small"
              showInfo={false}
              trailColor="#f0f2f5"
              strokeLinecap="round"
            />
          </div>
        </Col>
        
        {/* 显存使用 */}
        <Col span={24}>
          <div className="memory-usage">
            <Text type="secondary">显存使用</Text>
            <div className="memory-value">
              <Text strong>{`${memoryUsed}`}</Text>
              <Text type="secondary">{` / ${memoryTotal} MB`}</Text>
            </div>
          </div>
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

  useEffect(() => {
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
          const updated = [...prev, ...newHistoryData];
          // 只保留最近30个数据点
          return updated.slice(-30 * parsedData.gpus.length);
        });
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

  const getChartOption = (title, dataKey, yAxisTitle, colorMap = {}) => {
    const series = gpuData?.gpus.map((gpu, index) => {
      // 为每个GPU分配一个唯一的颜色
      const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'];
      const color = colorMap[index] || colors[index % colors.length];
      
      return {
        name: `GPU ${index + 1}`,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: color
        },
        itemStyle: {
          color: color
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: color + '80' // 添加透明度
              },
              {
                offset: 1,
                color: color + '10'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
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
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: gpuData?.gpus.map((_, index) => `GPU ${index + 1}`),
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [...new Set(historyData.map(item => item.timestamp))],
        axisLine: {
          lineStyle: {
            color: '#aaa'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisTitle,
        nameLocation: 'middle',
        nameGap: 40,
        nameTextStyle: {
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#aaa'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#eee'
          }
        }
      },
      series
    };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <Title level={2}>获取GPU数据失败</Title>
        <Text type="danger">{error}</Text>
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
            <SyncOutlined spin={loading} />
            <Text type="secondary">
              {lastUpdated ? `上次更新: ${lastUpdated}` : '等待数据...'}
            </Text>
          </Space>
        </Col>
      </Row>

      {/* GPU 卡片网格 */}
      <Row gutter={[16, 16]} className="gpu-cards-grid">
        {gpuData?.gpus.map((gpu, index) => (
          <Col xs={24} sm={24} md={12} lg={8} key={gpu.uuid}>
            <GpuCard gpu={gpu} index={index} />
          </Col>
        ))}
      </Row>

      <Divider />

      {/* 图表网格布局 */}
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
    </div>
  );
};

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
  .gpu-card {
    height: 100%;
    transition: all 0.3s;
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 
                0 3px 6px 0 rgba(0, 0, 0, 0.12), 
                0 5px 12px 4px rgba(0, 0, 0, 0.09);
  }
  
  .gpu-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.16), 
                0 6px 16px 0 rgba(0, 0, 0, 0.12), 
                0 9px 28px 8px rgba(0, 0, 0, 0.09);
  }
  
  .metric-card {
    background-color: #fafafa;
    border-radius: 8px;
  }
  
  .progress-container {
    margin-bottom: 12px;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .memory-usage {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .memory-value {
    display: flex;
    align-items: center;
  }
  
  .chart-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16);
  }
`;
document.head.appendChild(style);

export default GpuMetrics; 