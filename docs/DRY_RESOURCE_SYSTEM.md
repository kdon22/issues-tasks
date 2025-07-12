# DRY Resource System

## Overview

The DRY Resource System centralizes all resource configuration into a single place, making it incredibly easy to add new resources like "views", "reports", "dashboards", etc. Instead of touching 5+ files, you now only need to modify 2-3 files.

## Key Benefits

- **Single Source of Truth**: All configuration (API, cache, database) in one place
- **Auto-Generated Schema**: Database tables and indexes are automatically generated
- **Type Safety**: Full TypeScript support with auto-completion
- **Consistent Patterns**: All resources follow the same structure
- **Easy Maintenance**: Changes to one resource don't affect others
- **Cache Integration**: Seamlessly integrates with the IndexedDB caching system

## Architecture

### 1. Resource Registry (`lib/api/resource-registry.ts`)

The central registry that imports and manages all resources:

```typescript
import { resourceRegistry } from '@/lib/api/resource-registry';

export const resourceRegistry = {
  fieldSets: fieldSetsResourceConfig,
  issueTypes: issueTypesResourceConfig,
  teams: teamsResourceConfig,
  users: usersResourceConfig,
  projects: projectsResourceConfig,
  issues: issuesResourceConfig,
  labels: labelsResourceConfig,
  states: statesResourceConfig,
  // Add new resources here
} as const;
```

### 2. Resource Config Pattern (`lib/api/configs/[resource].ts`)

Each resource has a single config file with three sections:

```typescript
import { ResourceConfig } from '@/lib/api/resource-registry';

export const [resource]ResourceConfig: ResourceConfig = {
  // API Configuration (Server-side)
  api: {
    model: prisma.[resource],
    schema: { 
      create: createSchema, 
      update: updateSchema 
    },
    relations: ['workspace', 'owner'],
    filters: { 
      default: (ctx) => ({ workspaceId: ctx.workspace.id })
    },
    permissions: { 
      create: (ctx) => ctx.user.canCreate,
      update: (ctx, item) => ctx.user.canUpdate(item),
      delete: (ctx, item) => ctx.user.canDelete(item)
    },
  },
  
  // Cache Configuration (Client-side)
  cache: {
    resource: '[resource]',
    workspaceScoped: true,
    ttl: 30 * 60 * 1000, // 30 minutes
    optimisticUpdates: true,
    prefetchRelated: ['owner'],
    refreshInterval: 300000 // 5 minutes
  },
  
  // Database Schema Configuration
  database: {
    tableName: '[resource]',
    indexes: [
      'workspaceId', 
      '[workspaceId+timestamp]', 
      'timestamp'
    ],
    workspaceScoped: true
  }
};
```

### 3. Auto-Generated Database (`lib/api/cache/database.ts`)

The database schema is automatically generated from the registry:

```typescript
import { resourceRegistry } from '@/lib/api/resource-registry';

export class AppDatabase extends Dexie {
  // Auto-generated table declarations
  fieldSets!: Dexie.Table<CacheItem, string>;
  issueTypes!: Dexie.Table<CacheItem, string>;
  teams!: Dexie.Table<CacheItem, string>;
  users!: Dexie.Table<CacheItem, string>;
  projects!: Dexie.Table<CacheItem, string>;
  issues!: Dexie.Table<CacheItem, string>;
  labels!: Dexie.Table<CacheItem, string>;
  states!: Dexie.Table<CacheItem, string>;
  
  constructor() {
    super('AppDatabase');
    
    // Auto-generate schema from registry
    const schema = generateDatabaseSchema(resourceRegistry);
    this.version(1).stores(schema);
  }
}
```

### 4. Cache Integration (`lib/hooks/use-cached-resource.ts`)

Resources automatically integrate with the caching system:

```typescript
// Generic cached resource hook
const { state, actions } = useCachedResource<T>({
  resource: 'reports', // Must match resource registry key
  cacheKey: 'reports',
  optimisticUpdates: true,
  showToasts: true,
  autoSync: true,
  refreshInterval: 300000
});

// Convenience hooks (auto-generated from registry)
const { state, actions } = useCachedReports();
```

