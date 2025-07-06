// Status Flows API Route - Linear Clone
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { statusFlowsConfig } from '@/lib/api/configs/status-flows';

export const { GET, POST } = createCrudHandlers(statusFlowsConfig); 