import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('glass rounded-2xl shadow-card', className)} {...props} />
  ),
);
Card.displayName = 'Card';

export default Card;
