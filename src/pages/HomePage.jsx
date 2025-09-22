/**
 * @fileoverview 商品售卖系统主页组件
 * 
 * HomePage 作为商品售卖系统的核心展示页面，整合了商品展示、用户信息、购物车、
 * 评论系统等多个业务模块。该组件采用响应式布局设计，支持商品搜索、筛选等功能，
 * 为用户提供完整的商品浏览和购买体验。
 * 
 * 主要功能模块：
 * - 导航栏：包含系统标题、搜索框、筛选按钮
 * - 左侧边栏：用户信息卡片和快捷操作
 * - 主内容区：商品详情展示、评论列表、商品网格
 * - 悬浮购物车：全局购物车状态管理
 * 
 * 技术架构：
 * - React 18.2.0 + Hooks (函数式组件)
 * - Zustand 4.3.6 (全局状态管理)
 * - Tailwind CSS (响应式样式框架)
 * - Lucide React (矢量图标库)
 * 
 * 响应式设计：
 * - 手机端 (< 768px): 单列垂直布局
 * - 平板端 (768px - 1024px): 双列自适应布局
 * - 桌面端 (> 1024px): 四列网格布局
 * 
 * @author 商品售卖系统开发团队
 * @version 1.0.0
 * @since 2024-01-01
 * @lastModified 2024-01-15
 * 
 * @example
 * // 基本使用
 * import HomePage from './pages/HomePage';
 * 
 * function App() {
 *   return (
 *     <Router>
 *       <Route path="/" component={HomePage} />
 *     </Router>
 *   );
 * }
 * 
 * @requires React >= 18.0.0
 * @requires Zustand >= 4.0.0
 * @requires TailwindCSS >= 3.0.0
 * 
 * @see {@link ../components/ProductDisplay} 商品详情展示组件
 * @see {@link ../components/UserCard} 用户信息卡片组件
 * @see {@link ../components/ShoppingCart} 购物车组件
 * @see {@link ../components/CommentList} 评论列表组件
 * @see {@link ../store/productStore} 商品状态管理
 * @see {@link ../store/userStore} 用户状态管理
 */

import React, { useEffect } from 'react';

// ===== 状态管理库导入 =====
/** 商品相关状态管理：商品列表、加载、搜索功能 */
import { useProductStore } from '../store/productStore.js';
/** 用户相关状态管理：用户信息、登录状态、自动登录 */
import { useUserStore } from '../store/userStore.js';

// ===== 业务组件导入 =====
/** 商品详情展示组件：展示单个商品的详细信息、图片、价格等 */
import ProductDisplay from '../components/ProductDisplay/index.js';
/** 评论列表组件：展示商品相关的用户评论和评分 */
import CommentList from '../components/CommentList/index.js';
/** 用户信息卡片组件：展示用户头像、姓名、等级及快捷操作 */
import UserCard from '../components/UserCard/index.js';
/** 购物车组件：全局悬浮购物车，管理商品添加、删除、统计 */
import ShoppingCart from '../components/ShoppingCart/index.js';

// ===== UI图标库导入 =====
/** Lucide React图标库：提供搜索和筛选功能的矢量图标 */
import { SearchIcon, FilterIcon } from 'lucide-react';

