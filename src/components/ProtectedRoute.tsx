import { useSession } from './SessionContextProvider';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando autenticação...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;