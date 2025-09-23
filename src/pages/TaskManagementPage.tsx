/**
 * 任务管理系统 - 主页面组件
 * 
 * 该组件是任务管理系统的核心页面，整合了任务的展示、筛选、创建和管理功能。
 * 作为系统的主要用户界面，它协调多个子组件的协作，提供完整的任务管理体验。
 * 
 * 主要功能特性：
 * - 任务统计信息展示（总数、待办、进行中、已完成）
 * - 任务筛选和搜索功能
 * - 任务列表展示和操作
 * - 任务创建、编辑、删除功能
 * - 响应式布局设计
 * 
 * 技术实现：
 * - 使用 Material-UI 构建现代化界面
 * - 通过 Context API 进行状态管理
 * - 支持多模态框的统一管理
 * - 实现悬浮操作按钮的便捷交互
 * 
 * @fileoverview 任务管理系统主页面组件
 * @author 任务管理系统开发团队
 * @version 1.0.0
 * @created 2025-01-20
 * @lastModified 2025-01-20
 * 
 * @example
 * ```tsx
 * // 在App组件中使用
 * import { TaskManagementPage } from './pages/TaskManagementPage';
 * 
 * function App() {
 *   return (
 *     <AppProvider>
 *       <TaskManagementPage />
 *     </AppProvider>
 *   );
 * }
 * ```
 */

// React 核心库 - 提供组件基础功能
import React from 'react';

// Material-UI 组件库 - 提供现代化UI组件
import {
  Container,     // 页面容器组件，提供响应式布局
  Typography,    // 文本组件，用于标题和内容展示
  Box,          // 布局组件，用于flexbox布局和间距控制
  Fab,          // 悬浮操作按钮，用于主要操作入口
  Paper,        // 纸张效果容器，用于统计信息展示
  AppBar,       // 应用程序顶部导航栏
  Toolbar,      // 工具栏容器，放置导航内容
} from '@mui/material';

// Material-UI 图标库 - 提供矢量图标
import { Add as AddIcon } from '@mui/icons-material';

// 任务筛选面板组件 - 提供任务搜索和过滤功能
import { TaskFilterPanel } from '../components/TaskFilterPanel/TaskFilterPanel';

// 任务列表组件 - 展示过滤后的任务列表
import { TaskList } from '../components/TaskList/TaskList';

// 任务创建/编辑模态框 - 处理任务的创建和编辑操作
import { CreateTaskModal } from '../components/CreateTaskModal/CreateTaskModal';

// 任务详情模态框 - 展示任务的详细信息
import { TaskDetailModal } from '../components/TaskDetailModal/TaskDetailModal';

// 确认操作模态框 - 处理需要用户确认的危险操作
import { ConfirmModal } from '../components/ConfirmModal/ConfirmModal';

// 应用程序上下文钩子 - 提供全局状态管理和操作方法
import { useAppContext } from '../contexts/AppContext';

/**
 * 任务管理页面主组件
 * 
 * 作为任务管理系统的核心页面组件，负责整合和协调所有任务相关的功能模块。
 * 该组件采用分层架构设计，从上到下包括导航栏、统计面板、筛选面板、
 * 任务列表和悬浮操作按钮，同时管理多个模态框的显示状态。
 * 
 * 组件职责：
 * 1. 任务数据统计 - 计算并展示任务状态分布
 * 2. 页面布局管理 - 协调各个子组件的布局和间距
 * 3. 用户交互协调 - 处理创建任务等主要操作入口
 * 4. 模态框状态管理 - 统一管理所有模态框的显示状态
 * 
 * 状态依赖：
 * - tasks: 任务数据数组，用于统计和展示
 * - dispatch: 状态更新函数，用于触发各种操作
 * 
 * 子组件协调：
 * - TaskFilterPanel: 负责任务筛选逻辑
 * - TaskList: 负责任务列表展示
 * - 各类Modal: 负责具体的操作界面
 * 
 * @component
 * @description 任务管理系统的主页面组件，提供完整的任务管理界面
 * @returns {JSX.Element} 渲染的任务管理页面
 * 
 * @example
 * ```tsx
 * // 基本使用
 * <TaskManagementPage />
 * 
 * // 需要在AppProvider包装下使用
 * <AppProvider>
 *   <TaskManagementPage />
 * </AppProvider>
 * ```
 * 
 * @since 1.0.0
 */
