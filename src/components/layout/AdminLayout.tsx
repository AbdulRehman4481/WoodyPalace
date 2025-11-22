'use client';

import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { KeyboardShortcuts } from '@/components/ui/keyboard-shortcuts';
import { LoadingBar } from '@/components/ui/loading-bar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Loading Bar */}
      <LoadingBar />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader />

        {/* Breadcrumbs removed - handled by PageHeader */}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

