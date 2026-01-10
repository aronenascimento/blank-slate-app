import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, Project, Status, Priority, Period, PRIORITY_CONFIG, STATUS_CONFIG, PERIOD_CONFIG } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { taskTitleSchema, taskDescriptionSchema } from '@/lib/schemas';

const taskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  projectId: z.string().min(1, { message: 'O projeto é obrigatório.' }),
  deadline: z.date(),
  period: z.custom<Period>(),
  priority: z.custom<Priority>(),
  status: z.custom<Status>(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDetailDialogProps {
  task: Task;
  project: Project | undefined;
  projects: Project[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  children: React.ReactNode;
}

export function TaskDetailDialog({ task, project, projects, onUpdateTask, onDeleteTask, children }: TaskDetailDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      projectId: task.projectId,
      deadline: new Date(task.deadline),
      period: task.period,
      priority: task.priority,
      status: task.status,
    },
  });

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description || '',
        projectId: task.projectId,
        deadline: new Date(task.deadline),
        period: task.period,
        priority: task.priority,
        status: task.status,
      });
    }
  }, [task, open, form]);

  const onSubmit = (values: TaskFormValues) => {
    onUpdateTask(task.id, {
      ...values,
      deadline: values.deadline, // Keep as Date object
    });
    setOpen(false);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja deletar a tarefa "${task.title}"?`)) {
      onDeleteTask(task.id);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes da Tarefa
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Prazo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Period */}
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PERIOD_CONFIG).map(([key, config]) => {
                          const Icon = Lucide[config.icon as keyof typeof Lucide] as React.ElementType;
                          const periodColorClass = key === 'Manhã' ? 'text-period-morning' : 
                                                   key === 'Tarde' ? 'text-period-afternoon' : 'text-period-night';
                          return (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                <Icon className={cn("w-4 h-4", periodColorClass)} /> {config.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}