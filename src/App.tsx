import React from 'react';
import TaskManager from './components/TaskManager';
import './styles/TaskManager.css';

/**
 * 主应用组件
 * 
 * 渲染任务管理系统的主界面
 */
function App() {
  return (
    <div className="App">
      <TaskManager />
    </div>
  );
}

export default App;