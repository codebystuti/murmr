import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'primary' | 'ghost' | 'destructive' | 'link';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variantMap: Record<Variant, string> = {
  default: 'cta-secondary',
  primary: 'cta-primary',
  ghost: 'cta-ghost',
  destructive: 'cta-destructive',
  link: 'cta-link',
};

const sizeMap: Record<Size, string> = {
  sm: 'cta-sm',
  md: 'cta-md',
  lg: 'cta-lg',
  icon: 'cta-icon',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const isLink = variant === 'link';
    return (
      <Comp
        className={cn('cta', variantMap[variant], !isLink && sizeMap[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
