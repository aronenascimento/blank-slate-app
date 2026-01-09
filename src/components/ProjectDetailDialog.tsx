import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Project, ProjectColor } from '@/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Palette, Save, X, Pause, Play, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Regex para validar código hexadecimal de cor (ex: #RRGGBB)
const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;

const projectSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  color: z.string().regex(hexColorRegex, { message: 'Cor deve ser um código hexadecimal válido (ex: #1a2b3c).' }),
  status: z.enum(['Ativo', 'Pausado']),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectDetailDialogProps {
  project: Project;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onToggleStatus: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void; // Adicionado
  children: React.ReactNode;
}

export function ProjectDetailDialog({ project, onUpdateProject, onToggleStatus, onDeleteProject, children }: ProjectDetailDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      color: project.color.startsWith('#') ? project.color : '#2b6cb0', // Use default if mock color is not hex
      status: project.status,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name,
        color: project.color.startsWith('#') ? project.color : '#2b6cb0',
        status: project.status,
      });
    }
  }, [project, open, form]);

  const onSubmit = (values: ProjectFormValues) => {
    onUpdateProject(project.id, values);
    setOpen(false);
  };
  
  const handleToggle = () => {
    onToggleStatus(project.id);
    // Close dialog if status changes
    setOpen(false);
  };
  
  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja deletar o projeto "${project.name}"? Todas as tarefas associadas serão perdidas.`)) {
      onDeleteProject(project.id);
      setOpen(false);
    }
  };

  const isActive = project.status === 'Ativo';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Detalhes do Projeto
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor de Destaque (Hex)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-10 h-10 rounded-full border-none cursor-pointer p-0 overflow-hidden"
                        style={{ backgroundColor: field.value }}
                      />
                      <Input 
                        placeholder="#1a2b3c" 
                        {...field} 
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm font-medium text-muted-foreground">
                Status Atual: <span className={cn(
                  "font-semibold",
                  isActive ? "text-status-doing" : "text-muted-foreground"
                )}>{project.status}</span>
              </span>
              <Button 
                type="button"
                variant={isActive ? "outline" : "default"} 
                onClick={handleToggle}
              >
                {isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Projeto
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Ativar Projeto
                  </>
                )}
              </Button>
            </div>

            <DialogFooter className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Projeto
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