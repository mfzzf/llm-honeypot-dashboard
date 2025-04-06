import React from 'react';
import { Layout, Typography, Space, Button, Dropdown, Avatar, Badge, Menu, Tooltip } from 'antd';
import { 
  SettingOutlined, 
  ReloadOutlined, 
  BellOutlined, 
  UserOutlined, 
  LogoutOutlined,
  DownOutlined,
  InfoCircleOutlined
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

const headerStyle = {
  padding: 0,
  height: '80px',
  lineHeight: '80px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
  background: '#fff',
  margin: 0,
  borderBottom: '1px solid #f0f0f0',
  zIndex: 1000,
  position: 'sticky',
  top: 0,
};

const Header = () => {
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
    <AntHeader className="site-layout-background" style={headerStyle}>
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
            fontSize: '18px'
          }}>
            {pageTitle}
          </Title>
          <Tooltip title="查看此页面说明">
            <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'pointer' }} />
          </Tooltip>
        </div>
        <Space size="middle">
          <Button 
            type="text"
            icon={<ReloadOutlined />} 
            onClick={() => window.location.reload()}
            size="middle"
          >
            刷新
          </Button>

          <Dropdown 
            overlay={notificationMenu} 
            trigger={['click']}
            placement="bottomRight"
          >
            <Badge count={2} size="small">
              <Button
                type="text"
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
              <span>管理员</span>
              <DownOutlined style={{ fontSize: '12px', marginLeft: 4, color: '#8c8c8c' }} />
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header; 