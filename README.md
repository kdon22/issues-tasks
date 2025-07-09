# Linear Clone - Platinum Standard

A world-class Linear clone built with cutting-edge technology for blazing performance and enterprise-grade features.

## 🚀 **Tech Stack - Platinum Standard**

### **Core Framework**
- **Next.js 15.3.4** - Latest App Router with Turbopack
- **React 19** - Concurrent features for smooth UX
- **TypeScript 5** - Full type safety
- **Tailwind CSS 4** - Modern utility-first styling

### **Database & Backend**
- **PostgreSQL 16** - Enterprise-grade relational database
- **Prisma ORM** - Type-safe database access
- **Redis 7** - High-performance caching & real-time features
- **NextAuth.js v5** - Modern authentication

### **UI & Components**
- **Radix UI** - Headless, accessible components
- **shadcn/ui** - Beautiful, customizable components
- **Lucide Icons** - Consistent, beautiful icons
- **Framer Motion** - Smooth animations
- **Tailwind Merge** - Optimized CSS class management

### **State Management**
- **Zustand** - Lightweight client state
- **TanStack Query v5** - Powerful server state management
- **React Hook Form** - Performant forms
- **Zod** - Runtime type validation

### **Real-time & Collaboration**
- **Socket.io** - Real-time updates
- **TipTap** - Rich text editing with collaboration
- **WebSockets** - Live cursors and presence

### **Search & Performance**
- **Typesense** - Lightning-fast search engine
- **Fuse.js** - Client-side fuzzy search
- **React Virtual** - Virtualized lists for performance
- **React Window** - Efficient rendering

### **Offline & Storage**
- **Dexie.js** - IndexedDB wrapper for offline data
- **Service Worker** - Offline-first capabilities
- **MinIO** - S3-compatible object storage

### **Development & Testing**
- **Storybook** - Component development
- **Jest & Testing Library** - Unit & integration testing
- **Vitest** - Fast unit testing
- **ESLint & Prettier** - Code quality
- **Husky** - Git hooks

### **Monitoring & Analytics**
- **Sentry** - Error tracking & performance monitoring
- **Vercel Analytics** - Web analytics
- **Bundle Analyzer** - Build optimization

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   PostgreSQL    │    │     Redis       │
│   (Frontend)    │◄───┤   (Database)    │    │   (Caching)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Typesense    │    │      MinIO      │    │   Socket.io     │
│    (Search)     │    │   (Storage)     │    │  (Real-time)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### 1. Clone & Setup
```bash
git clone <your-repo>
cd linear-clone
cp env.example .env
```

### 2. Start Services
```bash
# Start all services (PostgreSQL, Redis, MinIO, Typesense, MailHog)
npm run docker:up

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 3. Development
```bash
# Start development server with Turbopack
npm run dev

# Open additional terminals for:
npm run db:studio      # Prisma Studio
npm run storybook      # Component development
```

## 📖 **Development Workflow**

### **Database Operations**
```bash
npm run db:studio      # Prisma Studio GUI
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create & run migrations
npm run db:push        # Push schema changes
npm run db:seed        # Seed database
npm run db:reset       # Reset database
```

### **Testing**
```bash
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run test:ui        # Vitest UI
```

### **Code Quality**
```bash
npm run lint           # Check linting
npm run lint:fix       # Fix linting issues
npm run format         # Format code
npm run type-check     # TypeScript check
```

### **Build & Analysis**
```bash
npm run build          # Production build
npm run analyze        # Bundle analysis
npm run start          # Production server
```

## 🔧 **Services**

All services run via Docker Compose:

| Service | URL | Purpose |
|---------|-----|---------|
| **App** | http://localhost:3000 | Next.js application |
| **PostgreSQL** | localhost:5432 | Primary database |
| **Redis** | localhost:6379 | Caching & sessions |
| **MinIO** | http://localhost:9001 | Object storage admin |
| **Typesense** | http://localhost:8108 | Search engine |
| **MailHog** | http://localhost:8025 | Email testing |
| **Prisma Studio** | http://localhost:5555 | Database GUI |
| **Storybook** | http://localhost:6006 | Component library |

## 🎯 **Linear Features**

### **Core Features**
- ✅ **Issues Management** - Create, edit, assign, track
- ✅ **Projects** - Organize work into projects
- ✅ **Teams** - Multi-team workspace support
- ✅ **States** - Customizable workflow states
- ✅ **Labels** - Flexible tagging system
- ✅ **Priorities** - Issue priority management
- ✅ **Assignments** - User assignment system

### **Advanced Features**
- 🔄 **Real-time Collaboration** - Live updates & cursors
- 🔍 **Lightning Search** - Instant fuzzy search
- ⌨️ **Keyboard Shortcuts** - Power user workflow
- 📱 **Mobile Responsive** - Perfect mobile experience
- 🌙 **Dark Mode** - System preference support
- 📊 **Activity Feeds** - Complete audit trail
- 💬 **Comments** - Threaded discussions
- 📎 **Attachments** - File upload support
- 🔔 **Notifications** - Smart notification system
- 📈 **Analytics** - Usage insights

### **Performance Features**
- ⚡ **Offline Support** - Works without internet
- 🚀 **Virtualization** - Handles thousands of items
- 🎯 **Optimistic Updates** - Instant UI feedback
- 💾 **Smart Caching** - Intelligent data caching
- 🌐 **CDN Ready** - Global content delivery

## 🔐 **Security**

- **Authentication** - NextAuth.js with multiple providers
- **Authorization** - Role-based access control
- **Data Validation** - Zod schemas everywhere
- **SQL Injection** - Prisma ORM protection
- **XSS Protection** - Content Security Policy
- **CSRF Protection** - Built-in Next.js protection

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
# Deploy to Vercel
npx vercel --prod

# Environment variables needed:
# - DATABASE_URL (PostgreSQL)
# - NEXTAUTH_SECRET
# - REDIS_URL
# - TYPESENSE_API_KEY
# - MINIO_* (S3 credentials)
```

