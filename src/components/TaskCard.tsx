import { Task, Project, PRIORITY_CONFIG, STATUS_CONFIG, Status, Priority, Period } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getProjectBadgeStyles } from '@/lib/colorUtils';
import * as Lucide from 'lucide-react';
import { useAppData } from './MainLayout';
import { TaskDetailDialog } from './TaskDetailDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onStatusChange?: (taskId: string, status: Status) => void;
  onPriorityChange?: (taskId: string, priority: Priority) => void;
  compact?: boolean;
}

const priorityVariants: Record<string, 'urgent' | 'problematic' | 'important' | 'standard'> = {
  'Urgente': 'urgent',
  'Problemática': 'problematic',
  'Importante': 'important',
  'Padrão': 'standard',
};

const statusVariants: Record<string, 'backlog' | 'todo' | 'blocked' | 'doing' | 'review' | 'done'> = {
  'BACKLOG': 'backlog',
  'A FAZER': 'todo',
  'TRAVADO': 'blocked',
  'FAZENDO': 'doing',
  'EM APROVAÇÃO': 'review',
  'FEITO': 'done',
};

export function TaskCard({ task, project, onStatusChange, onPriorityChange, compact = false }: TaskCardProps) {
  const { projects, handleUpdateTask, handleDeleteTask } = useAppData();
  
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = task.status === 'FEITO';
  const isOverdue = new Date(task.deadline) < new Date() && !isCompleted;
  
  const PriorityIcon = Lucide[priorityConfig.icon as keyof typeof Lucide] as React.ElementType;

  const handleCheckboxChange = (checked: boolean) => {
    if (onStatusChange) {
      onStatusChange(task.id, checked ? 'FEITO' : 'A FAZER');
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.dataTransfer.setData("taskId", task.id);
    e.currentTarget.classList.add('opacity-50', 'border-dashed', 'border-primary');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50', 'border-dashed', 'border-primary');
  };
  
  const handlePriorityChange = (newPriority: string) => {
    if (onPriorityChange) {
      onPriorityChange(task.id, newPriority as Priority);
    }
  };

  const formattedDeadline = format(new Date(task.deadline), 'dd/MM', { locale: ptBR });

  // Render content inside a wrapper that acts as the dialog trigger
  const cardContent = (
    <div
      draggable={!isCompleted}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group relative rounded-lg border border-border bg-card p-3 transition-all duration-200",
        "hover:bg-card-hover hover:border-border/80 hover:shadow-md",
        isOverdue && "border-l-2 border-l-destructive",
        isCompleted && "opacity-60",
        compact ? "p-2" : "p-3",
        !isCompleted && "cursor-pointer"
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleCheckboxChange}
          className="mt-0.5 border-muted-foreground/50 data-[state=checked]:bg-status-done data-[state=checked]:border-status-done"
          onClick={(e) => e.stopPropagation()}
        />
        
        {/* Main content area: flex-1 min-w-0 ensures it respects parent width */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* 1. Title */}
          <h4 className={cn(
            "font-medium text-sm leading-tight text-foreground break-words whitespace-normal", // Added whitespace-normal to explicitly allow wrapping
            isCompleted && "line-through text-muted-foreground"
          )}>
            {task.title}
          </h4>
          
          {/* 2. Tags (Priority, Project, Deadline) */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Priority Select */}
            <Select value={task.priority} onValueChange={handlePriorityChange} disabled={isCompleted}>
              <SelectTrigger 
                className={cn(
                  "h-auto text-[10px] px-1.5 py-0.5 rounded-full border-0 shadow-none transition-colors",
                  PRIORITY_CONFIG[task.priority].colorClass,
                  "hover:bg-opacity-30 w-fit"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <SelectValue>
                  <span className="flex items-center gap-1">
                    <PriorityIcon className="w-3 h-3" />
                    {!compact && <span>{priorityConfig.label}</span>}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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
            
            {/* Project Badge */}
            {project && (
              <Badge 
                className="shrink-0 text-[10px] px-1.5 py-0.5 border"
                style={getProjectBadgeStyles(project.color)}
              >
                {project.name}
              </Badge>
            )}

            {/* Deadline */}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              isOverdue ? "bg-destructive/20 text-destructive" : "bg-muted/50 text-muted-foreground"
            )}>
              {isOverdue ? 'Atrasada' : formattedDeadline}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <TaskDetailDialog 
      task={task} 
      project={project} 
      projects={projects} 
      onUpdateTask={handleUpdateTask} 
      onDeleteTask={handleDeleteTask}
    >
      {cardContent}
    </TaskDetailDialog>
  );
}