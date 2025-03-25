import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, DatePicker, Spin, Input, Tag } from 'antd';
import moment from 'moment';
import { getHoneypotLogs } from '../../services/elasticService';
import { getLogLevelStats, getHoneypotIpStats } from '../../services/visualizationService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';

const { RangePicker } = DatePicker;
const { Search } = Input;

const HoneypotLogs = () => {
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
        const logsData = await getHoneypotLogs(
          timeRange[0].toISOString(), 
          timeRange[1].toISOString(), 
          100, 
          searchQuery
        );
        setLogs(logsData.hits.hits);
      } catch (error) {
        console.error('获取蜜罐日志出错:', error);
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

  // 处理日志级别统计
  const logLevelData = getLogLevelStats(logs.length ? { hits: { hits: logs } } : null);

  // 蜜罐IP访问统计
  const ipStatsData = getHoneypotIpStats(logs.length ? { hits: { hits: logs } } : null);

  // 将日志数据转换为表格数据
  const tableData = logs.map((log, index) => {
    const source = log._source;
    return {
      key: index,
      timestamp: source['@timestamp'],
      message: source.message,
      level: source.level,
      host: source.host,
      remoteAddr: source.remote_addr || source.client_ip,
      sessionId: source.session_id,
      testId: source.test_id,
      type: source.type,
      username: source.username,
      path: source.path
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
      title: 'IP地址',
      dataIndex: 'remoteAddr',
      key: 'remoteAddr',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
    }
  ];

  const expandedRowRender = (record) => {
    const details = Object.entries(record).filter(([key, value]) => 
      value && 
      !['key', 'timestamp', 'message', 'level', 'remoteAddr', 'type', 'host'].includes(key)
    );
    
    return (
      <div style={{ maxWidth: '100%', overflow: 'auto' }}>
        {details.length > 0 && (
          <div>
            <p style={{ fontWeight: 'bold' }}>详细信息：</p>
            <table className="detail-table">
              <tbody>
                {details.map(([key, value]) => (
                  <tr key={key}>
                    <td style={{ fontWeight: 'bold', paddingRight: '16px' }}>{key}:</td>
                    <td style={{ wordBreak: 'break-word', maxWidth: '500px' }}>{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="honeypot-logs-container">
      <div className="page-header">
        <h1>蜜罐日志</h1>
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
              <Card title="日志级别分布">
                <PieChart
                  title="日志级别统计"
                  data={logLevelData}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="IP地址访问统计">
                <BarChart
                  title="TOP访问IP"
                  data={ipStatsData.counts}
                  xAxisData={ipStatsData.ips}
                  yAxisName="访问次数"
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

export default HoneypotLogs; 