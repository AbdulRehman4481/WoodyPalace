'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Categories', href: '/categories', icon: FolderTree },
  { name: 'Banners', href: '/banners', icon: ImageIcon },
  { name: 'Deals', href: '/deals', icon: Tag },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen text-white transition-all duration-300 border-r border-white/20 shadow-2xl',
        'bg-gradient-to-b from-slate-900 via-purple-900 to-blue-900',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200',
                isActive
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-gray-200 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-200',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Settings</span>}
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-200 hover:bg-red-500/80 hover:text-white transition-all duration-200',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

