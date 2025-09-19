import React, { useState } from 'react';
import './DragDropList.css';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

const DragDropList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'iPhone 15 Pro', price: 9999, category: '手机', stock: 50 },
    { id: '2', name: 'MacBook Pro', price: 19999, category: '电脑', stock: 30 },
    { id: '3', name: 'AirPods Pro', price: 1999, category: '耳机', stock: 100 },
    { id: '4', name: 'iPad Air', price: 4999, category: '平板', stock: 75 },
    { id: '5', name: 'Apple Watch', price: 2999, category: '手表', stock: 80 },
    { id: '6', name: 'Magic Mouse', price: 699, category: '配件', stock: 120 },
  ]);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverItem(id);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newProducts = [...products];
    const draggedIndex = newProducts.findIndex(p => p.id === draggedItem);
    const targetIndex = newProducts.findIndex(p => p.id === targetId);

    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, removed);

    setProducts(newProducts);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="drag-drop-container">
      <h2>商品拖拽排序</h2>
      <p className="description">
        通过拖拽来重新排列商品顺序，优化产品展示效果
      </p>
      
      <div className="products-list">
        {products.map((product) => (
          <div
            key={product.id}
            className={`product-item ${
              draggedItem === product.id ? 'dragging' : ''
            } ${dragOverItem === product.id ? 'drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, product.id)}
            onDragOver={(e) => handleDragOver(e, product.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, product.id)}
            onDragEnd={handleDragEnd}
          >
            <div className="drag-handle">⋮⋮</div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <div className="product-details">
                <span className="price">¥{product.price.toLocaleString()}</span>
                <span className="category">{product.category}</span>
                <span className="stock">库存: {product.stock}</span>
              </div>
            </div>
            <div className="product-actions">
              <button className="btn-edit">编辑</button>
              <button className="btn-delete">删除</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="drag-instructions">
        <p>💡 拖拽提示：点击并拖拽左侧的手柄图标来重新排序</p>
      </div>
    </div>
  );
};

export default DragDropList;