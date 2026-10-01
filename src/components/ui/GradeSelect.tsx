'use client';

import { cn } from '@/lib/utils';

const GRADES = ['', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'] as const;

interface GradeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function GradeSelect({ value, onChange, disabled, className }: GradeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-20 px-2 py-1 text-sm bg-glass-dark border border-glass-border rounded-lg',
        'text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {GRADES.map((grade) => (
        <option key={grade} value={grade}>
          {grade || '—'}
        </option>
      ))}
    </select>
  );
}