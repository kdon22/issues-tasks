// Members Individual Item API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { membersConfig } from '@/lib/api/configs/members';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(membersConfig);

export { GET, PUT, DELETE }; 