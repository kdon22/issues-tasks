// Projects Collection API - Using Workspace CRUD Factory
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { projectsConfig } from '@/lib/api/configs/projects';

const { GET, POST } = createWorkspaceCrudHandlers(projectsConfig);

export { GET, POST }; 