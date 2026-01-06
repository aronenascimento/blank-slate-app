import { Task, Project, Status, STATUS_CONFIG, Priority } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { LayoutGrid } from 'lucide-react';

interface KanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange: (taskId: string, status: Status) => void;
  onTaskPriorityChange: (taskId: string, newPriority: Priority) => void;
}

export function KanbanView({ tasks, projects, onTaskStatusChange, onTaskPriorityChange }: KanbanViewProps) {
  const statusOrder: Status[] = ['BACKLOG', 'A FAZER', 'FAZENDO', 'EM APROVAÇÃO', 'TRAVADO', 'FEITO'];

  const getTasksByStatus = (status: Status) => {
    return tasks.filter(task => task.status === status && !task.isArchived);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Kanban Geral</h1>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex space-x-4 pb-4">
          {statusOrder.map((status, index) => (
            <div 
              key={status} 
              className="w-[240px] shrink-0"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <KanbanColumn
                status={status}
                tasks={getTasksByStatus(status)}
                projects={projects}
                onTaskStatusChange={onTaskStatusChange}
                onTaskPriorityChange={onTaskPriorityChange}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}