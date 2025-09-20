import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Product, SearchFilters, SearchResult } from '@/shared/types';

interface ProductState {
  // 状态
  products: Product[];
  currentProduct: Product | null;
  searchResults: Product[];
  searchKeyword: string;
  filters: SearchFilters;
  sortBy: string;
  loading: boolean;
  error: string | null;
}

interface ProductActions {
  // 基础操作
  setProducts: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  getProductById: (id: string) => Product | null;
  
  // 异步操作
  loadProducts: () => Promise<void>;
  searchProducts: (keyword: string, filters?: SearchFilters, sortBy?: string) => Promise<void>;
  clearSearch: () => void;
  updateProductStock: (productId: string, newStock: number) => void;
}

type ProductStore = ProductState & ProductActions;

// 模拟产品数据
const mockProducts: Product[] = [
  {
    id: '1',
    name: '高端智能手机',
    description: '最新一代智能手机，搭载强劲处理器和高清摄像头',
    price: 4999,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'
    ],
    category: '电子产品',
    stock: 50,
    rating: 4.8,
    tags: ['热门', '新品', '5G'],
    variants: [
      { id: '1-1', name: '128GB 黑色', price: 4999, stock: 20, attributes: { color: '黑色', storage: '128GB' } },
      { id: '1-2', name: '256GB 白色', price: 5499, stock: 15, attributes: { color: '白色', storage: '256GB' } }
    ]
  },
  {
    id: '2',
    name: '无线耳机',
    description: '降噪无线耳机，音质清晰，佩戴舒适',
    price: 899,
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
    ],
    category: '音频设备',
    stock: 30,
    rating: 4.5,
    tags: ['降噪', '无线', '舒适']
  }
];

export const useProductStore = create<ProductStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      products: [],
      currentProduct: null,
      searchResults: [],
      searchKeyword: '',
      filters: {},
      sortBy: 'default',
      loading: false,
      error: null,

      // 基础操作
      setProducts: (products) => set({ products }),
      
      setCurrentProduct: (product) => set({ currentProduct: product }),
      
      getProductById: (id) => {
        const { products } = get();
        return products.find(product => product.id === id) || null;
      },
      
      // 异步操作
      loadProducts: async () => {
        set({ loading: true, error: null });
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ products: mockProducts, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '加载产品失败', 
            loading: false 
          });
        }
      },
      
      searchProducts: async (keyword, filters = {}, sortBy = 'default') => {
        set({ loading: true, searchKeyword: keyword, filters, sortBy });
        try {
          // 模拟搜索逻辑
          let results = [...mockProducts];
          
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
              results.sort((a, b) => b.id.localeCompare(a.id));
              break;
            default:
              break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          set({ searchResults: results, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '搜索失败', 
            loading: false 
          });
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
    }),
    {
      name: 'product-store',
    }
  )
);