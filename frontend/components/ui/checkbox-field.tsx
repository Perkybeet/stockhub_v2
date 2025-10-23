'use client';

import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface CheckboxFieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxField({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: CheckboxFieldProps) {
  return (
    <div
      className={cn(
        'flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 transition-colors',
        !disabled && 'cursor-pointer hover:bg-accent/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div className="space-y-1 leading-none flex-1">
        <label 
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', 
            !disabled && 'cursor-pointer'
          )}
          onClick={() => !disabled && onCheckedChange(!checked)}
        >
          {label}
        </label>
        {description && (
          <p 
            className={cn('text-sm text-muted-foreground', !disabled && 'cursor-pointer')}
            onClick={() => !disabled && onCheckedChange(!checked)}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
