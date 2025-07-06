// Issue Types Individual Item API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { issueTypesConfig } from '@/lib/api/configs/issue-types';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(issueTypesConfig);

export { GET, PUT, DELETE }; 