// Issues Individual Item API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { issuesConfig } from '@/lib/api/configs/issues';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(issuesConfig);

export { GET, PUT, DELETE }; 