'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  value: number;
  max?: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

const GRADE_COLORS = {
  mandatory: '#ef4444',
  elective: '#f59e0b',
  thesis: '#06b6d4',
};

type Category = 'mandatory' | 'elective' | 'thesis';

export function ProgressRing({
  value,
  max = 100,
  label,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const category = label.toLowerCase() as Category;
  const color = GRADE_COLORS[category] || '#06b6d4';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          {showPercentage && (
            <text
              x={size / 2}
              y={size / 2}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={size * 0.18}
              fontWeight={600}
              fill="white"
            >
              {Math.round(percentage)}%
            </text>
          )}
        </svg>
      </div>
      <span className="text-sm text-slate-400 text-center">{label}</span>
      <span className="text-xs text-slate-500">{value}/{max}h</span>
    </div>
  );
}