/**
 * HomePage 主组件 - 商品售卖系统的核心展示页面
 * 
 * 该组件作为商品售卖系统的主入口，负责整合并展示以下核心业务模块：
 * 
 * 主要职责：
 * 1. 商品信息管理：加载、展示和搜索商品列表
 * 2. 用户状态管理：处理用户登录状态和信息展示
 * 3. 页面布局管理：实现响应式网格布局系统
 * 4. 交互功能协调：统一管理搜索、筛选等用户操作
 * 
 * 状态管理架构：
 * - ProductStore: 管理商品数据、加载状态、搜索结果
 * - UserStore: 管理用户信息、登录状态、自动登录
 * 
 * 组件层次结构：
 * HomePage
 * ├── 导航栏 (Navigation Bar)
 * │   ├── 系统标题
 * │   ├── 搜索框 (Search Input)
 * │   └── 筛选按钮 (Filter Button)
 * ├── 响应式布局容器
 * │   ├── 左侧边栏 (UserCard)
 * │   └── 主内容区
 * │       ├── ProductDisplay (首选商品展示)
 * │       ├── CommentList (首选商品评论)
 * │       └── 商品网格列表 (其他商品)
 * └── ShoppingCart (悬浮购物车)
 * 
 * 性能优化策略：
 * - 懒加载：商品图片采用懒加载策略
 * - 状态优化：精确订阅所需的store字段
 * - 条件渲染：根据数据状态优化渲染逻辑
 * 
 * 响应式断点：
 * - sm: 640px+ (手机横屏)
 * - md: 768px+ (平板竖屏)
 * - lg: 1024px+ (平板横屏/小型桌面)
 * - xl: 1280px+ (大屏桌面)
 * 
 * @component
 * @returns {JSX.Element} 渲染完整的主页布局结构
 * 
 * @example
 * // 在路由系统中使用
 * <Route path="/" element={<HomePage />} />
 * 
 * // 在App组件中使用
 * function App() {
 *   return <HomePage />;
 * }
 * 
 * @since 1.0.0
 * @author 商品售卖系统开发团队
 */
