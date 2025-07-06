// Issue Types API Route - Linear Clone
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { issueTypesConfig } from '@/lib/api/configs/issue-types';

export const { GET, POST } = createCrudHandlers(issueTypesConfig); 