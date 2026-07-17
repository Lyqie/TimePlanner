import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-400/60 focus:border-transparent cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export default Select;
