import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>
  );
}
