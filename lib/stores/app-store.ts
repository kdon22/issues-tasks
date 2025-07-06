// App Store - Linear Clone (DRY Client State Management)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Workspace {
  id: string;
  name: string;
  url: string;
}

interface Team {
  id: string;
  name: string;
  identifier: string;
}

interface AppFilters {
  search: string;
  assignee?: string;
  state?: string;
  priority?: string;
  project?: string;
  labels?: string[];
  sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  commandPaletteOpen: boolean;
  createIssueModalOpen: boolean;
  selectedIssues: Set<string>;
}

interface AppState {
  // Authentication & Context
  user: User | null;
  currentWorkspace: Workspace | null;
  currentTeam: Team | null;
  
  // Filters & Search
  filters: AppFilters;
  
  // UI State
  ui: UIState;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  
  // Filter Actions
  updateFilters: (filters: Partial<AppFilters>) => void;
  resetFilters: () => void;
  
  // UI Actions
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  toggleCommandPalette: () => void;
  toggleCreateIssueModal: () => void;
  toggleIssueSelection: (id: string) => void;
  clearIssueSelection: () => void;
  selectAllIssues: (ids: string[]) => void;
}

// Default values
const defaultFilters: AppFilters = {
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const defaultUI: UIState = {
  sidebarCollapsed: false,
  theme: 'system',
  commandPaletteOpen: false,
  createIssueModalOpen: false,
  selectedIssues: new Set(),
};

// Store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        currentWorkspace: null,
        currentTeam: null,
        filters: defaultFilters,
        ui: defaultUI,

        // Authentication & Context Actions
        setUser: (user) => {
          set((state) => {
            state.user = user;
          });
        },

        setCurrentWorkspace: (workspace) => {
          set((state) => {
            state.currentWorkspace = workspace;
            // Reset team when workspace changes
            state.currentTeam = null;
          });
        },

        setCurrentTeam: (team) => {
          set((state) => {
            state.currentTeam = team;
          });
        },

        // Filter Actions
        updateFilters: (newFilters) => {
          set((state) => {
            Object.assign(state.filters, newFilters);
          });
        },

        resetFilters: () => {
          set((state) => {
            state.filters = { ...defaultFilters };
          });
        },

        // UI Actions
        toggleSidebar: () => {
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
          });
        },

        setTheme: (theme) => {
          set((state) => {
            state.ui.theme = theme;
          });
        },

        toggleCommandPalette: () => {
          set((state) => {
            state.ui.commandPaletteOpen = !state.ui.commandPaletteOpen;
          });
        },

        toggleCreateIssueModal: () => {
          set((state) => {
            state.ui.createIssueModalOpen = !state.ui.createIssueModalOpen;
          });
        },

        toggleIssueSelection: (id) => {
          set((state) => {
            if (state.ui.selectedIssues.has(id)) {
              state.ui.selectedIssues.delete(id);
            } else {
              state.ui.selectedIssues.add(id);
            }
          });
        },

        clearIssueSelection: () => {
          set((state) => {
            state.ui.selectedIssues.clear();
          });
        },

        selectAllIssues: (ids) => {
          set((state) => {
            state.ui.selectedIssues = new Set(ids);
          });
        },
      })),
      {
        name: 'linear-clone-store',
        // Only persist certain parts of the state
        partialize: (state) => ({
          user: state.user,
          currentWorkspace: state.currentWorkspace,
          currentTeam: state.currentTeam,
          filters: state.filters,
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
            theme: state.ui.theme,
          },
        }),
        // Custom storage to handle Sets
        storage: {
          getItem: (name: string) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            if (parsed.state?.ui?.selectedIssues && Array.isArray(parsed.state.ui.selectedIssues)) {
              parsed.state.ui.selectedIssues = new Set(parsed.state.ui.selectedIssues);
            }
            return parsed;
          },
          setItem: (name: string, value: any) => {
            const serialized = { ...value };
            if (serialized.state?.ui?.selectedIssues instanceof Set) {
              serialized.state.ui.selectedIssues = Array.from(serialized.state.ui.selectedIssues);
            }
            localStorage.setItem(name, JSON.stringify(serialized));
          },
          removeItem: (name: string) => localStorage.removeItem(name),
        },
      }
    ),
    { name: 'linear-clone-store' }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useCurrentWorkspace = () => useAppStore((state) => state.currentWorkspace);
export const useCurrentTeam = () => useAppStore((state) => state.currentTeam);
export const useFilters = () => useAppStore((state) => state.filters);
export const useUI = () => useAppStore((state) => state.ui);
export const useSelectedIssues = () => useAppStore((state) => state.ui.selectedIssues); 