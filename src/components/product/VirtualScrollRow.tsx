import React from 'react';
import { Image, Tag, Button, Space, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { Product } from '../../types';
import { PRODUCT_STATUS_OPTIONS } from '../../constants';

interface VirtualScrollRowProps {
  product: Product;
  columns: ColumnsType<Product>;
  style: React.CSSProperties;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
}

const VirtualScrollRow: React.FC<VirtualScrollRowProps> = ({
  product,
  columns,
  style,
  isSelected,
  onSelect,
  onClick,
  className = '',
}) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(e.target.checked);
  };

  const handleButtonClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    // 在实际应用中，这里会触发相应的操作
    console.log(`${action} product:`, product.id);
  };

  const renderCellContent = (column: any, product: Product) => {
    const { dataIndex, key, render } = column;
    
    if (render && typeof render === 'function') {
      return render(product[dataIndex as keyof Product], product, 0);
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
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+2gv..."
          />
        );
      case 'name':
        return (
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>
              {product.name}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              SKU: {product.sku}
            </div>
          </div>
        );
      case 'price':
        return (
          <div>
            <div style={{ color: '#f5222d', fontWeight: 500, fontSize: 14 }}>
              ¥{product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div style={{ 
                fontSize: 12, 
                color: '#999', 
                textDecoration: 'line-through' 
              }}>
                ¥{product.originalPrice.toFixed(2)}
              </div>
            )}
          </div>
        );
      case 'category':
        return <Tag color="blue">{product.category}</Tag>;
      case 'tags':
        return (
          <div>
            {product.tags.slice(0, 2).map(tag => (
              <Tag key={tag} size="small" style={{ marginBottom: 2 }}>
                {tag}
              </Tag>
            ))}
            {product.tags.length > 2 && (
              <Tag size="small" style={{ marginBottom: 2 }}>
                +{product.tags.length - 2}
              </Tag>
            )}
          </div>
        );
      case 'stock':
        return (
          <span style={{ 
            color: product.stock < 10 ? '#f5222d' : product.stock < 50 ? '#fa8c16' : '#52c41a',
            fontWeight: 500,
          }}>
            {product.stock}
          </span>
        );
      case 'status':
        const statusConfig = PRODUCT_STATUS_OPTIONS.find(s => s.value === product.status);
        return (
          <Tag color={statusConfig?.color}>
            {statusConfig?.label}
          </Tag>
        );
      case 'actions':
        return (
          <Space size="small">
            <Tooltip title="预览">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => handleButtonClick(e, 'preview')}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => handleButtonClick(e, 'edit')}
              />
            </Tooltip>
            <Tooltip title="二维码">
              <Button
                type="text"
                size="small"
                icon={<QrcodeOutlined />}
                onClick={(e) => handleButtonClick(e, 'qrcode')}
              />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => handleButtonClick(e, 'delete')}
              />
            </Tooltip>
          </Space>
        );
      default:
        return product[dataIndex as keyof Product];
    }
  };

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid #f0f0f0',
        background: isSelected ? '#e6f7ff' : '#fff',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
      }}
      className={`virtual-scroll-row ${className} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = '#fff';
        }
      }}
    >
      {/* 选择框列 */}
      <div style={{ width: 50, flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleCheckboxChange}
        />
      </div>
      
      {/* 数据列 */}
      {columns.map((column, index) => (
        <div
          key={column.key || index}
          style={{
            width: column.width || 100,
            flexShrink: 0,
            padding: '0 8px',
            textAlign: column.align || 'start',
            overflow: 'hidden',
          }}
        >
          {renderCellContent(column, product)}
        </div>
      ))}
    </div>
  );
};

export default VirtualScrollRow;