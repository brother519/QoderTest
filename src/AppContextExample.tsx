/**
 * AppContext 使用示例
 * 演示如何在应用中集成和使用 AppContext
 */

import React from 'react';
import AppContextProvider, { useAppContext, useTaskContext, useUIContext } from './AppContext';

// 示例：任务列表组件
const TaskList: React.FC = () => {
  const { tasks, loading, createTask, deleteTask } = useTaskContext();

  const handleCreateTask = async () => {
    try {
      await createTask({
        title: '新任务',
        description: '这是一个示例任务',
        status: 'pending',
        priority: 'medium',
        tags: ['示例']
      });
    } catch (error) {
      console.error('创建任务失败:', error);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <h2>任务列表</h2>
      <button onClick={handleCreateTask}>创建新任务</button>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <button onClick={() => deleteTask(task.id)}>删除</button>
        </div>
      ))}
    </div>
  );
};

// 示例：UI状态组件
const UIStatusBar: React.FC = () => {
  const { error, successMessage, loading, clearMessages } = useUIContext();

  return (
    <div>
      {loading && <div>处理中...</div>}
      {error && (
        <div style={{ color: 'red' }}>
          错误: {error}
          <button onClick={clearMessages}>关闭</button>
        </div>
      )}
      {successMessage && (
        <div style={{ color: 'green' }}>
          {successMessage}
        </div>
      )}
    </div>
  );
};

// 主应用组件
const ExampleApp: React.FC = () => {
  return (
    <AppContextProvider>
      <div>
        <h1>AppContext 示例应用</h1>
        <UIStatusBar />
        <TaskList />
      </div>
    </AppContextProvider>
  );
};

export default ExampleApp;