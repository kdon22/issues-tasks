// Workspace Labels API - Linear Clone
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { labelsConfig } from '@/lib/api/configs/labels';

const { GET, POST } = createWorkspaceCrudHandlers(labelsConfig);

export { GET, POST }; 