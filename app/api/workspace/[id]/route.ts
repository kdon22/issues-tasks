// Individual Workspace API Route - Linear Clone
import { createItemHandlers } from '@/lib/api/crud-factory';
import { workspaceConfig } from '@/lib/api/configs/workspace';

export const { GET, PUT, DELETE } = createItemHandlers(workspaceConfig); 