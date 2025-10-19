'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { name: 'Home', href: '/', current: pathname === '/' },
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      
      // Format the name
      let name = path.charAt(0).toUpperCase() + path.slice(1);
      if (path === 'new') name = 'New';
      if (path === 'edit') name = 'Edit';
      
      breadcrumbs.push({
        name,
        href: currentPath,
        current: isLast,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page or login
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <nav className="flex px-6 py-3 glass-card border-b border-slate-200/50 shadow-sm">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {breadcrumb.current ? (
              <span className="text-sm font-medium text-gray-900">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className={cn(
                  'text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors',
                  index === 0 && 'flex items-center'
                )}
              >
                {index === 0 && <Home className="h-4 w-4 mr-1" />}
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

