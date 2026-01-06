import { BacklogView } from '@/components/BacklogView';
import { useAppData } from '@/components/MainLayout';

const BacklogPage = () => {
  const { tasks, projects, handleTaskStatusChange } = useAppData();
  
  return (
    <BacklogView 
      tasks={tasks}
      projects={projects}
      onTaskStatusChange={handleTaskStatusChange}
    />
  );
};

export default BacklogPage;