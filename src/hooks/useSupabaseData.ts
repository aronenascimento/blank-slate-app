import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Project, Status, Period, Priority, ProjectColor } from '@/types';
import { useSession } from '@/components/SessionContextProvider';
import { toast } from 'sonner';

// --- Type Definitions for Supabase Data ---
// Supabase returns dates as strings, and IDs as strings/UUIDs.
interface SupabaseProject {
  id: string;
  name: string;
  status: 'Ativo' | 'Pausado';
  color: ProjectColor;
  created_at: string;
}

interface SupabaseTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  deadline: string; // ISO date string (YYYY-MM-DD)
  period: Period; // Now enforced by DB ENUM
  priority: Priority; // Now enforced by DB ENUM
  status: Status; // Now enforced by DB ENUM
  is_archived: boolean;
  created_at: string;
}

interface SupabaseProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

// Helper function to correctly parse YYYY-MM-DD date strings as local dates
// This prevents timezone offsets from shifting the date back a day.
const parseSupabaseDate = (dateString: string): Date => {
  // We append 'T00:00:00' to force interpretation as the start of the day in local time.
  // This is a common workaround for date-only inputs.
  return new Date(`${dateString}T00:00:00`);
};

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
  deadline: parseSupabaseDate(t.deadline), // Use the helper function here
  period: t.period,
  priority: t.priority,
  status: t.status,
  isArchived: t.is_archived,
  createdAt: new Date(t.created_at),
});

const transformProfile = (p: SupabaseProfile): Profile => ({
  id: p.id,
  firstName: p.first_name,
  lastName: p.last_name,
  avatarUrl: p.avatar_url,
  updatedAt: new Date(p.updated_at),
});

// --- Data Fetching ---

// RLS ensures only the authenticated user's data is returned, so we remove redundant user_id filters.
const fetchProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, color, created_at') // Explicit selection, excluding user_id
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(transformProject);
};

const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, project_id, title, description, deadline, period, priority, status, is_archived, created_at') // Explicit selection, excluding user_id
    .eq('is_archived', false) // Only fetch non-archived tasks
    .order('deadline', { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(transformTask);
};

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url, updated_at') // Explicit selection
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found (expected if profile hasn't been created yet)
    throw new Error(error.message);
  }
  
  return data ? transformProfile(data) : null;
};

// --- Main Hook ---

