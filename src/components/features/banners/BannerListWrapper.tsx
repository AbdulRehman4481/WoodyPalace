'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Banner, BannerType } from '@/types/banner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Edit, Trash2, Image as ImageIcon, Filter } from 'lucide-react';
import Image from 'next/image';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

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
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case BannerType.DISCOUNT:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case BannerType.COMING_SOON:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
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
      {/* Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
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
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : banners.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            icon={ImageIcon}
            title="No banners found"
            description="Get started by creating a new banner."
            action={{
              label: 'Add Banner',
              onClick: () => router.push('/banners/new'),
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="glass-card group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="relative h-48 bg-black/20 overflow-hidden">
                {banner.image ? (
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {!banner.isActive && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/10">
                      Inactive
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                    onClick={() => router.push(`/banners/${banner.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md border border-white/10"
                    onClick={() => handleDelete(banner.id, banner.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg truncate flex-1 pr-2">{banner.title}</h3>
                  <Badge variant="outline" className={cn("whitespace-nowrap", getTypeBadgeColor(banner.type))}>
                    {getTypeLabel(banner.type)}
                  </Badge>
                </div>

                {banner.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5em]">
                    {banner.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-muted-foreground font-medium bg-white/5 px-2 py-1 rounded-md">
                    Sort Order: {banner.sortOrder}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(banner.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

