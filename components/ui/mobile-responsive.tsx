// Mobile-Responsive UI Components with Touch Gestures
'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Button } from './button';
import { Input } from './input';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Separator } from './separator';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  X,
  Menu,
  Check,
  Trash2,
  Edit
} from 'lucide-react';

// Hook to detect mobile viewport
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Touch gesture hook
export function useTouchGestures(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// Mobile-optimized header
interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: ReactNode;
  subtitle?: string;
  isOnline?: boolean;
  lastSync?: Date | null;
}

export function MobileHeader({ 
  title, 
  onBack, 
  actions, 
  subtitle, 
  isOnline = true, 
  lastSync 
}: MobileHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "sticky top-0 z-50 border-b bg-background/95 backdrop-blur",
      "supports-[backdrop-filter]:bg-background/60"
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Offline indicator */}
          {!isOnline && (
            <Badge variant="secondary" className="text-xs">
              Offline
            </Badge>
          )}
          
          {/* Sync status */}
          {lastSync && (
            <Badge variant="outline" className="text-xs">
              {new Date(lastSync).toLocaleTimeString()}
            </Badge>
          )}
          
          {actions}
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized card with swipe actions
interface SwipeCardProps {
  children: ReactNode;
  className?: string;
  leftActions?: { icon: ReactNode; label: string; onClick: () => void; variant?: 'default' | 'destructive' }[];
  rightActions?: { icon: ReactNode; label: string; onClick: () => void; variant?: 'default' | 'destructive' }[];
  disabled?: boolean;
}

export function SwipeCard({ 
  children, 
  className, 
  leftActions = [], 
  rightActions = [],
  disabled = false
}: SwipeCardProps) {
  const [swiped, setSwiped] = useState<'left' | 'right' | null>(null);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const isMobile = useIsMobile();

  const gestures = useTouchGestures(
    () => {
      if (disabled || rightActions.length === 0) return;
      setSwiped('right');
      setIsActionsVisible(true);
    },
    () => {
      if (disabled || leftActions.length === 0) return;
      setSwiped('left');
      setIsActionsVisible(true);
    }
  );

  const handleActionClick = (action: () => void) => {
    action();
    setSwiped(null);
    setIsActionsVisible(false);
  };

  const handleCardClick = () => {
    if (isActionsVisible) {
      setSwiped(null);
      setIsActionsVisible(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Left actions */}
      {leftActions.length > 0 && (
        <div className={cn(
          "absolute left-0 top-0 h-full flex items-center transition-transform duration-200",
          swiped === 'left' ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="flex h-full">
            {leftActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => handleActionClick(action.onClick)}
                className="h-full rounded-none px-4 flex-col gap-1"
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Right actions */}
      {rightActions.length > 0 && (
        <div className={cn(
          "absolute right-0 top-0 h-full flex items-center transition-transform duration-200",
          swiped === 'right' ? 'translate-x-0' : 'translate-x-full'
        )}>
          <div className="flex h-full">
            {rightActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={() => handleActionClick(action.onClick)}
                className="h-full rounded-none px-4 flex-col gap-1"
              >
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main card */}
      <Card
        className={cn(
          "transition-transform duration-200 cursor-pointer active:scale-[0.99]",
          swiped === 'left' && `translate-x-[${leftActions.length * 80}px]`,
          swiped === 'right' && `translate-x-[-${rightActions.length * 80}px]`,
          className
        )}
        onClick={handleCardClick}
        {...(isMobile ? gestures : {})}
      >
        {children}
      </Card>
    </div>
  );
}

// Mobile-optimized form
interface MobileFormProps {
  children: ReactNode;
  title?: string;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
  isValid?: boolean;
}

export function MobileForm({ 
  children, 
  title, 
  onSubmit, 
  onCancel, 
  submitText = 'Save',
  isLoading = false,
  isValid = true
}: MobileFormProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {children}
        </div>

        {/* Sticky bottom actions */}
        <div className="sticky bottom-0 border-t bg-background p-4 flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className="flex-1"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Saving...' : submitText}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Mobile-optimized list view
interface MobileListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRefresh?: () => void;
  searchable?: boolean;
  onSearch?: (query: string) => void;
  filterable?: boolean;
  onFilter?: () => void;
  className?: string;
}

export function MobileList<T>({
  items,
  renderItem,
  loading = false,
  error,
  emptyMessage = 'No items found',
  onRefresh,
  searchable = false,
  onSearch,
  filterable = false,
  onFilter,
  className
}: MobileListProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMobile = useIsMobile();

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          {onRefresh && (
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {/* Search and filters */}
      {(searchable || filterable) && (
        <div className="flex gap-2 p-4 border-b">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          {filterable && (
            <Button variant="outline" size="sm" onClick={onFilter}>
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Pull to refresh */}
      {onRefresh && (
        <div className="text-center py-2 text-sm text-muted-foreground">
          Pull down to refresh
        </div>
      )}

      {/* List content */}
      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-muted-foreground text-center">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {items.map((item, index) => (
              <div key={index}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {(loading || isRefreshing) && items.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 text-center">
          <div className="inline-flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            {isRefreshing ? 'Refreshing...' : 'Loading...'}
          </div>
        </div>
      )}
    </div>
  );
}

// Mobile-optimized bottom sheet
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: ('25%' | '50%' | '75%' | '90%')[];
  initialSnap?: number;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = ['50%'],
  initialSnap = 0
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const isMobile = useIsMobile();

  const gestures = useTouchGestures(
    undefined,
    undefined,
    () => {
      // Swipe up to expand
      if (currentSnap < snapPoints.length - 1) {
        setCurrentSnap(prev => prev + 1);
      }
    },
    () => {
      // Swipe down to collapse or close
      if (currentSnap > 0) {
        setCurrentSnap(prev => prev - 1);
      } else {
        onClose();
      }
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-background rounded-t-xl border-t",
          "transition-transform duration-300 ease-out"
        )}
        style={{ height: snapPoints[currentSnap] }}
        {...gestures}
      >
        {/* Handle */}
        <div className="flex justify-center pt-2 pb-4">
          <div className="w-8 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized floating action button
interface MobileFABProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  variant?: 'default' | 'secondary';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function MobileFAB({
  onClick,
  icon = <Plus className="h-5 w-5" />,
  label,
  variant = 'default',
  position = 'bottom-right'
}: MobileFABProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed z-40 shadow-lg",
        positionClasses[position],
        label ? "px-4 py-3 h-auto" : "h-14 w-14 rounded-full p-0"
      )}
      variant={variant}
    >
      {icon}
      {label && <span className="ml-2 text-sm font-medium">{label}</span>}
    </Button>
  );
} 