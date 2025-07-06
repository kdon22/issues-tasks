// Issue Types Collection API - Using Workspace CRUD Factory
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { issueTypesConfig } from '@/lib/api/configs/issue-types';

const { GET, POST } = createWorkspaceCrudHandlers(issueTypesConfig);

export { GET, POST }; 