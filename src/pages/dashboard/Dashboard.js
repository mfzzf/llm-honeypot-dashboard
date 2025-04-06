import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, DatePicker, Statistic, Tabs, Badge, Button, Typography } from 'antd';
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  PieChartOutlined, 
  DashboardOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  UserOutlined,
  CodeOutlined
} from '@ant-design/icons';
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
const { Title, Text } = Typography;

// 设置带渐变的卡片样式
const gradientCardStyle = {
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: 'none',
  overflow: 'hidden',
};

// 卡片头部渐变样式
const cardGradients = {
  honeypot: {
    background: 'linear-gradient(90deg, #1890ff 0%, #36CBCB 100%)',
  },
  llm: {
    background: 'linear-gradient(90deg, #722ED1 0%, #EB2F96 100%)',
  },
  warning: {
    background: 'linear-gradient(90deg, #FA541C 0%, #FAAD14 100%)',
  },
  success: {
    background: 'linear-gradient(90deg, #52C41A 0%, #1890FF 100%)',
  }
};

// 卡片图标样式
const iconStyle = {
  fontSize: '24px',
  padding: '12px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  background: 'white',
};

// Tabs样式
const tabsStyle = {
  padding: 0,
  margin: 0,
  border: 'none',
};

// TabPane内容样式
const tabContentStyle = {
  padding: '16px',
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

  // 渲染统计卡片
  const renderStatisticCard = (title, value, icon, gradient, suffix = '条') => (
    <Card style={{...gradientCardStyle, height: '100%'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text type="secondary">{title}</Text>
          <Title level={3} style={{ margin: '8px 0' }}>{value}</Title>
          <Text type="secondary">{suffix}</Text>
        </div>
        <div style={{...iconStyle, color: gradient.background.split(' ')[2]}}>
          {icon}
        </div>
      </div>
      <div 
        style={{ 
          height: '4px', 
          width: '100%', 
          marginTop: '16px',
          ...gradient
        }} 
      />
    </Card>
  );

  const renderCharts = () => (
    <div style={tabContentStyle}>
      <div className="dashboard-header">
        <div>
          <Title level={2} style={{ margin: 0 }}>系统仪表盘</Title>
          <Text type="secondary">实时监控大数据安全态势</Text>
        </div>
        <div>
          <Badge count="实时" style={{ backgroundColor: '#52C41A', marginRight: '12px' }} />
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
            style={{ minWidth: '380px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="数据加载中..." />
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              {renderStatisticCard('蜜罐日志总数', honeypotLogs.length, <AlertOutlined />, cardGradients.honeypot)}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatisticCard('LLM请求总数', llmLogs.length, <CodeOutlined />, cardGradients.llm)}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatisticCard('独立IP数', ipStatsData.ips.length, <UserOutlined />, cardGradients.warning, '个')}
            </Col>
            <Col xs={24} sm={12} lg={6}>
              {renderStatisticCard('监控时间范围', `${timeRange[1].diff(timeRange[0], 'days')}`, <ClockCircleOutlined />, cardGradients.success, '天')}
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} lg={12}>
              <Card 
                title="蜜罐访问趋势" 
                style={gradientCardStyle}
                extra={<LineChartOutlined style={{ color: '#1890ff', fontSize: '16px' }} />}
              >
                <LineChart
                  title="蜜罐时间序列数据"
                  data={honeypotTimeData.counts}
                  xAxisData={honeypotTimeData.timestamps}
                  yAxisName="访问次数"
                  seriesName="蜜罐访问"
                  color={['#1890ff', '#36CBCB']}
                  smooth={true}
                  showArea={true}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title="LLM请求趋势" 
                style={gradientCardStyle}
                extra={<LineChartOutlined style={{ color: '#722ED1', fontSize: '16px' }} />}
              >
                <LineChart
                  title="LLM时间序列数据"
                  data={llmTimeData.counts}
                  xAxisData={llmTimeData.timestamps}
                  yAxisName="请求次数"
                  seriesName="LLM请求"
                  color={['#722ED1', '#EB2F96']}
                  smooth={true}
                  showArea={true}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
            <Col xs={24} lg={12}>
              <Card 
                title="日志级别分布" 
                style={gradientCardStyle}
                extra={<PieChartOutlined style={{ color: '#FAAD14', fontSize: '16px' }} />}
              >
                <PieChart
                  title="日志级别统计"
                  data={logLevelData}
                  radius={['45%', '70%']}
                  legend={{ orient: 'vertical', right: '5%', top: 'middle' }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title="LLM请求类型分布" 
                style={gradientCardStyle}
                extra={<BarChartOutlined style={{ color: '#FA541C', fontSize: '16px' }} />}
              >
                <BarChart
                  title="LLM请求类型"
                  data={llmTypeData.counts}
                  xAxisData={llmTypeData.types}
                  yAxisName="请求数量"
                  color={['#FA541C', '#FAAD14']}
                  showBackground={true}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: '24px', marginBottom: '24px' }}>
            <Col xs={24} lg={12}>
              <Card 
                title="蜜罐IP访问统计" 
                style={gradientCardStyle}
                extra={<BarChartOutlined style={{ color: '#52C41A', fontSize: '16px' }} />}
              >
                <BarChart
                  title="TOP访问IP"
                  data={ipStatsData.counts}
                  xAxisData={ipStatsData.ips}
                  yAxisName="访问次数"
                  color={['#52C41A', '#1890FF']}
                  showBackground={true}
                  horizontal={true}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title="LLM模型使用统计" 
                style={gradientCardStyle}
                extra={<PieChartOutlined style={{ color: '#1890FF', fontSize: '16px' }} />}
              >
                <BarChart
                  title="模型使用统计"
                  data={llmModelData.counts}
                  xAxisData={llmModelData.models}
                  yAxisName="使用次数"
                  color={['#1890FF', '#36CBCB']}
                  showBackground={true}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );

  return (
    <div className="dashboard-container" style={{ padding: 0, margin: 0, background: '#f0f2f5' }}>
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange} 
        style={tabsStyle}
        tabBarStyle={{ 
          margin: 0, 
          padding: '16px 24px 0',
          borderBottom: 'none'
        }}
        type="card"
      >
        <TabPane 
          tab={<span><InfoCircleOutlined />  系统介绍</span>} 
          key="1"
        >
          <Introduction />
        </TabPane>
        <TabPane 
          tab={<span><DashboardOutlined />  数据仪表盘</span>} 
          key="2"
        >
          {renderCharts()}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard; 