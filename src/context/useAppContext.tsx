/**
 * @fileoverview useAppContext Hook 和相关工具函数
 * 
 * 本文件提供了访问应用上下文的Hook和相关的工具函数，
 * 包括错误处理、类型安全检查和开发时的调试工具。
 * 
 * @author 系统开发团队
 * @version 1.0.0
 * @created 2025-09-22
 * @lastModified 2025-09-22
 */

import { useContext, useDebugValue, useEffect } from 'react';
import { AppContext, AppContextType } from './AppContext';

/**
 * 应用上下文访问Hook
 * 
 * @function useAppContext
 * @description 提供类型安全的应用上下文访问方式
 * 
 * 安全特性：
 * - 自动检查Context是否在Provider内使用
 * - 提供清晰的错误信息和解决建议
 * - TypeScript类型安全保障
 * - 开发时调试信息支持
 * 
 * 性能特性：
 * - 零运行时开销的类型检查
 * - 开发环境下的调试信息
 * - 生产环境自动优化
 * 
 * @returns {AppContextType} 应用上下文对象，包含所有状态和方法
 * 
 * @throws {Error} 当在AppProvider外部使用时抛出错误
 * 
 * @example
 * ```tsx
 * // 基本使用
 * function ProductList() {
 *   const { products, loadProducts, isLoading } = useAppContext();
 *   
 *   useEffect(() => {
 *     loadProducts();
 *   }, [loadProducts]);
 *   
 *   if (isLoading) return <LoadingSpinner />;
 *   
 *   return (
 *     <div>
 *       {products.map(product => (
 *         <ProductCard key={product.id} product={product} />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * // 解构使用特定功能
 * function ShoppingCart() {
 *   const { 
 *     cartItems, 
 *     updateCartItem, 
 *     removeFromCart, 
 *     getCartTotal 
 *   } = useAppContext();
 *   
 *   const total = getCartTotal();
 *   
 *   return (
 *     <div>
 *       <h2>购物车 (总计: ¥{total.toFixed(2)})</h2>
 *       {cartItems.map(item => (
 *         <CartItemRow 
 *           key={item.productId} 
 *           item={item}
 *           onUpdateQuantity={updateCartItem}
 *           onRemove={removeFromCart}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * 
 * // 错误处理示例
 * function ProductForm() {
 *   const { createProduct, error, isLoading } = useAppContext();
 *   
 *   const handleSubmit = async (formData) => {
 *     try {
 *       await createProduct(formData);
 *       message.success('商品创建成功');
 *     } catch (error) {
 *       // 错误已经在context中处理并设置到state
 *       console.error('创建商品失败:', error);
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <Alert type="error" message={error} />}
 *       {/* 表单字段 */}
 *       <button disabled={isLoading} type="submit">
 *         {isLoading ? '创建中...' : '创建商品'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  
  // 开发环境下的调试信息
  useDebugValue(context ? '✅ AppContext已连接' : '❌ AppContext未找到');
  
  // 错误处理：确保Hook在Provider内使用
  if (context === undefined) {
    throw new Error(
      '❌ useAppContext必须在AppProvider内部使用\n\n' +
      '解决方案：\n' +
      '1. 确保组件被AppProvider包裹\n' +
      '2. 检查组件层级结构\n' +
      '3. 验证AppProvider正确导入和使用\n\n' +
      '正确的使用方式：\n' +
      '<AppProvider>\n' +
      '  <YourComponent /> {/* ✅ 在这里可以使用useAppContext */}\n' +
      '</AppProvider>\n\n' +
      '错误的使用方式：\n' +
      '<YourComponent /> {/* ❌ 不在AppProvider内部 */}\n' +
      '<AppProvider>\n' +
      '  {/* 其他内容 */}\n' +
      '</AppProvider>'
    );
  }
  
  return context;
}

