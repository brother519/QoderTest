import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';

interface SortableRowProps {
  children: React.ReactNode;
  'data-row-key': string;
  className?: string;
  style?: React.CSSProperties;
}

const SortableRow: React.FC<SortableRowProps> = ({
  children,
  'data-row-key': dataRowKey,
  className = '',
  style,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dataRowKey,
  });

  const rowStyle: React.CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? {
      position: 'relative',
      zIndex: 999,
      opacity: 0.8,
      backgroundColor: '#e6f7ff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    } : {}),
  };

  const rowClassName = `${className} ${isDragging ? 'dragging' : ''}`;

  return (
    <tr
      ref={setNodeRef}
      style={rowStyle}
      className={rowClassName}
      {...props}
      {...attributes}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          // 为第一个单元格（通常是拖拽手柄列）添加拖拽监听器
          if (index === 0) {
            return React.cloneElement(child, {
              children: (
                <div
                  {...listeners}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                  }}
                >
                  <HolderOutlined className="drag-handle" />
                </div>
              ),
            });
          }
          return child;
        }
        return child;
      })}
    </tr>
  );
};

export default SortableRow;