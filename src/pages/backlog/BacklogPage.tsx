import { useAppData } from '@/components/MainLayout';
import { BacklogView } from '@/components/BacklogView';
import React from 'react';

const BacklogPage = () => {
  const { tasks, projects, handleUpdateTask, handleAddTask } = useAppData();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Backlog de Tarefas</h1>
      <BacklogView 
        tasks={tasks}
        projects={projects}
        onUpdateTask={handleUpdateTask}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default BacklogPage;