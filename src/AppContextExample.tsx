/**
 * AppContext Usage Example
 * Demonstrates how to integrate and use AppContext in applications
 */

import React from 'react';
import AppContextProvider, { useAppContext, useTaskContext, useUIContext } from './AppContext';

// Example: Task List Component
const TaskList: React.FC = () => {
  const { tasks, loading, createTask, deleteTask } = useTaskContext();

  const handleCreateTask = async () => {
    try {
      await createTask({
        title: 'New Task',
        description: 'This is an example task',
        status: 'pending',
        priority: 'medium',
        tags: ['example']
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Task List</h2>
      <button onClick={handleCreateTask}>Create New Task</button>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

// Example: UI Status Component
const UIStatusBar: React.FC = () => {
  const { error, successMessage, loading, clearMessages } = useUIContext();

  return (
    <div>
      {loading && <div>Processing...</div>}
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
          <button onClick={clearMessages}>Close</button>
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

// Main Application Component
const ExampleApp: React.FC = () => {
  return (
    <AppContextProvider>
      <div>
        <h1>AppContext Example Application</h1>
        <UIStatusBar />
        <TaskList />
      </div>
    </AppContextProvider>
  );
};

export default ExampleApp;