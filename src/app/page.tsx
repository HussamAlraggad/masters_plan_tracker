'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { LanguageToggle, useLanguage } from '@/components/ui/LanguageToggle';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { CourseCard } from '@/components/ui/CourseCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Course, Progress, Semester } from '@/types';
import { useUIStore } from '@/store/ui';
import { SemesterPlannerDrawer } from '@/components/SemesterPlannerDrawer';
import { ThesisTrackerDrawer } from '@/components/ThesisTrackerDrawer';
import { CourseDetailModal } from '@/components/CourseDetailModal';

export default function Dashboard() {
  const lang = useLanguage();
  const { isPlannerOpen, isThesisOpen, selectedCourseId, closeCourseDetail } = useUIStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const [coursesRes, progressRes, schedulesRes] = await Promise.all([
          supabase.from('courses').select('*').eq('active', true).order('course_id'),
          supabase.from('progress').select('*').eq('user_id', user.id),
          supabase.from('semesters').select('*').eq('user_id', user.id).order('year', { ascending: false }),
        ]);
        
        setCourses(coursesRes.data || []);
        setProgress(progressRes.data || []);
        
        // Get latest semester schedule
        const latestSemester = schedulesRes.data?.[0];
        if (latestSemester) {
          const scheduleRes = await supabase
            .from('schedules')
            .select('*')
            .eq('year', latestSemester.year)
            .eq('term', latestSemester.term);
          setSchedules(scheduleRes.data || []);
        }
      }
      setLoading(false);
    };
    
    getData();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        window.location.reload();
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow text-accent text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect to login
  }

  // Calculate progress stats
  const progressMap = new Map(progress.map(p => [p.course_id, p]));
  const passedCourses = progress.filter(p => p.status === 'passed');
  const registeredCourses = progress.filter(p => p.status === 'registered');
  
  const mandatoryCourses = courses.filter(c => c.category === 'mandatory');
  const electiveCourses = courses.filter(c => c.category === 'elective');
  const thesisCourses = courses.filter(c => c.category === 'thesis');
  
  const mandatoryPassed = mandatoryCourses.filter(c => 
    progressMap.get(c.course_id)?.status === 'passed'
  ).reduce((sum, c) => sum + c.credits, 0);
  
  const electivePassed = electiveCourses.filter(c => 
    progressMap.get(c.course_id)?.status === 'passed'
  ).reduce((sum, c) => sum + c.credits, 0);
  
  const thesisCredits = thesisCourses.reduce((sum, c) => sum + c.credits, 0);

  const handleStatusChange = async (courseId: string, status: string, grade?: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updateData: any = { status };
    if (grade) updateData.grade = grade;
    if (status === 'passed' && !grade) updateData.grade = 'A';

    await supabase
      .from('progress')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        ...updateData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' });

    // Optimistic update
    setProgress(prev => {
      const idx = prev.findIndex(p => p.course_id === courseId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updateData };
        return updated;
      }
      return [...prev, { user_id: user.id, course_id: courseId, ...updateData }];
    });
  };

  const name = (lang: 'ar' | 'en') => lang === 'ar' ? 'name_ar' : 'name_en';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <main className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-glass bg-slate-950/80 border-b border-glass-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="font-bold text-xl text-white">Masters Plan Tracker</h1>
                    <p className="text-xs text-slate-500">Software Engineering · Thesis Track</p>
                  </div>
                </motion.div>
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <ExportDropdown />
                <button
                  onClick={() => {}}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border bg-glass-dark border-glass-border text-white hover:bg-glass-light transition-colors focus-ring"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Progress Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ProgressRing
                value={mandatoryPassed}
                max={15}
                label="Mandatory"
                size={140}
              />
              <ProgressRing
                value={electivePassed}
                max={9}
                label="Elective"
                size={140}
              />
              <ProgressRing
                value={thesisCredits > 0 ? 9 : 0}
                max={9}
                label="Thesis"
                size={140}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="text-center">
                <p className="text-3xl font-bold text-accent">{passedCourses.length}</p>
                <p className="text-sm text-slate-400">Courses Passed</p>
              </GlassCard>
              <GlassCard className="text-center">
                <p className="text-3xl font-bold text-amber-400">{registeredCourses.length}</p>
                <p className="text-sm text-slate-400">Registered</p>
              </GlassCard>
              <GlassCard className="text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  {passedCourses.reduce((sum, p) => sum + (courses.find(c => c.course_id === p.course_id)?.credits || 0), 0)}
                </p>
                <p className="text-sm text-slate-400">Credits Earned</p>
              </GlassCard>
              <GlassCard className="text-center">
                <p className="text-3xl font-bold text-cyan-400">{courses.length - progress.length}</p>
                <p className="text-sm text-slate-400">Remaining</p>
              </GlassCard>
            </div>
          </motion.section>

          {/* Semester Planner & Course Grid */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* Course Grid */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Course Progress</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm rounded-lg border bg-glass-dark border-glass-border text-white hover:bg-glass-light transition-colors">
                    All
                  </button>
                  <button className="px-3 py-1 text-sm rounded-lg border bg-glass-dark border-glass-border text-white hover:bg-glass-light transition-colors">
                    Mandatory
                  </button>
                  <button className="px-3 py-1 text-sm rounded-lg border bg-glass-dark border-glass-border text-white hover:bg-glass-light transition-colors">
                    Elective
                  </button>
                  <button className="px-3 py-1 text-sm rounded-lg border bg-glass-dark border-glass-border text-white hover:bg-glass-light transition-colors">
                    Thesis
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    progress={progressMap.get(course.course_id)}
                    schedules={[]}
                    lang="ar"
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </motion.section>

            {/* Right Sidebar - Planner & Thesis */}
            <div className="space-y-6">
              {/* Semester Planner */}
              <SemesterPlannerDrawer isOpen={false} onClose={() => {}} />
              
              {/* Thesis Tracker */}
              <ThesisTrackerDrawer isOpen={false} onClose={() => {}} />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedCourseId && (
        <CourseDetailModal
          courseId={selectedCourseId}
          onClose={closeCourseDetail}
        />
      )}
    </div>
  );
}