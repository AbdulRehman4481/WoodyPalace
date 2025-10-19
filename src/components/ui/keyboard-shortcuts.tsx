'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Ctrl/Cmd is pressed
      const isMod = event.ctrlKey || event.metaKey;

      if (!isMod) return;

      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      switch (event.key) {
        case 'k':
          // Ctrl+K: Focus search (future implementation)
          event.preventDefault();
          break;
        case 'p':
          // Ctrl+P: New product
          event.preventDefault();
          router.push('/products/new');
          break;
        case 'o':
          // Ctrl+O: Orders
          event.preventDefault();
          router.push('/orders');
          break;
        case 'u':
          // Ctrl+U: Customers
          event.preventDefault();
          router.push('/customers');
          break;
        case 'h':
          // Ctrl+H: Home/Dashboard
          event.preventDefault();
          router.push('/');
          break;
        case '/':
          // Ctrl+/: Help (show keyboard shortcuts)
          event.preventDefault();
          // TODO: Show keyboard shortcuts modal
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  return null;
}

