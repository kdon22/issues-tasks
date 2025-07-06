// Field Configurations API Route - Linear Clone (2 lines!)
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { fieldConfigurationsConfig } from '@/lib/api/configs/field-configurations';

export const { GET, POST } = createCrudHandlers(fieldConfigurationsConfig); 