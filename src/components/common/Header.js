import React from 'react';
import { Layout, Typography, Space, Button, Dropdown } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const getPageTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return '仪表盘概览';
  if (pathname.includes('/honeypot-logs')) return '蜜罐日志分析';
  if (pathname.includes('/llm-logs')) return 'LLM请求日志';
  return '日志可视化系统';
};

const headerStyle = {
  padding: 0,
  height: '48px',
  lineHeight: '48px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  background: '#fff',
  margin: 0,
};

const Header = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <AntHeader className="site-layout-background" style={headerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', height: '48px' }}>
        <Title level={4} style={{ margin: 0, marginRight: 12, fontSize: '16px' }}>
          {pageTitle}
        </Title>
        <Space>
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
            size="small"
          >
            刷新
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
          >
            设置
          </Button>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header; 