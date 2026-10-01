'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'pending' | 'registered' | 'passed' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG = {
  pending: {
    bg: 'bg-status-pending/20',
    text: 'text-status-pending',
    border: 'border-status-pending/30',
    label: 'Pending',
  },
  registered: {
    bg: 'bg-status-registered/20',
    text: 'text-status-registered',
    border: 'border-status-registered/30',
    label: 'Registered',
  },
  passed: {
    bg: 'bg-status-passed/20',
    text: 'text-status-passed',
    border: 'border-status-passed/30',
    label: 'Passed',
  },
  failed: {
    bg: 'bg-status-failed/20',
    text: 'text-status-failed',
    border: 'border-status-failed/30',
    label: 'Failed',
  },
};

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        SIZE_CLASSES[size],
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.text.replace('text', 'bg'))} />
      {config.label}
    </span>
  );
}