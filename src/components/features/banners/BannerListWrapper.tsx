'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Banner, BannerType } from '@/types/banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/toast';

export function BannerListWrapper() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  useEffect(() => {
    loadBanners();
  }, [filterType, filterActive]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      if (filterActive !== 'all') {
        params.append('isActive', filterActive === 'active' ? 'true' : 'false');
      }

      const response = await fetch(`/api/banners?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBanners(data.data.data || []);
      } else {
        toast.error(data.error || 'Failed to load banners');
      }
    } catch (error) {
      console.error('Failed to load banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Banner deleted successfully');
        loadBanners();
      } else {
        toast.error(data.error || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const getTypeBadgeColor = (type: BannerType) => {
    switch (type) {
      case BannerType.NEW_ARRIVAL:
        return 'bg-blue-500';
      case BannerType.DISCOUNT:
        return 'bg-red-500';
      case BannerType.COMING_SOON:
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: BannerType) => {
    switch (type) {
      case BannerType.NEW_ARRIVAL:
        return 'New Arrival';
      case BannerType.DISCOUNT:
        return 'Discount';
      case BannerType.COMING_SOON:
        return 'Coming Soon';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banners"
        description="Manage website banners (New Arrival, Discount, Coming Soon)"
        actions={[
          {
            label: 'Add Banner',
            onClick: () => router.push('/banners/new'),
            icon: Plus,
          },
        ]}
      />

      <div className="flex gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={BannerType.NEW_ARRIVAL}>New Arrival</SelectItem>
            <SelectItem value={BannerType.DISCOUNT}>Discount</SelectItem>
            <SelectItem value={BannerType.COMING_SOON}>Coming Soon</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          title="No banners found"
          description="Get started by creating a new banner."
          action={
            <Button onClick={() => router.push('/banners/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {banner.image ? (
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {!banner.isActive && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg truncate flex-1">{banner.title}</h3>
                  <Badge className={getTypeBadgeColor(banner.type)}>
                    {getTypeLabel(banner.type)}
                  </Badge>
                </div>
                {banner.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {banner.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Order: {banner.sortOrder}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/banners/${banner.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(banner.id, banner.title)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

