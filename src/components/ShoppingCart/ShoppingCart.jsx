import React from 'react';
import { useCartStore } from '../../store/cartStore.js';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon } from 'lucide-react';

const ShoppingCart = ({ className = '' }) => {
  const {
    items,
    isVisible,
    totalAmount,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCartVisibility,
    hideCart,
    calculateTotals
  } = useCartStore();

  // 组件挂载时计算总计
  React.useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId, item.selectedVariant);
    } else {
      updateQuantity(item.productId, newQuantity, item.selectedVariant);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  const getItemPrice = (item) => {
    return item.selectedVariant?.price || item.product.price;
  };

  const getItemDisplayName = (item) => {
    const baseName = item.product.name;
    if (item.selectedVariant) {
      return `${baseName} - ${item.selectedVariant.name}`;
    }
    return baseName;
  };

  if (!isVisible) {
    return (
      <button
        onClick={toggleCartVisibility}
        className={`fixed top-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors ${className}`}
      >
        <ShoppingCartIcon size={24} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={hideCart}
      />
      
      {/* 购物车侧边栏 */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCartIcon size={20} />
            购物车 ({totalItems})
          </h2>
          <button
            onClick={hideCart}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon size={20} />
          </button>
        </div>

        {/* 购物车内容 */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCartIcon size={64} className="mb-4 opacity-30" />
              <p className="text-lg">购物车空空如也</p>
              <p className="text-sm">快去挑选心仪的商品吧！</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${JSON.stringify(item.selectedVariant)}`} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  {/* 商品图片 */}
                  <img
                    src={item.product.images?.[0] || '/placeholder-image.jpg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  
                  {/* 商品信息 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {getItemDisplayName(item)}
                    </h3>
                    <p className="text-blue-600 font-semibold">
                      {formatPrice(getItemPrice(item))}
                    </p>
                    
                    {/* 数量控制 */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MinusIcon size={16} />
                      </button>
                      <span className="min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <PlusIcon size={16} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId, item.selectedVariant)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            {/* 总计 */}
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>总计:</span>
              <span className="text-blue-600">{formatPrice(totalAmount)}</span>
            </div>
            
            {/* 操作按钮 */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // 这里应该跳转到结算页面
                  console.log('跳转到结算页面');
                  hideCart();
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                去结算
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                清空购物车
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;