## How to Add a New Resource

### Step 1: Create Resource Config

Create `lib/api/configs/reports.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { reportCreateSchema, reportUpdateSchema } from '@/lib/validations/report';
import type { ResourceConfig } from '@/lib/api/resource-registry';

export const reportsResourceConfig: ResourceConfig = {
  api: {
    model: prisma.report,
    schema: {
      create: reportCreateSchema,
      update: reportUpdateSchema,
    },
    relations: ['workspace', 'owner', 'team'],
    filters: {
      default: (ctx) => ({ workspaceId: ctx.workspace.id }),
      byTeam: (ctx, teamId) => ({ teamId }),
      byOwner: (ctx, ownerId) => ({ ownerId }),
    },
    permissions: {
      create: (ctx) => ctx.user.hasPermission('CREATE_REPORTS'),
      update: (ctx, item) => item.ownerId === ctx.user.id || ctx.user.isAdmin,
      delete: (ctx, item) => item.ownerId === ctx.user.id,
    },
  },
  
  cache: {
    resource: 'reports',
    workspaceScoped: true,
    ttl: 10 * 60 * 1000, // 10 minutes (reports change frequently)
    optimisticUpdates: true,
    prefetchRelated: ['owner', 'team'],
    refreshInterval: 300000, // 5 minutes
    showToasts: true,
    autoSync: true
  },
  
  database: {
    tableName: 'reports',
    indexes: [
      'workspaceId', 
      '[workspaceId+timestamp]', 
      'timestamp', 
      'ownerId', 
      'teamId',
      '[workspaceId+ownerId]'
    ],
    workspaceScoped: true
  }
};
```

### Step 2: Register the Resource

Update `lib/api/resource-registry.ts`:

```typescript
import { reportsResourceConfig } from './configs/reports';

export const resourceRegistry = {
  fieldSets: fieldSetsResourceConfig,
  issueTypes: issueTypesResourceConfig,
  teams: teamsResourceConfig,
  users: usersResourceConfig,
  projects: projectsResourceConfig,
  issues: issuesResourceConfig,
  labels: labelsResourceConfig,
  states: statesResourceConfig,
  reports: reportsResourceConfig, // ← Add this line
} as const;
```

### Step 3: Add Table Declaration

Update `lib/api/cache/database.ts`:

```typescript
export class AppDatabase extends Dexie {
  // Auto-generated table declarations
  fieldSets!: Dexie.Table<CacheItem, string>;
  issueTypes!: Dexie.Table<CacheItem, string>;
  teams!: Dexie.Table<CacheItem, string>;
  users!: Dexie.Table<CacheItem, string>;
  projects!: Dexie.Table<CacheItem, string>;
  issues!: Dexie.Table<CacheItem, string>;
  labels!: Dexie.Table<CacheItem, string>;
  states!: Dexie.Table<CacheItem, string>;
  reports!: Dexie.Table<CacheItem, string>; // ← Add this line
```

### Step 4: Add to Unified Data Layer

Update `lib/api/unified-data-layer.ts`:

```typescript
class UnifiedDataLayer {
  // ... existing resource accessors
  get fieldSets() { return this.createResourceOperations('field-sets'); }
  get issueTypes() { return this.createResourceOperations('issue-types'); }
  get teams() { return this.createResourceOperations('teams'); }
  get users() { return this.createResourceOperations('users'); }
  get projects() { return this.createResourceOperations('projects'); }
  get issues() { return this.createResourceOperations('issues'); }
  get labels() { return this.createResourceOperations('labels'); }
  get states() { return this.createResourceOperations('states'); }
  get reports() { return this.createResourceOperations('reports'); } // ← Add this line
}
```

### Step 5: Add Convenience Hook (Optional)

Update `lib/hooks/use-cached-resource.ts`:

```typescript
// Add after existing convenience hooks
export function useCachedReports() {
  return useCachedResource<Report>({
    resource: 'reports',
    cacheKey: 'reports',
    optimisticUpdates: true,
    showToasts: true,
    autoSync: true,
    refreshInterval: 300000 // 5 minutes
  });
}
```

### Step 6: Done! 🎉

