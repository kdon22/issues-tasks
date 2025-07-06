// Members API Route - Linear Clone
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { membersConfig } from '@/lib/api/configs/members';

export const { GET, POST } = createCrudHandlers(membersConfig); 