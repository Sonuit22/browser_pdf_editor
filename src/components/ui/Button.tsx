import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'default' | 'compact';
};

export function Button({ children, className, variant = 'primary', size = 'default', ...props }: ButtonProps) {
    return (
        <button className={cn('button', `button--${variant}`, `button--${size}`, className)} {...props}>
            {children}
        </button>
    );
}
