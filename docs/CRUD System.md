# CRUD System: Complete DRY Implementation Guide

## Overview
This document describes the complete CRUD (Create, Read, Update, Delete) system that eliminates code duplication by using a factory pattern to auto-generate both frontend and backend operations from resource configurations.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resource Configurations                      │
│                  (Single Source of Truth)                       │
│                                                                │
│  features/                                                      │
│  ├── teams/teams.config.ts                                     │
│  ├── projects/projects.config.ts                               │
│  ├── members/members.config.ts                                 │
│  └── admin/                                                    │
│      ├── labels/labels.config.ts                               │
│      ├── issue-types/issue-types.config.ts                     │
│      └── field-sets/field-sets.config.ts                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────┐                    ┌─────────────────────┐
│     Backend         │                    │     Frontend        │
│   (Auto-Generated)  │                    │   (Auto-Generated)  │
│                     │                    │                     │
│  DatabaseFactory    │◄──────────────────►│   ActionClient      │
│  HandlerFactory     │                    │   Generated Methods │
│  API Routes         │                    │   IndexedDB Stores  │
└─────────────────────┘                    └─────────────────────┘
```

## Problem Solved
The original system had significant code duplication:
- **Frontend**: 800+ lines of hardcoded CRUD methods for each resource type
- **Backend**: Repetitive handler functions for each resource
- **Maintenance**: Adding new resources required updates in 6+ places
- **Type Safety**: Manual mapping between frontend/backend types

## Complete System Components

### 1. Resource Configuration Layer (Single Source of Truth)

#### **Core Resource Configs**
- **`features/teams/teams.config.ts`** - Team resource definition
- **`features/projects/projects.config.ts`** - Project resource definition  
- **`features/members/members.config.ts`** - Member resource definition
- **`features/issues/issues.config.ts`** - Issue resource definition
- **`features/comments/comments.config.ts`** - Comment resource definition

#### **Admin Resource Configs**
- **`features/admin/labels/labels.config.ts`** - Label resource definition
- **`features/admin/labels/label-groups.config.ts`** - Label group resource definition
- **`features/admin/issue-types/config.ts`** - Issue type resource definition
- **`features/admin/field-sets/config.ts`** - Field set resource definition
- **`features/admin/workflows/config.ts`** - Status flow resource definition
- **`features/admin/statuses/config.ts`** - State resource definition

#### **Config Index Files**
- **`features/index.ts`** - Main feature exports
- **`components/settings/resource-configs/index.ts`** - Legacy re-exports (deprecated)

**Example Resource Config Structure:**
```typescript
// features/teams/teams.config.ts
export const teamConfig = {
  name: 'Team',
  actionPrefix: 'team',           // Used for API actions: team.create, team.update
  displayFields: [...],           // UI table columns
  searchFields: [...],            // Searchable fields
  createFields: [...],            // Form fields
  validationSchema: z.object({...}) // Zod validation
};
```

### 2. Backend Factory System

#### **Database Factory (Core Engine)**
- **`components/settings/action-handlers/database-factory.ts`** - Auto-generates database operations
  - `DatabaseFactory.initializeResourcesFromConfigs()` - Discovers all resources
  - `DatabaseFactory.createResourceOperations()` - Generates CRUD operations
  - `DatabaseFactory.generateAllHandlers()` - Creates all handlers

#### **Handler Factory**
- **`components/settings/action-handlers/handler-factory.ts`** - Factory for generating action handlers
  - `createResourceHandlers()` - Creates handlers for a resource
  - `createAllResourceHandlers()` - Creates all resource handlers

#### **Generated Handlers Export**
- **`components/settings/action-handlers/index.ts`** - Exports all auto-generated handlers
  - `actionHandlers` - Object containing all generated handlers
  - `generatedHandlers` - Direct factory output

#### **API Route**
- **`app/api/workspaces/[workspaceUrl]/actions/route.ts`** - Main API endpoint
  - `POST /api/workspaces/[workspaceUrl]/actions` - Single action endpoint
  - `handleAction()` - Routes to factory-generated handlers
  - `bootstrapWorkspace()` - Bulk data loading

### 3. Frontend Action Client System

#### **Main Action Client**
- **`lib/api/action-client.ts`** - DRY action client (refactored from 800+ to 400+ lines)
  - `ActionClient` - Main class with auto-generated methods
  - `createActionClient()` - Factory function
  - `AVAILABLE_RESOURCES` - Auto-discovered from configs
  - `generateResourceMethods()` - Creates all CRUD methods dynamically

#### **API Integration**
- **`lib/api/client.ts`** - API client utilities
- **`lib/api/index.ts`** - API exports

#### **React Hooks**
- **`lib/hooks/use-action-api.ts`** - Hook for using action client
- **`lib/hooks/use-api.ts`** - General API hook
- **`lib/hooks/use-resource.ts`** - Resource-specific operations

### 4. Type System

#### **Resource Types**
- **`lib/types/index.ts`** - Main type exports
- **`lib/types/resources.ts`** - Resource-specific types
- **`lib/resource-schemas/index.ts`** - Schema definitions

#### **Feature Schemas**
- **`features/teams/teams.schema.ts`** - Team validation
- **`features/projects/projects.schema.ts`** - Project validation  
- **`features/members/members.schema.ts`** - Member validation

### 5. UI Components

#### **Resource Settings Components**
- **`components/resource-settings/resource-settings-page.tsx`** - Generic settings page
- **`components/settings/resource-settings-page.tsx`** - Legacy settings page

#### **Form Components**
- **`components/teams/create-team-form.tsx`** - Team creation form
- **`components/projects/create-project-dialog.tsx`** - Project creation dialog
- **`components/labels/create-label-form.tsx`** - Label creation form

#### **Settings Pages**
- **`app/workspaces/[workspaceUrl]/settings/teams/page.tsx`** - Team settings
- **`app/workspaces/[workspaceUrl]/settings/projects/page.tsx`** - Project settings
- **`app/workspaces/[workspaceUrl]/settings/members/page.tsx`** - Member settings
- **`app/workspaces/[workspaceUrl]/settings/labels/page.tsx`** - Label settings

### 6. Database Schema

#### **Prisma Schema**
- **`prisma/schema.prisma`** - Database schema definition
- **`prisma/seed.ts`** - Seed data using the factory system

#### **Migrations**
- **`prisma/migrations/`** - Database migrations

## How It Works: End-to-End Flow

### 1. Resource Configuration
```typescript
// features/teams/teams.config.ts
export const teamConfig = {
  name: 'Team',
  actionPrefix: 'team',
  // ... configuration
};
```

### 2. Backend Auto-Generation
```typescript
// components/settings/action-handlers/database-factory.ts
DatabaseFactory.initializeResourcesFromConfigs();
// → Discovers teamConfig
// → Creates team.create, team.update, team.delete, team.list, team.get handlers
```

### 3. Frontend Auto-Generation
```typescript
// lib/api/action-client.ts
const AVAILABLE_RESOURCES = Object.values(resourceConfigs)
  .filter(config => config?.actionPrefix);
