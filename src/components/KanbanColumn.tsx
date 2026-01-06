import { Task, Project, Status, STATUS_CONFIG, Priority } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import * as Lucide from 'lucide-react';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange: (taskId: string, status: Status) => void;
  onTaskPriorityChange: (taskId: string, newPriority: Priority) => void;
}

export function KanbanColumn({ status, tasks, projects, onTaskStatusChange, onTaskPriorityChange }: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];
  const projectMap = new Map(projects.map(p => [p.id, p]));
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskStatusChange(taskId, status);
    }
    e.currentTarget.classList.remove('ring-2', 'ring-primary/50', 'ring-offset-2', 'ring-offset-background');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('ring-2', 'ring-primary/50', 'ring-offset-2', 'ring-offset-background');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary/50', 'ring-offset-2', 'ring-offset-background');
  };

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl border border-border p-3 min-h-[400px] transition-shadow duration-200",
        "bg-secondary/50"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold text-foreground">{config.label}</h3>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          config.colorClass
        )}>
          {tasks.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground/60">Nenhuma tarefa nesta coluna</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 20}ms` }}
            >
              <TaskCard
                task={task}
                project={projectMap.get(task.projectId)}
                onStatusChange={onTaskStatusChange}
                onPriorityChange={onTaskPriorityChange}
                compact={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}