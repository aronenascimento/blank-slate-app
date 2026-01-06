import { Task, Project, Period, Priority } from '@/types';
import { PeriodColumn } from './PeriodColumn';
import { OverdueAlert } from './OverdueAlert';
import { TaskListSection } from './TaskListSection';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskStatusChange: (taskId: string, status: Task['status']) => void;
  onTaskPeriodChange: (taskId: string, newPeriod: Period) => void;
  onTaskPriorityChange: (taskId: string, newPriority: Priority) => void;
}

export function DashboardView({ tasks, projects, onTaskStatusChange, onTaskPeriodChange, onTaskPriorityChange }: DashboardViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  
  const periods: Period[] = ['Manhã', 'Tarde', 'Noite'];

  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today && task.status !== 'FEITO' && !task.isArchived;
  });
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    // Show tasks scheduled for today OR tasks currently being done (FAZENDO)
    return (taskDate.getTime() === today.getTime() || task.status === 'FAZENDO') && !task.isArchived;
  });

  const tomorrowTasks = tasks.filter(task => {
    const taskDate = new Date(task.deadline);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === tomorrowDate.getTime() && task.status !== 'FEITO' && !task.isArchived;
  });

  const getTasksByPeriod = (period: Period) => {
    return todayTasks.filter(task => task.period === period);
  };

  // Handle drag drop logic
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetPeriod: Period) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onTaskPeriodChange(taskId, targetPeriod);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overdue Alert (Detailed List) */}
      {overdueTasks.length > 0 && (
        <OverdueAlert 
          tasks={overdueTasks} 
          projects={projects}
          onTaskStatusChange={onTaskStatusChange}
          onTaskPriorityChange={onTaskPriorityChange}
        />
      )}
      
      {/* Today's Tasks - Period Columns */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Tarefas de Hoje
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {periods.map((period, index) => (
            <div
              key={period}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onDrop={(e) => handleDrop(e, period)}
              onDragOver={handleDragOver}
            >
              <PeriodColumn
                period={period}
                tasks={getTasksByPeriod(period)}
                projects={projects}
                onTaskStatusChange={onTaskStatusChange}
                onTaskPriorityChange={onTaskPriorityChange}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Tomorrow Preview (Detailed List) */}
      <section>
        <TaskListSection
          title="Tarefas de Amanhã"
          icon={Calendar}
          tasks={tomorrowTasks}
          projects={projects}
          onTaskStatusChange={onTaskStatusChange}
          onTaskPriorityChange={onTaskPriorityChange}
        />
      </section>
    </div>
  );
}