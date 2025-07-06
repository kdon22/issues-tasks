// Individual Custom Field API Route - Linear Clone (2 lines!)
import { createItemHandlers } from '@/lib/api/crud-factory';
import { customFieldsConfig } from '@/lib/api/configs/custom-fields';

export const { GET, PUT, DELETE } = createItemHandlers(customFieldsConfig); 