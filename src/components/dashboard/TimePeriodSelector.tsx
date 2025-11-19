'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  className?: string;
}

export function TimePeriodSelector({ value, onChange, className }: TimePeriodSelectorProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(period.value)}
          className={cn(
            'text-xs',
            value === period.value && 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {period.label}
        </Button>
      ))}
    </div>
  );
}


