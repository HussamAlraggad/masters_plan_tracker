'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Conflict {
  course_id: string;
  section: string;
  time: string;
  location: string;
}

interface ConflictBadgeProps {
  conflicts: Conflict[];
  className?: string;
}

export function ConflictBadge({ conflicts, className }: ConflictBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (conflicts.length === 0) return null;

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={cn(
          'px-2 py-1 text-xs font-medium rounded-lg',
          'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          'flex items-center gap-1',
          'hover:bg-amber-500/30 transition-colors'
        )}
        aria-label={`Schedule conflicts: ${conflicts.length}`}
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>⚠️ {conflicts.length}</span>
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 glass-card p-3 shadow-xl z-50 animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-amber-300">Schedule Conflicts</span>
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            {conflicts.map((conflict, i) => (
              <div key={i} className="p-2 bg-glass-dark rounded border border-glass-border">
                <div className="font-medium text-white">{conflict.course_id}</div>
                <div className="text-slate-400">Sec {conflict.section} • {conflict.time}</div>
                <div className="text-slate-500">{conflict.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}