import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Statistic, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { getGpuMetrics, parseGpuMetrics } from '../services/gpuService';

const GpuMetrics = () => {
  const [gpuData, setGpuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metrics = await getGpuMetrics();
        const parsedData = parseGpuMetrics(metrics);
        setGpuData(parsedData);
        
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
          return updated.slice(-30);
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
        <h2>获取GPU数据失败</h2>
        <p>{error}</p>
      </div>
    );
  }

  const getChartOption = (title, dataKey, yAxisTitle) => {
    const series = gpuData?.gpus.map((gpu, index) => ({
      name: `GPU ${index + 1}`,
      type: 'line',
      smooth: true,
      data: historyData
        .filter(item => item.gpuIndex === index)
        .map(item => [item.timestamp, item[dataKey]])
    }));

    return {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
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
        data: [...new Set(historyData.map(item => item.timestamp))]
      },
      yAxis: {
        type: 'value',
        name: yAxisTitle,
        nameLocation: 'middle',
        nameGap: 40
      },
      series
    };
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* <h2>GPU 监控</h2> */}
      
      {/* 实时状态卡片 */}
      <Row gutter={[16, 16]}>
        {gpuData?.gpus.map((gpu, index) => (
          <Col xs={24} sm={12} md={8} key={gpu.uuid}>
            <Card title={`GPU ${index + 1}: ${gpu.name}`}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="温度"
                    value={gpu.temperature}
                    suffix="°C"
                    valueStyle={{ color: gpu.temperature > 80 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="功耗"
                    value={gpu.power.draw}
                    suffix="W"
                    precision={1}
                    valueStyle={{ color: gpu.power.draw > gpu.power.limit * 0.9 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ marginBottom: 4 }}>GPU 利用率</div>
                    <Progress
                      percent={gpu.utilization.gpu}
                      status={gpu.utilization.gpu > 90 ? 'exception' : 'normal'}
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: 4 }}>显存利用率</div>
                    <Progress
                      percent={gpu.utilization.memory}
                      status={gpu.utilization.memory > 90 ? 'exception' : 'normal'}
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <Statistic
                    title="显存使用"
                    value={gpu.memory.used}
                    suffix={`/ ${gpu.memory.total} MB`}
                    precision={1}
                    valueStyle={{ color: gpu.memory.used / gpu.memory.total > 0.9 ? '#cf1322' : '#3f8600' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 时间序列图表 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <ReactECharts
              option={getChartOption('GPU 温度变化', 'temperature', '温度 (°C)')}
              style={{ width: '100%', height: '400px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <ReactECharts
              option={getChartOption('GPU 功耗变化', 'power', '功耗 (W)')}
              style={{ width: '100%', height: '400px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <ReactECharts
              option={getChartOption('GPU 利用率变化', 'gpuUtilization', '利用率 (%)')}
              style={{ width: '100%', height: '400px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
          <Card>
            <ReactECharts
              option={getChartOption('显存利用率变化', 'memoryUtilization', '利用率 (%)')}
              style={{ width: '100%', height: '400px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GpuMetrics; 