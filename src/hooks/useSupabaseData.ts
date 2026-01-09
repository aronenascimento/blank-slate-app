import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Project, Status, Period, Priority, ProjectColor } from '@/types';
import { useSession } from '@/components/SessionContextProvider';
import { toast } from 'sonner';

// --- Type Definitions for Supabase Data ---
// Supabase returns dates as strings, and IDs as strings/UUIDs.
interface SupabaseProject {
  id: string;
  user_id: string;
  name: string;
  status: 'Ativo' | 'Pausado';
  color: ProjectColor;
  created_at: string;
}

interface SupabaseTask {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description: string | null;
  deadline: string; // ISO date string
  period: Period;
  priority: Priority;
  status: Status;
  is_archived: boolean;
  created_at: string;
}

// --- Data Transformation ---
const transformProject = (p: SupabaseProject): Project => ({
  id: p.id,
  name: p.name,
  status: p.status,
  color: p.color,
  createdAt: new Date(p.created_at),
});

const transformTask = (t: SupabaseTask): Task => ({
  id: t.id,
  title: t.title,
  description: t.description ?? undefined,
  projectId: t.project_id,
  deadline: new Date(t.deadline),
  period: t.period,
  priority: t.priority,
  status: t.status,
  isArchived: t.is_archived,
  createdAt: new Date(t.created_at),
});

// --- Data Fetching ---

const fetchProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(transformProject);
};

const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(transformTask);
};

// --- Main Hook ---

export const useSupabaseData = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const userId = user?.id;

  // 1. Fetch Projects
  const projectsQuery = useQuery({
    queryKey: ['projects', userId],
    queryFn: () => fetchProjects(userId!),
    enabled: !!userId,
    initialData: [],
  });

  // 2. Fetch Tasks
  const tasksQuery = useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => fetchTasks(userId!),
    enabled: !!userId,
    initialData: [],
  });

  // --- Mutations ---

  // Project Mutations
  const addProjectMutation = useMutation({
    mutationFn: async (newProject: { name: string; color: ProjectColor }) => {
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({ 
          name: newProject.name, 
          color: newProject.color, 
          user_id: userId,
          status: 'Ativo',
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return transformProject(data);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(`Projeto "${newProject.name}" criado com sucesso!`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          color: updates.color,
          status: updates.status,
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return transformProject(data);
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Tasks might need refresh if project status affects views
      toast.success(`Projeto "${updatedProject.name}" atualizado.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    }
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      // Tasks are automatically deleted via CASCADE constraint in the database
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw new Error(error.message);
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Projeto e tarefas associadas deletados.');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar projeto: ${error.message}`);
    }
  });

  // Task Mutations
  const addTaskMutation = useMutation({
    mutationFn: async (newTask: {
      title: string;
      projectId: string;
      period: Period;
      priority: Priority;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          project_id: newTask.projectId,
          title: newTask.title,
          deadline: new Date().toISOString().split('T')[0], // Default deadline to today
          period: newTask.period,
          priority: newTask.priority,
          status: 'A FAZER',
          is_archived: false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return transformTask(data);
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Tarefa "${newTask.title}" adicionada!`);
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar tarefa: ${error.message}`);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      // Supabase expects deadline as an ISO string (date only)
      const deadlineString = updates.deadline instanceof Date 
        ? updates.deadline.toISOString().split('T')[0] 
        : undefined;
        
      const payload = {
        title: updates.title,
        description: updates.description,
        project_id: updates.projectId,
        deadline: deadlineString,
        period: updates.period,
        priority: updates.priority,
        status: updates.status,
        is_archived: updates.isArchived,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return transformTask(data);
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Tarefa "${updatedTask.title}" atualizada.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw new Error(error.message);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa deletada.');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    }
  });

  return {
    projects: projectsQuery.data || [],
    tasks: tasksQuery.data || [],
    isLoading: projectsQuery.isLoading || tasksQuery.isLoading,
    isError: projectsQuery.isError || tasksQuery.isError,
    
    // Project Handlers
    handleAddProject: addProjectMutation.mutate,
    handleUpdateProject: updateProjectMutation.mutate,
    handleToggleProjectStatus: (projectId: string) => {
      const project = projectsQuery.data?.find(p => p.id === projectId);
      if (project) {
        const newStatus = project.status === 'Ativo' ? 'Pausado' : 'Ativo';
        updateProjectMutation.mutate({ projectId, updates: { status: newStatus } });
      }
    },
    handleDeleteProject: deleteProjectMutation.mutate,

    // Task Handlers
    handleAddTask: addTaskMutation.mutate,
    handleUpdateTask: updateTaskMutation.mutate,
    handleDeleteTask: deleteTaskMutation.mutate,
    
    // Specific Task Updates (used by drag/drop and quick actions)
    handleTaskStatusChange: (taskId: string, status: Status) => {
      updateTaskMutation.mutate({ taskId, updates: { status } });
    },
    handleTaskPeriodChange: (taskId: string, period: Period) => {
      updateTaskMutation.mutate({ taskId, updates: { period } });
    },
    handleTaskPriorityChange: (taskId: string, priority: Priority) => {
      updateTaskMutation.mutate({ taskId, updates: { priority } });
    },
  };
};