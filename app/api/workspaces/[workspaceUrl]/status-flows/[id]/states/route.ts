// States API Route - Linear Clone
import { createStatusFlowCrudHandlers } from '@/lib/api/status-flow-crud-factory';
import { statesConfig } from '@/lib/api/configs/states';

export const { GET, POST } = createStatusFlowCrudHandlers(statesConfig); 