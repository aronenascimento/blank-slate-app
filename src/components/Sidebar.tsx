import { LayoutGrid, FolderKanban, Calendar, Kanban, Settings, LogOut, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserSettingsDialog } from './UserSettingsDialog';
import { useSession } from './SessionContextProvider';

interface SidebarProps {
  overdueCount: number;
}

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Início' },
  { to: '/kanban', icon: Kanban, label: 'Kanban' },
  { to: '/projects', icon: FolderKanban, label: 'Projetos' },
  { to: '/backlog', icon: Calendar, label: 'Backlog' },
];

export function Sidebar({ overdueCount }: SidebarProps) {
  const { user } = useSession();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    } else {
      // The SessionContextProvider handles the toast.info('Sessão encerrada.')
    }
  };

  return (
    <div className="fixed top-0 left-0 h-full w-[240px] border-r border-border bg-sidebar p-4 flex flex-col z-40">
      {/* Logo/Title Area */}
      <div className="mb-8 pt-2">
        <h2 className="text-xl font-bold text-sidebar-foreground">
          P-<span className="text-gradient">flow</span>
        </h2>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col space-y-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center p-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors relative"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
            {to === '/' && overdueCount > 0 && (
              <span className="absolute right-3 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {overdueCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* User Settings and Logout */}
      <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
        {/* User Profile/Settings Dialog Trigger */}
        <UserSettingsDialog>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <User className="w-5 h-5 mr-3" />
            {user?.email || 'Configurações'}
          </Button>
        </UserSettingsDialog>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start p-3 text-sm font-medium text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );
}