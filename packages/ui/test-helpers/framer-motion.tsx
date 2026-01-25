import type { HTMLAttributes, ReactNode } from 'react';

interface MotionDivProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const motion = {
  div: ({ children, ...rest }: MotionDivProps) => <div {...rest}>{children}</div>,
};

export function useInView() {
  return true;
}
