import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-tx placeholder:text-tx3',
        'transition-all duration-150',
        'focus:outline-none focus:border-grad1',
        'focus:[box-shadow:0_0_0_2px_color-mix(in_oklab,var(--grad-1)_70%,transparent),0_0_0_4px_color-mix(in_oklab,var(--grad-1)_20%,transparent)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