export const useSupabaseData = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const userId = user?.id;

  // 1. Fetch Profile
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });

  // 2. Fetch Projects
  const projectsQuery = useQuery({
    queryKey: ['projects', userId],
    queryFn: fetchProjects, // No need for userId argument here, RLS handles it
    enabled: !!userId,
    initialData: [],
  });

  // 3. Fetch Tasks
  const tasksQuery = useQuery({
    queryKey: ['tasks', userId],
    queryFn: fetchTasks, // No need for userId argument here, RLS handles it
    enabled: !!userId,
    initialData: [],
  });

  // --- Mutations ---
  
  // Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { firstName: string; lastName: string; avatarUrl?: string }) => {
      if (!userId) throw new Error('User not authenticated');
      
      const payload = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        avatar_url: updates.avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select('id, first_name, last_name, avatar_url, updated_at') // Explicit selection
        .single();

      if (error) throw new Error(error.message);
      return transformProfile(data);
    },
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(`Perfil de ${updatedProfile.firstName} atualizado.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    }
  });

  // Project Mutations
  const addProjectMutation = useMutation({
    mutationFn: async (newProject: { name: string; color: ProjectColor }) => {
      if (!userId) throw new Error('User not authenticated');
      
      // RLS and the new CHECK constraint on 'color' will enforce security here.
      const { data, error } = await supabase
        .from('projects')
        .insert({ 
          name: newProject.name, 
          color: newProject.color, 
          user_id: userId,
          status: 'Ativo',
        })
        .select('id, name, status, color, created_at') // Explicit selection
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
      // RLS and the new CHECK constraint on 'color' will enforce security here.
      const { data, error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          color: updates.color,
          status: updates.status,
        })
        .eq('id', projectId)
        .select('id, name, status, color, created_at') // Explicit selection
        .single();

      if (error) throw new Error(error.message);
      return transformProject(data);
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Projeto "${updatedProject.name}" atualizado.`);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    }
  });
  
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      // Use the secure database function to delete the project
      const { error } = await supabase.rpc('delete_project_by_owner', { project_id_in: projectId });

      if (error) {
        // Throw a more specific error message for the toast handler
        throw new Error(`Falha ao executar RPC de exclusão de projeto: ${error.message}`);
      }
      return projectId;
    },
    onSuccess: (deletedProjectId) => {
      // Manually remove the project from the cache for instant UI update
      queryClient.setQueryData(['projects', userId], (oldData: Project[] | undefined) => {
        return oldData ? oldData.filter(p => p.id !== deletedProjectId) : [];
      });
      
      // Invalidate tasks to ensure associated tasks are removed/updated in other views
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
      deadline: Date; // Aceita a data
    }) => {
      if (!userId) throw new Error('User not authenticated');
      
      // The database ENUMs and new CHECK constraints enforce validity for these fields.
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          project_id: newTask.projectId,
          title: newTask.title,
          deadline: newTask.deadline.toISOString().split('T')[0], // Salva apenas a data (YYYY-MM-DD)
          period: newTask.period,
          priority: newTask.priority,
          status: 'BACKLOG', // DB default is now BACKLOG
          is_archived: false,
        })
        .select('id, project_id, title, description, deadline, period, priority, status, is_archived, created_at') // Explicit selection
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
      
      // Build payload dynamically, converting keys to snake_case for Supabase
      const payload: Record<string, any> = {};
      
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.projectId !== undefined) payload.project_id = updates.projectId;
      // DB ENUMs and CHECK constraints enforce validity for these fields
      if (updates.period !== undefined) payload.period = updates.period;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.isArchived !== undefined) payload.is_archived = updates.isArchived;
      
      // Handle deadline separately, ensuring it's formatted as a date string if present
      if (updates.deadline instanceof Date) {
        payload.deadline = updates.deadline.toISOString().split('T')[0];
      }

      if (Object.keys(payload).length === 0) {
        // No updates to perform
        return;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId)
        .select('id, project_id, title, description, deadline, period, priority, status, is_archived, created_at') // Explicit selection
        .single();

      if (error) throw new Error(error.message);
      return transformTask(data);
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (updatedTask) {
        toast.success(`Tarefa "${updatedTask.title}" atualizada.`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    }
  });
  
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Use the secure database function to delete the task
      const { error } = await supabase.rpc('delete_task_by_owner', { task_id_in: taskId });

      if (error) {
        // Throw a more specific error message for the toast handler
        throw new Error(`Falha ao executar RPC de exclusão de tarefa: ${error.message}`);
      }
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      // Manually remove the task from the local cache for instant UI update
      queryClient.setQueryData(['tasks', userId], (oldData: Task[] | undefined) => {
        return oldData ? oldData.filter(t => t.id !== deletedTaskId) : [];
      });
      
      // Invalidate to ensure consistency, although manual update should be enough for UI
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa deletada.');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    }
  });

  return {
    profile: profileQuery.data,
    projects: projectsQuery.data || [],
    tasks: tasksQuery.data || [],
    isLoading: profileQuery.isLoading || projectsQuery.isLoading || tasksQuery.isLoading,
    isError: profileQuery.isError || projectsQuery.isError || tasksQuery.isError,
    
    // Profile Handlers
    handleUpdateProfile: updateProfileMutation.mutate,

    // Project Handlers
    handleAddProject: addProjectMutation.mutate,
    handleUpdateProject: (projectId: string, updates: Partial<Project>) => {
      updateProjectMutation.mutate({ projectId, updates });
    },
    handleToggleProjectStatus: (projectId: string) => {
      const project = projectsQuery.data?.find(p => p.id === projectId);
      if (project) {
        const newStatus = project.status === 'Ativo' ? 'Pausado' : 'Ativo';
        updateProjectMutation.mutate({ projectId, updates: { status: newStatus } });
      }
    },
    handleDeleteProject: (projectId: string) => {
      deleteProjectMutation.mutate(projectId);
    },

    // Task Handlers
    handleAddTask: addTaskMutation.mutate,
    handleUpdateTask: (taskId: string, updates: Partial<Task>) => {
      updateTaskMutation.mutate({ taskId, updates });
    },
    handleDeleteTask: (taskId: string) => {
      deleteTaskMutation.mutate(taskId);
    },
    
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