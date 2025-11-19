'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  growth, 
  icon, 
  iconColor = 'bg-blue-500',
  className 
}: MetricCardProps) {
  const hasGrowth = growth !== undefined;
  const isPositive = hasGrowth && growth >= 0;

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {hasGrowth && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-sm font-medium',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', iconColor)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


