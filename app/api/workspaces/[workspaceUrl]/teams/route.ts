// Teams Collection API - Using Workspace CRUD Factory
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { teamsConfig } from '@/lib/api/configs/teams';

const { GET, POST } = createWorkspaceCrudHandlers(teamsConfig);

export { GET, POST }; 