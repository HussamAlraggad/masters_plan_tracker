'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { MilestoneCard } from '@/components/ui/MilestoneCard';
import { ThesisMilestone } from '@/types';
import { useUIStore } from '@/store/ui';

interface ThesisTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThesisTrackerDrawer({ isOpen, onClose }: ThesisTrackerDrawerProps) {
  const { openThesis, closeThesis } = useUIStore();
  const [milestones, setMilestones] = useState<ThesisMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadMilestones();
    }
  }, [isOpen]);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('thesis_milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('"order"', { ascending: true });

      if (data) setMilestones(data);
    } catch (error) {
      console.error('Failed to load milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: ThesisMilestone['status']) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('thesis_milestones')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);

    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  };

  const handleEdit = (milestone: any) => {
    setEditingId(milestone.id);
    setEditTitle(milestone.title);
    setEditNotes(milestone.notes);
    setEditDueDate(milestone.due_date || '');
  };

  const handleSaveEdit = async (id: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('thesis_milestones')
      .update({
        title: editTitle,
        notes: editNotes,
        due_date: editDueDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id);

    setMilestones(prev => prev.map(m => m.id === id ? { ...m, title: editTitle, notes: editNotes, due_date: editDueDate || null } : m));
    setEditingId(null);
  };

  const handleAddMilestone = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('thesis_milestones')
      .insert({
        user_id: user.id,
        title: 'New Milestone',
        order: milestones.length + 1,
        status: 'pending',
      })
      .select()
      .single();

    if (data) setMilestones(prev => [...prev, data]);
  };

  const totalProgress = milestones.filter(m => m.status === 'completed').length / milestones.length * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md lg:max-w-lg bg-slate-950 border-l border-glass-border z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div>
                <h2 className="text-lg font-semibold text-white">Thesis Tracker</h2>
                <p className="text-sm text-slate-400">Track your thesis milestones</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-glass-dark transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Progress Overview */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Overall Progress</h3>
                  <span className="text-accent font-bold text-xl">{Math.round(totalProgress)}%</span>
                </div>
                <div className="h-2 bg-glass-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    className="h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full"
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  {milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones completed
                </p>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Milestones</h3>
                  <button
                    onClick={handleAddMilestone}
                    className="px-3 py-1 text-sm rounded-lg border border-accent text-accent hover:bg-accent/10 transition-colors"
                  >
                    + Add Milestone
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="glass-card p-4 animate-pulse">
                        <div className="h-4 bg-glass-light rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-glass-light rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : milestones.length === 0 ? (
                  <div className="glass-card p-8 text-center text-slate-500">
                    No milestones yet. Click "Add Milestone" to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone, index) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={{
                          ...milestone,
                          order: index + 1,
                        }}
                        onUpdate={handleStatusChange}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}