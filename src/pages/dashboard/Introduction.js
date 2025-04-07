import React from 'react';
import { Card, Row, Col, Typography, Space, Divider, Button } from 'antd';
import { 
  DashboardOutlined, 
  RobotOutlined, 
  BugOutlined, 
  DatabaseOutlined, 
  AreaChartOutlined, 
  HistoryOutlined, 
  SearchOutlined, 
  TableOutlined, 
  SettingOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// 渐变背景样式
const gradientBg = {
  background: 'linear-gradient(160deg, #f0f2f5 0%, #ffffff 100%)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: 'none',
  overflow: 'hidden'
};

// 特性卡片样式
const featureCardStyle = {
  height: '100%',
  transition: 'all 0.3s ease',
  ...gradientBg
};

// 图标样式
const iconStyle = {
  fontSize: '24px',
  padding: '12px',
  borderRadius: '50%',
  marginBottom: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)'
};

const iconColors = {
  dashboard: { color: '#1890FF', background: 'rgba(24, 144, 255, 0.1)' },
  llm: { color: '#722ED1', background: 'rgba(114, 46, 209, 0.1)' },
  honeypot: { color: '#FA541C', background: 'rgba(250, 84, 28, 0.1)' },
  data: { color: '#52C41A', background: 'rgba(82, 196, 26, 0.1)' }
};

const Introduction = () => {
  return (
    <div className="introduction-container" style={{ padding: '24px', ...gradientBg, margin: '16px' }}>
      <Typography>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Space direction="vertical" size="small">
            <AreaChartOutlined style={{ fontSize: '48px', color: '#1890FF' }} />
            <Title level={2} style={{ margin: '16px 0', background: 'linear-gradient(90deg, #1890FF, #722ED1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HiveGuard智能化蜜罐可视化系统
            </Title>
            <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
              一个用于监控和分析LLM（大型语言模型）请求和蜜罐活动的高级可视化平台。通过丰富的图表和直观的界面，轻松掌握系统安全态势。
            </Paragraph>
          </Space>
        </div>

        <Divider style={{ margin: '32px 0' }}>
          <Space>
            <SettingOutlined style={{ fontSize: '16px', color: '#1890FF' }} />
            <Text strong>主要功能</Text>
          </Space>
        </Divider>
        
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          <Col xs={24} sm={8}>
            <Card 
              title={
                <Space>
                  <div style={{ ...iconStyle, ...iconColors.dashboard }}>
                    <DashboardOutlined />
                  </div>
                  <span>仪表盘</span>
                </Space>
              } 
              bordered={false}
              style={featureCardStyle}
              hoverable
            >
              <Paragraph>
                提供系统整体概览，包含LLM请求和蜜罐活动的关键指标和趋势图表。通过可视化数据，快速了解系统状态。
              </Paragraph>
              <div style={{ textAlign: 'right' }}>
                <Button type="link" icon={<ArrowRightOutlined />} href="/dashboard">查看详情</Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              title={
                <Space>
                  <div style={{ ...iconStyle, ...iconColors.llm }}>
                    <RobotOutlined />
                  </div>
                  <span>LLM日志</span>
                </Space>
              } 
              bordered={false}
              style={featureCardStyle}
              hoverable
            >
              <Paragraph>
                查看LLM日志详情，分析模型使用情况、请求类型分布，以及详细的请求与响应内容。优化模型性能和安全性。
              </Paragraph>
              <div style={{ textAlign: 'right' }}>
                <Button type="link" icon={<ArrowRightOutlined />} href="/llm-logs">查看详情</Button>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card 
              title={
                <Space>
                  <div style={{ ...iconStyle, ...iconColors.honeypot }}>
                    <BugOutlined />
                  </div>
                  <span>蜜罐日志</span>
                </Space>
              } 
              bordered={false}
              style={featureCardStyle}
              hoverable
            >
              <Paragraph>
                监控蜜罐活动，分析可疑IP地址，查看详细的攻击尝试记录和日志级别分布。提前发现并阻止潜在威胁。
              </Paragraph>
              <div style={{ textAlign: 'right' }}>
                <Button type="link" icon={<ArrowRightOutlined />} href="/honeypot-logs">查看详情</Button>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '32px 0' }}>
          <Space>
            <DatabaseOutlined style={{ fontSize: '16px', color: '#52C41A' }} />
            <Text strong>数据来源</Text>
          </Space>
        </Divider>
        
        <Card style={{ marginBottom: '32px', ...gradientBg }} bordered={false}>
          <Paragraph>
            系统数据来自于以下Elasticsearch索引：
          </Paragraph>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card type="inner" style={{ background: 'rgba(114, 46, 209, 0.05)', borderColor: 'rgba(114, 46, 209, 0.2)' }}>
                <Space>
                  <RobotOutlined style={{ color: '#722ED1' }} />
                  <Text code strong>llm-logs</Text>
                </Space>
                <Paragraph style={{ margin: '8px 0 0 0' }}>
                  存储LLM请求和响应的日志，包含模型信息、输入输出内容和响应时间等。
                </Paragraph>
              </Card>
            </Col>
            <Col span={12}>
              <Card type="inner" style={{ background: 'rgba(250, 84, 28, 0.05)', borderColor: 'rgba(250, 84, 28, 0.2)' }}>
                <Space>
                  <BugOutlined style={{ color: '#FA541C' }} />
                  <Text code strong>honeypot-logs</Text>
                </Space>
                <Paragraph style={{ margin: '8px 0 0 0' }}>
                  存储蜜罐活动的日志，记录攻击者IP、访问路径、攻击手段和事件等级等。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </Card>

        <Divider style={{ margin: '32px 0' }}>
          <Space>
            <SettingOutlined style={{ fontSize: '16px', color: '#FAAD14' }} />
            <Text strong>使用说明</Text>
          </Space>
        </Divider>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', ...gradientBg }} bordered={false} hoverable>
              <div style={{ ...iconStyle, ...iconColors.dashboard, margin: '0 auto 16px' }}>
                <HistoryOutlined />
              </div>
              <Title level={5}>时间选择</Title>
              <Paragraph>
                可使用时间选择器选择特定时间范围的数据
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', ...gradientBg }} bordered={false} hoverable>
              <div style={{ ...iconStyle, ...iconColors.llm, margin: '0 auto 16px' }}>
                <AreaChartOutlined />
              </div>
              <Title level={5}>图表交互</Title>
              <Paragraph>
                图表支持悬停查看详细数据，点击筛选特定条目
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', ...gradientBg }} bordered={false} hoverable>
              <div style={{ ...iconStyle, ...iconColors.honeypot, margin: '0 auto 16px' }}>
                <TableOutlined />
              </div>
              <Title level={5}>表格展开</Title>
              <Paragraph>
                表格支持展开查看详细信息，包含完整日志内容
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card style={{ textAlign: 'center', ...gradientBg }} bordered={false} hoverable>
              <div style={{ ...iconStyle, ...iconColors.data, margin: '0 auto 16px' }}>
                <SearchOutlined />
              </div>
              <Title level={5}>搜索功能</Title>
              <Paragraph>
                搜索功能支持按关键词筛选日志，快速定位信息
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Typography>
    </div>
  );
};

export default Introduction; 