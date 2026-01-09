import { useState, useRef, useEffect } from 'react';
import { Task, Project, Status, Priority, Period, STATUS_CONFIG, PRIORITY_CONFIG, PERIOD_CONFIG } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getProjectBadgeStyles } from '@/lib/colorUtils';
import { Filter, CalendarIcon } from 'lucide-react';
import * as Lucide from 'lucide-react';
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BacklogViewProps {
  tasks: Task[];
  projects: Project[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onAddTask: (task: { title: string; projectId: string; period: Period; priority: Priority; deadline: Date; }) => void;
}

interface NewTaskState {
  title: string;
  projectId: string;
  deadline: Date;
  period: Period;
  priority: Priority;
}

const getInitialNewTaskState = (projects: Project[]): NewTaskState => ({
  title: '',
  // Tries to default to an active project, otherwise the first one, or empty string
  projectId: projects.find(p => p.status === 'Ativo')?.id || projects[0]?.id || '',
  deadline: new Date(),
  period: 'Manhã' as Period,
  priority: 'Padrão' as Priority,
});

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

export function BacklogView({ tasks, projects, onUpdateTask, onAddTask }: BacklogViewProps) {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState<string>('');
  
  // State for the inline creation row
  const [newTask, setNewTask] = useState<NewTaskState>(getInitialNewTaskState(projects));
  const [isCreating, setIsCreating] = useState(false); // Tracks if the user has interacted with the new row
  const newTaskInputRef = useRef<HTMLInputElement>(null); // Ref para focar o input

  const projectMap = new Map(projects.map(p => [p.id, p]));

  // Backlog view only shows tasks with BACKLOG status
  const backlogTasks = tasks.filter(task => task.status === 'BACKLOG' && !task.isArchived);

  const filteredTasks = backlogTasks.filter(task => {
    if (filterProject !== 'all' && task.projectId !== filterProject) return false;
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
  
  // --- New Task Logic ---
  
  // Focus the new task input whenever the component renders and we are in creation mode
  useEffect(() => {
    if (isCreating && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [isCreating]);
  
  const handleNewTaskChange = (key: keyof NewTaskState, value: any) => {
    setNewTask(prev => ({ ...prev, [key]: value }));
    // Only set isCreating to true if the user interacts with a field other than title
    // Interaction with title is handled by the input itself
    if (key !== 'title') {
      setIsCreating(true);
    }
  };
  
  const handleNewTaskSubmit = () => {
    // Only submit if there is a title and a project selected
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
      setIsCreating(false);
    } else if (isCreating) {
      // If user interacted but didn't provide title, just reset the state
      setIsCreating(false);
      setNewTask(getInitialNewTaskState(projects));
    }
  };
  
  const NewTaskRow = () => {
    const currentProject = projectMap.get(newTask.projectId);
    const periodConfig = PERIOD_CONFIG[newTask.period];
    const PeriodIcon = Lucide[periodConfig.icon as keyof typeof Lucide] as React.ElementType;
    const priorityConfig = PRIORITY_CONFIG[newTask.priority];
    const PriorityIcon = Lucide[priorityConfig.icon as keyof typeof Lucide] as React.ElementType;
    
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
                e.preventDefault(); // Prevent default form submission if applicable
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
                    {/* Título - edição inline */}
                    <td className="py-3 px-4">
                      {editingTitle === task.id ? (
                        <Input
                          value={titleValue}
                          onChange={(e) => setTitleValue(e.target.value)}
                          onBlur={() => {
                            if (titleValue.trim() && titleValue !== task.title) {
                              onUpdateTask(task.id, { title: titleValue.trim() });
                            }
                            setEditingTitle(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (titleValue.trim() && titleValue !== task.title) {
                                onUpdateTask(task.id, { title: titleValue.trim() });
                              }
                              setEditingTitle(null);
                            }
                            if (e.key === 'Escape') setEditingTitle(null);
                          }}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={cn(
                            "font-medium text-sm cursor-pointer hover:text-primary transition-colors",
                            task.status === 'FEITO' && "line-through text-muted-foreground"
                          )}
                          onClick={() => {
                            setEditingTitle(task.id);
                            setTitleValue(task.title);
                          }}
                        >
                          {task.title}
                        </span>
                      )}
                    </td>
                    
                    {/* Projeto - select inline */}
                    <td className="py-3 px-4">
                      <Select 
                        value={task.projectId} 
                        onValueChange={(value) => onUpdateTask(task.id, { projectId: value })}
                      >
                        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
                          {project && (
                            <Badge 
                              className="text-[10px] cursor-pointer border" 
                              style={getProjectBadgeStyles(project.color)}
                            >
                              {project.name}
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
                            "text-sm flex items-center gap-1 hover:text-primary transition-colors cursor-pointer",
                            isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                          )}>
                            <CalendarIcon className="w-3 h-3" />
                            {format(new Date(task.deadline), "dd/MM", { locale: ptBR })}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(task.deadline)}
                            onSelect={(date) => {
                              if (date) {
                                onUpdateTask(task.id, { deadline: date });
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
                        value={task.period} 
                        onValueChange={(value) => onUpdateTask(task.id, { period: value as Period })}
                      >
                        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
                          <span className={cn(
                            "text-[10px] font-medium flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded-md",
                            periodVariants[task.period]
                          )}>
                            <PeriodIcon className="w-3 h-3" />
                            {task.period}
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
                        value={task.priority} 
                        onValueChange={(value) => onUpdateTask(task.id, { priority: value as Priority })}
                      >
                        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
                          <Badge variant={priorityVariants[task.priority]} className="text-[10px] flex items-center gap-1 cursor-pointer">
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
                    
                    {/* Status - select inline */}
                    <td className="py-3 px-4">
                      <Select 
                        value={task.status} 
                        onValueChange={(value) => onUpdateTask(task.id, { status: value as Status })}
                      >
                        <SelectTrigger className="w-auto h-7 text-xs border-0 bg-transparent p-0 hover:bg-secondary/50 rounded">
                          <Badge variant={statusVariants[task.status]} className="text-[10px] cursor-pointer">
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
              
              {/* New Task Row */}
              <NewTaskRow />
            </tbody>
          </table>
        </div>
        
        {sortedTasks.length === 0 && !isCreating && projects.length > 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Nenhuma tarefa encontrada com os filtros selecionados
          </div>
        )}
      </div>
    </div>
  );
}