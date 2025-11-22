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
    <aside
      className={cn(
        'flex flex-col h-screen border-r bg-card transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-[70px]' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 z-40 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent hover:text-accent-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      <div className={cn("flex items-center h-16 px-4 border-b", collapsed ? "justify-center" : "justify-start")}>
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <Package className="h-4 w-4" />
          </div>
          <span className={cn("font-bold text-lg transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
            Ecommerce
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                collapsed ? 'justify-center' : ''
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
              <span className={cn(
                "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}>
                {item.name}
              </span>
              {/* Tooltip for collapsed state could go here if using Tooltip component */}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t space-y-1">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 group',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className={cn(
            "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Settings
          </span>
        </Link>
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className={cn(
            "font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}

