import React from 'react';
import { Layout, Typography, Space, Button, Dropdown, Avatar, Badge, Menu, Tooltip } from 'antd';
import { 
  SettingOutlined, 
  ReloadOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DownOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const getPageTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return '仪表盘概览';
  if (pathname.includes('/honeypot-logs')) return '蜜罐日志分析';
  if (pathname.includes('/llm-logs')) return 'LLM请求日志';
  if (pathname.includes('/gpu-metrics')) return 'GPU监控';
  return '日志可视化系统';
};

const getHeaderStyle = (isDarkMode) => ({
  padding: 0,
  height: '60px',
  lineHeight: '60px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  background: isDarkMode ? '#1f1f1f' : '#fff',
  margin: 0,
  borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
  zIndex: 1000,
  position: 'sticky',
  top: 0,
});

const Header = ({ isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  // 用户菜单
  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          icon: <UserOutlined />,
          label: '个人中心',
        },
        {
          key: '2',
          icon: <SettingOutlined />,
          label: '账户设置',
        },
        {
          type: 'divider',
        },
        {
          key: '3',
          icon: <LogoutOutlined />,
          label: '退出登录',
        },
      ]}
    />
  );

  // 通知菜单
  const notificationMenu = (
    <Menu
      style={{ width: 300 }}
      items={[
        {
          key: 'title',
          label: <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong>通知中心</Text>
            <Button type="link" size="small">全部标为已读</Button>
          </div>,
          disabled: true,
        },
        {
          key: '1',
          label: <div>
            <Text strong style={{ display: 'block' }}>系统更新</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>系统已更新到最新版本 v1.2.3</Text>
          </div>,
        },
        {
          key: '2',
          label: <div>
            <Text strong style={{ display: 'block' }}>安全警告</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>检测到异常IP访问，请查看详情</Text>
          </div>,
        },
        {
          key: 'footer',
          label: <Button type="link" block>查看全部通知</Button>,
          disabled: true,
        },
      ]}
    />
  );

  return (
    <AntHeader className="site-layout-background" style={getHeaderStyle(isDarkMode)}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0 24px', 
        height: '60px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ 
            margin: 0, 
            marginRight: 12, 
            fontSize: '18px',
            color: isDarkMode ? '#fff' : 'inherit'
          }}>
            {pageTitle}
          </Title>
          <Tooltip title="查看此页面说明">
            <InfoCircleOutlined style={{ color: isDarkMode ? '#8c8c8c' : '#8c8c8c', cursor: 'pointer' }} />
          </Tooltip>
        </div>
        <Space size="middle">
          <Button 
            type={isDarkMode ? "default" : "text"}
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
            size="middle"
          >
            刷新
          </Button>
          
          <Tooltip title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}>
            <Button
              type={isDarkMode ? "default" : "text"}
              icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />}
              onClick={toggleTheme}
              size="middle"
            />
          </Tooltip>

          <Dropdown 
            overlay={notificationMenu} 
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={2} size="small">
              <Button
                type={isDarkMode ? "default" : "text"}
                icon={<BellOutlined />}
                size="middle"
              />
            </Badge>
          </Dropdown>

          <Dropdown 
            overlay={userMenu} 
            trigger={['click']}
            placement="bottomRight"
          >
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar style={{ marginRight: 8, backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
              <span style={{ color: isDarkMode ? '#fff' : 'inherit' }}>管理员</span>
              <DownOutlined style={{ fontSize: '12px', marginLeft: 4, color: isDarkMode ? '#8c8c8c' : '#8c8c8c' }} />
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header; 