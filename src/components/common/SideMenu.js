import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  BugOutlined, 
  RobotOutlined,
  DesktopOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  SettingOutlined,
  ToolOutlined,
  TeamOutlined,
  FileSearchOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Title } = Typography;

// Logo样式
const logoStyle = {
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s',
};

// Logo图标样式
const logoIconStyle = {
  fontSize: '24px',
  color: '#1890ff',
  marginRight: '8px',
  animation: 'pulse 1.5s infinite alternate',
};

// 定义关键帧动画
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 0.7;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1.05);
    }
  }
`;

const SideMenu = ({ isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return '1';
    if (path.includes('/honeypot-logs')) return '2';
    if (path.includes('/llm-logs')) return '3';
    if (path.includes('/gpu-metrics')) return '4';
    return '1';
  };

  return (
    <>
      <style>{pulseAnimation}</style>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={value => setCollapsed(value)}
        width={220}
        collapsedWidth={80}
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.09)',
          zIndex: 100,
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0
        }}
      >
        <div style={logoStyle}>
          <AreaChartOutlined style={logoIconStyle} />
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
              LLM/蜜罐监控
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={[getSelectedKey()]}
          selectedKeys={[getSelectedKey()]}
          mode="inline"
          style={{ borderRight: 0 }}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">仪表盘</Link>,
            },
            {
              type: 'divider',
              style: { borderColor: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }
            },
            {
              key: 'log-group',
              label: '日志分析',
              type: 'group',
              children: [
                {
                  key: '2',
                  icon: <BugOutlined />,
                  label: <Link to="/honeypot-logs">蜜罐日志</Link>,
                },
                {
                  key: '3',
                  icon: <RobotOutlined />,
                  label: <Link to="/llm-logs">LLM日志</Link>,
                },
              ]
            },
            {
              key: 'monitor-group',
              label: '系统监控',
              type: 'group',
              children: [
                {
                  key: '4',
                  icon: <DesktopOutlined />,
                  label: <Link to="/gpu-metrics">GPU监控</Link>,
                },
                {
                  key: '5',
                  icon: <LineChartOutlined />,
                  label: <Link to="/performance">性能监控</Link>,
                },
              ]
            },
            {
              type: 'divider',
              style: { borderColor: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }
            },
            {
              key: 'report-group',
              label: '统计报表',
              type: 'group',
              children: [
                {
                  key: '6',
                  icon: <BarChartOutlined />,
                  label: <Link to="/charts/bar">柱状图表</Link>,
                },
                {
                  key: '7',
                  icon: <PieChartOutlined />,
                  label: <Link to="/charts/pie">饼状图表</Link>,
                },
                {
                  key: '8',
                  icon: <FileSearchOutlined />,
                  label: <Link to="/reports">报表中心</Link>,
                },
              ]
            },
            {
              type: 'divider',
              style: { borderColor: 'rgba(255, 255, 255, 0.06)', margin: '8px 0' }
            },
            {
              key: 'setting-group',
              label: '系统设置',
              type: 'group',
              children: [
                {
                  key: '9',
                  icon: <SettingOutlined />,
                  label: <Link to="/settings">系统设置</Link>,
                },
                {
                  key: '10',
                  icon: <TeamOutlined />,
                  label: <Link to="/users">用户管理</Link>,
                },
                {
                  key: '11',
                  icon: <ToolOutlined />,
                  label: <Link to="/tools">工具集</Link>,
                }
              ]
            }
          ]}
        />
      </Sider>
    </>
  );
};

export default SideMenu; 