// Individual Project API Route - Linear Clone (2 lines!)
import { createItemHandlers } from '@/lib/api/crud-factory';
import { projectsConfig } from '@/lib/api/configs/projects';

export const { GET, PUT, DELETE } = createItemHandlers(projectsConfig); 