import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow hover:brightness-110 active:brightness-95',
  ghost:
    'bg-transparent hover:bg-slate-200/60 dark:hover:bg-slate-700/50 text-ink dark:text-ink-light',
  outline:
    'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-ink dark:text-ink-light',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export default Button;
