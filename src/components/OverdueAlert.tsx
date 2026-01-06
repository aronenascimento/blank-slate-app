import { Task, Project, Priority } from '@/types';
import { TaskCard } from './TaskCard';
import { AlertTriangle } from 'lucide-react';

interface OverdueAlertProps {
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange?: (taskId: string, status: Task['status']) => void;
  onTaskPriorityChange?: (taskId: string, newPriority: Priority) => void;
}

export function OverdueAlert({ tasks, projects, onTaskStatusChange, onTaskPriorityChange }: OverdueAlertProps) {
  if (tasks.length === 0) return null;

  const projectMap = new Map(projects.map(p => [p.id, p]));

  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="font-semibold text-destructive">Tarefas Atrasadas</h3>
        <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      {/* Alterado para grid de 2 colunas em telas médias e 3 em telas grandes */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task, index) => (
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
        ))}
      </div>
    </div>
  );
}