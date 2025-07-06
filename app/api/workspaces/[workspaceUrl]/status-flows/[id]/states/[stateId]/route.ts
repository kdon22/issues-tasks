// Individual State API Route - Linear Clone
import { createStatusFlowItemHandlers } from '@/lib/api/status-flow-crud-factory';
import { statesConfig } from '@/lib/api/configs/states';

export const { GET, PUT, DELETE } = createStatusFlowItemHandlers(statesConfig); 