export const TaskManagementPage: React.FC = () => {
  // 获取全局应用状态和状态更新函数
  // dispatch用于触发状态变更，state包含所有应用数据
  const { dispatch, state } = useAppContext();
  
  // 从全局状态中提取任务数据数组
  // 这是页面展示和统计计算的核心数据源
  const { tasks } = state;

  /**
   * 处理创建任务按钮点击事件
   * 
   * 当用户点击悬浮创建按钮时，该函数负责初始化创建任务的操作流程。
   * 首先清除当前选中的任务（确保不是编辑模式），然后打开创建任务模态框。
   * 
   * 执行步骤：
   * 1. 重置selectedTask为null，确保模态框以创建模式打开
   * 2. 设置创建模态框的打开状态为true
   * 
   * @description 初始化任务创建流程的事件处理函数
   * @triggers 用户点击悬浮创建按钮时
   * @sideEffects 更新全局状态中的selectedTask和isCreateModalOpen
   */
  const handleCreateTask = () => {
    // 清除选中任务，确保模态框以创建模式而非编辑模式打开
    dispatch({ type: 'SET_SELECTED_TASK', payload: null });
    // 打开创建任务模态框
    dispatch({ type: 'TOGGLE_CREATE_MODAL', payload: true });
  };

  // 任务状态统计 - 计算不同状态的任务数量，用于统计面板展示
  
  /**
   * 已完成任务数量统计
   * 通过过滤tasks数组，统计状态为'DONE'的任务数量
   * @type {number} 已完成任务的数量
   */
  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  
  /**
   * 进行中任务数量统计
   * 通过过滤tasks数组，统计状态为'IN_PROGRESS'的任务数量
   * @type {number} 进行中任务的数量
   */
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  
  /**
   * 待办任务数量统计
   * 通过过滤tasks数组，统计状态为'TODO'的任务数量
   * @type {number} 待办任务的数量
   */
  const todoTasks = tasks.filter(task => task.status === 'TODO').length;

  return (
    <>
      {/* 应用程序顶部导航栏 - 显示系统标题和版本信息 */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          {/* 系统标题，使用h5变体显示，flexGrow占满剩余空间 */}
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            任务管理系统 v1.0
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 主要内容容器 - 使用Material-UI的响应式容器 */}
      <Container maxWidth="lg">
        
        {/* 任务统计信息面板 - 展示任务总数和各状态分布 */}
        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            任务概览
          </Typography>
          
          {/* 统计数据展示区域 - 使用flexbox布局展示四个统计指标 */}
          <Box display="flex" gap={4}>
            {/* 总任务数统计 */}
            <Box>
              <Typography variant="h4" color="primary.main">
                {tasks.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总任务数
              </Typography>
            </Box>
            
            {/* 待办任务数统计 */}
            <Box>
              <Typography variant="h4" color="warning.main">
                {todoTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                待办任务
              </Typography>
            </Box>
            
            {/* 进行中任务数统计 */}
            <Box>
              <Typography variant="h4" color="info.main">
                {inProgressTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                进行中
              </Typography>
            </Box>
            
            {/* 已完成任务数统计 */}
            <Box>
              <Typography variant="h4" color="success.main">
                {completedTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                已完成
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* 任务筛选面板组件 - 提供搜索、状态、优先级等筛选功能 */}
        <TaskFilterPanel />

        {/* 任务列表组件 - 展示经过筛选的任务列表 */}
        <TaskList />

        {/* 悬浮创建任务按钮 - 固定在页面右下角的主要操作入口 */}
        <Fab
          color="primary"
          aria-label="添加任务"
          onClick={handleCreateTask}
          sx={{
            position: 'fixed',  // 固定定位，不随页面滚动
            bottom: 24,         // 距离底部24px
            right: 24,          // 距离右侦24px
          }}
        >
          <AddIcon />
        </Fab>

        {/* 模态框组件群 - 统一管理所有弹出式操作界面 */}
        
        {/* 任务创建/编辑模态框 - 根据selectedTask状态自动切换创建或编辑模式 */}
        <CreateTaskModal />
        
        {/* 任务详情查看模态框 - 展示任务的完整信息和操作选项 */}
        <TaskDetailModal />
        
        {/* 确认操作模态框 - 处理删除等需要用户确认的危险操作 */}
        <ConfirmModal />
        
      </Container>
    </>
  );
};