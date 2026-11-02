import React, { type HTMLAttributes, type ElementType } from 'react';
import { cn } from '@/utils/cn';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cleanPadding?: boolean;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  as: Component = 'div',
  size = 'xl',
  cleanPadding = false,
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        !cleanPadding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
