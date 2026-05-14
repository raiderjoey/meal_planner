import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      className={`material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
