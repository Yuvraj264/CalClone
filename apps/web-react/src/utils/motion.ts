import { Variants } from 'framer-motion';

/**
 * Professional spring physics configurations.
 */
export const springTransition = {
  type: 'spring',
  damping: 25,
  stiffness: 220,
};

/**
 * Standard page transition variants for seamless routing fades.
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/**
 * Hover scale variant for custom buttons and cards.
 */
export const hoverScaleVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.015,
    transition: { duration: 0.1, ease: 'easeInOut' },
  },
  tap: {
    scale: 0.985,
  },
};

/**
 * Modal overlay backdrop animation presets.
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

/**
 * Modal content sheet variants.
 */
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 12,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 260,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 12,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};
