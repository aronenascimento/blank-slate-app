import { supabase } from '@/lib/supabase';
import { Project, ProjectColor } from '@/types';

// Mapeamento de snake_case para camelCase para consistência com o frontend
const mapProjectFromSupabase = (data: any): Project => ({
  id: data.id,
  name: data.name,
  status: data.status as 'Ativo' | 'Pausado',
  color: data.color as ProjectColor,
  createdAt: new Date(data.created_at),
});

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  
  return data.map(mapProjectFromSupabase);
}

export async function createProject(projectData: { name: string; color: ProjectColor }): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return mapProjectFromSupabase(data);
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
  // Supabase espera snake_case, mas o frontend usa camelCase.
  // Precisamos mapear as chaves de volta se necessário, mas para este caso,
  // as chaves 'name', 'status', 'color' são as mesmas.
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return mapProjectFromSupabase(data);
}