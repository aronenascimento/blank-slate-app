import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { QuickAddButton } from '@/components/QuickAddButton';
import { mockProjects, mockTasks } from '@/data/mockData';
import { Task, Status, Period, Priority, Project, ProjectColor } from '@/types';
import { toast } from 'sonner';

const MainLayout = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  
  // Define sidebar width for content padding
  const SIDEBAR_WIDTH = '240px';

  const handleTaskStatusChange = (taskId: string, status: Status) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };
  
  const handleTaskPeriodChange = (taskId: string, newPeriod: Period) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, period: newPeriod } : task
    ));
  };
  
  const handleTaskPriorityChange = (taskId: string, newPriority: Priority) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, priority: newPriority } : task
    ));
  };

  const handleAddTask = (newTask: {
    title: string;
    projectId: string;
    period: Period;
    priority: Priority;
  }) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      projectId: newTask.projectId,
      deadline: new Date(),
      period: newTask.period,
      priority: newTask.priority,
      status: 'A FAZER',
      isArchived: false,
      createdAt: new Date(),
    };
    setTasks(prev => [task, ...prev]);
    toast.success(`Tarefa "${task.title}" adicionada!`);
  };
  
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        toast.success(`Tarefa "${task.title}" atualizada.`);
        return { ...task, ...updates };
      }
      return task;
    }));
  };
  
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success(`Tarefa "${taskToDelete.title}" deletada.`);
    }
  };
  
  const handleAddProject = (newProject: { name: string; color: ProjectColor }) => {
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      status: 'Ativo',
      color: newProject.color,
      createdAt: new Date(),
    };
    setProjects(prev => [project, ...prev]);
    toast.success(`Projeto "${project.name}" criado com sucesso!`);
  };
  
  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        toast.success(`Projeto "${project.name}" atualizado.`);
        return { ...project, ...updates };
      }
      return project;
    }));
  };
  
  const handleToggleProjectStatus = (projectId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const newStatus = project.status === 'Ativo' ? 'Pausado' : 'Ativo';
        toast.info(`Projeto "${project.name}" foi ${newStatus === 'Ativo' ? 'ativado' : 'pausado'}.`);
        return { ...project, status: newStatus };
      }
      return project;
    }));
  };

  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today && task.status !== 'FEITO' && !task.isArchived;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar overdueCount={overdueTasks.length} />
      
      <div style={{ marginLeft: SIDEBAR_WIDTH }} className="flex-1">
        <Header 
          overdueCount={overdueTasks.length}
        />
        
        <main className="px-4 py-6">
          {/* Outlet renders the specific route component (DashboardPage, ProjectsPage, etc.) */}
          <Outlet context={{ 
            tasks, 
            projects, 
            handleTaskStatusChange, 
            handleTaskPeriodChange, 
            handleTaskPriorityChange,
            handleUpdateTask,
            handleDeleteTask,
            handleAddProject,
            handleUpdateProject,
            handleToggleProjectStatus
          }} />
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
  return useOutletContext<{ 
    tasks: Task[]; 
    projects: Project[]; 
    handleTaskStatusChange: (taskId: string, status: Status) => void;
    handleTaskPeriodChange: (taskId: string, newPeriod: Period) => void;
    handleTaskPriorityChange: (taskId: string, newPriority: Priority) => void;
    handleUpdateTask: (taskId: string, updates: Partial<Task>) => void;
    handleDeleteTask: (taskId: string) => void;
    handleAddProject: (newProject: { name: string; color: ProjectColor }) => void;
    handleUpdateProject: (projectId: string, updates: Partial<Project>) => void;
    handleToggleProjectStatus: (projectId: string) => void;
  }>();
};