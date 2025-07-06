// Individual StatusFlow API endpoints for workspace-scoped operations
import { createWorkspaceItemHandlers } from '@/lib/api/workspace-crud-factory';
import { statusFlowsConfig } from '@/lib/api/configs/status-flows';

export const { GET, PUT, DELETE } = createWorkspaceItemHandlers(statusFlowsConfig); 