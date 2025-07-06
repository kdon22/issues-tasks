// Individual Field Configuration API Route - Linear Clone (2 lines!)
import { createItemHandlers } from '@/lib/api/crud-factory';
import { fieldConfigurationsConfig } from '@/lib/api/configs/field-configurations';

export const { GET, PUT, DELETE } = createItemHandlers(fieldConfigurationsConfig); 