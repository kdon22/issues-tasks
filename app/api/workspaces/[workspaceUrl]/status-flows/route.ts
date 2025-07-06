// StatusFlow API endpoints for workspace-scoped operations
import { createWorkspaceCrudHandlers } from '@/lib/api/workspace-crud-factory';
import { statusFlowsConfig } from '@/lib/api/configs/status-flows';

export const { GET, POST } = createWorkspaceCrudHandlers(statusFlowsConfig); 