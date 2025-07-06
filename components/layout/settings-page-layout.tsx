// Settings Page Layout - Reusable component for inline editing settings pages
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { PageLayout } from './page-layout';
import { Plus } from 'lucide-react';

interface SettingsAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

interface SettingsPageLayoutProps {
  title: string;
  description: string;
  actions?: SettingsAction[];
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  usePageLayout?: boolean; // Whether to wrap in PageLayout (for settings pages) or not (for main app pages)
}

export function SettingsPageLayout({ 
  title, 
  description, 
  actions = [], 
  children, 
  maxWidth = '4xl',
  usePageLayout = true 
}: SettingsPageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full'
  };

  const content = (
    <div className={`mx-auto space-y-6 ${maxWidthClasses[maxWidth]}`}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    className={
                      action.className || 
                      (action.variant === 'default' ? '' : 'text-slate-700 border-slate-300 hover:bg-slate-50')
                    }
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  if (usePageLayout) {
    return <PageLayout>{content}</PageLayout>;
  }

  return content;
}

// Category component for grouped settings (like status categories)
interface SettingsCategoryProps {
  name: string;
  description?: string;
  onAdd?: () => void;
  children: React.ReactNode;
}

export function SettingsCategory({ name, description, onAdd, children }: SettingsCategoryProps) {
  return (
    <div className="space-y-2">
      {/* Category Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-md border border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900">{name}</h3>
          {description && (
            <p className="text-xs text-slate-600 mt-0.5">{description}</p>
          )}
        </div>
        {onAdd && (
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 hover:bg-slate-200"
            onClick={onAdd}
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Category Content */}
      <div className="space-y-1 px-3">
        {children}
      </div>
    </div>
  );
}

// Item component for individual settings items
interface SettingsItemProps {
  children: React.ReactNode;
  isChild?: boolean; // For nested items (like labels under groups)
  className?: string;
}

export function SettingsItem({ children, isChild = false, className }: SettingsItemProps) {
  return (
    <div className={`py-2 ${isChild ? 'ml-6' : ''} ${className || ''}`}>
      {children}
    </div>
  );
} 