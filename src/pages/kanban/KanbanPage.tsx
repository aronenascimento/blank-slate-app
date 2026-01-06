import { KanbanView } from '@/components/KanbanView';
import { useAppData } from '@/components/MainLayout';

const KanbanPage = () => {
  const { tasks, projects, handleTaskStatusChange, handleTaskPriorityChange } = useAppData();
  
  return (
    <KanbanView 
      tasks={tasks}
      projects={projects}
      onTaskStatusChange={handleTaskStatusChange}
      onTaskPriorityChange={handleTaskPriorityChange}
    />
  );
};

export default KanbanPage;