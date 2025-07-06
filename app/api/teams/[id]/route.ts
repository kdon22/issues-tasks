// Individual Team API Route - Linear Clone
import { createItemHandlers } from '@/lib/api/crud-factory';
import { teamsConfig } from '@/lib/api/configs/teams';

export const { GET, PUT, DELETE } = createItemHandlers(teamsConfig); 