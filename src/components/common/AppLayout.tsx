import React from 'react';
import { Layout, theme } from 'antd';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import AppRouter from '../router/AppRouter';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const { sidebarCollapsed, theme: appTheme } = useAppSelector((state) => state.ui);
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 根据路由判断是否显示侧边栏
  const showSidebar = !location.pathname.includes('/login');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}
      <Layout className={`site-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {showSidebar && <Header />}
        <Content
          style={{
            margin: showSidebar ? '24px 16px' : 0,
            padding: showSidebar ? 24 : 0,
            background: showSidebar ? colorBgContainer : 'transparent',
            borderRadius: showSidebar ? 8 : 0,
            minHeight: showSidebar ? 280 : '100vh',
          }}
        >
          <AppRouter />
        </Content>
        {showSidebar && <Footer />}
      </Layout>
    </Layout>
  );
};

export default AppLayout;