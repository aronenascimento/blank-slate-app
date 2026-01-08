-- Criação da tabela projects
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    status text NOT NULL DEFAULT 'Ativo',
    color text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criação da tabela tasks
CREATE TABLE tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    deadline date NOT NULL,
    period text NOT NULL DEFAULT 'Manhã',
    priority text NOT NULL DEFAULT 'Padrão',
    status text NOT NULL DEFAULT 'A FAZER',
    is_archived boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para otimização de consultas
CREATE INDEX idx_tasks_project_id ON tasks (project_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_deadline ON tasks (deadline);

-- Configuração de RLS (Row Level Security)
-- Por enquanto, vamos permitir acesso total para simplificar o desenvolvimento inicial.
-- Em um ambiente de produção, você deve restringir isso ao usuário autenticado.

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);