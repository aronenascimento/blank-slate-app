import { Project, Task } from '@/types';
import { ProjectCard } from './ProjectCard';
import { FolderKanban } from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onProjectClick?: (projectId: string) => void;
}

export function ProjectsView({ projects, tasks, onProjectClick }: ProjectsViewProps) {
  const activeProjects = projects.filter(p => p.status === 'Ativo');
  const pausedProjects = projects.filter(p => p.status === 'Pausado');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Active Projects */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Projetos Ativos</h2>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
            {activeProjects.length}
          </span>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {activeProjects.map((project, index) => (
            <div
              key={project.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProjectCard
                project={project}
                tasks={tasks}
                onClick={() => onProjectClick?.(project.id)}
              />
            </div>
          ))}
        </div>
      </section>
      
      {/* Paused Projects */}
      {pausedProjects.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-muted-foreground">Pausados</h2>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {pausedProjects.length}
            </span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 opacity-60">
            {pausedProjects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProjectCard
                  project={project}
                  tasks={tasks}
                  onClick={() => onProjectClick?.(project.id)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}