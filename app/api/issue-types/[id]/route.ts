// Individual Issue Type API Route - Linear Clone
import { createItemHandlers } from '@/lib/api/crud-factory';
import { issueTypesConfig } from '@/lib/api/configs/issue-types';

export const { GET, PUT, DELETE } = createItemHandlers(issueTypesConfig); 