import React, { useState, useEffect, useCallback, useRef } from 'react';
import './InfiniteScroll.css';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
  rating: number;
}

const InfiniteScroll: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  // 模拟API调用
  const fetchProducts = useCallback(async (pageNum: number): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    
    if (pageNum > 20) { // 模拟数据结束
      return [];
    }
    
    const pageSize = 10;
    const startId = (pageNum - 1) * pageSize;
    const categories = ['智能手机', '笔记本电脑', '平板电脑', '无线耳机', '智能手表', '数码配件', '相机设备', '音响设备'];
    const brands = ['Apple', '华为', '小米', '三星', '索尼', '戴尔', '联想', '华硕', 'OPPO', 'vivo'];
    
    const newProducts: Product[] = [];
    for (let i = 0; i < pageSize; i++) {
      const id = startId + i + 1;
      const category = categories[id % categories.length];
      const brand = brands[id % brands.length];
      
      newProducts.push({
        id,
        name: `${brand} ${category} Pro Max ${Math.floor(id / 10) + 1}`,
        price: Math.floor(Math.random() * 15000) + 2000,
        category,
        description: `这是一款革命性的${category}，集成了最新的技术创新，为用户带来前所未有的体验。采用顶级材料制造，性能卓越，设计精美。`,
        stock: Math.floor(Math.random() * 100) + 50,
        image: `https://picsum.photos/300/200?random=${id}`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      });
    }
    
    return newProducts;
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProducts = await fetchProducts(page);
      
      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchProducts]);

  // 初始加载
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 设置 Intersection Observer
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

  const refreshData = () => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="product-card">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-rating">
          <span className="rating-star">⭐</span>
          <span className="rating-value">{product.rating}</span>
        </div>
      </div>
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-details">
          <div className="price-info">
            <span className="price">¥{product.price.toLocaleString()}</span>
            <span className="old-price">¥{(product.price * 1.2).toLocaleString()}</span>
          </div>
          <div className="product-badge">
            <span className="category-badge">{product.category}</span>
            <span className="stock-badge">库存 {product.stock}</span>
          </div>
        </div>
        <div className="product-actions">
          <button className="btn-cart">加入购物车</button>
          <button className="btn-buy">立即购买</button>
          <button className="btn-favorite">❤️</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="infinite-scroll-container">
      <div className="header-section">
        <h2>无限滚动商品展示</h2>
        <p className="description">
          滚动到底部自动加载更多商品，已加载 {products.length} 个商品
        </p>
        <button onClick={refreshData} className="refresh-btn">
          🔄 刷新数据
        </button>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 加载状态指示器 */}
      <div ref={loadingRef} className="loading-container">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>正在加载更多商品...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadMore} className="retry-btn">重试</button>
          </div>
        )}
        
        {!hasMore && products.length > 0 && (
          <div className="end-message">
            <p>🎉 已加载全部商品！</p>
            <p>共 {products.length} 个商品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfiniteScroll;