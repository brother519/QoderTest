import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// 懒加载页面组件
const ProductHomePage = lazy(() => import('@/features/product/pages/ProductHomePage'));
const TaskManagementPage = lazy(() => import('@/features/task/pages/TaskManagementPage'));

// 加载指示器组件
const LoadingFallback: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
  >
    <CircularProgress />
  </Box>
);

// 主路由配置
export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 默认重定向到产品页面 */}
        <Route path="/" element={<Navigate to="/products" replace />} />
        
        {/* 产品模块路由 */}
        <Route path="/products/*" element={<ProductHomePage />} />
        
        {/* 任务管理模块路由 */}
        <Route path="/tasks/*" element={<TaskManagementPage />} />
        
        {/* 404 页面 */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </Suspense>
  );
};