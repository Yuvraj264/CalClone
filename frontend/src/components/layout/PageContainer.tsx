import React from 'react';
import { cn } from '../../utils/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'max-w-5xl mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-8 w-full',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageContainer;
