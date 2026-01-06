import { Project, Task } from '@/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getProjectAccentStyle } from '@/lib/colorUtils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ProjectDetailDialog } from './ProjectDetailDialog';
import { useAppData } from './MainLayout';

interface ProjectCardProps {
  project: Project;
  tasks: Task[];
  onClick?: () => void;
}

export function ProjectCard({ project, tasks, onClick }: ProjectCardProps) {
  const { handleUpdateProject, handleToggleProjectStatus } = useAppData();
  
  const projectTasks = tasks.filter(t => t.projectId === project.id && !t.isArchived);
  const completedTasks = projectTasks.filter(t => t.status === 'FEITO').length;
  const totalTasks = projectTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const inProgressCount = projectTasks.filter(t => t.status === 'FAZENDO').length;

  const cardContent = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer",
        "transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        "hover:-translate-y-1"
      )}
    >
      <AspectRatio ratio={1 / 1} className="p-5">
        {/* Color accent */}
        <div 
          className="absolute top-0 left-0 w-1 h-full"
          style={getProjectAccentStyle(project.color)}
        />
        
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
                project.status === 'Ativo' 
                  ? "bg-status-doing/20 text-status-doing" 
                  : "bg-muted text-muted-foreground"
              )}>
                {project.status}
              </span>
            </div>
            
            <div className="text-right">
              <span className="text-2xl font-bold text-foreground">{totalTasks}</span>
              <p className="text-xs text-muted-foreground">tarefas</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-auto">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedTasks} concluídas</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          
          {inProgressCount > 0 && (
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-status-doing animate-pulse" />
              <span className="text-xs text-status-doing">
                {inProgressCount} em andamento
              </span>
            </div>
          )}
        </div>
      </AspectRatio>
    </div>
  );
  
  // If onClick is provided (e.g., in ProjectsView), use it for navigation.
  // If not, wrap it in the dialog for editing.
  if (onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  return (
    <ProjectDetailDialog 
      project={project} 
      onUpdateProject={handleUpdateProject}
      onToggleStatus={handleToggleProjectStatus}
    >
      {cardContent}
    </ProjectDetailDialog>
  );
}
