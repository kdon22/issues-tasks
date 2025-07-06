// Teams Individual Item API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { teamsConfig } from '@/lib/api/configs/teams';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(teamsConfig);

export { GET, PUT, DELETE }; 