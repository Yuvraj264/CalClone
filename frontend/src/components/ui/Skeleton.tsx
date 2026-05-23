import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gray-100 dark:bg-gray-800 border border-transparent',
        className
      )}
      {...props}
    />
  );
};

export default Skeleton;
