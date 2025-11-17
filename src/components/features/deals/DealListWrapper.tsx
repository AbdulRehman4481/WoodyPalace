'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Deal } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Plus, Edit, Trash2, Clock, Package, Star } from 'lucide-react';
import { toast } from '@/lib/toast';
import { formatCurrency } from '@/lib/utils';

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
      return { label: 'Inactive', color: 'bg-gray-500' };
    }

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-500' };
    }

    if (now > end) {
      return { label: 'Expired', color: 'bg-red-500' };
    }

    return { label: 'Active', color: 'bg-green-500' };
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
      <PageHeader
        title="Deals"
        description="Manage product deals with limited time offers"
        actions={[
          {
            label: 'Create Deal',
            onClick: () => router.push('/deals/new'),
            icon: Plus,
          },
        ]}
      />

      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
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

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading deals...</div>
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          title="No deals found"
          description="Get started by creating a new deal."
          action={
            <Button onClick={() => router.push('/deals/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((deal) => {
            const status = getDealStatus(deal);
            const timeRemaining = getTimeRemaining(deal.endDate);
            const productCount = deal.dealProducts?.length || 0;

            return (
              <Card key={deal.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{deal.title}</CardTitle>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deal.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {deal.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Starts: {formatDate(deal.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Ends: {formatDate(deal.endDate)}</span>
                    </div>
                    {status.label === 'Active' && (
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        <Clock className="h-4 w-4" />
                        <span>{timeRemaining}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {productCount} {productCount === 1 ? 'product' : 'products'}
                      </span>
                    </div>

                    {deal.massiveDealProduct && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-gray-600 font-semibold">
                          Massive Deal: {deal.massiveDealProduct.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/deals/${deal.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(deal.id, deal.title)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


