import React, { useState } from 'react';
import './App.css';
import ProductManagement from './components/ProductManagement';
import DragDropList from './components/DragDropList';
import VirtualScroll from './components/VirtualScroll';
import InfiniteScroll from './components/InfiniteScroll';
import CaptchaInput from './components/CaptchaInput';
import CodeEditor from './components/CodeEditor';
import Watermark from './components/Watermark';
import QRCodeGenerator from './components/QRCodeGenerator';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'integrated' | 'individual'>('integrated');
  const [activeTab, setActiveTab] = useState('drag-drop');

  const tabs = [
    { id: 'drag-drop', name: '拖拽排序', component: <DragDropList /> },
    { id: 'virtual-scroll', name: '虚拟滚动', component: <VirtualScroll /> },
    { id: 'infinite-scroll', name: '无限滚动', component: <InfiniteScroll /> },
    { id: 'captcha', name: '验证码输入', component: <CaptchaInput /> },
    { id: 'code-editor', name: '代码编辑器', component: <CodeEditor /> },
    { id: 'watermark', name: '水印', component: <Watermark /> },
    { id: 'qrcode', name: '二维码', component: <QRCodeGenerator /> },
  ];

  if (viewMode === 'integrated') {
    return <ProductManagement />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-controls">
          <div className="title-section">
            <h1>商品后台管理系统</h1>
            <p>功能齐全的现代化管理界面</p>
          </div>
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'integrated' ? 'active' : ''}`}
              onClick={() => setViewMode('integrated')}
            >
              🏪 集成模式
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'individual' ? 'active' : ''}`}
              onClick={() => setViewMode('individual')}
            >
              🔧 组件模式
            </button>
          </div>
        </div>
      </header>
      
      <nav className="app-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <main className="app-main">
        <div className="content-container">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </main>
    </div>
  );
};

export default App;