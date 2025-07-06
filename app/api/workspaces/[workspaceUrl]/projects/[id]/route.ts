// Individual Project API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { projectsConfig } from '@/lib/api/configs/projects';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(projectsConfig);

export { GET, PUT, DELETE }; 