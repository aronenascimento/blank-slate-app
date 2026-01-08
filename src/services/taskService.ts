import { supabase } from '@/lib/supabase';
import { Task, Status, Period, Priority } from '@/types';

// Mapeamento de snake_case para camelCase para consistência com o frontend
const mapTaskFromSupabase = (data: any): Task => ({
  id: data.id,
  title: data.title,
  description: data.description,
  projectId: data.project_id,
  deadline: new Date(data.deadline),
  period: data.period as Period,
  priority: data.priority as Priority,
  status: data.status as Status,
  isArchived: data.is_archived,
  createdAt: new Date(data.created_at),
});

// Mapeamento de camelCase para snake_case para o Supabase
const mapTaskToSupabase = (task: Partial<Task>): Record<string, any> => {
  const updates: Record<string, any> = {};
  if (task.title !== undefined) updates.title = task.title;
  if (task.description !== undefined) updates.description = task.description;
  if (task.projectId !== undefined) updates.project_id = task.projectId;
  if (task.deadline !== undefined) updates.deadline = task.deadline instanceof Date ? task.deadline.toISOString().split('T')[0] : task.deadline; // Supabase espera 'YYYY-MM-DD' para date
  if (task.period !== undefined) updates.period = task.period;
  if (task.priority !== undefined) updates.priority = task.priority;
  if (task.status !== undefined) updates.status = task.status;
  if (task.isArchived !== undefined) updates.is_archived = task.isArchived;
  
  return updates;
};


export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true })
    .order('priority', { ascending: true });

  if (error) throw new Error(error.message);
  
  return data.map(mapTaskFromSupabase);
}

export async function createTask(taskData: Omit<Task, 'id' | 'isArchived' | 'createdAt'>): Promise<Task> {
  const mappedData = mapTaskToSupabase(taskData);
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([mappedData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return mapTaskFromSupabase(data);
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const mappedUpdates = mapTaskToSupabase(updates);
  
  const { data, error } = await supabase
    .from('tasks')
    .update(mappedUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return mapTaskFromSupabase(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw new Error(error.message);
}