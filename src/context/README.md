# AppContext 全局状态管理模块

## 概述

AppContext 是一个基于 React Context API 和 useReducer 的全局状态管理解决方案，为商品销售系统提供统一的状态管理和业务操作方法。该模块采用了完整的 JSDoc 注释规范，提供了类型安全、高性能和易维护的状态管理功能。

## 主要特性

### 🏗️ 架构特点
- **基于 React Context API**: 原生的React状态管理方案
- **TypeScript支持**: 完整的类型定义和类型安全
- **模块化设计**: 清晰的文件结构和职责分离
- **性能优化**: 使用 useMemo 和 useCallback 优化性能
- **错误处理**: 完善的错误处理和恢复机制

### 📋 功能覆盖
- ✅ 商品数据管理 (CRUD操作)
- ✅ 购物车状态管理
- ✅ 用户认证状态
- ✅ 订单管理
- ✅ 地址管理
- ✅ 搜索和过滤
- ✅ UI状态管理 (模态框、加载状态等)
- ✅ 错误处理和日志记录

### 📝 注释规范
- 完整的文件级 JSDoc 注释
- 详细的函数和方法注释
- 类型定义的完整文档
- 使用示例和最佳实践
- 错误处理和异常情况说明

## 文件结构

```
src/context/
├── AppContext.tsx        # 核心Context定义、状态接口、Reducer
├── AppProvider.tsx       # Provider组件和业务方法实现
├── useAppContext.tsx     # Hook定义和工具函数
├── index.ts             # 统一导出文件
└── ../examples/
    └── AppContextUsage.tsx # 使用示例
```

## 快速开始

### 1. 设置 AppProvider

```tsx
import React from 'react';
import { AppProvider } from '@/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
```

### 2. 在组件中使用状态

```tsx
import React, { useEffect } from 'react';
import { useAppContext } from '@/context';

function ProductList() {
  const { 
    products, 
    isLoading, 
    error,
    loadProducts 
  } = useAppContext();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 3. 使用性能优化的选择器

```tsx
import React from 'react';
import { useAppSelector, useCartUtils } from '@/context';

function CartSummary() {
  // 只选择需要的状态，避免不必要的重渲染
  const cartItemsCount = useAppSelector(state => 
    state.cartItems.reduce((count, item) => count + item.quantity, 0)
  );
  
  // 或者使用预定义的工具Hook
  const { itemsCount, totalAmount } = useCartUtils();

  return (
    <div>
      <span>商品数量: {itemsCount}</span>
      <span>总金额: ¥{totalAmount.toFixed(2)}</span>
    </div>
  );
}
```

## 核心API文档

### AppProvider

应用上下文提供者组件，为整个应用提供全局状态管理。

**属性:**
- `children: React.ReactNode` - 子组件
- `initialState?: Partial<AppState>` - 可选的初始状态，用于测试

**示例:**
```tsx
<AppProvider>
  <App />
</AppProvider>

// 带初始状态（用于测试）
<AppProvider initialState={{ user: mockUser }}>
  <TestApp />
</AppProvider>
```

### useAppContext()

主要的Context访问Hook，提供完整的状态和方法。

**返回值:** `AppContextType` - 包含所有状态和操作方法

**示例:**
```tsx
const { 
  products, 
  cartItems, 
  user,
  loadProducts,
  addToCart,
  login 
} = useAppContext();
```

### useAppSelector(selector)

性能优化的状态选择器Hook。

**参数:**
- `selector: (state: AppContextType) => T` - 状态选择函数

**返回值:** `T` - 选择的状态值

**示例:**
```tsx
const productCount = useAppSelector(state => state.products.length);
const cartTotal = useAppSelector(state => 
  state.cartItems.reduce((total, item) => {
    const product = state.products.find(p => p.id === item.productId);
    return total + (product ? product.price * item.quantity : 0);
  }, 0)
);
```

### useAppActions()

只返回操作方法的Hook，用于不需要状态的组件。

**返回值:** 包含所有操作方法的对象

**示例:**
```tsx
const { createProduct, deleteProduct, showConfirmDialog } = useAppActions();
```

### useCartUtils()

购物车相关的工具方法集合。

**返回值:**
- `itemsCount: number` - 购物车商品总数
- `totalAmount: number` - 购物车总金额
- `isCartEmpty: boolean` - 购物车是否为空
- `getProductQuantity: (productId: string) => number` - 获取商品数量
- `isProductInCart: (productId: string) => boolean` - 检查商品是否在购物车
- `getCartProductDetails: () => Array` - 获取购物车详情

### useProductSearch()

商品搜索和过滤功能。

**返回值:**
- `searchFilters: SearchFilters` - 当前过滤条件
- `setSearchFilters: (filters: Partial<SearchFilters>) => void` - 设置过滤条件
- `clearFilters: () => void` - 清除过滤条件
- `filteredProducts: Product[]` - 过滤后的商品列表
- `hasFilters: boolean` - 是否有活跃的过滤条件

### useAppErrorHandler()

错误处理相关的工具。

**返回值:**
- `error: string | null` - 当前错误信息
- `isLoading: boolean` - 加载状态
- `clearError: () => void` - 清除错误
- `setError: (error: string) => void` - 设置错误
- `hasError: boolean` - 是否有错误

## 状态结构

### AppState

```typescript
interface AppState {
  // 业务数据
  products: Product[];              // 商品列表
  selectedProduct: Product | null;  // 当前选中商品
  cartItems: CartItem[];           // 购物车项目
  user: User | null;               // 当前用户
  orders: Order[];                 // 订单列表
  addresses: Address[];            // 地址列表
  paymentMethods: PaymentMethod[]; // 支付方式
  searchFilters: SearchFilters;    // 搜索过滤条件
  
