import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { UserProfile } from './UserProfile';

interface SidebarProps {
  activeTab: "library" | "albums" | "stats" | "ai" | "eq";
  setActiveTab: (tab: "library" | "albums" | "stats" | "ai" | "eq") => void;
  onOpenSettings: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onOpenSettings }: SidebarProps) {
  return (
    <div className="w-64 flex-shrink-0 flex flex-col bg-zinc-950 border-r border-white/5 z-20" style={{ WebkitAppRegion: "drag" } as any}>
      <NavigationSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <UserProfile onOpenSettings={onOpenSettings} />
    </div>
  );
}
