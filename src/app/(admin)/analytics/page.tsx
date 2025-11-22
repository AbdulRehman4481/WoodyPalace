import { AnalyticsDashboardWrapper } from '@/components/features/analytics/AnalyticsDashboardWrapper';
import { requireAdmin } from '@/lib/auth-helpers';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Comprehensive insights into your business performance, sales, and customer behavior."
        breadcrumbs={[
          { label: 'Analytics', href: '/analytics' },
        ]}
      />

      <AnalyticsDashboardWrapper />
    </div>
  );
}