// → Discovers teamConfig
// → Creates client.team.create(), client.team.update(), etc.
```

### 4. API Route Integration
```typescript
// app/api/workspaces/[workspaceUrl]/actions/route.ts
const handler = actionHandlers[action]; // auto-generated handler
return handler(resourceId, data, context);
```

### 5. UI Component Usage
```typescript
// components/teams/create-team-form.tsx
const client = createActionClient(workspaceUrl);
await client.team.create({ name: 'Engineering' });
```

## Key Benefits

### **Before (Old System)**
```typescript
// BACKEND - Manual handlers for each resource
async function createTeam(data, context) { /* ... */ }
async function updateTeam(id, data, context) { /* ... */ }
async function deleteTeam(id, context) { /* ... */ }
// ... repeat for 10+ resources = 50+ functions

// FRONTEND - Manual methods for each resource  
async createTeam(data) { return this.executeAction('team.create', data); }
async updateTeam(id, data) { return this.executeAction('team.update', id, data); }
// ... repeat for 10+ resources = 50+ methods
```

### **After (New System)**
```typescript
// BACKEND - Single factory generates all handlers
DatabaseFactory.createResourceOperations('team');
// → Automatically creates all CRUD operations

// FRONTEND - Single factory generates all methods
generateResourceMethods(); 
// → Automatically creates client.team.create(), etc.
```

## Adding New Resources

### **Step 1: Create Resource Config**
```typescript
// features/workflows/workflows.config.ts
export const workflowConfig = {
  name: 'Workflow',
  actionPrefix: 'workflow',
  displayFields: [
    { key: 'name', label: 'Name', clickable: true },
    { key: 'status', label: 'Status' }
  ],
  createFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' }
  ],
  validationSchema: z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional()
  })
};
```

### **Step 2: Export in Index**
```typescript
// features/index.ts
export { workflowConfig } from './workflows';
```

### **Step 3: Add to Database Schema**
```prisma
// prisma/schema.prisma
model Workflow {
  id          String   @id @default(cuid())
  name        String
  description String?
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### **Step 4: Update Types**
```typescript
// lib/types/resources.ts
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**That's it!** The system automatically:
- ✅ Generates `workflow.create`, `workflow.update`, `workflow.delete`, `workflow.list`, `workflow.get` API handlers
- ✅ Creates `client.workflow.create()`, `client.workflow.update()`, etc. frontend methods
- ✅ Sets up IndexedDB stores for offline caching
- ✅ Provides `client.resource('workflow')` generic access

## Usage Examples

### **Basic CRUD Operations**
```typescript
const client = createActionClient('my-workspace');

// Create
const team = await client.team.create({ 
  name: 'Engineering', 
  identifier: 'ENG' 
});

// Read
const teams = await client.team.list();
const team = await client.team.get(teamId);

// Update
await client.team.update(teamId, { name: 'Engineering Team' });

// Delete
await client.team.delete(teamId);
```

### **Generic Resource Access**
```typescript
// Access any resource dynamically
const resourceType = 'workflow'; // from user input
await client.resource(resourceType).create(data);
await client.resource(resourceType).list();
```

### **Available Resources**
```typescript
// Get all available resources
console.log(client.getAvailableResources());
// → ['team', 'project', 'label', 'member', 'workflow', ...]
```

### **Bulk Operations**
```typescript
// Bulk delete
await client.bulkDelete('team', [id1, id2, id3]);

// Bulk update
await client.bulkUpdate('team', [id1, id2], { isPrivate: false });
```

### **Offline Support**
```typescript
// Works offline with IndexedDB caching
const teams = await client.getCachedDataWithFallback('teams');
console.log('Pending actions:', client.getPendingActionsCount());
```

## File Organization

```
├── features/                          # Resource configurations (SSOT)
│   ├── teams/teams.config.ts         # Team resource config
│   ├── projects/projects.config.ts   # Project resource config
│   └── admin/                        # Admin resource configs
├── components/settings/action-handlers/
│   ├── database-factory.ts           # Backend CRUD generation
│   ├── handler-factory.ts            # Handler generation
│   └── index.ts                      # Generated handlers export
├── lib/api/
│   ├── action-client.ts               # Frontend CRUD client
│   └── client.ts                     # API utilities
├── app/api/workspaces/[workspaceUrl]/
│   └── actions/route.ts              # Main API endpoint
├── lib/hooks/
│   ├── use-action-api.ts             # Action client hook
│   └── use-resource.ts               # Resource operations hook
└── app/workspaces/[workspaceUrl]/settings/
    ├── teams/page.tsx                # Team settings page
    └── projects/page.tsx             # Project settings page
```

## Development Workflow

### **1. For New Resources**
→ Create config in `features/[resource]/[resource].config.ts`
→ Export in `features/index.ts`  
→ Add to database schema in `prisma/schema.prisma`
→ Add types to `lib/types/resources.ts`

### **2. For Backend Changes**
→ Modify `components/settings/action-handlers/database-factory.ts`
→ Update API route in `app/api/workspaces/[workspaceUrl]/actions/route.ts`

### **3. For Frontend Changes**
→ Modify `lib/api/action-client.ts`
→ Update hooks in `lib/hooks/`

### **4. For UI Changes**
→ Update components in `components/resource-settings/`
→ Modify settings pages in `app/workspaces/[workspaceUrl]/settings/`

## Architecture Benefits

1. **🎯 Single Source of Truth**: Resource configs drive everything
2. **🔄 Auto-Scaling**: New resources work immediately
3. **🛡️ Type Safety**: Full TypeScript support
4. **📈 Performance**: IndexedDB caching + offline support
5. **🔧 Maintainability**: 50% less code, zero duplication
6. **🚀 Developer Experience**: Consistent patterns across all resources

## Troubleshooting

### **Resource Not Found**
- Check that config is exported in `features/index.ts`
- Verify `actionPrefix` is unique
- Ensure Prisma model exists

### **Handler Not Generated**
- Check `DatabaseFactory.initializeResourcesFromConfigs()` logs
- Verify config has `actionPrefix` property
- Check `components/settings/action-handlers/index.ts` exports

### **Frontend Method Missing**
- Check `client.getAvailableResources()` includes your resource
- Verify resource config is imported in `lib/api/action-client.ts`
- Check browser console for generation errors

The CRUD system is now truly DRY - Don't Repeat Yourself! 🎉 