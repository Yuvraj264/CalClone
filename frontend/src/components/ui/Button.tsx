import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { hoverScaleVariants } from '../../utils/motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-gray-900 text-white border-transparent hover:bg-gray-800 active:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-100',
    secondary: 'bg-gray-100 text-gray-900 border-transparent hover:bg-gray-200/80 active:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700',
    outline: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-800/50',
    ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/40',
    destructive: 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/70 active:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <motion.button
      variants={hoverScaleVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
