// Individual Issue API Route - Linear Clone (2 lines!)
import { createItemHandlers } from '@/lib/api/crud-factory';
import { issuesConfig } from '@/lib/api/configs/issues';

export const { GET, PUT, DELETE } = createItemHandlers(issuesConfig); 