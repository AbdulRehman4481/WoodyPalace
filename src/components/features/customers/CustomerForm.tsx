'use client';

import React, { useState } from 'react';
import { Customer, UpdateCustomerRequest } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateCustomerSchema } from '@/lib/validations';
import { Loader2, User, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: UpdateCustomerRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, loading = false }: CustomerFormProps) {
  const [isActive, setIsActive] = useState(customer?.isActive ?? true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UpdateCustomerRequest>({
    resolver: zodResolver(updateCustomerSchema) as any,
    defaultValues: {
      email: customer?.email || '',
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      phone: customer?.phone || '',
      address: customer?.address ? {
        firstName: customer.address.firstName || '',
        lastName: customer.address.lastName || '',
        address1: customer.address.address1 || '',
        address2: customer.address.address2 || '',
        city: customer.address.city || '',
        state: customer.address.state || '',
        zipCode: customer.address.zipCode || '',
        country: customer.address.country || '',
      } : undefined,
      isActive: customer?.isActive ?? true,
    },
  });

  const watchedAddress = watch('address');

  // Handle form submission
  const onFormSubmit = async (data: UpdateCustomerRequest) => {
    try {
      // Clean up empty strings
      const cleanedData = {
        ...data,
        phone: data.phone === '' ? undefined : data.phone,
        address: data.address ? {
          ...data.address,
          address2: data.address.address2 === '' ? undefined : data.address.address2,
        } : undefined,
        isActive,
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address.firstName">First Name</Label>
                  <Input
                    id="address.firstName"
                    {...register('address.firstName')}
                    placeholder="Enter first name"
                  />
                  {errors.address?.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.firstName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address.lastName">Last Name</Label>
                  <Input
                    id="address.lastName"
                    {...register('address.lastName')}
                    placeholder="Enter last name"
                  />
                  {errors.address?.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address.address1">Address Line 1</Label>
                <Input
                  id="address.address1"
                  {...register('address.address1')}
                  placeholder="Enter street address"
                />
                {errors.address?.address1 && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.address1.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address.address2">Address Line 2</Label>
                <Input
                  id="address.address2"
                  {...register('address.address2')}
                  placeholder="Apartment, suite, etc. (optional)"
                />
                {errors.address?.address2 && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.address2.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city">City</Label>
                  <Input
                    id="address.city"
                    {...register('address.city')}
                    placeholder="Enter city"
                  />
                  {errors.address?.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address.state">State</Label>
                  <Input
                    id="address.state"
                    {...register('address.state')}
                    placeholder="Enter state"
                  />
                  {errors.address?.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address.zipCode">ZIP Code</Label>
                  <Input
                    id="address.zipCode"
                    {...register('address.zipCode')}
                    placeholder="Enter ZIP code"
                  />
                  {errors.address?.zipCode && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.zipCode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address.country">Country</Label>
                <Input
                  id="address.country"
                  {...register('address.country')}
                  placeholder="Enter country"
                />
                {errors.address?.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.address.country.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked as boolean)}
                />
                <Label htmlFor="isActive">Active Account</Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Inactive customers cannot place orders or access their account.
              </p>
            </CardContent>
          </Card>

          {/* Customer Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {watch('firstName')} {watch('lastName')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{watch('email')}</span>
                </div>
                {watch('phone') && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{watch('phone')}</span>
                  </div>
                )}
                {watchedAddress?.address1 && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {watchedAddress.address1}, {watchedAddress.city}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Update Customer
        </Button>
      </div>
    </form>
  );
}
