// Individual Label API Route - Linear Clone (2 lines!)
import { createItemHandlers } from '@/lib/api/crud-factory';
import { labelsConfig } from '@/lib/api/configs/labels';

export const { GET, PUT, DELETE } = createItemHandlers(labelsConfig); 