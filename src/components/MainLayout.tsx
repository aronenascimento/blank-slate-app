import { Outlet, useOutletContext } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { QuickAddButton } from '@/components/QuickAddButton';
import { Task, Status, Period, Priority, Project, ProjectColor } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useSession } from './SessionContextProvider';
import { MobileSidebar } from './MobileSidebar'; // Import MobileSidebar

// Define the context type for components consuming app data
interface AppDataContext {
  tasks: Task[]; 
  projects: Project[]; 
  isLoading: boolean;
  handleTaskStatusChange: (taskId: string, status: Status) => void;
  handleTaskPeriodChange: (taskId: string, newPeriod: Period) => void;
  handleTaskPriorityChange: (taskId: string, newPriority: Priority) => void;
  handleUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  handleDeleteTask: (taskId: string) => void;
  handleAddProject: (newProject: { name: string; color: ProjectColor }) => void;
  handleUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  handleToggleProjectStatus: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleAddTask: (task: { title: string; projectId: string; period: Period; priority: Priority; deadline: Date; }) => void;
}

const MainLayout = () => {
  const { isLoading: isSessionLoading } = useSession();
  const { 
    tasks, 
    projects, 
    isLoading: isDataLoading,
    handleTaskStatusChange, 
    handleTaskPeriodChange, 
    handleTaskPriorityChange,
    handleUpdateTask,
    handleDeleteTask,
    handleAddProject,
    handleUpdateProject,
    handleToggleProjectStatus,
    handleDeleteProject,
    handleAddTask,
  } = useSupabaseData();
  
  const isLoading = isSessionLoading || isDataLoading;

  // Define sidebar width for content padding
  const SIDEBAR_WIDTH = '240px';

  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    // tasks are already filtered for !isArchived by useSupabaseData
    return taskDate < today && task.status !== 'FEITO';
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar overdueCount={overdueTasks.length} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px]">
        <Header 
          overdueCount={overdueTasks.length}
        >
          {/* Mobile Menu Trigger passed as a child/prop to Header */}
          <MobileSidebar overdueCount={overdueTasks.length} />
        </Header>
        
        <main className="px-4 py-6">
          {/* Outlet renders the specific route component (DashboardPage, ProjectsPage, etc.) */}
          <Outlet context={{ 
            tasks, 
            projects, 
            isLoading,
            handleTaskStatusChange, 
            handleTaskPeriodChange, 
            handleTaskPriorityChange,
            handleUpdateTask,
            handleDeleteTask,
            handleAddProject,
            handleUpdateProject,
            handleToggleProjectStatus,
            handleDeleteProject,
            handleAddTask
          } as AppDataContext} />
        </main>
      </div>
      
      <QuickAddButton 
        projects={projects}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default MainLayout;

// Custom hook to access context data
export const useAppData = () => {
  return useOutletContext<AppDataContext>();
};