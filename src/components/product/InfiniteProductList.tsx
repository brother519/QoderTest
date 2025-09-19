import React, { useState, useCallback } from 'react';
import { Card, Avatar, Tag, Space, Button, Tooltip, Divider } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { Product } from '../../types';
import { useAppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';
import InfiniteScrollContainer from '../common/InfiniteScrollContainer';
import { PRODUCT_STATUS_OPTIONS } from '../../constants';

interface InfiniteProductListProps {
  products: Product[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  onLoadMore: () => Promise<void>;
  onProductClick?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  onGenerateQR?: (product: Product) => void;
}

const InfiniteProductList: React.FC<InfiniteProductListProps> = ({
  products,
  hasMore,
  loading,
  error,
  onLoadMore,
  onProductClick,
  onProductEdit,
  onProductDelete,
  onGenerateQR,
}) => {
  const dispatch = useAppDispatch();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleAction = useCallback((action: string, product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    
    switch (action) {
      case 'edit':
        onProductEdit?.(product);
        break;
      case 'delete':
        onProductDelete?.(product);
        break;
      case 'preview':
        onProductClick?.(product);
        break;
      case 'qr':
        onGenerateQR?.(product);
        break;
      default:
        break;
    }
  }, [onProductEdit, onProductDelete, onProductClick, onGenerateQR]);

  const renderProductCard = (product: Product) => {
    const statusConfig = PRODUCT_STATUS_OPTIONS.find(s => s.value === product.status);
    const isHovered = hoveredId === product.id;

    return (
      <Card
        key={product.id}
        hoverable
        className="product-card"
        style={{
          marginBottom: 16,
          cursor: 'pointer',
          transition: 'all 0.2s',
          transform: isHovered ? 'translateY(-2px)' : 'none',
          boxShadow: isHovered 
            ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={() => setHoveredId(product.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => onProductClick?.(product)}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {/* 商品图片 */}
          <div style={{ flexShrink: 0 }}>
            <Avatar
              size={80}
              shape="square"
              src={product.images[0]}
              icon={<ShoppingOutlined />}
              style={{ borderRadius: 8 }}
            />
          </div>

          {/* 商品信息 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 16 }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: 16, 
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.name}
                </h4>
                
                <div style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
                  SKU: {product.sku} | 分类: {product.category}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <Space size="small" wrap>
                    {product.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} size="small" color="blue">
                        {tag}
                      </Tag>
                    ))}
                    {product.tags.length > 3 && (
                      <Tag size="small" color="default">
                        +{product.tags.length - 3}
                      </Tag>
                    )}
                  </Space>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <span style={{ color: '#f5222d', fontSize: 18, fontWeight: 500 }}>
                      ¥{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span style={{ 
                        marginLeft: 8, 
                        color: '#999', 
                        textDecoration: 'line-through',
                        fontSize: 12
                      }}>
                        ¥{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <Divider type="vertical" />
                  
                  <div>
                    <span style={{ color: '#666', fontSize: 12 }}>库存: </span>
                    <span style={{ 
                      color: product.stock < 10 ? '#f5222d' : 
                             product.stock < 50 ? '#fa8c16' : '#52c41a',
                      fontWeight: 500
                    }}>
                      {product.stock}
                    </span>
                  </div>
                  
                  <Divider type="vertical" />
                  
                  <Tag color={statusConfig?.color} size="small">
                    {statusConfig?.label}
                  </Tag>
                </div>
              </div>

              {/* 操作按钮 */}
              <div style={{ flexShrink: 0 }}>
                <Space direction="vertical" size="small">
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={(e) => handleAction('preview', product, e)}
                    />
                  </Tooltip>
                  <Tooltip title="编辑">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => handleAction('edit', product, e)}
                    />
                  </Tooltip>
                  <Tooltip title="二维码">
                    <Button
                      type="text"
                      size="small"
                      icon={<QrcodeOutlined />}
                      onClick={(e) => handleAction('qr', product, e)}
                    />
                  </Tooltip>
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleAction('delete', product, e)}
                    />
                  </Tooltip>
                </Space>
              </div>
            </div>

            {/* 商品描述 */}
            <div style={{ 
              marginTop: 12, 
              color: '#666', 
              fontSize: 12,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
              lineHeight: 1.5,
            }}>
              {product.description}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <InfiniteScrollContainer
      hasMore={hasMore}
      loadMore={onLoadMore}
      loading={loading}
      error={error}
      threshold={200}
      style={{ height: '100%', padding: '0 16px' }}
      emptyComponent={
        <div style={{ textAlign: 'center', padding: 40 }}>
          <ShoppingOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div style={{ color: '#999' }}>暂无商品数据</div>
        </div>
      }
    >
      {products.map(renderProductCard)}
    </InfiniteScrollContainer>
  );
};

export default InfiniteProductList;