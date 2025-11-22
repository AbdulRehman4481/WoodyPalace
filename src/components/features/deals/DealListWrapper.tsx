'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Deal } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus, Edit, Trash2, Clock, Package, Star, Filter, Tag } from 'lucide-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading';

export function DealListWrapper() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadDeals();
  }, [filterStatus]);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus === 'active') {
        params.append('isActiveNow', 'true');
      } else if (filterStatus === 'upcoming') {
        params.append('isUpcoming', 'true');
      } else if (filterStatus === 'expired') {
        params.append('isExpired', 'true');
      } else if (filterStatus === 'inactive') {
        params.append('isActive', 'false');
      }

      const response = await fetch(`/api/deals?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDeals(data.data.data || []);
      } else {
        toast.error(data.error || 'Failed to load deals');
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Deal deleted successfully');
        loadDeals();
      } else {
        toast.error(data.error || 'Failed to delete deal');
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      toast.error('Failed to delete deal');
    }
  };

  const getDealStatus = (deal: Deal) => {
    const now = new Date();
    const start = new Date(deal.startDate);
    const end = new Date(deal.endDate);

    if (!deal.isActive) {
      return { label: 'Inactive', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' };
    }

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    }

    if (now > end) {
      return { label: 'Expired', color: 'bg-red-500/10 text-red-500 border-red-500/20' };
    }

    return { label: 'Active', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endDate: Date | string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white/5 border-white/10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deals</SelectItem>
              <SelectItem value="active">Active Now</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : deals.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            icon={Tag}
            title="No deals found"
            description="Get started by creating a new deal."
            action={{
              label: 'Create Deal',
              onClick: () => router.push('/deals/new'),
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const status = getDealStatus(deal);
            const timeRemaining = getTimeRemaining(deal.endDate);
            const productCount = deal.dealProducts?.length || 0;

            return (
              <div
                key={deal.id}
                className="glass-card group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="p-5 border-b border-white/5 bg-white/5 flex items-start justify-between">
                  <h3 className="font-semibold text-lg truncate flex-1 pr-2">{deal.title}</h3>
                  <Badge variant="outline" className={cn("whitespace-nowrap", status.color)}>
                    {status.label}
                  </Badge>
                </div>

                <div className="p-5 space-y-4">
                  {deal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                      {deal.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary/50" />
                      <span>Starts: {formatDate(deal.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary/50" />
                      <span>Ends: {formatDate(deal.endDate)}</span>
                    </div>
                    {status.label === 'Active' && (
                      <div className="flex items-center gap-2 text-red-500 font-semibold animate-pulse">
                        <Clock className="h-4 w-4" />
                        <span>{timeRemaining}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {productCount} {productCount === 1 ? 'product' : 'products'}
                      </span>
                    </div>

                    {deal.massiveDealProduct && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-foreground font-medium truncate">
                          Massive Deal: {deal.massiveDealProduct.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary"
                    onClick={() => router.push(`/deals/${deal.id}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => handleDelete(deal.id, deal.title)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