### **Docker Production**
```bash
# Build production image
docker build -t linear-clone .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🎨 **Design System**

Built with a comprehensive design system:
- **Typography** - Consistent text hierarchy
- **Colors** - Dark/light mode support
- **Spacing** - Harmonious spacing scale
- **Components** - Reusable UI components
- **Icons** - Lucide icon library
- **Animations** - Smooth micro-interactions

## 🔧 **Configuration**

### **Environment Variables**
See `env.example` for all configuration options.

### **Prisma Schema**
Comprehensive database schema with:
- Users, Teams, Workspaces
- Issues, Projects, Labels, States
- Comments, Attachments, Activities
- Notifications, Preferences

### **TypeScript Configuration**
Strict TypeScript with path mapping and optimizations.

### **Tailwind Configuration**
Custom design system with plugins and optimizations.

## 📚 **Documentation**

- **Components** - Storybook at http://localhost:6006
- **API** - Auto-generated from Prisma schema
- **Database** - Prisma Studio at http://localhost:5555
- **Architecture** - This README and inline docs

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Run the full test suite
5. Submit a pull request

## 📄 **License**

MIT License - see LICENSE file for details.

---

**Built with ❤️ for the modern web**

# Issues & Tasks

A modern project management tool built with Next.js, TypeScript, and PostgreSQL.

## Architecture Overview

This application uses a unified resource system with DRY (Don't Repeat Yourself) principles throughout.

### DRY Resource Management

#### Hook Factory Pattern
Instead of manually creating CRUD hooks for each resource type, we use a factory pattern:

```typescript
// ✅ New way (1 line per resource)
export const teamHooks = createResourceHooks<Team>('team');
export const projectHooks = createResourceHooks<Project>('project');
export const labelHooks = createResourceHooks<Label>('label');

// ❌ Old way (50+ lines per resource)
export function useTeams() { return useActionQuery('team.list'); }
export function useTeam(id) { return useActionQuery('team.get', { enabled: !!id }); }
export function useCreateTeam() { /* 15 lines of boilerplate */ }
export function useUpdateTeam() { /* 15 lines of boilerplate */ }
export function useDeleteTeam() { /* 15 lines of boilerplate */ }
```

#### Auto-Generated Resource Configurations
Settings pages automatically generate their configurations:

```typescript
// ✅ New way (3 lines)
export default function TeamsPage() {
  const config = generateResourceConfig('team');
  return <ResourceSettingsPage config={config} />;
}

// ❌ Old way (20+ lines)
export default function TeamsPage() {
  return (
    <ResourceSettingsPage
      config={{
        name: 'Team',
        actionPrefix: 'team',
        displayFields: ['name', 'identifier', 'description'],
        searchFields: ['name', 'identifier', 'description'],
        createFields: [
          { key: 'name', label: 'Team Name', type: 'text', required: true },
          { key: 'identifier', label: 'Identifier', type: 'text', required: true },
          { key: 'description', label: 'Description', type: 'textarea' }
        ]
      }}
    />
  );
}
```

#### Adding New Resources
To add a new resource type, you only need:

1. Create the hooks: `export const newResourceHooks = createResourceHooks('newResource');`
2. Create the page: `<ResourceSettingsPage config={generateResourceConfig('newResource')} />`
3. Add API endpoints following the standard pattern

### Benefits

- **90% reduction** in boilerplate code
- **Type-safe** with proper TypeScript interfaces
- **Consistent API** across all resources
- **Automatic form generation** for CRUD operations
- **Optimistic updates** and offline support built-in
- **Easy to extend** for new resource types

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives
- **TypeScript**: Full type safety throughout

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your database and environment variables
4. Run the development server: `npm run dev`

## Development

The codebase follows strict DRY principles with:
- Unified resource management system
- Auto-generated CRUD operations
- Type-safe API layer
- Consistent UI patterns

See the individual files for detailed implementation examples.
