'use client';

import React from 'react';

interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}

export function GaugeChart({ value, max, label, color = '#10b981', size = 200 }: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = size / 2 - 10;
  const circumference = Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on value
  const getColor = () => {
    if (percentage >= 70) return '#10b981'; // green
    if (percentage >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const finalColor = color || getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + 20}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M ${size * 0.1} ${size / 2} A ${radius} ${radius} 0 0 1 ${size * 0.9} ${size / 2}`}
            fill="none"
            stroke={finalColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
            style={{
              transform: 'rotate(180deg)',
              transformOrigin: `${size / 2}px ${size / 2}px`,
            }}
          />
        </svg>
        {/* Value text */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-3xl font-bold" style={{ color: finalColor }}>
            {value.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}


