import React, { useState, useMemo, useCallback } from 'react';
import './VirtualScroll.css';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  image: string;
}

const ITEM_HEIGHT = 120;
const CONTAINER_HEIGHT = 500;
const VISIBLE_ITEMS = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + 2;

const VirtualScroll: React.FC = () => {
  // 生成大量测试数据
  const generateProducts = useCallback((count: number): Product[] => {
    const categories = ['手机', '电脑', '平板', '耳机', '手表', '配件', '相机', '音响'];
    const brands = ['Apple', '华为', '小米', '三星', '索尼', '戴尔', '联想', '华硕'];
    const products: Product[] = [];
    
    for (let i = 0; i < count; i++) {
      const category = categories[i % categories.length];
      const brand = brands[i % brands.length];
      products.push({
        id: i + 1,
        name: `${brand} ${category} ${Math.floor(i / 8) + 1}代`,
        price: Math.floor(Math.random() * 20000) + 1000,
        category,
        description: `这是一款优质的${category}产品，采用最新技术制造，性能卓越，值得信赖。`,
        stock: Math.floor(Math.random() * 200) + 10,
        image: `https://picsum.photos/60/60?random=${i}`,
      });
    }
    return products;
  }, []);

  const [products] = useState<Product[]>(() => generateProducts(10000));
  const [scrollTop, setScrollTop] = useState(0);
  const [filter, setFilter] = useState('');

  // 过滤产品
  const filteredProducts = useMemo(() => {
    if (!filter) return products;
    return products.filter(product => 
      product.name.toLowerCase().includes(filter.toLowerCase()) ||
      product.category.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  // 计算可见项目
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    const endIndex = Math.min(startIndex + VISIBLE_ITEMS, filteredProducts.length);
    
    return {
      startIndex,
      endIndex,
      items: filteredProducts.slice(startIndex, endIndex),
      totalHeight: filteredProducts.length * ITEM_HEIGHT,
      offsetY: startIndex * ITEM_HEIGHT,
    };
  }, [filteredProducts, scrollTop]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const ProductItem: React.FC<{ product: Product; index: number }> = ({ product, index }) => (
    <div 
      className="virtual-product-item"
      style={{
        height: ITEM_HEIGHT,
        transform: `translateY(${index * ITEM_HEIGHT}px)`,
      }}
    >
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-content">
        <h3>{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          <span className="price">¥{product.price.toLocaleString()}</span>
          <span className="category">{product.category}</span>
          <span className="stock">库存: {product.stock}</span>
        </div>
      </div>
      <div className="product-actions">
        <button className="btn-view">查看</button>
        <button className="btn-edit">编辑</button>
      </div>
    </div>
  );

  return (
    <div className="virtual-scroll-container">
      <h2>虚拟滚动商品列表</h2>
      <p className="description">
        高性能展示大量商品数据（{filteredProducts.length.toLocaleString()} 条记录），只渲染可见区域
      </p>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="搜索商品名称或分类..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <div className="search-stats">
          找到 {filteredProducts.length.toLocaleString()} 个商品
        </div>
      </div>

      <div 
        className="virtual-list-container"
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={handleScroll}
      >
        <div 
          className="virtual-list-spacer"
          style={{ height: visibleItems.totalHeight }}
        >
          <div 
            className="virtual-list-content"
            style={{ transform: `translateY(${visibleItems.offsetY}px)` }}
          >
            {visibleItems.items.map((product, index) => (
              <ProductItem 
                key={product.id} 
                product={product} 
                index={visibleItems.startIndex + index}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="virtual-scroll-info">
        <div className="info-item">
          <label>滚动位置:</label>
          <span>{scrollTop}px</span>
        </div>
        <div className="info-item">
          <label>可见范围:</label>
          <span>{visibleItems.startIndex} - {visibleItems.endIndex}</span>
        </div>
        <div className="info-item">
          <label>渲染项目:</label>
          <span>{visibleItems.items.length} / {filteredProducts.length}</span>
        </div>
      </div>
    </div>
  );
};

export default VirtualScroll;