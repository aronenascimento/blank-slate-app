import { useAppData } from '@/components/MainLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ListTodo, Plus, Pause, Play, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { getProjectAccentStyle } from '@/lib/colorUtils'; // Importado
import { ProjectDetailDialog } from '@/components/ProjectDetailDialog';

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { 
    projects, 
    tasks, 
    handleTaskStatusChange, 
    handleTaskPriorityChange, 
    handleToggleProjectStatus,
    handleUpdateProject,
    handleDeleteProject,
  } = useAppData();
  const navigate = useNavigate();

  const project = projects.find(p => p.id === projectId);
  
  // Filter tasks for this project, sorted by deadline and priority
  // Tasks are already filtered for !isArchived by useSupabaseData
  const projectTasks = tasks
    .filter(t => t.projectId === projectId)
    .sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      if (dateA !== dateB) return dateA - dateB;
      
      const priorityOrder = { 'Urgente': 0, 'Problemática': 1, 'Importante': 2, 'Padrão': 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  if (!project) {
    return <div className="text-center py-12 text-muted-foreground">Projeto não encontrado.</div>;
  }
  
  // Use utility function for color style
  const accentStyle = getProjectAccentStyle(project.color);
    
  const pendingTasks = projectTasks.filter(t => t.status !== 'FEITO').length;
  const isActive = project.status === 'Ativo';

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Projetos
      </Button>
      
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div 
          className="w-2 h-8 rounded-full shrink-0"
          style={accentStyle} // Usando o estilo do utilitário
        />
        <div>
          <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pendingTasks} tarefa{pendingTasks !== 1 ? 's' : ''} pendente{pendingTasks !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="ml-auto flex gap-2">
          {/* Botão de Editar Projeto (Abre o ProjectDetailDialog) */}
          <ProjectDetailDialog
            project={project}
            onUpdateProject={handleUpdateProject}
            onToggleStatus={handleToggleProjectStatus}
            onDeleteProject={(id) => {
              handleDeleteProject(id);
              navigate('/projects'); // Redireciona após deletar
            }}
          >
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar Projeto
            </Button>
          </ProjectDetailDialog>
          
          {/* Botão de Pausar/Ativar Projeto */}
          <Button 
            variant={isActive ? "outline" : "default"} 
            onClick={() => handleToggleProjectStatus(project.id)}
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
          
          <Button variant="outline" size="default">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tarefa
          </Button>
        </div>
      </div>
      
      {projectTasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed p-8">
          <ListTodo className="w-8 h-8 mx-auto mb-3" />
          <p>Nenhuma tarefa encontrada para este projeto.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projectTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                project={project}
                onStatusChange={handleTaskStatusChange}
                onPriorityChange={handleTaskPriorityChange}
                compact={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;