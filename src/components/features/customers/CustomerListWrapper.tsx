'use client';

import { useRouter } from 'next/navigation';
import { CustomerList } from './CustomerList';
import { Customer } from '@/types/customer';

export function CustomerListWrapper() {
  const router = useRouter();

  const handleCustomerSelect = (customer: Customer) => {
    router.push(`/customers/${customer.id}`);
  };

  const handleCustomerEdit = (customer: Customer) => {
    router.push(`/customers/${customer.id}/edit`);
  };

  const handleCustomerAdd = () => {
    router.push('/customers/new');
  };

  return (
    <CustomerList
      onCustomerSelect={handleCustomerSelect}
      onCustomerEdit={handleCustomerEdit}
      onCustomerAdd={handleCustomerAdd}
    />
  );
}

