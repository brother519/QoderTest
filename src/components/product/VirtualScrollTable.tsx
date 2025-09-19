import React, { useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Product } from '../../types';
import { VIRTUAL_SCROLL_CONFIG } from '../../constants';
import VirtualScrollRow from './VirtualScrollRow';

interface VirtualScrollTableProps {
  products: Product[];
  columns: ColumnsType<Product>;
  loading?: boolean;
  height?: number;
  itemHeight?: number;
  onRowClick?: (product: Product) => void;
  onRowSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  className?: string;
}

const VirtualScrollTable: React.FC<VirtualScrollTableProps> = ({
  products,
  columns,
  loading = false,
  height = VIRTUAL_SCROLL_CONFIG.CONTAINER_HEIGHT,
  itemHeight = VIRTUAL_SCROLL_CONFIG.ITEM_HEIGHT,
  onRowClick,
  onRowSelect,
  selectedIds = [],
  className = '',
}) => {
  // 计算表格总宽度
  const totalWidth = useMemo(() => {
    return columns.reduce((total, column) => {
      return total + (column.width as number || 100);
    }, 0);
  }, [columns]);

  // 处理行选择
  const handleRowSelect = useCallback((productId: string, selected: boolean) => {
    if (!onRowSelect) return;
    
    const newSelectedIds = selected
      ? [...selectedIds, productId]
      : selectedIds.filter(id => id !== productId);
    
    onRowSelect(newSelectedIds);
  }, [selectedIds, onRowSelect]);

  // 处理全选
  const handleSelectAll = useCallback((selected: boolean) => {
    if (!onRowSelect) return;
    
    const newSelectedIds = selected ? products.map(p => p.id) : [];
    onRowSelect(newSelectedIds);
  }, [products, onRowSelect]);

  // 渲染行组件
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const product = products[index];
    const isSelected = selectedIds.includes(product.id);
    
    return (
      <VirtualScrollRow
        key={product.id}
        style={style}
        product={product}
        columns={columns}
        isSelected={isSelected}
        onSelect={(selected) => handleRowSelect(product.id, selected)}
        onClick={() => onRowClick?.(product)}
        className={index % 2 === 0 ? 'even-row' : 'odd-row'}
      />
    );
  }, [products, columns, selectedIds, handleRowSelect, onRowClick]);

  // 渲染表头
  const renderHeader = () => {
    const isAllSelected = products.length > 0 && selectedIds.length === products.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

    return (
      <div
        className="virtual-table-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 48,
          background: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 16px',
          fontWeight: 500,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        {onRowSelect && (
          <div style={{ width: 50, flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={e => handleSelectAll(e.target.checked)}
            />
          </div>
        )}
        {columns.map((column, index) => (
          <div
            key={column.key || index}
            style={{
              width: column.width || 100,
              flexShrink: 0,
              padding: '0 8px',
              textAlign: column.align || 'start',
            }}
          >
            {column.title}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        className="virtual-table-empty"
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: 6,
          color: '#999',
        }}
      >
        暂无数据
      </div>
    );
  }

  return (
    <div
      className={`virtual-scroll-table ${className}`}
      style={{
        height,
        border: '1px solid #f0f0f0',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {renderHeader()}
      <List
        height={height - 48} // 减去表头高度
        itemCount={products.length}
        itemSize={itemHeight}
        width="100%"
        className="virtual-scroll-list"
        style={{
          scrollbarWidth: 'thin',
        }}
      >
        {Row}
      </List>
      
      {/* 显示总数信息 */}
      <div
        className="virtual-table-footer"
        style={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
          fontSize: 12,
          color: '#666',
        }}
      >
        <span>
          共 {products.length} 条记录
          {selectedIds.length > 0 && ` (已选择 ${selectedIds.length} 条)`}
        </span>
        <span>使用虚拟滚动优化大数据渲染</span>
      </div>
    </div>
  );
};

export default VirtualScrollTable;