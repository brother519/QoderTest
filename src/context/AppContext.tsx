/**
 * @fileoverview 应用全局状态管理模块 - AppContext
 * 
 * 本文件实现了基于 React Context API 和 useReducer 的全局状态管理系统，
 * 为整个商品销售系统提供统一的状态管理和业务操作方法。
 * 
 * 主要功能包括：
 * - 商品数据的 CRUD 操作
 * - 购物车状态管理
 * - 用户认证状态
 * - 订单状态管理
 * - 全局UI状态（模态框、加载状态等）
 * - 搜索和过滤功能
 * 
 * 技术架构：
 * - React Context API：提供全局状态共享
 * - useReducer：处理复杂状态更新逻辑
 * - TypeScript：类型安全保障
 * - 异步操作：集成API服务调用
 * 
 * @author 系统开发团队
 * @version 1.0.0
 * @created 2025-09-22
 * @lastModified 2025-09-22
 * 
 * @example
 * ```tsx
 * // 在应用根组件中使用 AppProvider
 * function App() {
 *   return (
 *     <AppProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *         </Routes>
 *       </Router>
 *     </AppProvider>
 *   );
 * }
 * 
 * // 在子组件中使用 useAppContext
 * function ProductList() {
 *   const { products, loadProducts, createProduct } = useAppContext();
 *   
 *   useEffect(() => {
 *     loadProducts();
 *   }, []);
 *   
 *   return (
 *     <div>
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { Product, CartItem, User, Order, Address, PaymentMethod, SearchFilters } from '../types';

/**
 * 应用状态接口定义
 * 
 * @interface AppState
 * @description 定义应用的全局状态结构，包含所有业务数据和UI状态
 */
interface AppState {
  /** 商品列表数据 */
  products: Product[];
  /** 当前选中的商品 */
  selectedProduct: Product | null;
  /** 购物车商品列表 */
  cartItems: CartItem[];
  /** 当前登录用户信息 */
  user: User | null;
  /** 订单列表 */
  orders: Order[];
  /** 用户地址列表 */
  addresses: Address[];
  /** 支付方式列表 */
  paymentMethods: PaymentMethod[];
  /** 搜索过滤条件 */
  searchFilters: SearchFilters;
  /** 全局加载状态 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** UI状态 - 各种模态框的显示状态 */
  ui: {
    /** 商品详情模态框 */
    isProductModalOpen: boolean;
    /** 购物车模态框 */
    isCartModalOpen: boolean;
    /** 用户登录模态框 */
    isLoginModalOpen: boolean;
    /** 地址管理模态框 */
    isAddressModalOpen: boolean;
    /** 支付选择模态框 */
    isPaymentModalOpen: boolean;
    /** 确认对话框 */
    isConfirmDialogOpen: boolean;
    /** 确认对话框的配置 */
    confirmDialog: {
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel: () => void;
    } | null;
  };
}

/**
 * 应用Action联合类型
 * 
 * @typedef {Object} AppAction
 * @description 定义所有可能的状态更新操作类型
 */
