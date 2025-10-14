/**
 * @fileoverview 商品管理状态Store
 * @description 基于Zustand实现的商品系统状态管理模块，负责商品加载、搜索、筛选和库存管理
 * @module store/productStore
 */

import { create } from 'zustand';
import { mockProducts } from '../data/mockData.js';

/**
 * 商品管理Store
 * @description 提供商品相关的状态管理和业务操作方法
 * 
 * 主要功能：
 * - 商品列表加载和管理
 * - 商品搜索和筛选（关键词、分类、价格、评分、库存）
 * - 搜索结果排序（价格、评分、时间）
 * - 商品详情查询
 * - 库存更新
 */
export const useProductStore = create((set, get) => ({
  /**
   * 商品列表数据
   * @type {Array<Object>}
   * @description 存储所有商品的完整列表
   */
  products: [],
  
  /**
   * 当前查看的商品
   * @type {Object|null}
   * @description 当前正在查看详情的商品对象，null表示未选中任何商品
   */
  currentProduct: null,
  
  /**
   * 搜索结果列表
   * @type {Array<Object>}
   * @description 根据搜索条件筛选后的商品列表
   */
  searchResults: [],
  
  /**
   * 搜索关键词
   * @type {string}
   * @description 当前搜索使用的关键词
   */
  searchKeyword: '',
  
  /**
   * 筛选条件
   * @type {Object}
   * @property {string} [category] - 商品分类
   * @property {Array<number>} [priceRange] - 价格范围 [min, max]
   * @property {number} [rating] - 最低评分要求
   * @property {boolean} [inStock] - 是否只显示有货商品
   */
  filters: {},
  
  /**
   * 排序方式
   * @type {string}
   * @default 'default'
   * @description 商品排序方式：'default'(默认)、'price_asc'(价格升序)、'price_desc'(价格降序)、'rating'(评分降序)、'newest'(最新)
   */
  sortBy: 'default',
  
  /**
   * 加载状态标识
   * @type {boolean}
   * @default false
   */
  loading: false,
  
  /**
   * 错误信息
   * @type {string|null}
   */
  error: null,

  /**
   * 设置商品列表
   * @param {Array<Object>} products - 商品数组
   * @returns {void}
   */
  setProducts: (products) => set({ products }),
  
  /**
   * 设置当前商品
   * @param {Object} product - 商品对象
   * @returns {void}
   */
  setCurrentProduct: (product) => set({ currentProduct: product }),
  
  /**
   * 根据ID获取商品
   * @param {string} id - 商品ID
   * @returns {Object|null} 商品对象，未找到返回null
   */
  getProductById: (id) => {
    const { products } = get();
    return products.find(product => product.id === id) || null;
  },
  
  /**
   * 加载商品列表
   * @async
   * @returns {Promise<void>}
   * @description 从模拟数据源加载全部商品列表
   */
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用延迟500ms
      setTimeout(() => {
        set({ products: mockProducts, loading: false });
      }, 500);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  /**
   * 搜索商品
   * @async
   * @param {string} keyword - 搜索关键词
   * @param {Object} [filters={}] - 筛选条件
   * @param {string} [filters.category] - 商品分类
   * @param {Array<number>} [filters.priceRange] - 价格范围 [min, max]
   * @param {number} [filters.rating] - 最低评分
   * @param {boolean} [filters.inStock] - 是否只显示有货
   * @param {string} [sortBy='default'] - 排序方式
   * @returns {Promise<void>}
   * @description 根据关键词和筛选条件搜索商品，支持分类、价格、评分、库存筛选和多种排序方式
   */
  searchProducts: async (keyword, filters = {}, sortBy = 'default') => {
    set({ loading: true, searchKeyword: keyword, filters, sortBy });
    try {
      // 模拟搜索逻辑
      let results = mockProducts;
      
      // 第一步：关键词搜索（匹配商品名、描述、标签）
      if (keyword) {
        results = results.filter(product => 
          product.name.toLowerCase().includes(keyword.toLowerCase()) ||
          product.description.toLowerCase().includes(keyword.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
      }
      
      // 第二步：分类筛选
      if (filters.category) {
        results = results.filter(product => product.category === filters.category);
      }
      
      // 第三步：价格范围筛选
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        results = results.filter(product => product.price >= min && product.price <= max);
      }
      
      // 第四步：评分筛选
      if (filters.rating) {
        results = results.filter(product => product.rating >= filters.rating);
      }
      
      // 第五步：库存筛选
      if (filters.inStock) {
        results = results.filter(product => product.stock > 0);
      }
      
      // 第六步：根据sortBy参数排序
      switch (sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          // 按ID字符串排序模拟时间排序
          results.sort((a, b) => b.id.localeCompare(a.id));
          break;
        default:
          // 保持默认顺序，不进行排序
          break;
      }
      
      // 模拟网络延迟300ms后返回结果
      setTimeout(() => {
        set({ searchResults: results, loading: false });
      }, 300);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  /**
   * 清除搜索结果和筛选条件
   * @returns {void}
   * @description 重置搜索状态为初始状态
   */
  clearSearch: () => set({ 
    searchResults: [], 
    searchKeyword: '', 
    filters: {}, 
    sortBy: 'default' 
  }),
  
  /**
   * 更新商品库存
   * @param {string} productId - 商品ID
   * @param {number} newStock - 新库存数量
   * @returns {void}
   * @description 根据商品ID更新指定商品的库存数量
   */
  updateProductStock: (productId, newStock) => {
    const { products } = get();
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, stock: newStock }
        : product
    );
    set({ products: updatedProducts });
  }
}));