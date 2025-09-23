/**
 * 任务列表组件
 * 
 * 该组件负责显示经过筛选的任务列表，采用响应式网格布局设计，
 * 支持不同屏幕尺寸的自适应显示。组件与筛选面板紧密集成，实时响应筛选条件的变化。
 * 
 * 主要功能特性：
 * - 动态任务筛选：实时响应筛选条件并更新显示结果
 * - 响应式布局：根据屏幕尺寸自动调整列数和间距
 * - 空状态处理：优雅地处理无任务或无匹配结果的情况
 * - 高性能渲染：针对大量任务数据进行优化
 * 
 * 布局说明：
 * - 手机端（xs）：单列显示，充分利用屏幕宽度
 * - 平板端（sm）：双列显示，平衡内容密度
 * - 桌面端（md+）：三列显示，提供最佳视觉体验
 * 
 * 数据流：
 * 1. 从全局状态获取原始任务数据和筛选条件
 * 2. 通过filterTasks工具函数处理筛选逻辑
 * 3. 将筛选后的任务传递给TaskCard组件显示
 * 
 * @fileoverview 任务列表组件
 * @author 任务管理系统开发团队
 * @version 1.0.0
 * @created 2025-01-20
 * @lastModified 2025-01-20
 * 
 * @example
 * ```tsx
 * // 基本使用
 * <TaskList />
 * 
 * // 与筛选面板组合使用
 * <>
 *   <TaskFilterPanel />
 *   <TaskList />
 * </>
 * ```
 */

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { TaskCard } from '../TaskCard/TaskCard';
import { useAppContext } from '../../../contexts/AppContext';
import { filterTasks } from '../../../utils';

export const TaskList: React.FC = () => {
  const { state } = useAppContext();
  const { tasks, filter } = state;

  const filteredTasks = filterTasks(tasks, filter);

  if (filteredTasks.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
        textAlign="center"
      >
        <Typography variant="h6" color="text.secondary">
          {tasks.length === 0 ? '暂无任务' : '没有符合条件的任务'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {filteredTasks.map((task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id}>
          <TaskCard task={task} />
        </Grid>
      ))}
    </Grid>
  );
};