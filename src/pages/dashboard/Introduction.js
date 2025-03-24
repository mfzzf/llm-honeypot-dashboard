import React from 'react';
import { Card, Row, Col, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

const Introduction = () => {
  return (
    <div className="introduction-container" style={{ padding: '0 16px 24px' }}>
      <Typography>
        <Title level={2}>LLM与蜜罐日志可视化系统介绍</Title>
        <Paragraph>
          本系统是一个用于监控和分析LLM（大型语言模型）请求和蜜罐活动的可视化平台。系统从ELK（Elasticsearch、Logstash、Kibana）平台收集日志数据，并提供直观的图表和分析功能。
        </Paragraph>

        <Title level={3}>主要功能</Title>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card title="仪表盘" bordered={false}>
              <Paragraph>
                提供系统整体概览，包含LLM请求和蜜罐活动的关键指标和趋势图表。
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="LLM日志" bordered={false}>
              <Paragraph>
                查看LLM日志详情，分析模型使用情况、请求类型分布，以及详细的请求与响应内容。
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card title="蜜罐日志" bordered={false}>
              <Paragraph>
                监控蜜罐活动，分析可疑IP地址，查看详细的攻击尝试记录和日志级别分布。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Title level={3} style={{ marginTop: '24px' }}>数据来源</Title>
        <Paragraph>
          系统数据来自于以下Elasticsearch索引：
          <ul>
            <li><Text code>llm-logs</Text> - 存储LLM请求和响应的日志</li>
            <li><Text code>honeypot-logs</Text> - 存储蜜罐活动的日志</li>
          </ul>
        </Paragraph>

        <Title level={3}>使用说明</Title>
        <Paragraph>
          <ul>
            <li>可使用时间选择器选择特定时间范围的数据</li>
            <li>图表支持悬停查看详细数据</li>
            <li>表格支持展开查看详细信息</li>
            <li>搜索功能支持按关键词筛选日志</li>
          </ul>
        </Paragraph>
      </Typography>
    </div>
  );
};

export default Introduction; 