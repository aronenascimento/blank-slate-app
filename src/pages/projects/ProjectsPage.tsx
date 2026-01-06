import { ProjectsView } from '@/components/ProjectsView';
import { useAppData } from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { NewProjectDialog } from '@/components/NewProjectDialog';
import { Plus } from 'lucide-react';

const ProjectsPage = () => {
  const { tasks, projects, handleAddProject } = useAppData();
  const navigate = useNavigate();
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus Projetos</h1>
        <NewProjectDialog onAddProject={handleAddProject} />
      </div>
      
      <ProjectsView 
        projects={projects}
        tasks={tasks}
        onProjectClick={handleProjectClick}
      />
    </div>
  );
};

export default ProjectsPage;