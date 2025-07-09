# Modular Resource System Guide

## Overview

This project uses a **modular, config-driven resource system** for all workspace resources (teams, members, projects, labels, issue types, status flows, field sets, etc.).

- **All resource logic (fields, validation, CRUD handlers) lives in one file per resource.**
- **A central handler registry** automatically wires up all resource actions to the single API endpoint.
- **The UI is driven by config:** most resources use a generic settings page, but resources can provide a custom editor for rich/complex UIs.

This system is inspired by Linear/Vercel's gold-standard patterns and is designed for:
- **DRYness** (no duplication)
- **Maintainability** (easy to add/change resources)
- **Performance** (single endpoint, offline-first, optimistic updates)

---

## Directory Structure

```
components/settings/
  resource-configs/
    member.ts
    team.ts
    project.ts
    label.ts
    issueType.ts
    fieldSet.ts
    statusFlow.ts
  action-handlers/
    index.ts
  resource-settings-page.tsx
```

---

## How It Works

### 1. **Resource Config Files**
Each resource has a config file in `components/settings/resource-configs/`:
- Exports a config object: fields, validation, display/search fields, etc.
- Exports CRUD (and custom) action handlers for the resource.
- Optionally, provides a `customEditor` React component for rich add/edit UI.

**Example: `resource-configs/member.ts`**
```ts
import { z } from 'zod';

export const memberConfig = {
  name: 'Member',
  actionPrefix: 'member',
  displayFields: [...],
  searchFields: [...],
  createFields: [...],
  validationSchema: z.object({ ... }),
  // customEditor: MyCustomEditor (optional)
};

export const memberHandlers = {
  'member.create': async (data, context) => { ... },
  'member.update': async (id, data, context) => { ... },
  // ...
};
```

### 2. **Central Handler Registry**
- `components/settings/action-handlers/index.ts` imports all resource handlers and merges them into a single `actionHandlers` object.
- The API endpoint (`app/api/workspaces/[workspaceUrl]/actions/route.ts`) uses this registry to dispatch all resource actions.

**Example:**
```ts
import { memberHandlers } from '../resource-configs/member';
import { teamHandlers } from '../resource-configs/team';
// ...
export const actionHandlers = {
  ...memberHandlers,
  ...teamHandlers,
  // ...
};
```

### 3. **Generic Resource Settings Page**
- `components/settings/resource-settings-page.tsx` is the generic UI for all resource settings.
- It uses the resource config to render fields, validation, and actions.
- If a resource provides a `customEditor`, it is used for add/edit instead of the generic form (e.g., status flows, field sets).

---

## How to Add a New Resource

1. **Create a config file:**
   - Add `components/settings/resource-configs/myResource.ts`.
   - Export a config object (fields, validation, etc.).
   - Export CRUD handlers for the resource.
   - (Optional) Export a `customEditor` React component for rich add/edit UI.

2. **Register handlers:**
   - Import your handlers in `components/settings/action-handlers/index.ts` and spread them into `actionHandlers`.

3. **Add a settings page:**
   - In `app/workspaces/[workspaceUrl]/settings/`, create a page that imports your config and passes it to `ResourceSettingsPage`.
   - Example:
     ```tsx
     import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
     import { myResourceConfig } from '@/components/settings/resource-configs/myResource';
     export default function MyResourceSettingsPage() {
       return <ResourceSettingsPage config={myResourceConfig} />;
     }
     ```

4. **(Optional) Add custom UI:**
   - If your resource needs a custom add/edit UI, export a `customEditor` in your config and implement the component.

---

## Example: Adding a "Milestone" Resource

1. `components/settings/resource-configs/milestone.ts`:
   ```ts
   import { z } from 'zod';
   export const milestoneConfig = {
     name: 'Milestone',
     actionPrefix: 'milestone',
     displayFields: ['name', 'dueDate'],
     searchFields: ['name'],
     createFields: [
       { key: 'name', label: 'Name', type: 'text', required: true },
       { key: 'dueDate', label: 'Due Date', type: 'date' }
     ],
     validationSchema: z.object({
       name: z.string().min(1, 'Name required'),
       dueDate: z.string().optional(),
     }),
   };
   export const milestoneHandlers = {
     'milestone.create': async (data, context) => { ... },
     'milestone.update': async (id, data, context) => { ... },
     'milestone.delete': async (id, context) => { ... },
     'milestone.list': async (context) => { ... },
     'milestone.get': async (id, context) => { ... },
   };
   ```
2. Register in `action-handlers/index.ts`:
   ```ts
   import { milestoneHandlers } from '../resource-configs/milestone';
   export const actionHandlers = {
     ...milestoneHandlers,
     // ...
   };
   ```
3. Add a settings page:
   ```tsx
   import { ResourceSettingsPage } from '@/components/settings/resource-settings-page';
   import { milestoneConfig } from '@/components/settings/resource-configs/milestone';
   export default function MilestoneSettingsPage() {
     return <ResourceSettingsPage config={milestoneConfig} />;
   }
   ```

---

## Tips & Best Practices

- **Keep resource config files focused:** Only config, validation, and handlers for that resource.
- **Use Zod for validation** (or your preferred schema lib).
- **Use customEditor for complex UIs** (e.g., drag-and-drop, multi-step forms).
- **Test handlers in isolation** (they are just functions!).
- **No legacy/duplicate CRUD pages:** All resource logic should flow through the config/handler system.

---

## Questions?
- See the code comments and examples in `components/settings/resource-configs/`.
- Ask in the team chat or open an issue if you need help! 