Your new resource now has:

- ✅ **Database table** with proper indexes (`reports` table)
- ✅ **Caching layer** with 10-minute TTL and optimistic updates
- ✅ **API endpoints** using existing CRUD factory
- ✅ **Workspace scoping** and user permissions
- ✅ **Real-time sync** and offline support
- ✅ **TypeScript support** with auto-completion
- ✅ **React hooks** for easy component integration

## Usage Examples

### Basic Usage

```typescript
import { useCachedReports } from '@/lib/hooks/use-cached-resource';

function ReportsPage() {
  const { state, actions } = useCachedReports();
  
  const handleCreateReport = async (data) => {
    await actions.create(data); // Optimistic update
  };
  
  if (state.loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Reports ({state.items.length})</h1>
      {state.items.map(report => (
        <div key={report.id}>{report.title}</div>
      ))}
      <button onClick={() => handleCreateReport({ title: 'New Report' })}>
        Create Report
      </button>
    </div>
  );
}
```

### Using Data Layer

```typescript
import { useDataLayer } from '@/lib/api/unified-data-layer';

function ReportDetail({ reportId }: { reportId: string }) {
  const dataLayer = useDataLayer();
  const [report, setReport] = useState(null);
  
  useEffect(() => {
    const loadReport = async () => {
      const reportData = await dataLayer.reports.get(reportId);
      setReport(reportData);
    };
    loadReport();
  }, [reportId]);
  
  const handleUpdate = async (updates) => {
    await dataLayer.reports.update(reportId, updates);
    setReport(prev => ({ ...prev, ...updates }));
  };
  
  if (!report) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{report.title}</h1>
      <button onClick={() => handleUpdate({ title: 'Updated Title' })}>
        Update Title
      </button>
    </div>
  );
}
```

### Generic Resource Hook

```typescript
import { useCachedResource } from '@/lib/hooks/use-cached-resource';

function CustomReportsPage() {
  const { state, actions } = useCachedResource<Report>({
    resource: 'reports',
    cacheKey: 'reports',
    optimisticUpdates: true,
    showToasts: false, // Disable toasts
    autoSync: true,
    refreshInterval: 60000 // 1 minute
  });
  
  return (
    <div>
      <h1>Custom Reports</h1>
      <div>Items: {state.items.length}</div>
      <div>Loading: {state.loading}</div>
      <div>Error: {state.error}</div>
      <div>Last sync: {state.lastSync?.toLocaleString()}</div>
    </div>
  );
}
```

## Helper Utilities

### Generate Table Declarations

Use the helper script to auto-generate table declarations:

```bash
# Option 1: Using npm script (recommended)
npm run generate:resources

# Option 2: Direct execution
node scripts/generate-resource-tables.js
```

This will output:
- **Table declarations** for your AppDatabase class
- **Database schema** for your generateDatabaseSchema() function
- **Resource registry summary** showing all configured resources
- **Step-by-step instructions** for adding new resources

