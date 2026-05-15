import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tonal';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-label-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:opacity-90 shadow-sm',
    secondary: 'bg-secondary text-on-secondary hover:opacity-90 shadow-sm',
    outline: 'border border-primary text-primary hover:bg-primary-fixed transition-colors',
    ghost: 'text-on-surface-variant hover:bg-surface-container-low',
    tonal: 'bg-primary-container text-on-primary-container hover:opacity-90',
  };

  const sizes = {
    sm: 'px-4 py-2 text-label-sm',
    md: 'px-6 py-3 text-label-md',
    lg: 'px-8 py-4 text-label-md',
    icon: 'p-2',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
