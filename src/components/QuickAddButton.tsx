import { useState } from 'react';
import { Plus, X, Flame, Skull, Zap, Circle, Sun, CloudSun, Moon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Project, Period, Priority } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';

interface QuickAddButtonProps {
  projects: Project[];
  onAddTask?: (task: {
    title: string;
    projectId: string;
    period: Period;
    priority: Priority;
    deadline: Date; // Adicionado deadline
  }) => void;
}

const priorityIcons: Record<Priority, React.ElementType> = {
  'Urgente': Flame,
  'Problemática': Skull,
  'Importante': Zap,
  'Padrão': Circle,
};

const periodIcons: Record<Period, React.ElementType> = {
  'Manhã': Sun,
  'Tarde': CloudSun,
  'Noite': Moon,
};

export function QuickAddButton({ projects, onAddTask }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [period, setPeriod] = useState<Period>('Manhã');
  const [priority, setPriority] = useState<Priority>('Padrão');
  const [deadline, setDeadline] = useState<Date>(new Date()); // Novo estado para a data

  const handleSubmit = () => {
    if (!title.trim() || !projectId || !deadline) return;
    
    onAddTask?.({
      title: title.trim(),
      projectId,
      period,
      priority,
      deadline, // Passando a data
    });
    
    setTitle('');
    setDeadline(new Date()); // Resetar para hoje
    setIsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Quick Add Form */}
      <div className={cn(
        "fixed bottom-24 right-6 z-50 w-80 rounded-xl border border-border bg-card shadow-lg p-4 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground">Nova Tarefa</h4>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <Input
            placeholder="Nome da tarefa..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
            className="bg-secondary border-border"
          />
          
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Deadline Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-secondary border-border",
                  !deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? (
                  format(deadline, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione o prazo</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          
          <div className="flex gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="bg-secondary border-border flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periodIcons).map(([key, Icon]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {key}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="bg-secondary border-border flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priorityIcons).map(([key, Icon]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" /> {key}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleSubmit} className="w-full" disabled={!title.trim() || !deadline}>
            Adicionar Tarefa
          </Button>
        </div>
      </div>
      
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg",
          "flex items-center justify-center transition-all duration-300",
          "hover:shadow-glow hover:scale-105",
          isOpen && "rotate-45 bg-muted text-muted-foreground"
        )}
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
}