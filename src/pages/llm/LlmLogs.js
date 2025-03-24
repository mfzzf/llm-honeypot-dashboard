import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, DatePicker, Spin, Button, Input, Tag } from 'antd';
import moment from 'moment';
import { getLlmLogs } from '../../services/elasticService';
import { getLlmModelStats, getLlmRequestTypeStats } from '../../services/visualizationService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';

const { RangePicker } = DatePicker;
const { Search } = Input;

const LlmLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [timeRange, setTimeRange] = useState([
    moment().subtract(7, 'days'),
    moment()
  ]);
  const [searchQuery, setSearchQuery] = useState('*');

  // 加载数据
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const logsData = await getLlmLogs(
          timeRange[0].toISOString(), 
          timeRange[1].toISOString(), 
          100, 
          searchQuery
        );
        setLogs(logsData.hits.hits);
      } catch (error) {
        console.error('获取LLM日志出错:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, searchQuery]);

  const handleTimeRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setTimeRange(dates);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value || '*');
  };

  // 处理LLM请求类型统计
  const llmTypeData = getLlmRequestTypeStats(logs.length ? { hits: { hits: logs } } : null);

  // LLM模型使用统计
  const llmModelData = getLlmModelStats(logs.length ? { hits: { hits: logs } } : null);

  // 将日志数据转换为表格数据
  const tableData = logs.map((log, index) => {
    const source = log._source;
    return {
      key: index,
      timestamp: source['@timestamp'],
      message: source.message,
      level: source.level,
      model: source.model,
      provider: source.provider,
      type: source.type,
      question: source.question,
      response: source.response,
      error: source.error
    };
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      render: level => {
        let color = 'blue';
        if (level === 'error') {
          color = 'red';
        } else if (level === 'warning') {
          color = 'orange';
        } else if (level === 'info') {
          color = 'green';
        }
        return <Tag color={color}>{level}</Tag>;
      }
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    }
  ];

  const expandedRowRender = (record) => {
    return (
      <div>
        {record.question && (
          <div>
            <p style={{ fontWeight: 'bold' }}>问题：</p>
            <pre>{record.question}</pre>
          </div>
        )}
        {record.response && (
          <div>
            <p style={{ fontWeight: 'bold' }}>回复：</p>
            <pre>{record.response}</pre>
          </div>
        )}
        {record.error && (
          <div>
            <p style={{ fontWeight: 'bold', color: 'red' }}>错误：</p>
            <pre>{record.error}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="llm-logs-container">
      <div className="page-header">
        <h1>LLM日志</h1>
        <div className="header-controls">
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
            style={{ marginRight: '16px' }}
          />
          <Search
            placeholder="搜索日志内容"
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
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
            <Col span={12}>
              <Card title="LLM模型使用分布">
                <PieChart
                  title="模型使用统计"
                  data={llmModelData.models.map((model, index) => ({
                    name: model,
                    value: llmModelData.counts[index]
                  }))}
                />
              </Card>
            </Col>
          </Row>

          <Card title={`日志列表 (${logs.length}条)`}>
            <Table
              columns={columns}
              dataSource={tableData}
              expandable={{ expandedRowRender }}
              pagination={{ pageSize: 10 }}
              rowKey="key"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default LlmLogs; 