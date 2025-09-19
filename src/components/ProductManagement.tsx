import React, { useState } from 'react';
import './ProductManagement.css';
import DragDropList from './DragDropList';
import VirtualScroll from './VirtualScroll';
import InfiniteScroll from './InfiniteScroll';
import CaptchaInput from './CaptchaInput';
import CodeEditor from './CodeEditor';
import Watermark from './Watermark';
import QRCodeGenerator from './QRCodeGenerator';

interface Tab {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ReactNode;
}

const ProductManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const tabs: Tab[] = [
    {
      id: 'overview',
      name: '系统概览',
      description: '查看系统功能和统计信息',
      icon: '📊',
      component: <SystemOverview />
    },
    {
      id: 'drag-drop',
      name: '商品排序',
      description: '通过拖拽调整商品展示顺序',
      icon: '🔄',
      component: <DragDropList />
    },
    {
      id: 'virtual-scroll',
      name: '大数据展示',
      description: '高性能展示海量商品数据',
      icon: '⚡',
      component: <VirtualScroll />
    },
    {
      id: 'infinite-scroll',
      name: '商品浏览',
      description: '无限滚动浏览商品列表',
      icon: '📱',
      component: <InfiniteScroll />
    },
    {
      id: 'captcha',
      name: '安全验证',
      description: '管理员登录安全验证',
      icon: '🔐',
      component: <CaptchaInput />
    },
    {
      id: 'code-editor',
      name: '代码配置',
      description: '编辑商品配置和自定义脚本',
      icon: '💻',
      component: <CodeEditor />
    },
    {
      id: 'watermark',
      name: '图片水印',
      description: '为商品图片添加版权保护',
      icon: '🎨',
      component: <Watermark />
    },
    {
      id: 'qrcode',
      name: '二维码管理',
      description: '生成商品二维码和链接',
      icon: '📱',
      component: <QRCodeGenerator />
    }
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActiveTab('overview');
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>🏪 商品后台管理系统</h2>
            <p>请完成安全验证后登录</p>
          </div>
          <div className="login-content">
            <CaptchaInput />
            <button 
              className="login-btn"
              onClick={handleLogin}
            >
              🔑 进入管理后台
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <header className="management-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🏪 商品后台管理系统</h1>
            <p>功能完备的现代化商品管理平台</p>
          </div>
          <div className="user-section">
            <span className="user-info">👨‍💼 管理员</span>
            <button 
              className="logout-btn"
              onClick={() => setIsLoggedIn(false)}
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <div className="management-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <div className="nav-content">
                  <span className="nav-name">{tab.name}</span>
                  <span className="nav-desc">{tab.description}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <div className="content-header">
            <div className="tab-info">
              <h2>
                {tabs.find(tab => tab.id === activeTab)?.icon} {' '}
                {tabs.find(tab => tab.id === activeTab)?.name}
              </h2>
              <p>{tabs.find(tab => tab.id === activeTab)?.description}</p>
            </div>
          </div>
          
          <div className="content-body">
            {tabs.find(tab => tab.id === activeTab)?.component}
          </div>
        </main>
      </div>
    </div>
  );
};

// 系统概览组件
const SystemOverview: React.FC = () => {
  const stats = [
    { label: '商品总数', value: '10,248', trend: '+12%', icon: '📦' },
    { label: '今日访问', value: '1,567', trend: '+8%', icon: '👥' },
    { label: '订单数量', value: '423', trend: '+15%', icon: '🛒' },
    { label: '系统状态', value: '正常', trend: '99.9%', icon: '✅' },
  ];

  const features = [
    {
      title: '拖拽排序',
      description: '直观的商品排序管理，支持批量调整',
      icon: '🔄',
      status: '正常运行'
    },
    {
      title: '虚拟滚动',
      description: '高性能展示，支持百万级数据',
      icon: '⚡',
      status: '正常运行'
    },
    {
      title: '无限加载',
      description: '流畅的用户体验，自动分页加载',
      icon: '📱',
      status: '正常运行'
    },
    {
      title: '安全验证',
      description: '多重安全保护，防止恶意访问',
      icon: '🔐',
      status: '正常运行'
    },
    {
      title: '代码编辑',
      description: '灵活的配置管理，支持实时预览',
      icon: '💻',
      status: '正常运行'
    },
    {
      title: '图片水印',
      description: '版权保护，支持批量处理',
      icon: '🎨',
      status: '正常运行'
    },
    {
      title: '二维码生成',
      description: '快速生成分享码，支持批量导出',
      icon: '📱',
      status: '正常运行'
    }
  ];

  return (
    <div className="system-overview">
      <section className="stats-section">
        <h3>📈 系统统计</h3>
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-trend">{stat.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h3>🛠️ 功能模块</h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <span className="feature-icon">{feature.icon}</span>
                <h4>{feature.title}</h4>
              </div>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-status">
                <span className="status-indicator active"></span>
                <span className="status-text">{feature.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <h3>🚀 快速操作</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span>添加商品</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>数据分析</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">🔧</span>
            <span>系统设置</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📁</span>
            <span>批量导入</span>
          </button>
        </div>
      </section>

      <section className="system-info">
        <h3>💡 系统信息</h3>
        <div className="info-card">
          <div className="info-item">
            <strong>版本:</strong> v2.1.0
          </div>
          <div className="info-item">
            <strong>最后更新:</strong> 2024-01-20 14:30
          </div>
          <div className="info-item">
            <strong>运行时间:</strong> 15天 8小时 23分钟
          </div>
          <div className="info-item">
            <strong>数据库:</strong> MongoDB 6.0
          </div>
          <div className="info-item">
            <strong>服务器:</strong> Ubuntu 22.04 LTS
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductManagement;