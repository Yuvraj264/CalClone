import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  label,
  error,
  type = 'text',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        className={cn(
          'w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all placeholder-gray-400 dark:placeholder-gray-600',
          error && 'border-rose-300 focus:ring-rose-500 focus:border-rose-500',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
