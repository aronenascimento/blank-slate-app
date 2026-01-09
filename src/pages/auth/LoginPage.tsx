import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
  const { session, isLoading } = useSession();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-foreground">Carregando...</div>;
  }

  if (session) {
    // Redirect authenticated users to the main dashboard
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl border border-border bg-card shadow-lg">
        <h1 className="text-2xl font-bold text-center text-foreground">TaskFlow</h1>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary) / 0.8)',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary) / 0.8)',
                  inputBackground: 'hsl(var(--input))',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--ring))',
                  inputPlaceholder: 'hsl(var(--muted-foreground))',
                  defaultButtonText: 'hsl(var(--secondary-foreground))',
                },
              },
            },
          }}
          theme="dark"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default LoginPage;