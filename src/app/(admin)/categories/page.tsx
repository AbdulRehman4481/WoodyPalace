import { CategoryTreeWrapper } from '@/components/features/categories/CategoryTreeWrapper';
import { requireAdmin } from '@/lib/auth-helpers';

export default async function CategoriesPage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <CategoryTreeWrapper />
    </div>
  );
}
