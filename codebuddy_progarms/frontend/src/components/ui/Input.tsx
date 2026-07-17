import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export default Input;
