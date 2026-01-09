import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { User, Save, LogOut, Settings } from 'lucide-react';
import { useSession } from './SessionContextProvider';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const profileSchema = z.object({
  first_name: z.string().min(1, { message: 'Nome é obrigatório.' }),
  last_name: z.string().min(1, { message: 'Sobrenome é obrigatório.' }),
  // avatar_url: z.string().url().optional().or(z.literal('')), // Skipping avatar for simplicity
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserSettingsDialogProps {
  children: React.ReactNode;
}

export function UserSettingsDialog({ children }: UserSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const { profile, handleUpdateProfile } = useSupabaseData();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.firstName || '',
      last_name: profile?.lastName || '',
    },
  });

  // Reset form when profile data changes or dialog opens
  useEffect(() => {
    if (open && profile) {
      form.reset({
        first_name: profile.firstName || '',
        last_name: profile.lastName || '',
      });
    }
  }, [profile, open, form]);

  const onSubmit = (values: ProfileFormValues) => {
    if (user) {
      handleUpdateProfile({
        firstName: values.first_name,
        lastName: values.last_name,
      });
      setOpen(false);
    }
  };
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Configurações do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={!form.formState.isValid}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Perfil
                </Button>
              </DialogFooter>
            </form>
          </Form>
          
          <div className="border-t border-border pt-4">
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}