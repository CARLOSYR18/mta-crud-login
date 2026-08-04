import type { ReactNode } from 'react';

interface BadgeProps {
  tone?: 'brand' | 'slate';
  children: ReactNode;
}

export function Badge({ tone = 'slate', children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}