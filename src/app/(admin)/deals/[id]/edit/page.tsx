'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DealForm } from '@/components/features/deals/DealForm';
import { Deal, UpdateDealRequest } from '@/types/deal';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setDeal(data.data);
        } else {
          setError(data.error || 'Failed to load deal');
        }
      } catch (err) {
        setError('Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDeal();
    }
  }, [id]);

  const handleSubmit = async (data: UpdateDealRequest) => {
    setSubmitting(true);
    setError(null);

    const updatePromise = fetch(`/api/deals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update deal');
      }
      return response.json();
    });

    toast.promise(updatePromise, {
      loading: 'Updating deal...',
      success: () => {
        router.push('/deals');
        router.refresh();
        return 'Deal updated successfully!';
      },
      error: (err) => {
        setSubmitting(false);
        setError(err.message);
        return err.message || 'Failed to update deal';
      },
    });
  };

  const handleCancel = () => {
    router.push('/deals');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error || 'Deal not found'}</p>
        </div>
        <button
          onClick={() => router.push('/deals')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Deals
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Deal</h1>
        <p className="text-gray-600 mt-1">
          Update deal information and products.
        </p>
      </div>

      <DealForm
        deal={deal}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </div>
  );
}

