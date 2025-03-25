import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, DatePicker, Spin, Button, Input, Tag } from 'antd';
import moment from 'moment';
import { getLlmLogs } from '../../services/elasticService';
import { getLlmModelStats, getLlmRequestTypeStats, getLlmEventTypeStats, getLlmStatusStats } from '../../services/visualizationService';
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
  const [typeFilter, setTypeFilter] = useState(null);
  const [modelFilter, setModelFilter] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);

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
    // 清除所有筛选
    setTypeFilter(null);
    setModelFilter(null);
    setEventTypeFilter(null);
    setStatusFilter(null);
  };

  // 处理图表点击事件
  const handleTypeClick = (type) => {
    setTypeFilter(typeFilter === type ? null : type);
    // 清除其他筛选
    setModelFilter(null);
    setEventTypeFilter(null);
    setStatusFilter(null);
  };

  const handleModelClick = (model) => {
    setModelFilter(modelFilter === model ? null : model);
    // 清除其他筛选
    setTypeFilter(null);
    setEventTypeFilter(null);
    setStatusFilter(null);
  };

  const handleEventTypeClick = (eventType) => {
    setEventTypeFilter(eventTypeFilter === eventType ? null : eventType);
    // 清除其他筛选
    setTypeFilter(null);
    setModelFilter(null);
    setStatusFilter(null);
  };

  const handleStatusClick = (status) => {
    setStatusFilter(statusFilter === status ? null : status);
    // 清除其他筛选
    setTypeFilter(null);
    setModelFilter(null);
    setEventTypeFilter(null);
  };

  // 处理LLM请求类型统计
  const llmTypeData = getLlmRequestTypeStats(logs.length ? { hits: { hits: logs } } : null);

  // LLM模型使用统计
  const llmModelData = getLlmModelStats(logs.length ? { hits: { hits: logs } } : null);

  // LLM事件类型统计
  const llmEventTypeData = getLlmEventTypeStats(logs.length ? { hits: { hits: logs } } : null);

  // LLM状态统计
  const llmStatusData = getLlmStatusStats(logs.length ? { hits: { hits: logs } } : null);

  // 将日志数据转换为表格数据
  const tableData = logs
    .map((log, index) => {
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
        error: source.error,
        host: source.host,
        operation: source.operation,
        reason: source.reason,
        status: source.status
      };
    })
    .filter(item => {
      // 应用筛选
      if (typeFilter && item.type !== typeFilter) return false;
      if (modelFilter && item.model !== modelFilter) return false;
      if (eventTypeFilter && item.type !== eventTypeFilter) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      return true;
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
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'blue';
        if (status === 'rejected') {
          color = 'red';
        } else if (status === 'approved') {
          color = 'green';
        }
        return status ? <Tag color={color}>{status}</Tag> : null;
      }
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
    }
  ];

  const expandedRowRender = (record) => {
    return (
      <div style={{ maxWidth: '100%', overflow: 'auto' }}>
        {record.question && (
          <div>
            <p style={{ fontWeight: 'bold' }}>问题：</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>{record.question}</pre>
          </div>
        )}
        {record.response && (
          <div>
            <p style={{ fontWeight: 'bold' }}>回复：</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>{record.response}</pre>
          </div>
        )}
        {record.reason && record.status !== 'allowed' && record.status !== 'approved' && (
          <div>
            <p style={{ fontWeight: 'bold', color: 'orange' }}>拒绝原因：</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>{record.reason}</pre>
          </div>
        )}
        {record.error && (
          <div>
            <p style={{ fontWeight: 'bold', color: 'red' }}>错误：</p>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>{record.error}</pre>
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
          {(typeFilter || modelFilter || eventTypeFilter || statusFilter) && (
            <Button 
              type="primary" 
              danger 
              style={{ marginLeft: '16px' }}
              onClick={() => {
                setTypeFilter(null);
                setModelFilter(null);
                setEventTypeFilter(null);
                setStatusFilter(null);
              }}
            >
              清除筛选
            </Button>
          )}
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
              <Card title={`LLM请求类型分布 ${typeFilter ? `(已筛选: ${typeFilter})` : ''}`}>
                <BarChart
                  title="LLM请求类型"
                  data={llmTypeData.counts}
                  xAxisData={llmTypeData.types}
                  yAxisName="请求数量"
                  onClickItem={handleTypeClick}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title={`LLM模型使用分布 ${modelFilter ? `(已筛选: ${modelFilter})` : ''}`}>
                <PieChart
                  title="模型使用统计"
                  data={llmModelData.models.map((model, index) => ({
                    name: model,
                    value: llmModelData.counts[index]
                  }))}
                  onClickItem={handleModelClick}
                />
              </Card>
            </Col>
          </Row>
          
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col span={12}>
              <Card title={`LLM事件类型分布 ${eventTypeFilter ? `(已筛选: ${eventTypeFilter})` : ''}`}>
                <PieChart
                  title="事件类型统计"
                  data={llmEventTypeData.eventTypes.map((eventType, index) => ({
                    name: eventType,
                    value: llmEventTypeData.counts[index]
                  }))}
                  onClickItem={handleEventTypeClick}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title={`LLM状态分布 ${statusFilter ? `(已筛选: ${statusFilter})` : ''}`}>
                <PieChart
                  title="状态统计"
                  data={llmStatusData.statuses.map((status, index) => ({
                    name: status,
                    value: llmStatusData.counts[index]
                  }))}
                  onClickItem={handleStatusClick}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title={`日志列表 (${tableData.length}条${(typeFilter || modelFilter || eventTypeFilter || statusFilter) ? ', 已筛选' : ''})`}>
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