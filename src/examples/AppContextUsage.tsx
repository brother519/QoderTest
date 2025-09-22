/**
 * @fileoverview AppContext 使用示例
 * 
 * 本文件展示了如何正确使用 AppContext 模块中的各种功能，
 * 包括状态管理、业务操作、错误处理和性能优化等最佳实践。
 * 
 * @author 系统开发团队
 * @version 1.0.0
 * @created 2025-09-22
 */

import React, { useEffect, useState } from 'react';
import { 
  AppProvider, 
  useAppContext, 
  useAppSelector, 
  useAppActions,
  useCartUtils,
  useProductSearch,
  useAppErrorHandler 
} from '../context';
import type { Product } from '../types';

/**
 * 应用根组件示例
 * 展示如何正确设置 AppProvider
 */
export function AppExample() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <main>
          <ProductSearchExample />
          <ProductListExample />
          <CartExample />
        </main>
        <ErrorBoundaryExample />
      </div>
    </AppProvider>
  );
}

/**
 * 头部组件示例
 * 展示如何使用 useAppSelector 优化性能
 */
function Header() {
  // 只选择需要的状态，避免不必要的重渲染
  const user = useAppSelector(state => state.user);
  const cartItemsCount = useCartUtils().itemsCount;
  
  // 只获取需要的操作方法
  const { toggleCartModal, toggleLoginModal } = useAppActions();

  return (
    <header className="app-header">
      <h1>商品销售系统</h1>
      <div className="header-actions">
        <button onClick={() => toggleCartModal()}>
          购物车 ({cartItemsCount})
        </button>
        {user ? (
          <span>欢迎, {user.username}</span>
        ) : (
          <button onClick={() => toggleLoginModal()}>
            登录
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * 商品搜索组件示例
 * 展示如何使用 useProductSearch Hook
 */
function ProductSearchExample() {
  const { 
    searchFilters, 
    setSearchFilters, 
    clearFilters,
    hasFilters 
  } = useProductSearch();

  return (
    <div className="product-search">
      <h2>商品搜索</h2>
      <div className="search-filters">
        <input
          type="text"
          placeholder="搜索分类"
          value={searchFilters.category || ''}
          onChange={(e) => setSearchFilters({ category: e.target.value })}
        />
        
        <div className="price-range">
          <label>价格范围:</label>
          <input
            type="number"
            placeholder="最低价格"
            onChange={(e) => {
              const minPrice = parseFloat(e.target.value) || 0;
              const maxPrice = searchFilters.priceRange?.[1] || 1000;
              setSearchFilters({ priceRange: [minPrice, maxPrice] });
            }}
          />
          <input
            type="number"
            placeholder="最高价格"
            onChange={(e) => {
              const maxPrice = parseFloat(e.target.value) || 1000;
              const minPrice = searchFilters.priceRange?.[0] || 0;
              setSearchFilters({ priceRange: [minPrice, maxPrice] });
            }}
          />
        </div>
        
        <label>
          <input
            type="checkbox"
            checked={searchFilters.inStock || false}
            onChange={(e) => setSearchFilters({ inStock: e.target.checked })}
          />
          只显示有库存商品
        </label>
        
        {hasFilters && (
          <button onClick={clearFilters}>
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 商品列表组件示例
 * 展示如何使用 useAppContext 进行完整的CRUD操作
 */
function ProductListExample() {
  const { 
    products, 
    isLoading, 
    error,
    loadProducts, 
    createProduct,
    updateProduct,
    deleteProduct,
    showConfirmDialog 
  } = useAppContext();

  const { filteredProducts } = useProductSearch();

  // 组件挂载时加载商品
  useEffect(() => {
    loadProducts().catch(console.error);
  }, [loadProducts]);

  const handleCreateProduct = async () => {
    try {
      await createProduct({
        name: '新商品',
        description: '新商品描述',
        price: 99.99,
        images: [],
        category: '默认分类',
        stock: 100,
        rating: 0,
        tags: []
      });
      alert('商品创建成功');
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这个商品吗？此操作不可恢复。',
      onConfirm: async () => {
        try {
          await deleteProduct(productId);
          alert('商品删除成功');
        } catch (error) {
          console.error('删除失败:', error);
        }
      },
      onCancel: () => console.log('取消删除')
    });
  };

  if (isLoading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>错误: {error}</p>
        <button onClick={() => loadProducts()}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="list-header">
        <h2>商品列表 ({filteredProducts.length} 个商品)</h2>
        <button onClick={handleCreateProduct}>
          添加商品
        </button>
      </div>
      
      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            onDelete={() => handleDeleteProduct(product.id)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 商品卡片组件示例
 * 展示如何在子组件中使用Context
 */
function ProductCard({ 
  product, 
  onDelete 
}: { 
  product: Product; 
  onDelete: () => void; 
}) {
  const { addToCart } = useAppActions();
  const { getProductQuantity } = useCartUtils();
  
  const quantityInCart = getProductQuantity(product.id);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity: 1,
      addedAt: new Date()
    });
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">¥{product.price.toFixed(2)}</p>
      <p className="stock">库存: {product.stock}</p>
      <p className="rating">评分: {product.rating}</p>
      
      {quantityInCart > 0 && (
        <p className="cart-quantity">
          购物车中: {quantityInCart} 件
        </p>
      )}
      
      <div className="card-actions">
        <button 
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? '缺货' : '加入购物车'}
        </button>
        <button onClick={onDelete} className="delete-btn">
          删除
        </button>
      </div>
    </div>
  );
}

/**
 * 购物车组件示例
 * 展示如何使用 useCartUtils Hook
 */
function CartExample() {
  const { 
    itemsCount, 
    totalAmount, 
    isCartEmpty,
    getCartProductDetails 
  } = useCartUtils();
  
  const { updateCartItem, removeFromCart, clearCart } = useAppActions();
  const cartDetails = getCartProductDetails();

  if (isCartEmpty) {
    return (
      <div className="cart-empty">
        <h2>购物车</h2>
        <p>购物车是空的</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>购物车 ({itemsCount} 件商品)</h2>
        <button onClick={clearCart} className="clear-cart">
          清空购物车
        </button>
      </div>
      
      <div className="cart-items">
        {cartDetails.map(({ productId, quantity, product, subtotal }) => (
          <div key={productId} className="cart-item">
            {product ? (
              <>
                <h4>{product.name}</h4>
                <p>单价: ¥{product.price.toFixed(2)}</p>
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateCartItem(productId, quantity - 1)}
                  >
                    -
                  </button>
                  <span>数量: {quantity}</span>
                  <button 
                    onClick={() => updateCartItem(productId, quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <p>小计: ¥{subtotal.toFixed(2)}</p>
                <button 
                  onClick={() => removeFromCart(productId)}
                  className="remove-btn"
                >
                  移除
                </button>
              </>
            ) : (
              <p>商品信息未找到</p>
            )}
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <h3>总计: ¥{totalAmount.toFixed(2)}</h3>
        <button className="checkout-btn">
          结算
        </button>
      </div>
    </div>
  );
}

/**
 * 错误边界组件示例
 * 展示如何使用 useAppErrorHandler Hook
 */
function ErrorBoundaryExample() {
  const { error, clearError, hasError } = useAppErrorHandler();

  if (!hasError) {
    return null;
  }

  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>出现错误</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={clearError}>
            清除错误
          </button>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 性能优化示例组件
 * 展示如何使用选择器避免不必要的重渲染
 */
function PerformanceOptimizedComponent() {
  // 只选择需要的特定状态
  const productCount = useAppSelector(state => state.products.length);
  const isLoading = useAppSelector(state => state.isLoading);
  
  // 使用计算属性避免重复计算
  const expensiveComputedValue = useAppSelector(state => {
    // 只有当products变化时才重新计算
    return state.products
      .filter(p => p.price > 100)
      .reduce((sum, p) => sum + p.price, 0);
  });

  return (
    <div className="performance-example">
      <h3>性能优化示例</h3>
      <p>商品总数: {productCount}</p>
      <p>高价商品总值: ¥{expensiveComputedValue.toFixed(2)}</p>
      {isLoading && <p>正在加载...</p>}
    </div>
  );
}

/**
 * 自定义Hook示例
 * 展示如何基于AppContext创建自定义Hook
 */
function useProductManager() {
  const { products, createProduct, updateProduct, deleteProduct } = useAppContext();
  const [isOperating, setIsOperating] = useState(false);

  const safeCreateProduct = async (productData: Omit<Product, 'id'>) => {
    setIsOperating(true);
    try {
      await createProduct(productData);
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '操作失败' 
      };
    } finally {
      setIsOperating(false);
    }
  };

  const safeUpdateProduct = async (product: Product) => {
    setIsOperating(true);
    try {
      await updateProduct(product);
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '操作失败' 
      };
    } finally {
      setIsOperating(false);
    }
  };

  const safeDeleteProduct = async (productId: string) => {
    setIsOperating(true);
    try {
      await deleteProduct(productId);
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '操作失败' 
      };
    } finally {
      setIsOperating(false);
    }
  };

  return {
    products,
    isOperating,
    safeCreateProduct,
    safeUpdateProduct,
    safeDeleteProduct
  };
}

/**
 * 自定义Hook使用示例
 */
function CustomHookExample() {
  const { products, isOperating, safeCreateProduct } = useProductManager();

  const handleCreate = async () => {
    const result = await safeCreateProduct({
      name: '测试商品',
      description: '测试描述',
      price: 99.99,
      images: [],
      category: '测试分类',
      stock: 10,
      rating: 0,
      tags: []
    });

    if (result.success) {
      alert('创建成功');
    } else {
      alert('创建失败: ' + result.error);
    }
  };

  return (
    <div className="custom-hook-example">
      <h3>自定义Hook示例</h3>
      <p>商品数量: {products.length}</p>
      <button 
        onClick={handleCreate} 
        disabled={isOperating}
      >
        {isOperating ? '创建中...' : '创建测试商品'}
      </button>
    </div>
  );
}

export default AppExample;