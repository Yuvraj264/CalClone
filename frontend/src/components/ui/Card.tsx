import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { hoverScaleVariants } from '../../utils/motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  const cardStyles = cn(
    'bg-white border border-gray-150 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80 transition-all duration-150 overflow-hidden',
    hoverable && 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md/5',
    className
  );

  if (hoverable) {
    return (
      <motion.div
        variants={hoverScaleVariants}
        initial="rest"
        whileHover="hover"
        className={cardStyles}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardStyles} {...props}>
      {children}
    </div>
  );
};

export default Card;
