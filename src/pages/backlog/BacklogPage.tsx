import { BacklogView } from '@/components/BacklogView';
import { useAppData } from '@/components/MainLayout';

const BacklogPage = () => {
  const { tasks, projects, handleUpdateTask } = useAppData();
  
  return (
    <BacklogView 
      tasks={tasks}
      projects={projects}
      onUpdateTask={handleUpdateTask}
    />
  );
};

export default BacklogPage;