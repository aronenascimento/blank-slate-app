import { useState } from 'react';
import { Task, Project, Status, Priority, STATUS_CONFIG, PRIORITY_CONFIG, PERIOD_CONFIG } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Lucide from 'lucide-react';
import React from 'react';

interface BacklogViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange: (taskId: string, status: Status) => void;
}

const statusVariants: Record<string, 'backlog' | 'todo' | 'blocked' | 'doing' | 'review' | 'done'> = {
  'BACKLOG': 'backlog',
  'A FAZER': 'todo',
  'TRAVADO': 'blocked',
  'FAZENDO': 'doing',
  'EM APROVAÇÃO': 'review',
  'FEITO': 'done',
};

const priorityVariants: Record<string, 'urgent' | 'problematic' | 'important' | 'standard'> = {
  'Urgente': 'urgent',
  'Problemática': 'problematic',
  'Importante': 'important',
  'Padrão': 'standard',
};

const projectColorVariants: Record<string, 'projectBlue' | 'projectPurple' | 'projectGreen' | 'projectOrange' | 'projectPink' | 'projectCyan'> = {
  blue: 'projectBlue',
  purple: 'projectPurple',
  green: 'projectGreen',
  orange: 'projectOrange',
  pink: 'projectPink',
  cyan: 'projectCyan',
};

export function BacklogView({ tasks, projects, onTaskStatusChange }: BacklogViewProps) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const projectMap = new Map(projects.map(p => [p.id, p]));

  const filteredTasks = tasks.filter(task => {
    if (task.isArchived) return false;
    if (filterProject !== 'all' && task.projectId !== filterProject) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by deadline first
    const dateA = new Date(a.deadline).getTime();
    const dateB = new Date(b.deadline).getTime();
    if (dateA !== dateB) return dateA - dateB;
    
    // Then by priority
    const priorityOrder: Record<Priority, number> = { 'Urgente': 0, 'Problemática': 1, 'Importante': 2, 'Padrão': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtros:</span>
        </div>
        
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="w-[150px] h-8 text-xs bg-secondary border-border">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Projetos</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-secondary border-border">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
              const Icon = Lucide[config.icon as keyof typeof Lucide] as React.ElementType;
              return (
                <SelectItem key={key} value={key}>
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {config.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <div className="flex-1" />
        
        <span className="text-sm text-muted-foreground">
          {sortedTasks.length} tarefa{sortedTasks.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Tarefa</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Projeto</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Prazo</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Período</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Prioridade</th>
                <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.map((task, index) => {
                const project = projectMap.get(task.projectId);
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'FEITO';
                const periodConfig = PERIOD_CONFIG[task.period];
                const PeriodIcon = Lucide[periodConfig.icon as keyof typeof Lucide] as React.ElementType;
                const priorityConfig = PRIORITY_CONFIG[task.priority];
                const PriorityIcon = Lucide[priorityConfig.icon as keyof typeof Lucide] as React.ElementType;
                
                return (
                  <tr 
                    key={task.id}
                    className={cn(
                      "border-b border-border/50 hover:bg-card-hover transition-colors",
                      "animate-fade-in"
                    )}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="py-3 px-4">
                      <span className={cn(
                        "font-medium text-sm",
                        task.status === 'FEITO' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {project && (
                        <Badge variant={projectColorVariants[project.color]} className="text-[10px]">
                          {project.name}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn(
                        "text-sm",
                        isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                      )}>
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <PeriodIcon className="w-3 h-3" />
                        {task.period}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={priorityVariants[task.priority]} className="text-[10px] flex items-center gap-1">
                        <PriorityIcon className="w-3 h-3" /> {priorityConfig.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        value={task.status} 
                        onValueChange={(value) => onTaskStatusChange(task.id, value as Status)}
                      >
                        <SelectTrigger className="w-[130px] h-7 text-xs border-0 bg-transparent p-0">
                          <Badge variant={statusVariants[task.status]} className="text-[10px]">
                            {STATUS_CONFIG[task.status].label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedTasks.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Nenhuma tarefa encontrada com os filtros selecionados
          </div>
        )}
      </div>
    </div>
  );
}