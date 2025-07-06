// Issues Collection API - Using Workspace CRUD Factory
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { issuesConfig } from '@/lib/api/configs/issues';

const { GET, POST } = createWorkspaceCrudHandlers(issuesConfig);

export { GET, POST }; 