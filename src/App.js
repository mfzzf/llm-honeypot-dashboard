import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme, FloatButton } from 'antd';
import { 
  RocketOutlined, 
  BulbOutlined,
  BulbFilled,
  QuestionCircleOutlined
} from '@ant-design/icons';
import SideMenu from './components/common/SideMenu';
import Header from './components/common/Header';
import Dashboard from './pages/dashboard/Dashboard';
import HoneypotLogs from './pages/honeypot/HoneypotLogs';
import LlmLogs from './pages/llm/LlmLogs';
import GpuMetrics from './pages/GpuMetrics';
import './App.css';

const { Content, Footer } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

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
  minHeight: 'calc(100vh - 112px)', // 减去头部和底部的高度
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
  // 深色模式状态
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 从本地存储中加载主题偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // 检测系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);
  
  // 切换深色/浅色模式
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ConfigProvider
      theme={{
        ...customTheme,
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <Router>
        <Layout style={layoutStyle} className={isDarkMode ? 'dark-theme' : 'light-theme'}>
          <SideMenu isDarkMode={isDarkMode} />
          <Layout className="site-layout" style={{ margin: 0, padding: 0 }}>
            <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
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
              <div style={{ margin: '0 auto', maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  LLM蜜罐日志可视化系统 ©{new Date().getFullYear()} 
                </div>
                <div>
                  <a href="#" style={{ marginRight: '16px' }}>帮助文档</a>
                  <a href="#" style={{ marginRight: '16px' }}>API</a>
                  <a href="#">关于</a>
                </div>
              </div>
            </Footer>
          </Layout>
          <FloatButton.Group
            trigger="hover"
            style={{ right: 24 }}
            icon={<RocketOutlined />}
          >
            <FloatButton icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />} tooltip="切换主题" onClick={toggleTheme} />
            <FloatButton icon={<QuestionCircleOutlined />} tooltip="帮助" />
          </FloatButton.Group>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App; 