Example output:
```
🚀 DRY Resource System - Table Generator

// Auto-generated table declarations for AppDatabase
// Copy these into your AppDatabase class:

  fieldSets!: Dexie.Table<CacheItem, string>;
  issueTypes!: Dexie.Table<CacheItem, string>;
  teams!: Dexie.Table<CacheItem, string>;
  users!: Dexie.Table<CacheItem, string>;
  projects!: Dexie.Table<CacheItem, string>;
  issues!: Dexie.Table<CacheItem, string>;
  labels!: Dexie.Table<CacheItem, string>;
  states!: Dexie.Table<CacheItem, string>;

// System tables
  syncOperations!: Dexie.Table<SyncOperation, string>;
  conflicts!: Dexie.Table<ConflictItem, string>;
  workspaceCache!: Dexie.Table<WorkspaceCache, string>;

// Resource Registry Summary:
// Total resources: 8
// - fieldSets: field-sets (workspace-scoped)
// - issueTypes: issue-types (workspace-scoped)
// - teams: teams (workspace-scoped)
// - users: users (workspace-scoped)
// - projects: projects (workspace-scoped)
// - issues: issues (workspace-scoped)
// - labels: labels (workspace-scoped)
// - states: states (workspace-scoped)

============================================================
HOW TO ADD A NEW RESOURCE (e.g., "reports"):
============================================================

1. Create lib/api/configs/reports.ts:
   - Define reportsResourceConfig following the ResourceConfig pattern
   - Include API, cache, and database configurations

2. Update lib/api/resource-registry.ts:
   - Import: import { reportsResourceConfig } from "./configs/reports";
   - Add to registry: reports: reportsResourceConfig,

3. Update lib/api/cache/database.ts:
   - Add table declaration: reports!: Dexie.Table<CacheItem, string>;
   - (Or run this script to generate all declarations)

4. Update lib/api/unified-data-layer.ts:
   - Add getter: get reports() { return this.createResourceOperations('reports'); }

5. Optional: Add convenience hook in lib/hooks/use-cached-resource.ts:
   - Add useCachedReports() function

6. That's it! Your new resource will have:
   ✓ Auto-generated database table with proper indexes
   ✓ Configured caching with TTL and optimistic updates
   ✓ API endpoints using existing CRUD factory
   ✓ Workspace scoping and permissions
   ✓ Hooks integration for auto-save and real-time updates

7. Run this script again to verify your changes:
   node scripts/generate-resource-tables.js

============================================================
AUTO-GENERATED DATABASE SCHEMA:
============================================================

// Copy this into your generateDatabaseSchema() function:
const schema = {
  fieldSets: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  issueTypes: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  teams: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  users: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  projects: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  issues: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  labels: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  states: '&id, workspaceId, [workspaceId+timestamp], timestamp',
  // System tables
  syncOperations: '&id, [resource+timestamp], priority, timestamp',
  conflicts: '&id, resource, resourceId, timestamp',
  workspaceCache: '&id, workspaceId, lastFullSync, lastDeltaSync'
};

✅ Generation complete! Copy the declarations above into your files.
```

**Pro tip**: Run this script whenever you add a new resource to see exactly what code needs to be added to your database class!

### Access Resource Configs

```typescript
import { getResourceConfig, getAllResourceConfigs } from '@/lib/api/resource-registry';

// Get specific resource config
const reportsConfig = getResourceConfig('reports');

// Get all resource configs
const allConfigs = getAllResourceConfigs();

// Check if resource exists
const hasReports = 'reports' in resourceRegistry;
```

## Migration from Old System

The old system still works! Legacy exports are maintained for backward compatibility:

```typescript
// Old way (still works)
import { fieldSetsConfig, fieldSetsCacheConfig } from '@/lib/api/configs/field-sets';

// New way (recommended)
import { fieldSetsResourceConfig } from '@/lib/api/configs/field-sets';
```

## Configuration Options

### Cache Configuration

```typescript
cache: {
  resource: 'reports',           // Must match resource registry key
  workspaceScoped: true,         // Scope to current workspace
  ttl: 10 * 60 * 1000,         // Time to live (10 minutes)
  optimisticUpdates: true,       // Enable optimistic updates
  prefetchRelated: ['owner'],    // Auto-prefetch related resources
  refreshInterval: 300000,       // Auto-refresh every 5 minutes
  showToasts: true,             // Show success/error toasts
  autoSync: true                // Auto-sync when online
}
```

### Database Configuration

```typescript
database: {
  tableName: 'reports',          // IndexedDB table name
  indexes: [                     // Database indexes for performance
    'workspaceId',              // Single column index
    '[workspaceId+timestamp]',  // Compound index
    'timestamp',                // Single column index
    'ownerId',                  // Single column index
    '[workspaceId+ownerId]'     // Compound index
  ],
  workspaceScoped: true          // Enable workspace scoping
}
```

### API Configuration

