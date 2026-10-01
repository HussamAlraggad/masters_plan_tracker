'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConflictBadge } from '@/components/ui/ConflictBadge';
import { Course, Semester } from '@/types';
import { useLanguage } from '@/components/ui/LanguageToggle';
import { useUIStore } from '@/store/ui';

interface SemesterPlannerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SemesterPlannerDrawer({ isOpen, onClose }: SemesterPlannerDrawerProps) {
  const lang = useLanguage();
  const { openPlanner, closePlanner } = useUIStore();
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [term, setTerm] = useState<'first' | 'second' | 'summer'>('first');
  const [maxCourses, setMaxCourses] = useState(3);
  const [maxCredits, setMaxCredits] = useState(9);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'suggestions'>('planner');

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, term, max_courses: maxCourses, max_credits: maxCredits, user_id: user.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setActiveTab('suggestions');
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlan = async (courseId: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('semesters').upsert({
      user_id: user.id,
      year,
      term,
      target_courses: maxCourses,
      target_credits: maxCredits,
      status: 'planned',
    }, { onConflict: 'user_id,year,term' });

    await supabase.from('progress').upsert({
      user_id: user.id,
      course_id: courseId,
      status: 'registered',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,course_id' });

    // Refresh would happen here in real app
  };

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
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div>
                <h2 className="text-lg font-semibold text-white">Semester Planner</h2>
                <p className="text-sm text-slate-400">Plan your next semester</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-glass-dark transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-glass-border px-4">
              <button
                onClick={() => setActiveTab('planner')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'planner' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Planner
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'suggestions' ? 'border-accent text-accent' : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                Suggestions
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Planner Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Academic Year</label>
                    <select
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="w-full px-3 py-2 bg-glass-dark border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {[2024, 2025, 2026, 2027, 2028].map(y => (
                        <option key={y} value={y.toString()}>{y}-{y+1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Term</label>
                    <select
                      value={term}
                      onChange={e => setTerm(e.target.value as any)}
                      className="w-full px-3 py-2 bg-glass-dark border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="first">First Semester</option>
                      <option value="second">Second Semester</option>
                      <option value="summer">Summer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Max Courses</label>
                    <input
                      type="number"
                      value={maxCourses}
                      onChange={e => setMaxCourses(Number(e.target.value))}
                      min={1} max={5}
                      className="w-full px-3 py-2 bg-glass-dark border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Max Credits</label>
                    <input
                      type="number"
                      value={maxCredits}
                      onChange={e => setMaxCredits(Number(e.target.value))}
                      min={3} max={15}
                      className="w-full px-3 py-2 bg-glass-dark border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-accent text-slate-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50"
                >
                  {loading ? 'Getting Suggestions...' : 'Get Course Suggestions'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}