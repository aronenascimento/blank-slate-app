import { DashboardView } from '@/components/DashboardView';
import { useAppData } from '@/components/MainLayout';

const DashboardPage = () => {
  const { tasks, projects, handleTaskStatusChange, handleTaskPeriodChange, handleTaskPriorityChange } = useAppData();
  
  return (
    <DashboardView 
      tasks={tasks}
      projects={projects}
      onTaskStatusChange={handleTaskStatusChange}
      onTaskPeriodChange={handleTaskPeriodChange}
      onTaskPriorityChange={handleTaskPriorityChange}
    />
  );
};

export default DashboardPage;