import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors duration-fast',
          'placeholder:text-neutral-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-error focus-visible:ring-error'
            : 'border-neutral-300 hover:border-neutral-400',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
