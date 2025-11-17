'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BannerForm } from '@/components/features/banners/BannerForm';
import { Banner, UpdateBannerRequest } from '@/types/banner';
import { toast } from '@/lib/toast';
import { Loader2 } from 'lucide-react';

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/banners/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setBanner(data.data);
        } else {
          setError(data.error || 'Failed to load banner');
        }
      } catch (err) {
        setError('Failed to load banner');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBanner();
    }
  }, [id]);

  const handleSubmit = async (data: UpdateBannerRequest) => {
    setSubmitting(true);
    setError(null);

    const updatePromise = fetch(`/api/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update banner');
      }
      return response.json();
    });

    toast.promise(updatePromise, {
      loading: 'Updating banner...',
      success: () => {
        router.push('/banners');
        router.refresh();
        return 'Banner updated successfully!';
      },
      error: (err) => {
        setSubmitting(false);
        setError(err.message);
        return err.message || 'Failed to update banner';
      },
    });
  };

  const handleCancel = () => {
    router.push('/banners');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="p-6">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error || 'Banner not found'}</p>
        </div>
        <button
          onClick={() => router.push('/banners')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Banners
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Banner</h1>
        <p className="text-gray-600 mt-1">
          Update banner information.
        </p>
      </div>

      <BannerForm
        banner={banner}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={submitting}
      />
    </div>
  );
}

