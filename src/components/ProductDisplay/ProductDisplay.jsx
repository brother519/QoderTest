import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore.js';
import { useProductStore } from '../../store/productStore.js';
import { StarIcon, ShoppingCartIcon, HeartIcon, ShareIcon } from 'lucide-react';

const ProductDisplay = ({ productId, className = '' }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { getProductById } = useProductStore();
  const { addToCart, getCartItemCount } = useCartStore();
  
  const product = getProductById(productId);
  
  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">商品未找到</p>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock;
  const cartItemCount = getCartItemCount(product.id, selectedVariant);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    // 可以添加成功提示
    console.log('商品已添加到购物车');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} size={16} className="fill-yellow-400 text-yellow-400" />);
    }
    if (hasHalfStar) {
      stars.push(<StarIcon key="half" size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<StarIcon key={i} size={16} className="text-gray-300" />);
    }
    return stars;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="lg:flex">
        {/* 图片区域 */}
        <div className="lg:w-1/2">
          {/* 主图片 */}
          <div className="aspect-square bg-gray-100">
            <img
              src={product.images[selectedImageIndex] || '/placeholder-image.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* 缩略图 */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImageIndex === index 
                      ? 'border-blue-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品信息区域 */}
        <div className="lg:w-1/2 p-6">
          {/* 商品标题和标签 */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {renderStars(product.rating)}
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating} 分
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 价格 */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-red-600">
              {formatPrice(currentPrice)}
            </div>
            {selectedVariant && selectedVariant.price !== product.price && (
              <div className="text-lg text-gray-500 line-through">
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          {/* 商品描述 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">商品描述</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* 规格选择 */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">选择规格</h3>
              <div className="grid grid-cols-1 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={variant.stock === 0}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-blue-600 font-semibold">
                        {formatPrice(variant.price)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      库存: {variant.stock} 件
                      {variant.stock === 0 && <span className="text-red-500 ml-2">缺货</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 数量选择 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">数量</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-4 py-2 border border-gray-300 rounded bg-gray-50 min-w-[60px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={quantity >= currentStock}
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-2">
                库存: {currentStock} 件
              </span>
            </div>
          </div>

          {/* 购买按钮区域 */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                currentStock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCartIcon size={20} />
              {currentStock === 0 ? '暂时缺货' : '加入购物车'}
              {cartItemCount > 0 && (
                <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            <div className="flex gap-2">
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <HeartIcon size={18} />
                收藏
              </button>
              <button className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <ShareIcon size={18} />
                分享
              </button>
            </div>
          </div>

          {/* 商品信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">分类:</span>
                <span className="ml-2 text-gray-900">{product.category}</span>
              </div>
              <div>
                <span className="text-gray-500">库存:</span>
                <span className="ml-2 text-gray-900">{currentStock} 件</span>
              </div>
              <div>
                <span className="text-gray-500">评分:</span>
                <span className="ml-2 text-gray-900">{product.rating}/5.0</span>
              </div>
              <div>
                <span className="text-gray-500">商品ID:</span>
                <span className="ml-2 text-gray-900">{product.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;