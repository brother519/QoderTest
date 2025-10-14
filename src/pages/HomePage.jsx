/**
 * @fileoverview 首页组件
 * @description 商品售卖系统的主页面，展示商品列表、商品详情、评论和用户信息
 * @module pages/HomePage
 */

import React, { useEffect } from 'react';
import { useProductStore } from '../store/productStore.js';
import { useUserStore } from '../store/userStore.js';
import ProductDisplay from '../components/ProductDisplay/index.js';
import CommentList from '../components/CommentList/index.js';
import UserCard from '../components/UserCard/index.js';
import ShoppingCart from '../components/ShoppingCart/index.js';
import { SearchIcon, FilterIcon } from 'lucide-react';

/**
 * 首页组件
 * @component
 * @description 系统主页面，包含导航栏、搜索、商品展示、评论列表和用户信息
 * 
 * 布局结构：
 * - 头部：导航栏和搜索栏
 * - 左侧栏：用户信息卡片
 * - 主内容区：商品详情、评论列表、其他商品
 * - 浮动组件：购物车
 * 
 * @returns {JSX.Element} 首页组件
 */
const HomePage = () => {
  // 从 Store 获取商品相关状态和方法
  const { products, loadProducts, searchProducts } = useProductStore();
  // 从 Store 获取用户相关方法
  const { autoLogin } = useUserStore();

  /**
   * 组件挂载时初始化
   * @description 加载商品数据和尝试自动登录
   */
  useEffect(() => {
    loadProducts();
    autoLogin();
  }, [loadProducts, autoLogin]);

  /**
   * 处理搜索操作
   * @param {string} keyword - 搜索关键词
   * @description 根据关键词搜索商品
   */
  const handleSearch = (keyword) => {
    if (keyword.trim()) {
      searchProducts(keyword);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">商品售卖系统</h1>
            </div>
            
            {/* 搜索框 */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索商品..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.target.value);
                    }
                  }}
                />
                <SearchIcon size={20} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FilterIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧边栏 */}
          <div className="lg:col-span-1">
            <UserCard className="sticky top-8" />
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {products.length > 0 && (
              <div className="space-y-8">
                {/* 展示第一个商品的详细信息 */}
                <ProductDisplay productId={products[0]?.id} />
                
                {/* 商品评论 */}
                <CommentList productId={products[0]?.id} />
                
                {/* 其他商品列表 */}
                {products.length > 1 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-6">更多商品</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.slice(1).map((product) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold text-lg">
                              ¥{product.price.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              // 这里应该跳转到商品详情页
                              console.log(`查看商品: ${product.id}`);
                            }}
                            className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            查看详情
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 购物车组件 */}
      <ShoppingCart />
    </div>
  );
};

export default HomePage;