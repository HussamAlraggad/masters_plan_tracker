'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  title: string;
  order: number;
  due_date: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  onUpdate?: (id: string, status: Milestone['status']) => void;
  onEdit?: (milestone: Milestone) => void;
}

const STATUS_COLORS = {
  pending: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_ICONS = {
  pending: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  in_progress: (
    <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  completed: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  ),
};

export function MilestoneCard({ milestone, onUpdate, onEdit }: MilestoneCardProps) {
  const statusColor = STATUS_COLORS[milestone.status];
  const statusLabel = STATUS_LABELS[milestone.status];
  const statusIcon = STATUS_ICONS[milestone.status];

  const handleStatusChange = (newStatus: Milestone['status']) => {
    onUpdate?.(milestone.id, newStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: milestone.order * 0.05 }}
      className={cn(
        'glass-card p-4 relative overflow-hidden',
        'border-l-4',
        statusColor.replace('bg-', 'bg-').replace('text-', '').replace('border-', 'border-')
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', statusColor)}>
              {statusLabel}
            </span>
            {milestone.due_date && (
              <span className="px-2 py-0.5 text-xs text-slate-500 bg-glass-dark rounded border border-glass-border">
                Due: {new Date(milestone.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg text-white mb-1">{milestone.title}</h3>
          {milestone.notes && (
            <p className="text-sm text-slate-400 line-clamp-2">{milestone.notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={cn('p-2 rounded-full', statusColor.replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', ''))}>
            {statusIcon}
          </span>
          <div className="flex gap-1">
            {milestone.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange(milestone.status === 'pending' ? 'in_progress' : 'completed')}
                className={cn(
                  'px-2 py-1 text-xs rounded border transition-colors',
                  milestone.status === 'pending'
                    ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
                    : 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10'
                )}
              >
                {milestone.status === 'pending' ? 'Start' : 'Complete'}
              </button>
            )}
            <button
              onClick={() => onEdit?.(milestone)}
              className="px-2 py-1 text-xs rounded border border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: milestone.status === 'completed' ? '100%' : milestone.status === 'in_progress' ? '50%' : '0%' }}
        className="absolute bottom-0 left-0 h-1 bg-accent transition-all duration-500"
      />
    </motion.div>
  );
}