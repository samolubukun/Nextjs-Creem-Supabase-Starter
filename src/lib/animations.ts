import type { Variants } from "framer-motion";

export const FADE_IN_UP: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const SCALE_IN: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export const STAGGER_CONTAINER: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const LOGO_FLOAT: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: (custom: { y: number[]; duration: number; delay?: number }) => ({
    opacity: 0.3,
    scale: 1,
    x: 0,
    y: custom.y,
    transition: {
      opacity: { duration: 1, delay: custom.delay || 0 },
      y: { duration: custom.duration, repeat: Infinity, ease: "easeInOut" },
    },
  }),
};

export const BAR_FILL: Variants = {
  initial: { width: 0 },
  whileInView: (width: string) => ({
    width,
    transition: { duration: 1, ease: "easeOut" },
  }),
};
