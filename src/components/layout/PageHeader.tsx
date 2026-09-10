import React from 'react';
import { GlobalSearch } from '../GlobalSearch';

interface PageHeaderProps {
  title: string;
  rightSlot?: React.ReactNode;
}

export function PageHeader({ title, rightSlot }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      <div className="flex justify-end">{rightSlot}</div>
    </div>
  );
}
