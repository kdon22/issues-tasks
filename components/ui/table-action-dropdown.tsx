import { Button } from './button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
  separator?: boolean; // Add separator after this item
}

interface TableActionDropdownProps {
  actions: ActionItem[];
  align?: 'start' | 'center' | 'end';
}

export function TableActionDropdown({ actions, align = 'end' }: TableActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {actions.map((action, index) => (
          <div key={index}>
            <DropdownMenuItem 
              onClick={action.onClick}
              className={action.variant === 'destructive' ? 'text-destructive' : ''}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
            {action.separator && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 