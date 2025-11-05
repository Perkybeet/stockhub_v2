'use client';

import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface ResponsiveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

const sizeClasses = {
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
  full: 'max-w-full',
};

export function ResponsiveForm({
  open,
  onOpenChange,
  title,
  description,
  children,
  header,
  footer,
  size = '5xl',
  className,
}: ResponsiveFormProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="flex h-[95vh] max-h-[95vh] flex-col">
          {/* Header */}
          <DrawerHeader className="shrink-0 border-b-2 border-border px-4 py-4 bg-muted/30 text-left">
            {header ? (
              header
            ) : (
              <>
                <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
                {description && (
                  <DrawerDescription className="text-sm text-muted-foreground mt-1">
                    {description}
                  </DrawerDescription>
                )}
              </>
            )}
          </DrawerHeader>

          {/* Content - Scrollable */}
          <div className={cn('flex-1 overflow-y-auto px-4 py-4', className)}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 border-t border-border px-4 py-4 bg-muted/20">
              {footer}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex h-[90vh] max-h-[90vh] flex-col gap-0 p-0',
          sizeClasses[size],
          className
        )}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="shrink-0 border-b-2 border-border px-6 py-5 bg-muted/30 text-left">
          {header ? (
            header
          ) : (
            <>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground mt-2">
                  {description}
                </DialogDescription>
              )}
            </>
          )}
        </DialogHeader>

        {/* Content - Scrollable */}
        <div className={cn('flex-1 overflow-y-auto px-6 py-4', className)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-border px-6 py-4 bg-muted/20">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
