'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradeSelect } from '@/components/ui/GradeSelect';
import { Course, Progress } from '@/types';
import { useLanguage } from '@/components/ui/LanguageToggle';
import { useUIStore } from '@/store/ui';

interface CourseDetailModalProps {
  courseId: string;
  onClose: () => void;
}

export function CourseDetailModal({ courseId, onClose }: CourseDetailModalProps) {
  const lang = useLanguage();
  const { closeCourseDetail } = useUIStore();
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [courseRes, progressRes] = await Promise.all([
        supabase.from('courses').select('*').eq('course_id', courseId).single(),
        supabase.from('progress').select('*').eq('user_id', user.id).eq('course_id', courseId).single(),
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to load course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string, grade?: string) => {
    if (!course) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: any = { status };
    if (grade) updateData.grade = grade;

    await supabase
      .from('progress')
      .upsert({
        user_id: user.id,
        course_id: course.course_id,
        ...updateData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' });

    setProgress((prev: any) => ({ ...prev, ...updateData }));
  };

  if (loading || !course) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      >
        <motion.div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 animate-pulse">
          <div className="h-6 bg-glass-dark rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-glass-dark rounded w-1/2"></div>
        </motion.div>
      </motion.div>
    );
  }

  const name = lang === 'ar' ? course.name_ar : course.name_en;
  const altName = lang === 'ar' ? course.name_en : course.name_ar;
  const status = progress?.status || 'pending';
  const grade = progress?.grade || '';

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-slate-950 border border-glass-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-glass-border">
          <div>
            <span className="text-xs font-mono text-accent mb-1 block">{course.course_id}</span>
            <h2 className="text-2xl font-bold text-white">{name}</h2>
            <p className="text-slate-400 mt-1">{altName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-glass-dark transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={status} size="lg" />
              {status === 'passed' && grade && (
                <span className="px-3 py-1 text-lg font-bold rounded-lg bg-accent/20 text-accent border border-accent/30">
                  Grade: {grade}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full border bg-glass-dark border-glass-border text-slate-300">
                {course.credits} Credits
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full border bg-glass-dark border-glass-border text-slate-300 capitalize">
                {course.category}
              </span>
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">Course Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Course ID</p>
                <p className="font-mono text-white">{course.course_id}</p>
              </div>
              <div>
                <p className="text-slate-500">Category</p>
                <p className="capitalize text-white">{course.category}</p>
              </div>
              <div>
                <p className="text-slate-500">Credits</p>
                <p className="text-white">{course.credits}h</p>
              </div>
              <div>
                <p className="text-slate-500">Track</p>
                <p className="capitalize text-white">{course.track}</p>
              </div>
            </div>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="glass-card p-4">
              <h3 className="font-semibold text-white mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {course.prerequisites.map((preq: string) => (
                  <span key={preq} className="px-2 py-1 text-sm bg-glass-dark border border-glass-border rounded text-slate-300">
                    {preq}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">Semesters Offered</h3>
            <div className="flex flex-wrap gap-2">
              {course.semester_offered.map((sem: string) => (
                <span key={sem} className="px-3 py-1 text-sm bg-accent/20 text-accent rounded-full border border-accent/30 capitalize">
                  {sem}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="font-semibold text-white mb-2">Status History</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </span>
                <span className="text-slate-400">Course added to system</span>
              </div>
              {progress && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  </span>
                  <span className="text-slate-400">
                    Status changed to {status} {grade ? `with grade ${grade}` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-glass-border">
            <GradeSelect
              value={grade}
              onChange={g => handleStatusChange('passed', g)}
              disabled={status !== 'passed'}
            />
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-glass-dark border border-glass-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="pending">Pending</option>
              <option value="registered">Registered</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent text-slate-950 font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}