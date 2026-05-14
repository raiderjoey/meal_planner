import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'surface' | 'error';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm';
  
  const variants = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary text-on-secondary',
    outline: 'border border-primary text-primary',
    surface: 'bg-surface-container-high text-on-surface-variant',
    error: 'bg-error-container text-on-error-container',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
