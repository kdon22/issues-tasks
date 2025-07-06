// Individual Status Flow API Route - Linear Clone
import { createItemHandlers } from '@/lib/api/crud-factory';
import { statusFlowsConfig } from '@/lib/api/configs/status-flows';

export const { GET, PUT, DELETE } = createItemHandlers(statusFlowsConfig); 