type AppAction =
  // 商品相关操作
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product | null }
  
  // 购物车相关操作
  | { type: 'SET_CART_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  
  // 用户相关操作
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User> }
  
  // 订单相关操作
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: Order['status'] } }
  
  // 地址相关操作
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: Address }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'SET_DEFAULT_ADDRESS'; payload: string }
  
  // 支付方式相关操作
  | { type: 'SET_PAYMENT_METHODS'; payload: PaymentMethod[] }
  
  // 搜索和过滤操作
  | { type: 'SET_SEARCH_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'CLEAR_SEARCH_FILTERS' }
  
  // 全局状态操作
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  
  // UI状态操作
  | { type: 'TOGGLE_PRODUCT_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_CART_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_LOGIN_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_ADDRESS_MODAL'; payload?: boolean }
  | { type: 'TOGGLE_PAYMENT_MODAL'; payload?: boolean }
  | { type: 'SHOW_CONFIRM_DIALOG'; payload: AppState['ui']['confirmDialog'] }
  | { type: 'HIDE_CONFIRM_DIALOG' };

/**
 * 应用上下文类型定义
 * 
 * @interface AppContextType
 * @description 定义Context提供的所有状态和方法
 */
interface AppContextType extends AppState {
  // 商品管理方法
  /** 加载商品列表 */
  loadProducts: () => Promise<void>;
  /** 创建新商品 */
  createProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  /** 更新商品信息 */
  updateProduct: (product: Product) => Promise<void>;
  /** 删除商品 */
  deleteProduct: (productId: string) => Promise<void>;
  /** 设置选中商品 */
  setSelectedProduct: (product: Product | null) => void;
  
  // 购物车管理方法
  /** 添加商品到购物车 */
  addToCart: (item: CartItem) => void;
  /** 更新购物车商品数量 */
  updateCartItem: (productId: string, quantity: number) => void;
  /** 从购物车移除商品 */
  removeFromCart: (productId: string) => void;
  /** 清空购物车 */
  clearCart: () => void;
  /** 获取购物车商品总数 */
  getCartItemsCount: () => number;
  /** 获取购物车总金额 */
  getCartTotal: () => number;
  
  // 用户管理方法
  /** 用户登录 */
  login: (credentials: { email: string; password: string }) => Promise<void>;
  /** 用户登出 */
  logout: () => void;
  /** 更新用户资料 */
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  
  // 订单管理方法
  /** 加载订单列表 */
  loadOrders: () => Promise<void>;
  /** 创建订单 */
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Promise<void>;
  /** 更新订单状态 */
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  
  // 地址管理方法
  /** 加载地址列表 */
  loadAddresses: () => Promise<void>;
  /** 添加新地址 */
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  /** 更新地址 */
  updateAddress: (address: Address) => Promise<void>;
  /** 删除地址 */
  deleteAddress: (addressId: string) => Promise<void>;
  /** 设置默认地址 */
  setDefaultAddress: (addressId: string) => Promise<void>;
  
  // 搜索和过滤方法
  /** 设置搜索过滤条件 */
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  /** 清除搜索过滤条件 */
  clearSearchFilters: () => void;
  /** 根据过滤条件搜索商品 */
  searchProducts: (filters: SearchFilters) => Promise<void>;
  
  // UI状态管理方法
  /** 切换商品详情模态框 */
  toggleProductModal: (isOpen?: boolean) => void;
  /** 切换购物车模态框 */
  toggleCartModal: (isOpen?: boolean) => void;
  /** 切换登录模态框 */
  toggleLoginModal: (isOpen?: boolean) => void;
  /** 切换地址管理模态框 */
  toggleAddressModal: (isOpen?: boolean) => void;
  /** 切换支付方式模态框 */
  togglePaymentModal: (isOpen?: boolean) => void;
  /** 显示确认对话框 */
  showConfirmDialog: (config: NonNullable<AppState['ui']['confirmDialog']>) => void;
  /** 隐藏确认对话框 */
  hideConfirmDialog: () => void;
  
  // 工具方法
  /** 分发Action的方法 */
  dispatch: React.Dispatch<AppAction>;
}

/**
 * 应用初始状态
 * 
 * @constant {AppState} initialState
 * @description 定义应用启动时的默认状态值
 * 
 * 初始状态设计原则：
 * - 所有列表数据初始为空数组
 * - 用户未登录状态（user: null）
 * - 所有模态框初始关闭
 * - 无错误状态和加载状态
 * - 搜索过滤条件为空对象
 */
const initialState: AppState = {
  // 业务数据初始状态
  products: [],
  selectedProduct: null,
  cartItems: [],
  user: null,
  orders: [],
  addresses: [],
  paymentMethods: [],
  searchFilters: {},
  
  // 全局状态初始值
  isLoading: false,
  error: null,
  
  // UI状态初始值 - 所有模态框默认关闭
  ui: {
    isProductModalOpen: false,
    isCartModalOpen: false,
    isLoginModalOpen: false,
    isAddressModalOpen: false,
    isPaymentModalOpen: false,
    isConfirmDialogOpen: false,
    confirmDialog: null
  }
};

/**
 * 应用状态Reducer函数
 * 
 * @function appReducer
 * @description 处理所有状态更新逻辑的纯函数
 * 
 * @param {AppState} state - 当前状态
 * @param {AppAction} action - 要执行的操作
 * @returns {AppState} 新的状态对象
 * 
 * Reducer设计原则：
 * - 保持状态不可变性，总是返回新的状态对象
 * - 按业务领域组织action处理逻辑
 * - 对于复杂操作，使用展开运算符保持性能
 * - 为未知action提供默认处理
 * 
 * @example
 * // 基本使用
 * const newState = appReducer(currentState, {
 *   type: 'SET_PRODUCTS',
 *   payload: products
 * });
 * 
 * // 复杂更新
 * const updatedState = appReducer(currentState, {
 *   type: 'UPDATE_CART_ITEM',
 *   payload: { productId: '123', quantity: 2 }
 * });
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ====== 商品相关状态更新 ======
    
    /**
     * 设置商品列表
     * @description 替换整个商品列表，通常用于初始加载或重新加载数据
     */
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
        error: null // 成功加载后清除错误状态
      };
    
    /**
     * 添加新商品
     * @description 在商品列表中添加一个新商品
     */
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        error: null
      };
    
    /**
     * 更新商品信息
     * @description 更新已存在的商品信息，同时更新选中商品（如果匹配）
     */
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        ),
        selectedProduct: state.selectedProduct?.id === action.payload.id 
          ? action.payload 
          : state.selectedProduct,
        error: null
      };
    
    /**
     * 删除商品
     * @description 从列表中移除指定商品，同时清理相关状态
     */
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        selectedProduct: state.selectedProduct?.id === action.payload 
          ? null 
          : state.selectedProduct,
        cartItems: state.cartItems.filter(item => item.productId !== action.payload),
        error: null
      };
    
    /**
     * 设置当前选中商品
     * @description 用于商品详情页或编辑功能
     */
    case 'SET_SELECTED_PRODUCT':
      return {
        ...state,
        selectedProduct: action.payload
      };
    
    // ====== 购物车相关状态更新 ======
    
    /**
     * 设置购物车列表
     * @description 替换整个购物车列表，用于初始加载
     */
    case 'SET_CART_ITEMS':
      return {
        ...state,
        cartItems: action.payload
      };
    
    /**
     * 添加商品到购物车
     * @description 添加新商品或合并相同商品的数量
     */
    case 'ADD_TO_CART':
      const existingItemIndex = state.cartItems.findIndex(
        item => item.productId === action.payload.productId &&
               JSON.stringify(item.selectedVariant) === JSON.stringify(action.payload.selectedVariant)
      );
      
      if (existingItemIndex >= 0) {
        // 商品已存在，更新数量
        const updatedItems = [...state.cartItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity
        };
        return {
          ...state,
          cartItems: updatedItems
        };
      } else {
        // 新商品，直接添加
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload]
        };
      }
    
    /**
     * 更新购物车商品数量
     * @description 修改指定商品的数量，数量为0时移除商品
     */
    case 'UPDATE_CART_ITEM':
      if (action.payload.quantity <= 0) {
        // 数量为0或负数时，从购物车中移除
        return {
          ...state,
          cartItems: state.cartItems.filter(item => item.productId !== action.payload.productId)
        };
      }
      
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.productId === action.payload.productId 
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    /**
     * 从购物车移除商品
     * @description 完全移除指定商品
     */
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.productId !== action.payload)
      };
    
    /**
     * 清空购物车
     * @description 移除所有购物车商品，通常用于结算后
     */
    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: []
      };
    
    // ====== 用户相关状态更新 ======
    
    /**
     * 设置用户信息
     * @description 用于登录或登出操作
     */
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        // 登出时清空相关数据
        ...(action.payload === null && {
          orders: [],
          addresses: []
        })
      };
    
    /**
     * 更新用户资料
     * @description 部分更新用户信息
     */
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    
    // ====== 订单相关状态更新 ======
    
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload
      };
    
    case 'ADD_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders]
      };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.orderId
            ? { ...order, status: action.payload.status }
            : order
        )
      };
    
    // ====== 地址相关状态更新 ======
    
    case 'SET_ADDRESSES':
      return {
        ...state,
        addresses: action.payload
      };
    
    case 'ADD_ADDRESS':
      return {
        ...state,
        addresses: [...state.addresses, action.payload]
      };
    
    case 'UPDATE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map(address =>
          address.id === action.payload.id ? action.payload : address
        )
      };
    
    case 'DELETE_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.filter(address => address.id !== action.payload)
      };
    
    case 'SET_DEFAULT_ADDRESS':
      return {
        ...state,
        addresses: state.addresses.map(address => ({
          ...address,
          isDefault: address.id === action.payload
        }))
      };
    
    // ====== 支付方式相关状态更新 ======
    
    case 'SET_PAYMENT_METHODS':
      return {
        ...state,
        paymentMethods: action.payload
      };
    
    // ====== 搜索和过滤状态更新 ======
    
    case 'SET_SEARCH_FILTERS':
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload }
      };
    
    case 'CLEAR_SEARCH_FILTERS':
      return {
        ...state,
        searchFilters: {}
      };
    
    // ====== 全局状态更新 ======
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false // 出现错误时停止加载状态
      };
    
    // ====== UI状态更新 ======
    
    case 'TOGGLE_PRODUCT_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          isProductModalOpen: action.payload ?? !state.ui.isProductModalOpen
        }
      };
    
    case 'TOGGLE_CART_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          isCartModalOpen: action.payload ?? !state.ui.isCartModalOpen
        }
      };
    
    case 'TOGGLE_LOGIN_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoginModalOpen: action.payload ?? !state.ui.isLoginModalOpen
        }
      };
    
    case 'TOGGLE_ADDRESS_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          isAddressModalOpen: action.payload ?? !state.ui.isAddressModalOpen
        }
      };
    
    case 'TOGGLE_PAYMENT_MODAL':
      return {
        ...state,
        ui: {
          ...state.ui,
          isPaymentModalOpen: action.payload ?? !state.ui.isPaymentModalOpen
        }
      };
    
    case 'SHOW_CONFIRM_DIALOG':
      return {
        ...state,
        ui: {
          ...state.ui,
          isConfirmDialogOpen: true,
          confirmDialog: action.payload
        }
      };
    
    case 'HIDE_CONFIRM_DIALOG':
      return {
        ...state,
        ui: {
          ...state.ui,
          isConfirmDialogOpen: false,
          confirmDialog: null
        }
      };
    
    /**
     * 默认情况处理
     * @description 对于未知的action类型，返回当前状态不变
     * 这是一个安全措施，防止应用崩溃
     */
    default:
      console.warn(`未知的 Action 类型: ${(action as any).type}`);
      return state;
  }
}

/**
 * 应用上下文对象
 * 
 * @constant {React.Context<AppContextType | undefined>} AppContext
 * @description 创建 React Context，提供全局状态和方法的访问
 * 
 * 初始值设为 undefined，确保只能在 AppProvider 内部使用
 * 这样设计的好处：
 * - 早期发现错误使用：在 Provider 外使用会报错
 * - 类型安全：TypeScript 可以检测到未初始化的使用
 * - 避免意外的默认值传播
 */
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * 应用上下文提供者组件属性接口
 * 
 * @interface AppProviderProps
 * @description 定义 AppProvider 组件的属性类型
 */
interface AppProviderProps {
  /** 子组件 */
  children: React.ReactNode;
  /** 初始状态（可选），用于测试或服务端渲染 */
  initialState?: Partial<AppState>;
}

// ====== 导出声明 ======

/**
 * 导出所有类型和常量，供其他模块使用
 */
export type { AppState, AppAction, AppContextType, AppProviderProps };
export { AppContext, initialState, appReducer };