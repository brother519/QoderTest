import { create } from 'zustand';
import { mockProducts } from '../data/mockData.js';

// 商品状态管理
export const useProductStore = create((set, get) => ({
  // 状态
  products: [],
  currentProduct: null,
  searchResults: [],
  searchKeyword: '',
  filters: {},
  sortBy: 'default',
  loading: false,
  error: null,

  // 动作
  setProducts: (products) => set({ products }),
  
  setCurrentProduct: (product) => set({ currentProduct: product }),
  
  getProductById: (id) => {
    const { products } = get();
    return products.find(product => product.id === id) || null;
  },
  
  loadProducts: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用
      setTimeout(() => {
        set({ products: mockProducts, loading: false });
      }, 500);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  searchProducts: async (keyword, filters = {}, sortBy = 'default') => {
    set({ loading: true, searchKeyword: keyword, filters, sortBy });
    try {
      // 模拟搜索逻辑
      let results = mockProducts;
      
      // 关键词搜索
      if (keyword) {
        results = results.filter(product => 
          product.name.toLowerCase().includes(keyword.toLowerCase()) ||
          product.description.toLowerCase().includes(keyword.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
      }
      
      // 分类筛选
      if (filters.category) {
        results = results.filter(product => product.category === filters.category);
      }
      
      // 价格筛选
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        results = results.filter(product => product.price >= min && product.price <= max);
      }
      
      // 评分筛选
      if (filters.rating) {
        results = results.filter(product => product.rating >= filters.rating);
      }
      
      // 库存筛选
      if (filters.inStock) {
        results = results.filter(product => product.stock > 0);
      }
      
      // 排序
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
          // 模拟按时间排序
          results.sort((a, b) => b.id.localeCompare(a.id));
          break;
        default:
          // 保持原有顺序
          break;
      }
      
      setTimeout(() => {
        set({ searchResults: results, loading: false });
      }, 300);
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  clearSearch: () => set({ 
    searchResults: [], 
    searchKeyword: '', 
    filters: {}, 
    sortBy: 'default' 
  }),
  
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