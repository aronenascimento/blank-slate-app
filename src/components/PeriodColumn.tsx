import { Task, Project, Period, PERIOD_CONFIG, Status, Priority } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';
import React from 'react';

interface PeriodColumnProps {
  period: Period;
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange?: (taskId: string, status: Status) => void;
  onTaskPriorityChange?: (taskId: string, newPriority: Priority) => void;
}

export function PeriodColumn({ period, tasks, projects, onTaskStatusChange, onTaskPriorityChange }: PeriodColumnProps) {
  const config = PERIOD_CONFIG[period];
  const projectMap = new Map(projects.map(p => [p.id, p]));
  
  const Icon = Lucide[config.icon as keyof typeof Lucide] as React.ElementType;

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('ring-2', 'ring-primary/50', 'ring-offset-2', 'ring-offset-background');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary/50', 'ring-offset-2', 'ring-offset-background');
  };
  
  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl border p-4 min-h-[300px] transition-shadow duration-200",
        config.gradient
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-foreground" />
        <h3 className="font-semibold text-foreground">{config.label}</h3>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      {/* Alterado para grid de 2 colunas em telas médias e maiores */}
      <div className="grid gap-2 flex-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center col-span-full">
            <p className="text-sm text-muted-foreground/60">Arraste tarefas para cá</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                project={projectMap.get(task.projectId)}
                onStatusChange={onTaskStatusChange}
                onPriorityChange={onTaskPriorityChange}
                compact={true} // Garantindo modo compacto
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}