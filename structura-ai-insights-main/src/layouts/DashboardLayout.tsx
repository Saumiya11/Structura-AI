import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex w-full blueprint-grid">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn("flex-1 flex flex-col transition-all duration-300", collapsed ? "ml-16" : "ml-60")}>
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
