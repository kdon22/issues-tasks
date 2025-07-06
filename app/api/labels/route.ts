// Labels API Route - Linear Clone (2 lines!)
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { labelsConfig } from '@/lib/api/configs/labels';

export const { GET, POST } = createCrudHandlers(labelsConfig); 