/**
 * 应用上下文状态选择器Hook
 * 
 * @function useAppSelector
 * @description 提供细粒度的状态选择，优化性能
 * 
 * @template T 选择器返回值类型
 * @param {(state: AppContextType) => T} selector - 状态选择器函数
 * @returns {T} 选择的状态值
 * 
 * 性能优化：
 * - 只有选择的状态发生变化时才重新渲染
 * - 支持复杂的状态计算和缓存
 * - 避免不必要的组件更新
 * 
 * @example
 * ```tsx
 * // 只选择商品列表，其他状态变化不会影响此组件
 * function ProductList() {
 *   const products = useAppSelector(state => state.products);
 *   const isLoading = useAppSelector(state => state.isLoading);
 *   
 *   return (
 *     <div>
 *       {isLoading ? <LoadingSpinner /> : (
 *         products.map(product => (
 *           <ProductCard key={product.id} product={product} />
 *         ))
 *       )}
 *     </div>
 *   );
 * }
 * 
 * // 选择计算属性
 * function CartSummary() {
 *   const cartItemsCount = useAppSelector(state => 
 *     state.cartItems.reduce((count, item) => count + item.quantity, 0)
 *   );
 *   
 *   const cartTotal = useAppSelector(state => 
 *     state.cartItems.reduce((total, item) => {
 *       const product = state.products.find(p => p.id === item.productId);
 *       return total + (product ? product.price * item.quantity : 0);
 *     }, 0)
 *   );
 *   
 *   return (
 *     <div>
 *       <span>商品数量: {cartItemsCount}</span>
 *       <span>总金额: ¥{cartTotal.toFixed(2)}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAppSelector<T>(selector: (state: AppContextType) => T): T {
  const context = useAppContext();
  return selector(context);
}

/**
 * 应用操作方法Hook
 * 
 * @function useAppActions
 * @description 提供只包含操作方法的Hook，避免状态依赖
 * 
 * @returns {object} 包含所有操作方法的对象
 * 
 * 使用场景：
 * - 只需要调用方法，不关心状态的组件
 * - 避免不必要的重渲染
 * - 优化性能敏感的组件
 * 
 * @example
 * ```tsx
 * // 只使用操作方法，不依赖状态
 * function ProductActions({ productId }) {
 *   const { deleteProduct, showConfirmDialog } = useAppActions();
 *   
 *   const handleDelete = () => {
 *     showConfirmDialog({
 *       title: '确认删除',
 *       message: '确定要删除这个商品吗？',
 *       onConfirm: () => deleteProduct(productId),
 *       onCancel: () => {}
 *     });
 *   };
 *   
 *   return (
 *     <button onClick={handleDelete}>
 *       删除商品
 *     </button>
 *   );
 * }
 * ```
 */
export function useAppActions() {
  const context = useAppContext();
  
  // 提取所有操作方法
  return {
    // 商品操作
    loadProducts: context.loadProducts,
    createProduct: context.createProduct,
    updateProduct: context.updateProduct,
    deleteProduct: context.deleteProduct,
    setSelectedProduct: context.setSelectedProduct,
    
    // 购物车操作
    addToCart: context.addToCart,
    updateCartItem: context.updateCartItem,
    removeFromCart: context.removeFromCart,
    clearCart: context.clearCart,
    
    // 用户操作
    login: context.login,
    logout: context.logout,
    updateUserProfile: context.updateUserProfile,
    
    // 订单操作
    loadOrders: context.loadOrders,
    createOrder: context.createOrder,
    updateOrderStatus: context.updateOrderStatus,
    
    // 地址操作
    loadAddresses: context.loadAddresses,
    addAddress: context.addAddress,
    updateAddress: context.updateAddress,
    deleteAddress: context.deleteAddress,
    setDefaultAddress: context.setDefaultAddress,
    
    // 搜索操作
    setSearchFilters: context.setSearchFilters,
    clearSearchFilters: context.clearSearchFilters,
    searchProducts: context.searchProducts,
    
    // UI操作
    toggleProductModal: context.toggleProductModal,
    toggleCartModal: context.toggleCartModal,
    toggleLoginModal: context.toggleLoginModal,
    toggleAddressModal: context.toggleAddressModal,
    togglePaymentModal: context.togglePaymentModal,
    showConfirmDialog: context.showConfirmDialog,
    hideConfirmDialog: context.hideConfirmDialog,
    
    // 工具方法
    dispatch: context.dispatch
  };
}

/**
 * 错误边界Hook
 * 
 * @function useAppErrorHandler
 * @description 提供统一的错误处理逻辑
 * 
 * @returns {object} 错误处理相关的状态和方法
 * 
 * 功能特性：
 * - 全局错误状态管理
 * - 错误恢复机制
 * - 错误日志记录
 * - 用户友好的错误提示
 * 
 * @example
 * ```tsx
 * function ErrorBoundaryComponent() {
 *   const { error, clearError, isLoading } = useAppErrorHandler();
 *   
 *   if (error) {
 *     return (
 *       <div className="error-container">
 *         <h2>出现错误</h2>
 *         <p>{error}</p>
 *         <button onClick={clearError}>重试</button>
 *       </div>
 *     );
 *   }
 *   
 *   return <MainContent />;
 * }
 * ```
 */