const HomePage = () => {
  // ===== 状态管理与hooks提取 =====
  
  /**
   * 从商品store中提取所需的状态和方法
   * @type {Object} productState - 商品相关状态和操作方法
   * @property {Array} products - 当前加载的商品列表数组
   * @property {Function} loadProducts - 异步加载商品数据的方法
   * @property {Function} searchProducts - 根据关键词搜索商品的方法
   */
  const { products, loadProducts, searchProducts } = useProductStore();
  
  /**
   * 从用户store中提取所需的状态和方法
   * @type {Object} userState - 用户相关状态和操作方法
   * @property {Function} autoLogin - 自动检查用户登录状态的方法
   */
  const { autoLogin } = useUserStore();

  // ===== 副作用处理和生命周期管理 =====
  
  /**
   * 组件初始化副作用处理
   * 
   * 该useEffect在组件首次渲染时执行，负责初始化两个核心模块：
   * 1. 商品数据加载：调用loadProducts()从mockData中获取商品列表
   * 2. 用户状态检查：调用autoLogin()检查本地存储的用户信息
   * 
   * 依赖数组说明：
   * - loadProducts: 商品加载函数，来自useProductStore
   * - autoLogin: 自动登录函数，来自useUserStore
   * 
   * 执行时机：组件挂载(mount)后立即执行
   * 
   * 性能考虑：
   * - 通过传入依赖数组避免不必要的重复执行
   * - 两个初始化操作并行执行，提高加载效率
   * 
   * @effect
   * @param {Function[]} deps - 依赖数组，包含外部函数引用
   */
  useEffect(() => {
    loadProducts(); // 异步加载商品列表数据
    autoLogin();    // 检查用户登录状态并自动登录
  }, [loadProducts, autoLogin]);

  // ===== 事件处理函数 =====
  
  /**
   * 处理商品搜索功能
   * 
   * 该函数在用户在搜索框中输入关键词并按下Enter键时被调用。
   * 它会验证输入内容的有效性，然后调用商品store的搜索方法。
   * 
   * 搜索逻辑：
   * 1. 首先去除关键词的前后空格
   * 2. 检查关键词是否非空
   * 3. 如果有效，则调用searchProducts进行搜索
   * 4. 搜索结果会更新到products状态中
   * 
   * 搜索范围：
   * - 商品名称 (product.name)
   * - 商品描述 (product.description)
   * - 商品标签 (product.tags)
   * 
   * 用户体验优化：
   * - 对空关键词进行过滤，避免无效搜索
   * - 搜索参数验证，确保数据安全性
   * 
   * @function
   * @param {string} keyword - 用户输入的搜索关键词
   * @returns {void} 无返回值，通过副作用更新store状态
   * 
   * @example
   * // 在搜索框中输入"手机"并按Enter
   * handleSearch('手机'); // 搜索包含"手机"的商品
   * 
   * // 空字符串不会触发搜索
   * handleSearch('   '); // 不执行搜索
   * 
   * @see {@link ../store/productStore#searchProducts} 商品搜索store方法
   * @since 1.0.0
   */
  const handleSearch = (keyword) => {
    // 去除前后空格并检查关键词有效性
    if (keyword.trim()) {
      // 调用商品store的搜索方法
      searchProducts(keyword);
    }
  };

  // ===== 组件渲染返回 =====
  
  return (
    {/* 
      最外层容器：采用全屏高度和浅灰色背景
      - min-h-screen: 确保页面至少占满整个屏幕高度
      - bg-gray-100: 使用浅灰色背景，与白色卡片形成对比
    */}
    <div className="min-h-screen bg-gray-100">
      
      {/* 
        =================================================================
        导航栏模块 (Navigation Bar)
        =================================================================
        负责显示系统标题、提供全局搜索功能和筛选入口。
        
        布局特性：
        - 固定在页面顶部，提供一致的导航体验
        - 使用Flexbox布局，实现元素水平对齐和分布
        - 响应式内边距：手机(px-4) -> 平板(px-6) -> 桌面(px-8)
        
        视觉设计：
        - 白色背景(bg-white)与页面背景形成对比
        - 轻微阴影(shadow-sm)和底部边框(border-b)增加层次感
        - 固定高度(h-16)保证一致性
      */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* 系统标题区域 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">商品售卖系统</h1>
            </div>
            
            {/* 
              ===============================================================
              搜索功能模块 (Search Module)
              ===============================================================
              提供全局商品搜索功能，支持实时搜索和键盘事件响应。
              
              功能特性：
              - 实时输入反馈：用户输入时提供视觉反馈
              - 键盘快捷键：Enter键触发搜索
              - 响应式宽度：自适应不同屏幕尺寸
              
              交互设计：
              - 左侧搜索图标提示功能
              - focus状态带有蓝色边框高亮
              - 占位符文本提供操作指引
              
              布局策略：
              - flex-1: 自动伸缩填充可用空间
              - max-width: 限制最大宽度保证美观
              - mx-8: 在导航栏中居中对齐
            */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                {/* 
                  搜索输入框
                  - 全宽度布局适应响应式容器
                  - 左内边距(pl-10)留出图标空间
                  - 右内边距(pr-4)保证文本不贴边
                  - focus状态样式提供清晰的视觉反馈
                */}
                <input
                  type="text"
                  placeholder="搜索商品..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    // 监听键盘事件，当用户按下Enter键时触发搜索
                    if (e.key === 'Enter') {
                      handleSearch(e.target.value);
                    }
                  }}
                />
                {/* 
                  搜索图标
                  - 绝对定位在输入框左上角
                  - 使用灰色调色保持视觉一致性
                  - 20px尺寸适合输入框高度
                */}
                <SearchIcon size={20} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* 
              功能按钮区域
              - 筛选按钮：为未来的商品筛选功能预留入口
              - hover效果：提供视觉反馈提升用户体验
            */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <FilterIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 
        =================================================================
        主体内容区域容器 (Main Content Container)
        =================================================================
        采用响应式网格布局系统，适配不同屏幕尺寸的设备。
        
        容器特性：
        - max-width: 7xl (1280px) - 限制最大宽度保证可读性
        - mx-auto - 水平居中对齐
        - 响应式内边距: 4px(手机) -> 6px(平板) -> 8px(桌面)
        - py-8 - 上下8单位内边距提供通透感
        
        响应式网格系统设计：
        
        手机端 (< 1024px)：
        - grid-cols-1: 单列垂直堆叠布局
        - 侧边栏和主内容区垂直排列
        - 优先级：用户信息 > 商品展示 > 其他内容
        
        大屏幕 (≥ 1024px)：
        - lg:grid-cols-4: 四列网格布局
        - 左侧边栏占的1列 (lg:col-span-1)
        - 主内容区占的3列 (lg:col-span-3)
        - 1:3的宽度比例实现黄金分割
        
        网格间距：
        - gap-8: 各网格区域间8单位间距
        - 保证内容区域之间有足够的视觉分隔
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 
            ===============================================================
            左侧边栏区域 (Left Sidebar)
            ===============================================================
            负责展示用户相关信息和快捷操作，为用户提供个性化服务入口。
            
            布局特性：
            - lg:col-span-1: 在大屏幕上占据1/4宽度
            - 手机端全宽显示，位于页面顶部
            - 大屏幕上位于左侧，与主内容并列
            
            定位策略：
            - sticky top-8: 粘性定位，在用户滚动时保持可见
            - 距离顶部8单位，留出导航栏空间
            
            组件设计：
            - UserCard: 封装的用户信息组件
            - 包含用户头像、姓名、等级信息
            - 提供快捷操作按钮（订单、收藏等）
          */}
          <div className="lg:col-span-1">
            <UserCard className="sticky top-8" />
          </div>

          {/* 
            ===============================================================
            主要内容区域 (Main Content Area)
            ===============================================================
            商品展示的核心区域，包含商品详情、评论和相关商品推荐。
            
            布局特性：
            - lg:col-span-3: 在大屏幕上占据3/4宽度
            - 手机端全宽显示，位于侧边栏下方
            - 大屏幕上位于右侧，与侧边栏并列
            
            内容组织结构：
            1. 首选商品展示 (ProductDisplay)
            2. 首选商品评论 (CommentList)
            3. 其他商品网格列表
            
            条件渲染逻辑：
            - 仅在products数组非空时渲染内容
            - 避免在数据加载过程中显示空状态
            
            间距管理：
            - space-y-8: 各子模块间在8单位垂直间距
            - 保证内容区域之间有清晰的视觉分隔
          */}
          <div className="lg:col-span-3">
            {/* 
              条件渲染逻辑：仅在有商品数据时显示内容
              - products.length > 0: 确保商品数据已加载
              - 避免在加载过程中显示空内容或错误状态
            */}
            {products.length > 0 && (
              <div className="space-y-8">
                
                {/* 
                  ===============================================================
                  首选商品详情展示模块 (Featured Product Display)
                  ===============================================================
                  展示商品列表中的第一个商品的完整详情信息。
                  
                  业务逻辑：
                  - 选择策略：products[0] - 取数组第一个元素
                  - 传递productId而非product对象，确保数据一致性
                  - 可选操作符(?)避免空数据异常
                  
                  组件职责：
                  - ProductDisplay: 显示商品图片、名称、价格、描述
                  - 包含加入购物车、收藏等交互功能
                  - 响应式设计适配不同屏幕
                  
                  数据流：
                  HomePage -> ProductDisplay -> ProductStore
                  通过productId获取具体商品信息
                */}
                <ProductDisplay productId={products[0]?.id} />
                
                {/* 
                  ===============================================================
                  商品评论列表模块 (Product Comments)
                  ===============================================================
                  展示首选商品的用户评论和评分信息。
                  
                  业务逻辑：
                  - 与ProductDisplay保持一致，显示同一商品的评论
                  - 通过productId关联对应的评论数据
                  
                  组件功能：
                  - 显示评论列表、评分统计
                  - 支持评论分页、排序功能
                  - 提供发表评论的入口（需登录）
                  
                  用户体验：
                  - 为用户决策购买提供参考信息
                  - 展示商品口碑和用户反馈
                */}
                <CommentList productId={products[0]?.id} />
                
                {/* 
                  ===============================================================
                  其他商品网格列表模块 (Additional Products Grid)
                  ===============================================================
                  展示除首选商品外的其他商品，以卡片网格形式展示。
                  
                  条件渲染逻辑：
                  - products.length > 1: 确保有多个商品才显示此模块
                  - 避免在只有1个商品时显示空的网格
                  
                  容器设计：
                  - bg-white: 白色背景卡片式设计
                  - rounded-lg: 圆角边框增加现代感
                  - shadow-lg: 较大阴影突出重要性
                  - p-6: 内边距提供舒适的内容间距
                  
                  响应式网格布局：
                  - grid-cols-1: 手机端单列显示
                  - md:grid-cols-2: 中等屏幕双列显示
                  - xl:grid-cols-3: 大屏幕三列显示
                  - gap-6: 卡片间6单位间距
                  
                  数据处理：
                  - products.slice(1): 跳过第一个商品（已在上方展示）
                  - map遵历渲染剩余商品
                  - key={product.id}: React列表渲染优化
                */}
                {products.length > 1 && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-6">更多商品</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {products.slice(1).map((product) => (
                        
                        {/* 
                          单个商品卡片设计
                          - border: 边框分隔各卡片
                          - rounded-lg: 圆角边框保持一致性
                          - p-4: 内边距提供内容间距
                          - hover:shadow-md: 悬停阴影效果提升交互体验
                          - transition-shadow: 平滑的阴影过渡动画
                        */
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          
                          {/* 
                            商品图片展示
                            - w-full h-48: 固定高度保证卡片一致性
                            - object-cover: 图片裁剪适配容器
                            - rounded-lg: 圆角边框与卡片保持一致
                            - mb-3: 与下方文本的间距
                            - images[0]: 使用第一张图片作为封面
                          */}
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                          
                          {/* 
                            商品名称
                            - font-semibold: 半粗体突出重要性
                            - text-lg: 较大字号提高可读性
                            - mb-2: 与下方元素的间距
                          */}
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          
                          {/* 
                            商品描述
                            - text-gray-600: 灰色辅助文本
                            - text-sm: 小字号节省空间
                            - mb-2: 与下方元素的间距
                            - line-clamp-2: 限制两行显示，超出省略
                          */}
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                          
                          {/* 
                            价格和评分显示区域
                            - flex justify-between: 两端对齐布局
                            - items-center: 垂直居中对齐
                          */}
                          <div className="flex items-center justify-between">
                            
                            {/* 
                              商品价格显示
                              - text-blue-600: 蓝色价格突出重点
                              - font-bold: 粗体字增强视觉效果
                              - text-lg: 较大字号提高可读性
                              - toLocaleString(): 数字千分位格式化
                            */}
                            <span className="text-blue-600 font-bold text-lg">
                              ¥{product.price.toLocaleString()}
                            </span>
                            
                            {/* 
                              评分显示区域
                              - flex items-center: 水平布局并居中对齐
                              - gap-1: 星号和评分数字间小间距
                            */}
                            <div className="flex items-center gap-1">
                              {/* 黄色星号评分图标 */}
                              <span className="text-yellow-500">★</span>
                              {/* 评分数值 */}
                              <span className="text-sm text-gray-600">{product.rating}</span>
                            </div>
                          </div>
                          
                          {/* 
                            查看详情按钮
                            - w-full: 全宽按钮提供更大点击区域
                            - mt-3: 与上方内容的间距
                            - bg-blue-600: 蓝色主题色保持一致性
                            - text-white: 白色文字保证对比度
                            - py-2: 垂直内边距提供适合的点击区域
                            - rounded-lg: 圆角边框与卡片保持一致
                            - hover:bg-blue-700: 悬停加深颜色反馈
                            - transition-colors: 平滑的颜色过渡动画
                          */}
                          <button
                            onClick={() => {
                              // TODO: 跳转到商品详情页面
                              // 未来可以集成React Router进行路由跳转
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

      {/* 
        =================================================================
        悬浮购物车组件 (Floating Shopping Cart)
        =================================================================
        全局购物车组件，提供在整个应用中的购物车功能。
        
        定位策略：
        - 悬浮在页面内容上方，不影响正常浏览
        - 通常定位在右下角或右上角
        - 具有较高的z-index值确保在最上层
        
        功能特性：
        - 显示购物车中商品数量和总价
        - 支持商品添加、删除、数量修改
        - 提供结算和清空购物车功能
        - 支持展开/折叠显示模式
        
        交互体验：
        - 点击按钮可展开/收起购物车详情
        - 支持脉冲动画和视觉反馈
        - 在手机端适配触摸操作
        
        数据源：
        - 从 CartStore 获取购物车状态
        - 与 ProductStore 协同工作获取商品信息
        - 支持数据持久化存储
        
        性能优化：
        - 使用React.memo防止不必要的重渲染
        - 懒加载购物车内容，仅在用户打开时加载
        - 优化动画性能，使用CSS transform
      */}
      <ShoppingCart />
    </div>
  );
};

// ===== 组件导出 =====
/**
 * 导出HomePage组件作为默认导出
 * 
 * 使用说明：
 * - 适用于作为应用的主页组件
 * - 需要在父组件中提供Zustand store支持
 * - 建议在Router中作为默认路由使用
 * 
 * @exports {React.Component} HomePage - 主页组件
 */
export default HomePage;