import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Product } from '../../types';
import { useAppDispatch } from '../../store';
import { updateLocalOrder, reorderProducts } from '../../store/slices/productsSlice';
import { addNotification } from '../../store/slices/uiSlice';
import SortableRow from './SortableRow';
import DragPreviewRow from './DragPreviewRow';

interface DragDropTableProps {
  products: Product[];
  columns: ColumnsType<Product>;
  loading?: boolean;
  onProductsReorder?: (reorderedProducts: Product[]) => void;
  rowSelection?: any;
  pagination?: any;
}

const DragDropTable: React.FC<DragDropTableProps> = ({
  products,
  columns,
  loading = false,
  onProductsReorder,
  rowSelection,
  pagination,
}) => {
  const dispatch = useAppDispatch();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 拖拽开始事件
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // 找到被拖拽的商品
    const draggedItem = products.find(product => product.id === active.id);
    setDraggedProduct(draggedItem || null);
  };

  // 拖拽结束事件
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setDraggedProduct(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex(product => product.id === active.id);
    const newIndex = products.findIndex(product => product.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // 创建新的排序数组
    const reorderedProducts = arrayMove(products, oldIndex, newIndex);
    const productIds = reorderedProducts.map(product => product.id);

    try {
      // 乐观更新：立即更新本地状态
      dispatch(updateLocalOrder(productIds));
      
      // 调用回调函数
      onProductsReorder?.(reorderedProducts);

      // 发送到服务器
      await dispatch(reorderProducts(productIds)).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: '商品排序已更新',
      }));
    } catch (error) {
      // 排序失败，可能需要重新获取数据来恢复状态
      dispatch(addNotification({
        type: 'error',
        message: '排序更新失败，请稍后重试',
      }));
    }
  };

  // 获取拖拽项目的索引
  const getDraggedItemIndex = () => {
    if (!activeId) return -1;
    return products.findIndex(product => product.id === activeId);
  };

  // 创建自定义行组件
  const components = {
    body: {
      row: SortableRow,
    },
  };

  // 为表格数据添加索引
  const dataSourceWithIndex = products.map((product, index) => ({
    ...product,
    index,
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext 
        items={products.map(product => product.id)} 
        strategy={verticalListSortingStrategy}
      >
        <Table<Product & { index: number }>
          components={components}
          rowKey="id"
          dataSource={dataSourceWithIndex}
          columns={columns}
          loading={loading}
          rowSelection={rowSelection}
          pagination={pagination}
          className="drag-drop-table"
          onRow={(record) => ({
            'data-row-key': record.id,
          })}
        />
      </SortableContext>
      
      {/* 拖拽预览层 */}
      <DragOverlay>
        {activeId && draggedProduct ? (
          <DragPreviewRow 
            product={draggedProduct} 
            columns={columns}
            index={getDraggedItemIndex()}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DragDropTable;