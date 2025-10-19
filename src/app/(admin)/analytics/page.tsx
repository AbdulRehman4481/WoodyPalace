import { AnalyticsDashboardWrapper } from '@/components/features/analytics/AnalyticsDashboardWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <AnalyticsDashboardWrapper />
    </div>
  );
}
