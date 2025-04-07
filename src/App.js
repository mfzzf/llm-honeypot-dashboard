import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, FloatButton } from 'antd';
import { 
  RocketOutlined, 
  QuestionCircleOutlined
} from '@ant-design/icons';
import SideMenu from './components/common/SideMenu';
import Dashboard from './pages/dashboard/Dashboard';
import HoneypotLogs from './pages/honeypot/HoneypotLogs';
import LlmLogs from './pages/llm/LlmLogs';
import GpuMetrics from './pages/GpuMetrics';
import './App.css';

const { Content, Footer } = Layout;

// 定义自定义主题
const customTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Card: {
      colorBgContainer: '#ffffff',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    Button: {
      colorPrimaryHover: '#40a9ff',
    },
    Layout: {
      colorBgHeader: '#001529',
      colorBgBody: '#f0f2f5',
    },
    Menu: {
      colorItemBg: 'transparent',
    },
  },
};

// 定义样式对象
const contentStyle = {
  margin: 0,
  padding: 0,
  minHeight: 'calc(100vh - 32px)', // 只减去底部的高度
};

const layoutStyle = {
  minHeight: '100vh',
};

const footerStyle = {
  textAlign: 'center',
  padding: '16px 0',
  margin: 0,
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  backgroundColor: '#ffffff',
};

const App = () => {
  return (
    <ConfigProvider
      theme={customTheme}
    >
      <Router>
        <Layout style={layoutStyle}>
          <SideMenu />
          <Layout className="site-layout" style={{ margin: 0, padding: 0 }}>
            <Content style={contentStyle}>
              <div className="site-layout-background" style={{ margin: 0, padding: 0 }}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/honeypot-logs" element={<HoneypotLogs />} />
                  <Route path="/llm-logs" element={<LlmLogs />} />
                  <Route path="/gpu-metrics" element={<GpuMetrics />} />
                </Routes>
              </div>
            </Content>
            <Footer style={footerStyle}>
              <div style={{ margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                HiveGuard智能化蜜罐可视化系统 ©{new Date().getFullYear()} 
              </div>
            </Footer>
          </Layout>
          <FloatButton.Group
            trigger="hover"
            style={{ right: 24 }}
            icon={<RocketOutlined />}
          >
            <FloatButton icon={<QuestionCircleOutlined />} tooltip="帮助" />
          </FloatButton.Group>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App; 