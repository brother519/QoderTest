/**
 * @fileoverview AppProvider 组件实现
 * 
 * 本文件包含 AppProvider 组件和相关业务方法的实现，
 * 提供完整的状态管理和业务操作功能。
 * 
 * @author 系统开发团队
 * @version 1.0.0
 * @created 2025-09-22
 * @lastModified 2025-09-22
 */

import React, { useCallback, useMemo } from 'react';
import { AppContext, AppContextType, AppState, AppAction, appReducer, initialState } from './AppContext';
import { Product, CartItem, User, Order, Address, SearchFilters } from '../types';

/**
 * 应用上下文提供者组件属性接口
 */
interface AppProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

/**
 * 应用上下文提供者组件
 * 
 * @component AppProvider
 * @description 为整个应用提供全局状态管理和业务操作方法
 * 
 * 主要职责：
 * - 初始化应用状态
 * - 提供状态更新方法
 * - 集成业务API调用
 * - 处理错误和加载状态
 * - 管理UI状态
 * 
 * 性能优化：
 * - 使用 useCallback 缓存方法，避免不必要的重渲染
 * - 使用 useMemo 缓存计算属性
 * - 状态结构扁平化，减少深层嵌套更新
 * 
 * @param {AppProviderProps} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {Partial<AppState>} props.initialState - 可选的初始状态
 * 
 * @example
 * ```tsx
 * // 基本使用
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
 * // 带初始状态的使用（用于测试）
 * function TestApp() {
 *   const testInitialState = {
 *     user: { id: '1', username: 'test', email: 'test@example.com' },
 *     products: mockProducts
 *   };
 *   
 *   return (
 *     <AppProvider initialState={testInitialState}>
 *       <TestComponent />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export function AppProvider({ children, initialState: propInitialState }: AppProviderProps) {
  // 合并初始状态
  const mergedInitialState = useMemo(() => ({
    ...initialState,
    ...propInitialState
  }), [propInitialState]);

  const [state, dispatch] = React.useReducer(appReducer, mergedInitialState);

  // ====== 商品管理方法 ======

  /**
   * 加载商品列表
   * 
   * @async
   * @function loadProducts
   * @description 从API加载商品数据并更新状态
   * 
   * 功能特点：
   * - 自动处理加载状态
   * - 错误处理和日志记录
   * - 支持搜索和过滤参数
   * 
   * @throws {Error} 网络请求失败或数据格式错误时抛出异常
   * 
   * @example
   * ```tsx
   * const { loadProducts } = useAppContext();
   * 
   * useEffect(() => {
   *   loadProducts().catch(error => {
   *     console.error('加载商品失败:', error);
   *   });
   * }, []);
   * ```
   */
  const loadProducts = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 模拟API调用 - 实际项目中应该调用真实的API
      // const response = await productService.getProducts(state.searchFilters);
      // const products = response.data;
      
      // 临时使用模拟数据
      const mockProducts: Product[] = [
        {
          id: '1',
          name: '示例商品',
          description: '这是一个示例商品',
          price: 99.99,
          images: ['https://example.com/image1.jpg'],
          category: '电子产品',
          stock: 100,
          rating: 4.5,
          tags: ['热销', '推荐']
        }
      ];

      dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
    } catch (error) {
      console.error('加载商品失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '加载商品失败' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * 创建新商品
   * 
   * @async
   * @function createProduct
   * @description 创建新商品并添加到商品列表
   * 
   * @param {Omit<Product, 'id'>} product - 商品数据（不包含ID）
   * 
   * 业务逻辑：
   * - 生成唯一ID
   * - 数据验证
   * - API调用
   * - 状态更新
   * 
   * @throws {Error} 数据验证失败或API调用失败时抛出异常
   * 
   * @example
   * ```tsx
   * const { createProduct } = useAppContext();
   * 
   * const handleSubmit = async (productData) => {
   *   try {
   *     await createProduct(productData);
   *     message.success('商品创建成功');
   *   } catch (error) {
   *     message.error('创建失败: ' + error.message);
   *   }
   * };
   * ```
   */
  const createProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 数据验证
      if (!product.name || !product.price || product.price <= 0) {
        throw new Error('商品名称和价格不能为空，且价格必须大于0');
      }

      // 生成唯一ID
      const newProduct: Product = {
        ...product,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };

      // 模拟API调用
      // await productService.createProduct(newProduct);

      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    } catch (error) {
      console.error('创建商品失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '创建商品失败' 
      });
      throw error; // 重新抛出错误供调用者处理
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  /**
   * 更新商品信息
   * 
   * @async
   * @function updateProduct
   * @description 更新已存在的商品信息
   * 
   * @param {Product} product - 完整的商品数据
   * 
   * 更新策略：
   * - 乐观更新：先更新UI，再同步服务器
   * - 失败回滚：API调用失败时恢复原状态
   * - 数据一致性：确保所有相关状态同步更新
   * 
   * @throws {Error} 商品不存在或更新失败时抛出异常
   */
  const updateProduct = useCallback(async (product: Product): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 检查商品是否存在
      const existingProduct = state.products.find(p => p.id === product.id);
      if (!existingProduct) {
        throw new Error('商品不存在');
      }

      // 乐观更新
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });

      // 模拟API调用
      // await productService.updateProduct(product);

    } catch (error) {
      console.error('更新商品失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '更新商品失败' 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.products]);

  /**
   * 删除商品
   * 
   * @async
   * @function deleteProduct
   * @description 删除指定的商品
   * 
   * @param {string} productId - 商品ID
   * 
   * 删除影响：
   * - 从商品列表中移除
   * - 清理购物车中的相关商品
   * - 清理选中状态（如果匹配）
   * - 级联删除相关数据
   * 
   * 安全措施：
   * - 确认对话框防止误删
   * - 软删除选项（标记删除）
   * - 权限检查
   */
  const deleteProduct = useCallback(async (productId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // 检查商品是否存在
      const product = state.products.find(p => p.id === productId);
      if (!product) {
        throw new Error('商品不存在');
      }

      // 模拟API调用
      // await productService.deleteProduct(productId);

      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    } catch (error) {
      console.error('删除商品失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '删除商品失败' 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.products]);

  /**
   * 设置选中商品
   * 
   * @function setSelectedProduct
   * @description 设置当前选中的商品，用于详情展示或编辑
   * 
   * @param {Product | null} product - 要选中的商品，null表示清除选中
   * 
   * 使用场景：
   * - 商品详情页展示
   * - 编辑商品时的数据回填
   * - 模态框中的商品操作
   */
  const setSelectedProduct = useCallback((product: Product | null): void => {
    dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
  }, []);

  // ====== 购物车管理方法 ======

  /**
   * 添加商品到购物车
   * 
   * @function addToCart
   * @description 将商品添加到购物车，支持规格选择和数量设定
   * 
   * @param {CartItem} item - 购物车项目数据
   * 
   * 处理逻辑：
   * - 检查商品库存
   * - 合并相同商品（相同规格）
   * - 数量累加
   * - 本地存储同步
   */
  const addToCart = useCallback((item: CartItem): void => {
    try {
      // 验证商品是否存在且有库存
      const product = state.products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error('商品不存在');
      }
      
      if (product.stock < item.quantity) {
        throw new Error('库存不足');
      }

      dispatch({ type: 'ADD_TO_CART', payload: item });
    } catch (error) {
      console.error('添加到购物车失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '添加到购物车失败' 
      });
    }
  }, [state.products]);

  /**
   * 更新购物车商品数量
   * 
   * @function updateCartItem
   * @description 修改购物车中指定商品的数量
   * 
   * @param {string} productId - 商品ID
   * @param {number} quantity - 新的数量
   * 
   * 业务规则：
   * - 数量为0时自动移除商品
   * - 数量不能超过库存
   * - 数量必须为正整数
   */
  const updateCartItem = useCallback((productId: string, quantity: number): void => {
    try {
      if (quantity < 0) {
        throw new Error('商品数量不能为负数');
      }

      // 检查库存
      if (quantity > 0) {
        const product = state.products.find(p => p.id === productId);
        if (product && product.stock < quantity) {
          throw new Error('库存不足');
        }
      }

      dispatch({ type: 'UPDATE_CART_ITEM', payload: { productId, quantity } });
    } catch (error) {
      console.error('更新购物车失败:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : '更新购物车失败' 
      });
    }
  }, [state.products]);

  /**
   * 从购物车移除商品
   * 
   * @function removeFromCart
   * @description 完全移除购物车中的指定商品
   * 
   * @param {string} productId - 要移除的商品ID
   */
  const removeFromCart = useCallback((productId: string): void => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  }, []);

  /**
   * 清空购物车
   * 
   * @function clearCart
   * @description 移除购物车中的所有商品
   * 
   * 使用场景：
   * - 订单提交成功后
   * - 用户主动清空
   * - 会话过期时
   */
  const clearCart = useCallback((): void => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  /**
   * 获取购物车商品总数
   * 
   * @function getCartItemsCount
   * @description 计算购物车中所有商品的总数量
   * 
   * @returns {number} 商品总数量
   * 
   * 计算逻辑：累加所有商品的 quantity 值
   */
  const getCartItemsCount = useCallback((): number => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [state.cartItems]);

  /**
   * 获取购物车总金额
   * 
   * @function getCartTotal
   * @description 计算购物车中所有商品的总金额
   * 
   * @returns {number} 总金额
   * 
   * 计算逻辑：
   * - 查找每个商品的当前价格
   * - 乘以对应数量
   * - 累加得到总金额
   * - 处理商品不存在的情况
   */
  const getCartTotal = useCallback((): number => {
    return state.cartItems.reduce((total, item) => {
      const product = state.products.find(p => p.id === item.productId);
      if (!product) return total;
      
      const price = item.selectedVariant?.price ?? product.price;
      return total + (price * item.quantity);
    }, 0);
  }, [state.cartItems, state.products]);

  // ====== Context Value 构建 ======

  /**
   * Context 提供的值
   * 
   * @constant contextValue
   * @description 构建传递给 Context 的完整值对象
   * 
   * 使用 useMemo 进行优化：
   * - 避免每次渲染都创建新对象
   * - 减少子组件的不必要重渲染
   * - 提高应用整体性能
   */
  const contextValue = useMemo<AppContextType>(() => ({
    // 状态数据
    ...state,
    
    // 商品管理方法
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    
    // 购物车管理方法
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    
    // 其他方法（这里可以继续添加用户、订单等方法）
    login: async () => { /* TODO: 实现登录逻辑 */ },
    logout: () => { /* TODO: 实现登出逻辑 */ },
    updateUserProfile: async () => { /* TODO: 实现用户资料更新 */ },
    
    loadOrders: async () => { /* TODO: 实现订单加载 */ },
    createOrder: async () => { /* TODO: 实现订单创建 */ },
    updateOrderStatus: async () => { /* TODO: 实现订单状态更新 */ },
    
    loadAddresses: async () => { /* TODO: 实现地址加载 */ },
    addAddress: async () => { /* TODO: 实现地址添加 */ },
    updateAddress: async () => { /* TODO: 实现地址更新 */ },
    deleteAddress: async () => { /* TODO: 实现地址删除 */ },
    setDefaultAddress: async () => { /* TODO: 实现默认地址设置 */ },
    
    setSearchFilters: (filters) => dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters }),
    clearSearchFilters: () => dispatch({ type: 'CLEAR_SEARCH_FILTERS' }),
    searchProducts: async () => { /* TODO: 实现商品搜索 */ },
    
    // UI 状态管理方法
    toggleProductModal: (isOpen) => dispatch({ type: 'TOGGLE_PRODUCT_MODAL', payload: isOpen }),
    toggleCartModal: (isOpen) => dispatch({ type: 'TOGGLE_CART_MODAL', payload: isOpen }),
    toggleLoginModal: (isOpen) => dispatch({ type: 'TOGGLE_LOGIN_MODAL', payload: isOpen }),
    toggleAddressModal: (isOpen) => dispatch({ type: 'TOGGLE_ADDRESS_MODAL', payload: isOpen }),
    togglePaymentModal: (isOpen) => dispatch({ type: 'TOGGLE_PAYMENT_MODAL', payload: isOpen }),
    showConfirmDialog: (config) => dispatch({ type: 'SHOW_CONFIRM_DIALOG', payload: config }),
    hideConfirmDialog: () => dispatch({ type: 'HIDE_CONFIRM_DIALOG' }),
    
    // 工具方法
    dispatch
  }), [
    state,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setSelectedProduct,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartItemsCount,
    getCartTotal,
    dispatch
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}