  // 全局状态
  isLoading: boolean;              // 加载状态
  error: string | null;            // 错误信息
  
  // UI状态
  ui: {
    isProductModalOpen: boolean;
    isCartModalOpen: boolean;
    isLoginModalOpen: boolean;
    isAddressModalOpen: boolean;
    isPaymentModalOpen: boolean;
    isConfirmDialogOpen: boolean;
    confirmDialog: ConfirmDialogConfig | null;
  };
}
```

## 操作方法

### 商品管理
- `loadProducts(): Promise<void>` - 加载商品列表
- `createProduct(product: Omit<Product, 'id'>): Promise<void>` - 创建商品
- `updateProduct(product: Product): Promise<void>` - 更新商品
- `deleteProduct(productId: string): Promise<void>` - 删除商品
- `setSelectedProduct(product: Product | null): void` - 设置选中商品

### 购物车管理
- `addToCart(item: CartItem): void` - 添加到购物车
- `updateCartItem(productId: string, quantity: number): void` - 更新数量
- `removeFromCart(productId: string): void` - 移除商品
- `clearCart(): void` - 清空购物车
- `getCartItemsCount(): number` - 获取商品总数
- `getCartTotal(): number` - 获取总金额

### 用户管理
- `login(credentials: LoginCredentials): Promise<void>` - 用户登录
- `logout(): void` - 用户登出
- `updateUserProfile(profile: Partial<User>): Promise<void>` - 更新资料

### UI状态管理
- `toggleProductModal(isOpen?: boolean): void` - 切换商品模态框
- `toggleCartModal(isOpen?: boolean): void` - 切换购物车模态框
- `showConfirmDialog(config: ConfirmDialogConfig): void` - 显示确认对话框
- `hideConfirmDialog(): void` - 隐藏确认对话框

## 最佳实践

### 1. 性能优化

**使用选择器避免不必要的重渲染:**
```tsx
// ✅ 好的做法 - 只选择需要的状态
const productCount = useAppSelector(state => state.products.length);

// ❌ 避免 - 选择整个状态对象
const state = useAppContext(); // 会导致所有状态变化时都重渲染
```

**使用专用Hook:**
```tsx
// ✅ 好的做法 - 使用专门的工具Hook
const { itemsCount, totalAmount } = useCartUtils();

// ❌ 避免 - 在组件中重复计算
const context = useAppContext();
const itemsCount = context.cartItems.reduce(...); // 每次渲染都计算
```

### 2. 错误处理

**使用统一的错误处理:**
```tsx
function ProductForm() {
  const { createProduct, error } = useAppContext();
  
  const handleSubmit = async (formData) => {
    try {
      await createProduct(formData);
      // 成功处理
    } catch (error) {
      // 错误已自动设置到Context状态中
      console.error('操作失败:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert message={error} />}
      {/* 表单内容 */}
    </form>
  );
}
```

### 3. 类型安全

**充分利用TypeScript类型:**
```tsx
import type { Product, AppContextType } from '@/context';

// ✅ 类型安全的选择器
const expensiveProducts = useAppSelector((state: AppContextType) => 
  state.products.filter((product: Product) => product.price > 100)
);
```

### 4. 测试友好

**为测试提供初始状态:**
```tsx
// 测试文件中
const TestWrapper = ({ children }) => (
  <AppProvider initialState={{
    products: mockProducts,
    user: mockUser
  }}>
    {children}
  </AppProvider>
);
```

## 常见问题

### Q: 如何在Provider外使用Context？
A: 这是不被允许的。`useAppContext` 会自动检测并抛出详细的错误信息，指导如何正确使用。

### Q: 如何优化大型列表的性能？
A: 使用 `useAppSelector` 选择特定的数据切片，避免不必要的重渲染。考虑实现虚拟滚动或分页。

### Q: 如何处理异步操作的错误？
A: 所有异步方法都有内置的错误处理，错误会自动设置到Context状态中。你也可以通过try-catch捕获特定的错误。

### Q: 如何扩展状态管理功能？
A: 可以通过修改 `AppState` 接口、添加新的Action类型和在reducer中处理新的业务逻辑来扩展功能。

## 开发和调试

### 开发模式功能
- 自动的Context使用检查
- 详细的错误信息和解决建议
- React DevTools支持
- useDebugValue集成

### 调试工具
在开发环境中，可以访问 `window.__APP_CONTEXT_DEBUG__` 获取调试信息。

## 版本信息

- **当前版本**: 1.0.0
- **最后更新**: 2025-09-22
- **兼容性**: React 18+, TypeScript 4.5+

## 贡献指南

如需修改或扩展此模块：

1. 保持JSDoc注释的完整性和准确性
2. 确保所有新功能都有相应的类型定义
3. 添加适当的错误处理
4. 更新相关的使用示例
5. 运行类型检查确保无编译错误

---

*这个模块基于设计文档要求创建，提供了完整的JSDoc注释和企业级的状态管理解决方案。*