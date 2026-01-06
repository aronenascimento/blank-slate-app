import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Palette } from 'lucide-react';
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
import { ProjectColor } from '@/types';
import { cn } from '@/lib/utils';

// Regex para validar código hexadecimal de cor (ex: #RRGGBB)
const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;

const projectSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  color: z.string().regex(hexColorRegex, { message: 'Cor deve ser um código hexadecimal válido (ex: #1a2b3c).' }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface NewProjectDialogProps {
  onAddProject: (project: { name: string; color: ProjectColor }) => void;
}

export function NewProjectDialog({ onAddProject }: NewProjectDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      color: '#2b6cb0', // Default blue color
    },
  });

  const onSubmit = (values: ProjectFormValues) => {
    // values is guaranteed to have name and color due to Zod validation
    // We assert the type here to satisfy the strict requirements of onAddProject
    onAddProject(values as { name: string; color: ProjectColor });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Criar Novo Projeto
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
                    <Input placeholder="Ex: Website da Empresa" {...field} />
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
            
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={!form.formState.isValid}>
                Criar Projeto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}