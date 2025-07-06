// Custom Fields API Route - Linear Clone (2 lines!)
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { customFieldsConfig } from '@/lib/api/configs/custom-fields';

export const { GET, POST } = createCrudHandlers(customFieldsConfig); 