import React from 'react';
import { Image, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Product } from '../../types';
import { PRODUCT_STATUS_OPTIONS } from '../../constants';

interface DragPreviewRowProps {
  product: Product;
  columns: ColumnsType<Product>;
  index: number;
}

const DragPreviewRow: React.FC<DragPreviewRowProps> = ({ 
  product, 
  columns, 
  index 
}) => {
  const renderCellContent = (column: any, product: Product) => {
    const { dataIndex, key, render } = column;
    
    if (render && typeof render === 'function') {
      return render(product[dataIndex as keyof Product], product, index);
    }
    
    // 根据列的key渲染不同内容
    switch (key) {
      case 'images':
        return (
          <Image
            src={product.images[0]}
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            preview={false}
          />
        );
      case 'name':
        return (
          <div>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{product.name}</div>
            <div style={{ fontSize: 10, color: '#999' }}>SKU: {product.sku}</div>
          </div>
        );
      case 'price':
        return (
          <div style={{ color: '#f5222d', fontWeight: 500, fontSize: 12 }}>
            ¥{product.price.toFixed(2)}
          </div>
        );
      case 'category':
        return <Tag color="blue" size="small">{product.category}</Tag>;
      case 'tags':
        return (
          <div>
            {product.tags.slice(0, 2).map(tag => (
              <Tag key={tag} size="small" style={{ fontSize: 10 }}>
                {tag}
              </Tag>
            ))}
          </div>
        );
      case 'stock':
        return (
          <span style={{ 
            color: product.stock < 10 ? '#f5222d' : '#52c41a',
            fontSize: 12,
          }}>
            {product.stock}
          </span>
        );
      case 'status':
        const statusConfig = PRODUCT_STATUS_OPTIONS.find(s => s.value === product.status);
        return (
          <Tag color={statusConfig?.color} size="small">
            {statusConfig?.label}
          </Tag>
        );
      default:
        return product[dataIndex as keyof Product];
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #d9d9d9',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: 0.9,
        minWidth: 600,
        gap: 12,
      }}
    >
      {/* 拖拽手柄 */}
      <div style={{ width: 20, textAlign: 'center' }}>
        <div
          style={{
            width: 8,
            height: 2,
            backgroundColor: '#999',
            margin: '2px 0',
            borderRadius: 1,
          }}
        />
        <div
          style={{
            width: 8,
            height: 2,
            backgroundColor: '#999',
            margin: '2px 0',
            borderRadius: 1,
          }}
        />
        <div
          style={{
            width: 8,
            height: 2,
            backgroundColor: '#999',
            margin: '2px 0',
            borderRadius: 1,
          }}
        />
      </div>
      
      {/* 商品图片 */}
      <div style={{ flexShrink: 0 }}>
        {renderCellContent({ key: 'images' }, product)}
      </div>
      
      {/* 商品名称 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {renderCellContent({ key: 'name' }, product)}
      </div>
      
      {/* 价格 */}
      <div style={{ width: 80, textAlign: 'right' }}>
        {renderCellContent({ key: 'price' }, product)}
      </div>
      
      {/* 分类 */}
      <div style={{ width: 80 }}>
        {renderCellContent({ key: 'category' }, product)}
      </div>
      
      {/* 状态 */}
      <div style={{ width: 60 }}>
        {renderCellContent({ key: 'status' }, product)}
      </div>
    </div>
  );
};

export default DragPreviewRow;