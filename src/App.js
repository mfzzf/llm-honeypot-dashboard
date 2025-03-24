import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import SideMenu from './components/common/SideMenu';
import Header from './components/common/Header';
import Dashboard from './pages/dashboard/Dashboard';
import HoneypotLogs from './pages/honeypot/HoneypotLogs';
import LlmLogs from './pages/llm/LlmLogs';
import './App.css';

const { Content, Footer } = Layout;

// 定义样式对象
const contentStyle = {
  margin: 0,
  padding: 0,
};

const layoutStyle = {
  minHeight: '100vh',
};

const footerStyle = {
  textAlign: 'center',
  padding: '12px 0',
  margin: 0,
};

const App = () => {
  return (
    <Router>
      <Layout style={layoutStyle}>
        <SideMenu />
        <Layout className="site-layout" style={{ margin: 0, padding: 0 }}>
          <Header />
          <Content style={contentStyle}>
            <div className="site-layout-background" style={{ margin: 0, padding: 0 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/honeypot-logs" element={<HoneypotLogs />} />
                <Route path="/llm-logs" element={<LlmLogs />} />
              </Routes>
            </div>
          </Content>
          <Footer style={footerStyle}>
            LLM与蜜罐日志可视化系统 ©{new Date().getFullYear()} Created with React
          </Footer>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App; 