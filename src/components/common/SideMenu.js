import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  BugOutlined, 
  RobotOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const SideMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return '1';
    if (path.includes('/honeypot-logs')) return '2';
    if (path.includes('/llm-logs')) return '3';
    return '1';
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={value => setCollapsed(value)}
    >
      <div className="logo-container">
        <span className="logo-text">
          {collapsed ? '监控' : 'LLM/蜜罐监控'}
        </span>
      </div>
      <Menu
        theme="dark"
        defaultSelectedKeys={[getSelectedKey()]}
        selectedKeys={[getSelectedKey()]}
        mode="inline"
      >
        <Menu.Item key="1" icon={<DashboardOutlined />}>
          <Link to="/dashboard">仪表盘</Link>
        </Menu.Item>
        <Menu.Item key="2" icon={<BugOutlined />}>
          <Link to="/honeypot-logs">蜜罐日志</Link>
        </Menu.Item>
        <Menu.Item key="3" icon={<RobotOutlined />}>
          <Link to="/llm-logs">LLM日志</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideMenu; 