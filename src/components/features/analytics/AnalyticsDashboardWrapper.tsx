'use client';

import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { toast } from '@/lib/toast';

export function AnalyticsDashboardWrapper() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
    toast.success('Analytics data refreshed');
  };

  const handleExport = (type: string) => {
    toast.info(`Export ${type} feature coming soon!`);
  };

  return (
    <AnalyticsDashboard
      onRefresh={handleRefresh}
      onExport={handleExport}
    />
  );
}

