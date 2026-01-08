import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { QuickAddButton } from '@/components/QuickAddButton';
import { Task, Status, Period, Priority, Project, ProjectColor } from '@/types';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/services/taskService';
import { fetchProjects, createProject, updateProject } from '@/services/projectService';

const MainLayout = () => {
  const queryClient = useQueryClient();
  
  // Define sidebar width for content padding
  const SIDEBAR_WIDTH = '240px';

  // --- Data Fetching (Queries) ---
  const { data: tasks = [], isLoading: isLoadingTasks, error: tasksError } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const { data: projects = [], isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
  
  // Handle loading/error states (simple display for now)
  if (isLoadingTasks || isLoadingProjects) {
    // In a real app, you'd show a proper skeleton/loading screen
    return <div className="min-h-screen flex items-center justify-center text-primary">Carregando dados...</div>;
  }
  
  if (tasksError || projectsError) {
    toast.error("Erro ao carregar dados: " + (tasksError?.message || projectsError?.message));
    return <div className="min-h-screen flex items-center justify-center text-destructive">Erro ao carregar dados.</div>;
  }

  // --- Mutations ---

  // Task Mutations
  const addTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Tarefa "${newTask.title}" adicionada!`);
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar tarefa: ${error.message}`);
    }
  });
  
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string, updates: Partial<Task> }) => updateTask(taskId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      // Optimistic update feedback is better, but for simplicity, we use toast on success
      const taskTitle = tasks.find(t => t.id === variables.taskId)?.title || 'Tarefa';
      toast.success(`${taskTitle} atualizada.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const taskTitle = tasks.find(t => t.id === taskId)?.title || 'Tarefa';
      toast.success(`Tarefa "${taskTitle}" deletada.`);
    },
    onError: (error) => {
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    }
  });

  // Project Mutations
  const addProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    }
  });
  
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string, updates: Partial<Project> }) => updateProject(projectId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      const projectName = projects.find(p => p.id === variables.projectId)?.name || 'Projeto';
      toast.success(`Projeto "${projectName}" atualizado.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    }
  });

  // --- Handlers ---

  const handleTaskStatusChange = (taskId: string, status: Status) => {
    updateTaskMutation.mutate({ taskId, updates: { status } });
  };
  
  const handleTaskPeriodChange = (taskId: string, newPeriod: Period) => {
    updateTaskMutation.mutate({ taskId, updates: { period: newPeriod } });
  };
  
  const handleTaskPriorityChange = (taskId: string, newPriority: Priority) => {
    updateTaskMutation.mutate({ taskId, updates: { priority: newPriority } });
  };

  const handleAddTask = (newTask: {
    title: string;
    projectId: string;
    period: Period;
    priority: Priority;
  }) => {
    // The service layer handles setting default status, deadline (today), and isArchived (false)
    const taskData = {
      ...newTask,
      deadline: new Date(), // Set deadline to today
      status: 'A FAZER' as Status,
      isArchived: false,
      createdAt: new Date(),
    };
    // We only pass the required fields to the service layer
    const serviceData = {
      title: taskData.title,
      projectId: taskData.projectId,
      deadline: taskData.deadline,
      period: taskData.period,
      priority: taskData.priority,
      status: taskData.status,
      description: '', // Ensure description is included if needed by the service, or omit if optional
    };
    
    addTaskMutation.mutate(serviceData);
  };
  
  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, updates });
  };
  
  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };
  
  const handleAddProject = (newProject: { name: string; color: ProjectColor }) => {
    addProjectMutation.mutate(newProject);
  };
  
  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    updateProjectMutation.mutate({ projectId, updates });
  };
  
  const handleToggleProjectStatus = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newStatus = project.status === 'Ativo' ? 'Pausado' : 'Ativo';
      updateProjectMutation.mutate({ projectId, updates: { status: newStatus } });
    }
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