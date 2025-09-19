import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface InfiniteScrollContainerProps {
  children: React.ReactNode;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

const InfiniteScrollContainer: React.FC<InfiniteScrollContainerProps> = ({
  children,
  hasMore,
  loadMore,
  loading = false,
  error = null,
  threshold = 100,
  className = '',
  style,
  emptyComponent,
  loadingComponent,
  errorComponent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const lastLoadTimeRef = useRef<number>(0);
  const loadingDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 防抖加载函数
  const debouncedLoadMore = useCallback(async () => {
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1000) { // 1秒内只允许一次加载
      return;
    }

    if (loadingDebounceRef.current) {
      clearTimeout(loadingDebounceRef.current);
    }

    loadingDebounceRef.current = setTimeout(async () => {
      if (!isLoadingMore && hasMore && !loading && !error) {
        setIsLoadingMore(true);
        lastLoadTimeRef.current = now;
        
        try {
          await loadMore();
        } catch (err) {
          console.error('Load more failed:', err);
        } finally {
          setIsLoadingMore(false);
        }
      }
    }, 200);
  }, [hasMore, loadMore, loading, error, isLoadingMore]);

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom <= threshold) {
      debouncedLoadMore();
    }
  }, [threshold, debouncedLoadMore]);

  // 添加滚动监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // 初始检查是否需要加载
    const checkInitialLoad = () => {
      if (container.scrollHeight <= container.clientHeight && hasMore && !loading && !error) {
        debouncedLoadMore();
      }
    };
    
    // 延迟检查，确保内容已渲染
    setTimeout(checkInitialLoad, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (loadingDebounceRef.current) {
        clearTimeout(loadingDebounceRef.current);
      }
    };
  }, [handleScroll, hasMore, loading, error, debouncedLoadMore]);

  // 重试加载
  const handleRetry = () => {
    debouncedLoadMore();
  };

  // 渲染加载指示器
  const renderLoadingIndicator = () => {
    if (loadingComponent) {
      return loadingComponent;
    }

    return (
      <div className="infinite-scroll-loading" style={{ textAlign: 'center', padding: '20px 0' }}>
        <Spin size="small" />
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          加载更多数据中...
        </div>
      </div>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    if (errorComponent) {
      return errorComponent;
    }

    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={handleRetry}>
              重试
            </Button>
          }
        />
      </div>
    );
  };

  // 渲染底部状态
  const renderFooter = () => {
    if (error) {
      return renderError();
    }

    if (isLoadingMore || loading) {
      return renderLoadingIndicator();
    }

    if (!hasMore) {
      return (
        <div
          style={{
            textAlign: 'center',
            padding: '20px 0',
            color: '#999',
            fontSize: 12,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          已加载全部数据
        </div>
      );
    }

    return null;
  };

  // 如果没有数据且不在加载中，显示空状态
  const isEmpty = React.Children.count(children) === 0;
  if (isEmpty && !loading && !error) {
    return (
      <div
        className={`infinite-scroll-container ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          color: '#999',
          ...style,
        }}
      >
        {emptyComponent || '暂无数据'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`infinite-scroll-container ${className}`}
      style={{
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
    >
      {children}
      {renderFooter()}
    </div>
  );
};

export default InfiniteScrollContainer;