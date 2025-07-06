// Individual Member API Route - Linear Clone
import { createItemHandlers } from '@/lib/api/crud-factory';
import { membersConfig } from '@/lib/api/configs/members';

export const { GET, PUT, DELETE } = createItemHandlers(membersConfig); 