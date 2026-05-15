import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <section className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-lg ${className}`}>
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-background">{title}</h1>
        {description && <p className="font-body-md text-body-md text-on-surface-variant mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-base">{children}</div>}
    </section>
  );
};
