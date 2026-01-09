import { useState, useRef, useEffect } from 'react';
import { Task, Project, Status, Priority, Period, STATUS_CONFIG, PRIORITY_CONFIG, PERIOD_CONFIG } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getProjectBadgeStyles } from '@/lib/colorUtils';
import { CalendarIcon } from 'lucide-react';
import * as Lucide from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

interface NewTaskRowProps {
  projects: Project[];
  onAddTask: (task: { title: string; projectId: string; period: Period; priority: Priority; deadline: Date; }) => void;
}

interface NewTaskState {
  title: string;
  projectId: string;
  deadline: Date;
  period: Period;
  priority: Priority;
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

const periodVariants: Record<string, string> = {
  'Manhã': 'bg-period-morning/20 text-period-morning',
  'Tarde': 'bg-period-afternoon/20 text-period-afternoon',
  'Noite': 'bg-period-night/20 text-period-night',
};

const getInitialNewTaskState = (projects: Project[]): NewTaskState => ({
  title: '',
  projectId: projects.find(p => p.status === 'Ativo')?.id || projects[0]?.id || '',
  deadline: new Date(),
  period: 'Manhã' as Period,
  priority: 'Padrão' as Priority,
});

export function NewTaskRow({ projects, onAddTask }: NewTaskRowProps) {
  const [newTask, setNewTask] = useState<NewTaskState>(getInitialNewTaskState(projects));
  const [isCreating, setIsCreating] = useState(false);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  
  const projectMap = new Map(projects.map(p => [p.id, p]));
  const currentProject = projectMap.get(newTask.projectId);
  const periodConfig = PERIOD_CONFIG[newTask.period];
  const PeriodIcon = Lucide[periodConfig.icon as keyof typeof Lucide] as React.ElementType;
  const priorityConfig = PRIORITY_CONFIG[newTask.priority];
  const PriorityIcon = Lucide[priorityConfig.icon as keyof typeof Lucide] as React.ElementType;

  // Focus the input when the row is ready for creation
  useEffect(() => {
    if (isCreating && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [isCreating]);

  const handleNewTaskChange = (key: keyof NewTaskState, value: any) => {
    setNewTask(prev => ({ ...prev, [key]: value }));
    if (key !== 'title') {
      setIsCreating(true);
    }
  };
  
  const handleNewTaskSubmit = () => {
    if (newTask.title.trim() && newTask.projectId) {
      onAddTask({
        title: newTask.title.trim(),
        projectId: newTask.projectId,
        period: newTask.period,
        priority: newTask.priority,
        deadline: newTask.deadline,
      });
      
      // Reset state and prepare for the next task
      setNewTask(getInitialNewTaskState(projects));
      setIsCreating(true); // Keep creation mode active to allow immediate next entry
    } else if (isCreating) {
      // If user interacted but didn't provide title, just reset the state
      setIsCreating(false);
      setNewTask(getInitialNewTaskState(projects));
    }
  };
  
  if (projects.length === 0) {
    return (
      <tr className="border-b border-border/50">
        <td colSpan={6} className="py-3 px-4 text-center text-muted-foreground text-sm">
          Crie um projeto primeiro para adicionar tarefas.
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-card/50 hover:bg-card-hover transition-colors border-b border-border/50">
      {/* Título - Input */}
      <td className="py-3 px-4">
        <Input
          ref={newTaskInputRef}
          placeholder="Nova tarefa..."
          value={newTask.title}
          onChange={(e) => {
            // Update state without losing focus
            setNewTask(prev => ({ ...prev, title: e.target.value }));
            setIsCreating(true);
          }}
          onBlur={handleNewTaskSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleNewTaskSubmit();
            }
          }}
          className="h-7 text-sm bg-background border-border"
        />
      </td>
      
      {/* Projeto - select inline */}
      <td className="py-3 px-4">
        <Select 
          value={newTask.projectId} 
          onValueChange={(value) => handleNewTaskChange('projectId', value)}
        >
          <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
            {currentProject && (
              <Badge 
                className="text-[10px] cursor-pointer border" 
                style={getProjectBadgeStyles(currentProject.color)}
              >
                {currentProject.name}
              </Badge>
            )}
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>
                <Badge 
                  className="text-[10px] border" 
                  style={getProjectBadgeStyles(p.color)}
                >
                  {p.name}
                </Badge>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      
      {/* Prazo - calendário */}
      <td className="py-3 px-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className={cn(
              "text-sm flex items-center gap-1 hover:text-primary transition-colors cursor-pointer text-muted-foreground"
            )} onClick={() => setIsCreating(true)}>
              <CalendarIcon className="w-3 h-3" />
              {format(newTask.deadline, "dd/MM", { locale: ptBR })}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newTask.deadline}
              onSelect={(date) => {
                if (date) {
                  handleNewTaskChange('deadline', date);
                }
              }}
              className="pointer-events-auto"
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </td>
      
      {/* Período - select inline */}
      <td className="py-3 px-4">
        <Select 
          value={newTask.period} 
          onValueChange={(value) => handleNewTaskChange('period', value as Period)}
        >
          <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
            <span className={cn(
              "text-[10px] font-medium flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-md",
              periodVariants[newTask.period]
            )}>
              <PeriodIcon className="w-3 h-3" />
              {newTask.period}
            </span>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_CONFIG).map(([key, config]) => {
              const Icon = Lucide[config.icon as keyof typeof Lucide] as React.ElementType;
              return (
                <SelectItem key={key} value={key}>
                  <span className={cn(
                    "flex items-center gap-2 px-2 py-0.5 rounded-md",
                    periodVariants[key as Period]
                  )}>
                    <Icon className="w-4 h-4" /> {config.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </td>
      
      {/* Prioridade - select inline */}
      <td className="py-3 px-4">
        <Select 
          value={newTask.priority} 
          onValueChange={(value) => handleNewTaskChange('priority', value as Priority)}
        >
          <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
            <Badge variant={priorityVariants[newTask.priority]} className="text-[10px] flex items-center gap-1 cursor-pointer">
              <PriorityIcon className="w-3 h-3" /> {priorityConfig.label}
            </Badge>
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
      </td>
      
      {/* Status (Fixed) */}
      <td className="py-3 px-4">
        <Badge variant={statusVariants['BACKLOG']} className="text-[10px]">
          {STATUS_CONFIG['BACKLOG'].label}
        </Badge>
      </td>
    </tr>
  );
}