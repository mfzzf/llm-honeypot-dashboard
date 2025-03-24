import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, DatePicker, Statistic, Tabs } from 'antd';
import moment from 'moment';
import { 
  getHoneypotLogs, 
  getLlmLogs, 
  getHoneypotStats, 
  getLlmStats 
} from '../../services/elasticService';
import {
  processTimeSeriesData,
  getLogLevelStats,
  getLlmRequestTypeStats,
  getLlmModelStats,
  getHoneypotIpStats
} from '../../services/visualizationService';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import Introduction from './Introduction';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Tabs样式
const tabsStyle = {
  padding: 0,
  margin: 0,
  border: 'none',
};

// TabPane内容样式
const tabContentStyle = {
  padding: '0 16px',
  margin: 0,
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const [honeypotLogs, setHoneypotLogs] = useState([]);
  const [llmLogs, setLlmLogs] = useState([]);
  const [honeypotStats, setHoneypotStats] = useState(null);
  const [llmStats, setLlmStats] = useState(null);
  const [activeTab, setActiveTab] = useState('1');

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === '1') {
        return; // 介绍页不需要加载数据
      }
      
      setLoading(true);
      try {
        const [honeypotLogsData, llmLogsData, honeypotStatsData, llmStatsData] = await Promise.all([
          getHoneypotLogs(timeRange[0].toISOString(), timeRange[1].toISOString(), 100),
          getLlmLogs(timeRange[0].toISOString(), timeRange[1].toISOString(), 100),
          getHoneypotStats(timeRange[0].toISOString(), timeRange[1].toISOString()),
          getLlmStats(timeRange[0].toISOString(), timeRange[1].toISOString())
        ]);

        setHoneypotLogs(honeypotLogsData.hits.hits);
        setLlmLogs(llmLogsData.hits.hits);
        setHoneypotStats(honeypotStatsData);
        setLlmStats(llmStatsData);
      } catch (error) {
        console.error('获取数据出错:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, activeTab]);

  const handleTimeRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setTimeRange(dates);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // 处理蜜罐时间序列数据
  const honeypotTimeData = honeypotStats ? 
    processTimeSeriesData(honeypotStats) : 
    { timestamps: [], counts: [] };

  // 处理LLM时间序列数据
  const llmTimeData = llmStats ? 
    processTimeSeriesData(llmStats) : 
    { timestamps: [], counts: [] };

  // 处理日志级别统计
  const logLevelData = getLogLevelStats(honeypotLogs.length ? { hits: { hits: honeypotLogs } } : null);

  // 处理LLM请求类型统计
  const llmTypeData = getLlmRequestTypeStats(llmLogs.length ? { hits: { hits: llmLogs } } : null);

  // LLM模型使用统计
  const llmModelData = getLlmModelStats(llmLogs.length ? { hits: { hits: llmLogs } } : null);

  // 蜜罐IP访问统计
  const ipStatsData = getHoneypotIpStats(honeypotLogs.length ? { hits: { hits: honeypotLogs } } : null);

  const renderCharts = () => (
    <div style={tabContentStyle}>
      <div className="dashboard-header">
        <h1>系统仪表盘</h1>
        <RangePicker
          ranges={{
            '最近24小时': [moment().subtract(24, 'hours'), moment()],
            '最近7天': [moment().subtract(7, 'days'), moment()],
            '最近30天': [moment().subtract(30, 'days'), moment()],
          }}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          value={timeRange}
          onChange={handleTimeRangeChange}
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="蜜罐日志总数"
                  value={honeypotLogs.length}
                  suffix="条"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="LLM请求总数"
                  value={llmLogs.length}
                  suffix="条"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="蜜罐访问趋势">
                <LineChart
                  title="蜜罐时间序列数据"
                  data={honeypotTimeData.counts}
                  xAxisData={honeypotTimeData.timestamps}
                  yAxisName="访问次数"
                  seriesName="蜜罐访问"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="LLM请求趋势">
                <LineChart
                  title="LLM时间序列数据"
                  data={llmTimeData.counts}
                  xAxisData={llmTimeData.timestamps}
                  yAxisName="请求次数"
                  seriesName="LLM请求"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="日志级别分布">
                <PieChart
                  title="日志级别统计"
                  data={logLevelData}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="LLM请求类型分布">
                <BarChart
                  title="LLM请求类型"
                  data={llmTypeData.counts}
                  xAxisData={llmTypeData.types}
                  yAxisName="请求数量"
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="蜜罐IP访问统计">
                <BarChart
                  title="TOP访问IP"
                  data={ipStatsData.counts}
                  xAxisData={ipStatsData.ips}
                  yAxisName="访问次数"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="LLM模型使用统计">
                <BarChart
                  title="模型使用统计"
                  data={llmModelData.counts}
                  xAxisData={llmModelData.models}
                  yAxisName="使用次数"
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );

  return (
    <div className="dashboard-container" style={{ padding: 0, margin: 0 }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        style={tabsStyle}
        tabBarStyle={{ margin: 0, padding: '0 16px', borderBottom: '1px solid #f0f0f0' }}
      >
        <TabPane tab="系统介绍" key="1">
          <Introduction />
        </TabPane>
        <TabPane tab="数据仪表盘" key="2">
          {renderCharts()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard; 