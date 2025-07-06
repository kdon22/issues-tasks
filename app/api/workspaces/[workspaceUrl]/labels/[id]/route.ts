// Labels Individual Item API - Using Workspace CRUD Factory
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { labelsConfig } from '@/lib/api/configs/labels';

const { GET, PUT, DELETE } = createWorkspaceItemHandlers(labelsConfig);

export { GET, PUT, DELETE }; 