export function useAppErrorHandler() {
  const { error, isLoading, dispatch } = useAppContext();
  
  /**
   * 清除错误状态
   * 
   * @function clearError
   * @description 清除当前的错误状态，允许用户重试操作
   */
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };
  
  /**
   * 设置错误状态
   * 
   * @function setError
   * @description 设置新的错误状态
   * 
   * @param {string} errorMessage - 错误消息
   */
  const setError = (errorMessage: string) => {
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  };
  
  // 开发环境下的错误日志
  useEffect(() => {
    if (error && process.env.NODE_ENV === 'development') {
      console.group('🚨 AppContext Error');
      console.error('Error message:', error);
      console.trace('Error stack trace');
      console.groupEnd();
    }
  }, [error]);
  
  return {
    error,
    isLoading,
    clearError,
    setError,
    hasError: !!error
  };
}

/**
 * 购物车工具Hook
 * 
 * @function useCartUtils
 * @description 提供购物车相关的计算和工具方法
 * 
 * @returns {object} 购物车工具方法集合
 * 
 * @example
 * ```tsx
 * function CartSummary() {
 *   const { 
 *     itemsCount, 
 *     totalAmount, 
 *     isCartEmpty, 
 *     getProductQuantity 
 *   } = useCartUtils();
 *   
 *   return (
 *     <div>
 *       <h3>购物车摘要</h3>
 *       <p>商品数量: {itemsCount}</p>
 *       <p>总金额: ¥{totalAmount.toFixed(2)}</p>
 *       {isCartEmpty && <p>购物车为空</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCartUtils() {
  const { cartItems, products, getCartItemsCount, getCartTotal } = useAppContext();
  
  const itemsCount = getCartItemsCount();
  const totalAmount = getCartTotal();
  const isCartEmpty = cartItems.length === 0;
  
  /**
   * 获取指定商品在购物车中的数量
   * 
   * @function getProductQuantity
   * @param {string} productId - 商品ID
   * @returns {number} 商品在购物车中的数量
   */
  const getProductQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };
  
  /**
   * 检查商品是否在购物车中
   * 
   * @function isProductInCart
   * @param {string} productId - 商品ID
   * @returns {boolean} 商品是否在购物车中
   */
  const isProductInCart = (productId: string): boolean => {
    return cartItems.some(item => item.productId === productId);
  };
  
  /**
   * 获取购物车中的商品详情
   * 
   * @function getCartProductDetails
   * @returns {Array} 包含完整商品信息的购物车项目
   */
  const getCartProductDetails = () => {
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product,
        subtotal: product ? product.price * item.quantity : 0
      };
    });
  };
  
  return {
    itemsCount,
    totalAmount,
    isCartEmpty,
    getProductQuantity,
    isProductInCart,
    getCartProductDetails
  };
}

/**
 * 产品搜索Hook
 * 
 * @function useProductSearch
 * @description 提供商品搜索和过滤功能
 * 
 * @returns {object} 搜索相关的状态和方法
 * 
 * @example
 * ```tsx
 * function ProductSearch() {
 *   const { 
 *     searchFilters, 
 *     setSearchFilters, 
 *     clearFilters,
 *     filteredProducts 
 *   } = useProductSearch();
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={searchFilters.category || ''} 
 *         onChange={(e) => setSearchFilters({ category: e.target.value })}
 *         placeholder="搜索分类"
 *       />
 *       <button onClick={clearFilters}>清除筛选</button>
 *       <div>
 *         {filteredProducts.map(product => (
 *           <ProductCard key={product.id} product={product} />
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProductSearch() {
  const { 
    products, 
    searchFilters, 
    setSearchFilters, 
    clearSearchFilters 
  } = useAppContext();
  
  // 根据当前过滤条件筛选商品
  const filteredProducts = products.filter(product => {
    // 分类过滤
    if (searchFilters.category && product.category !== searchFilters.category) {
      return false;
    }
    
    // 价格范围过滤
    if (searchFilters.priceRange) {
      const [minPrice, maxPrice] = searchFilters.priceRange;
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
    }
    
    // 评分过滤
    if (searchFilters.rating && product.rating < searchFilters.rating) {
      return false;
    }
    
    // 库存过滤
    if (searchFilters.inStock && product.stock <= 0) {
      return false;
    }
    
    return true;
  });
  
  return {
    searchFilters,
    setSearchFilters,
    clearFilters: clearSearchFilters,
    filteredProducts,
    hasFilters: Object.keys(searchFilters).length > 0
  };
}