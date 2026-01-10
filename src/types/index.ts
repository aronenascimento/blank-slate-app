export type Priority = 'Urgente' | 'Problemática' | 'Importante' | 'Padrão';
export type Status = 'BACKLOG' | 'A FAZER' | 'TRAVADO' | 'FAZENDO' | 'EM APROVAÇÃO' | 'FEITO';
export type Period = 'Manhã' | 'Tarde' | 'Noite';
// ProjectColor now accepts any string (e.g., hex code)
export type ProjectColor = string; 

export interface Project {
  id: string;
  name: string;
  status: 'Ativo' | 'Pausado';
  color: ProjectColor; // This will now store the hex code
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  deadline: Date;
  period: Period;
  priority: Priority;
  status: Status;
  isArchived: boolean;
  createdAt: Date;
}

export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  updatedAt: Date;
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; icon: string; colorClass: string }> = {
  'Urgente': { label: 'Urgente', icon: 'Flame', colorClass: 'bg-priority-urgent/20 text-priority-urgent border-priority-urgent/30' },
  'Problemática': { label: 'Problemática', icon: 'Skull', colorClass: 'bg-priority-problematic/20 text-priority-problematic border-priority-problematic/30' },
  'Importante': { label: 'Importante', icon: 'Zap', colorClass: 'bg-priority-important/20 text-priority-important border-priority-important/30' },
  'Padrão': { label: 'Padrão', icon: 'Circle', colorClass: 'bg-priority-default/20 text-priority-default border-priority-default/30' },
};

export const STATUS_CONFIG: Record<Status, { label: string; colorClass: string }> = {
  'BACKLOG': { label: 'Backlog', colorClass: 'bg-status-backlog/20 text-status-backlog' },
  'A FAZER': { label: 'A Fazer', colorClass: 'bg-status-todo/20 text-status-todo' },
  'TRAVADO': { label: 'Travado', colorClass: 'bg-status-blocked/20 text-status-blocked' },
  'FAZENDO': { label: 'Fazendo', colorClass: 'bg-status-doing/20 text-status-doing' },
  'EM APROVAÇÃO': { label: 'Em Aprovação', colorClass: 'bg-status-review/20 text-status-review' },
  'FEITO': { label: 'Feito', colorClass: 'bg-status-done/20 text-status-done' },
};

export const PERIOD_CONFIG: Record<Period, { label: string; icon: string; gradient: string }> = {
  'Manhã': { label: 'Manhã', icon: 'Sun', gradient: 'period-morning' },
  'Tarde': { label: 'Tarde', icon: 'CloudSun', gradient: 'period-afternoon' },
  'Noite': { label: 'Noite', icon: 'Moon', gradient: 'period-night' },
};