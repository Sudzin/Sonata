import React from 'react';
import { GlobalSearch } from '../GlobalSearch';

interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
  rightSlot?: React.ReactNode;
}

export function PageHeader({ title, showSearch = true, rightSlot }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-white w-1/4">{title}</h1>
      
      {showSearch && (
        <div className="flex-1 max-w-xl flex justify-center">
          <GlobalSearch />
        </div>
      )}
      
      <div className="w-1/4 flex justify-end">{rightSlot}</div>
    </div>
  );
}
