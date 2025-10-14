/**
 * @fileoverview 应用主入口组件
 * @description React应用的根组件，配置路由系统
 * @module App
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';

/**
 * 应用主组件
 * @component
 * @description 应用的根组件，包含路由配置和页面结构
 * 
 * 路由配置：
 * - / - 首页
 * - /products - 商品列表页
 * - /product/:id - 商品详情页
 * 
 * @returns {JSX.Element} 应用根组件
 */
const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<HomePage />} />
          <Route path="/product/:id" element={<HomePage />} />
          {/* 其他路由可以在这里添加 */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;