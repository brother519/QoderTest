import React, { useState } from 'react';
import { Table, Image, Tag, Button, Space, Tooltip, Switch } from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  QrcodeOutlined,
  CopyOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import { Product } from '../../types';
import { PRODUCT_STATUS_OPTIONS, TABLE_COLUMNS_CONFIG } from '../../constants';
import { useAppDispatch } from '../../store';
import { updateProduct, deleteProduct } from '../../store/slices/productsSlice';
import { openModal, addNotification } from '../../store/slices/uiSlice';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  pagination: any;
  enableDragSort?: boolean;
  enableVirtualScroll?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  selectedIds,
  onSelectionChange,
  pagination,
  enableDragSort = false,
  enableVirtualScroll = false,
}) => {
  const dispatch = useAppDispatch();
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // 行选择配置
  const rowSelection: TableRowSelection<Product> = {
    selectedRowKeys: selectedIds,
    onChange: (selectedRowKeys) => {
      onSelectionChange(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: Product) => ({
      disabled: record.status === 'draft', // 草稿状态不允许批量操作
    }),
  };

  // 状态切换处理
  const handleStatusToggle = async (product: Product, checked: boolean) => {
    try {
      const newStatus = checked ? 'active' : 'inactive';
      await dispatch(updateProduct({
        id: product.id,
        data: { status: newStatus }
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: `商品状态已更新为${checked ? '上架' : '下架'}`,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: '状态更新失败',
      }));
    }
  };

  // 编辑商品
  const handleEdit = (product: Product) => {
    // 设置编辑的商品数据到全局状态，然后打开模态框
    dispatch(openModal('productForm'));
  };

  // 删除商品
  const handleDelete = async (product: Product) => {
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: '商品删除成功',
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: '商品删除失败',
      }));
    }
  };

  // 预览商品
  const handlePreview = (product: Product) => {
    dispatch(openModal('preview'));
  };

  // 生成二维码
  const handleGenerateQR = (product: Product) => {
    dispatch(openModal('qrCode'));
  };

  // 复制商品链接
  const handleCopyLink = (product: Product) => {
    const link = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(link).then(() => {
      dispatch(addNotification({
        type: 'success',
        message: '商品链接已复制到剪贴板',
      }));
    });
  };

  // 表格列配置
  const columns: ColumnsType<Product> = [
    // 拖拽手柄列（可选）
    ...(enableDragSort ? [{
      key: 'dragHandle',
      width: TABLE_COLUMNS_CONFIG.DRAG_HANDLE.width,
      render: () => (
        <HolderOutlined className="drag-handle" />
      ),
    }] : []),
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: TABLE_COLUMNS_CONFIG.IMAGE.width,
      render: (images: string[]) => (
        <Image
          src={images[0]}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8G+2gv..."
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: TABLE_COLUMNS_CONFIG.NAME.width,
      ellipsis: TABLE_COLUMNS_CONFIG.NAME.ellipsis,
      render: (name: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>SKU: {record.sku}</div>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: TABLE_COLUMNS_CONFIG.PRICE.width,
      align: TABLE_COLUMNS_CONFIG.PRICE.align,
      render: (price: number, record: Product) => (
        <div>
          <div style={{ color: '#f5222d', fontWeight: 500 }}>
            ¥{price.toFixed(2)}
          </div>
          {record.originalPrice && record.originalPrice > price && (
            <div style={{ 
              fontSize: 12, 
              color: '#999', 
              textDecoration: 'line-through' 
            }}>
              ¥{record.originalPrice.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: TABLE_COLUMNS_CONFIG.CATEGORY.width,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div>
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small" style={{ marginBottom: 2 }}>
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag size="small" style={{ marginBottom: 2 }}>
              +{tags.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center',
      render: (stock: number) => (
        <span style={{ 
          color: stock < 10 ? '#f5222d' : stock < 50 ? '#fa8c16' : '#52c41a' 
        }}>
          {stock}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: TABLE_COLUMNS_CONFIG.STATUS.width,
      render: (status: Product['status'], record: Product) => {
        const statusConfig = PRODUCT_STATUS_OPTIONS.find(s => s.value === status);
        const isActive = status === 'active';
        
        return (
          <div>
            <Tag color={statusConfig?.color}>
              {statusConfig?.label}
            </Tag>
            {status !== 'draft' && (
              <div style={{ marginTop: 4 }}>
                <Switch
                  size="small"
                  checked={isActive}
                  onChange={(checked) => handleStatusToggle(record, checked)}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: TABLE_COLUMNS_CONFIG.ACTIONS.width,
      fixed: TABLE_COLUMNS_CONFIG.ACTIONS.fixed,
      render: (_, record: Product) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="生成二维码">
            <Button
              type="text"
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => handleGenerateQR(record)}
            />
          </Tooltip>
          <Tooltip title="复制链接">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopyLink(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table<Product>
      className="product-table"
      columns={columns}
      dataSource={products}
      rowKey="id"
      loading={loading}
      pagination={pagination}
      rowSelection={rowSelection}
      scroll={{ x: 1200, y: enableVirtualScroll ? 400 : undefined }}
      size="middle"
      onRow={(record) => ({
        onMouseEnter: () => setHoveredRowId(record.id),
        onMouseLeave: () => setHoveredRowId(null),
        className: hoveredRowId === record.id ? 'hovered-row' : '',
      })}
    />
  );
};

export default ProductTable;