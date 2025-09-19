import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { store } from './store';
import AppLayout from './components/common/AppLayout';
import { useAppSelector } from './store';
import 'antd/dist/reset.css';
import './styles/global.css';

function AppContent() {
  const { theme } = useAppSelector((state) => state.ui);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme === 'dark' ? 'darkAlgorithm' : 'defaultAlgorithm',
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AppLayout />
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;