// Projects API Route - Linear Clone (2 lines!)
import { createCrudHandlers } from '@/lib/api/crud-factory';
import { projectsConfig } from '@/lib/api/configs/projects';

export const { GET, POST } = createCrudHandlers(projectsConfig); 