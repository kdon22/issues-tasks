// Data Table Component - Linear Clone (DRY & Reusable)
"use client";

import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Settings2,
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Action types for table rows
export interface TableAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

// Bulk action types
export interface BulkAction<T = any> {
  label: string;
  icon?: React.ElementType;
  onClick: (rows: T[]) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: (rows: T[]) => boolean;
}

// Filter configuration
export interface TableFilter {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

// Main data table props
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  
  // Search & Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  filters?: TableFilter[];
  
  // Actions
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  
  // Features
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  
  // Customization
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
  
  // Toolbar actions
  toolbarActions?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // Page size options
  pageSizeOptions?: number[];
}

export function DataTable<T>({
  data,
  columns: initialColumns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKey,
  filters = [],
  actions = [],
  bulkActions = [],
  sortable = true,
  selectable = false,
  pagination = true,
  title,
  description,
  emptyMessage = "No data available",
  className,
  toolbarActions,
  isLoading = false,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});

  // Add selection column if selectable
  const columns = useMemo(() => {
    if (!selectable) return initialColumns;
    
    const selectionColumn: ColumnDef<T, any> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="w-4 h-4 rounded border-gray-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    };

    return [selectionColumn, ...initialColumns];
  }, [initialColumns, selectable]);

  // Add actions column if actions exist
  const columnsWithActions = useMemo(() => {
    if (actions.length === 0) return columns;

    const actionsColumn: ColumnDef<T, any> = {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {actions
            .filter(action => !action.hidden?.(row.original))
            .slice(0, 2) // Show first 2 actions as buttons
            .map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => action.onClick(row.original)}
                  disabled={action.disabled?.(row.original)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                </Button>
              );
            })}
          
          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions
                  .filter(action => !action.hidden?.(row.original))
                  .slice(2) // Show remaining actions in dropdown
                  .map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => action.onClick(row.original)}
                        disabled={action.disabled?.(row.original)}
                        className={cn(
                          action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
                        )}
                      >
                        {Icon && <Icon className="w-4 h-4 mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 80,
    };

    return [...columns, actionsColumn];
  }, [columns, actions]);

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortable ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: selectable,
    initialState: {
      pagination: {
        pageSize: pageSizeOptions[0],
      },
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || description) && (
        <div>
          {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          {filters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {Object.keys(columnFilters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(columnFilters).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filters.map((filter) => (
                  <div key={filter.id} className="p-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    {filter.type === 'text' && (
                      <Input
                        placeholder={filter.placeholder}
                        className="mt-1"
                        onChange={(e) => {
                          const value = e.target.value;
                          setColumnFilters(prev => 
                            value ? { ...prev, [filter.id]: value } : 
                            Object.fromEntries(Object.entries(prev).filter(([key]) => key !== filter.id))
                          );
                        }}
                      />
                    )}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Selected Count & Bulk Actions */}
          {selectable && selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              {bulkActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "secondary"}
                    size="sm"
                    onClick={() => action.onClick(selectedRows)}
                    disabled={action.disabled?.(selectedRows)}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-2" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {toolbarActions}
          
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="font-medium">
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center space-x-2",
                          header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {sortable && header.column.getCanSort() && (
                          <div className="flex flex-col">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnsWithActions.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnsWithActions.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                className="h-8 w-16 rounded border border-input bg-background px-2 text-sm"
              >
                {pageSizeOptions.map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center text-sm font-medium w-20">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 