```typescript
api: {
  model: prisma.report,          // Prisma model
  schema: {                      // Validation schemas
    create: reportCreateSchema,
    update: reportUpdateSchema,
  },
  relations: ['workspace', 'owner', 'team'], // Prisma relations to include
  filters: {                     // Pre-defined filters
    default: (ctx) => ({ workspaceId: ctx.workspace.id }),
    byTeam: (ctx, teamId) => ({ teamId }),
    byOwner: (ctx, ownerId) => ({ ownerId }),
  },
  permissions: {                 // Access control
    create: (ctx) => ctx.user.hasPermission('CREATE_REPORTS'),
    update: (ctx, item) => {
      // Owner can always update
      if (item.ownerId === ctx.user.id) return true;
      // Team members can update shared items
      if (item.teamId && ctx.user.teamIds.includes(item.teamId)) return true;
      // Admins can update everything
      return ctx.user.isAdmin;
    },
    delete: (ctx, item) => item.ownerId === ctx.user.id || ctx.user.isAdmin,
  },
}
```

## Best Practices

### 1. Resource Naming
- Use camelCase for resource names (`fieldSets`, `issueTypes`, `customFields`)
- Use descriptive names that match your domain model
- Keep names consistent across API, cache, and database

### 2. Cache TTL Guidelines
```typescript
// Static/configuration data (rarely changes)
ttl: 60 * 60 * 1000, // 1 hour

// Dynamic data (frequently updated)
ttl: 5 * 60 * 1000,  // 5 minutes

// User-specific data (moderate updates)
ttl: 15 * 60 * 1000, // 15 minutes
```

### 3. Database Indexes
Always include these core indexes:
```typescript
indexes: [
  'workspaceId',              // Required for workspace scoping
  '[workspaceId+timestamp]',  // Required for time-based queries
  'timestamp',                // Required for sync operations
  // Add domain-specific indexes
  'ownerId',                  // For user-owned resources
  'teamId',                   // For team-scoped resources
  '[workspaceId+status]',     // For status filtering
]
```

### 4. Permissions
Be specific and secure:
```typescript
permissions: {
  create: (ctx) => ctx.user.hasPermission('CREATE_REPORTS'),
  update: (ctx, item) => {
    // Owner can always update
    if (item.ownerId === ctx.user.id) return true;
    // Team members can update shared items
    if (item.teamId && ctx.user.teamIds.includes(item.teamId)) return true;
    // Admins can update everything
    return ctx.user.isAdmin;
  },
  delete: (ctx, item) => item.ownerId === ctx.user.id || ctx.user.isAdmin,
}
```

### 5. Relations and Prefetching
Only prefetch what you commonly use:
```typescript
relations: ['workspace', 'owner', 'team'], // Prisma relations
prefetchRelated: ['owner'],                 // Only prefetch owner data
```

## Testing

### Test Resource Integration

```typescript
describe('Reports Resource', () => {
  it('should be registered in resource registry', () => {
    expect(resourceRegistry.reports).toBeDefined();
  });
  
  it('should have proper cache configuration', () => {
    const config = getResourceConfig('reports');
    expect(config.cache.resource).toBe('reports');
    expect(config.cache.workspaceScoped).toBe(true);
  });
  
  it('should work with cached resource hook', async () => {
    const { state, actions } = useCachedReports();
    
    // Test creation
    const newReport = await actions.create({ title: 'Test Report' });
    expect(newReport.title).toBe('Test Report');
    
    // Test state update
    expect(state.items).toContain(newReport);
  });
});
```

## Summary

The DRY Resource System transforms resource management from a complex, error-prone process into a simple, consistent pattern. Adding new resources like "reports", "dashboards", or "analytics" is now just a matter of:

1. Creating one config file (`lib/api/configs/reports.ts`)
2. Adding one line to the registry (`reports: reportsResourceConfig`)
3. Adding one table declaration (`reports!: Dexie.Table<CacheItem, string>`)
4. Adding one data layer getter (`get reports() { ... }`)

**The generator script makes it even easier** by showing you exactly what code to add and where to add it.

This system maintains all the benefits of the original caching architecture while making it much easier to maintain and extend. Every new resource automatically gets:

- ✅ **Full caching integration** with IndexedDB
- ✅ **Optimistic updates** for instant UI feedback
- ✅ **Offline support** with automatic sync
- ✅ **Type safety** with TypeScript
- ✅ **Consistent API** across all resources
- ✅ **Workspace scoping** and permissions
- ✅ **React hooks** for easy component integration 