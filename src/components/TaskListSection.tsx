import { Task, Project, Status, Priority } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { ListTodo } from 'lucide-react';

interface TaskListSectionProps {
  title: string;
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange?: (taskId: string, status: Status) => void;
  onTaskPriorityChange?: (taskId: string, newPriority: Priority) => void;
  icon: React.ElementType;
  className?: string;
}

export function TaskListSection({ 
  title, 
  tasks, 
  projects, 
  onTaskStatusChange, 
  onTaskPriorityChange, 
  icon: Icon,
  className
}: TaskListSectionProps) {
  const projectMap = new Map(projects.map(p => [p.id, p]));

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <span>{title}</span>
        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </h3>
      
      {/* Alterado para grid de 2 colunas em telas médias */}
      <div className="grid gap-3 sm:grid-cols-2">
        {tasks.length === 0 ? (
          <div className="text-sm text-muted-foreground/60 border border-dashed rounded-lg p-4 text-center col-span-full">
            <ListTodo className="w-5 h-5 mx-auto mb-1" />
            Nenhuma tarefa aqui.
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
                compact={true}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}