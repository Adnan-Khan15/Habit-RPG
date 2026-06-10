import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const base = 'font-semibold rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
    const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
    const variants = {
      primary: 'bg-accent-gold text-black hover:brightness-110',
      ghost: 'text-text-primary hover:bg-white/5',
      danger: 'bg-accent-red text-white hover:brightness-110',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
