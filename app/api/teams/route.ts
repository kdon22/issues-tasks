// Teams API Route - Linear Clone (2 lines!)
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { teamsConfig } from '@/lib/api/configs/teams';

export const { GET, POST } = createCrudHandlers(teamsConfig); 