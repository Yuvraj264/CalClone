import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-gray-150 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;
