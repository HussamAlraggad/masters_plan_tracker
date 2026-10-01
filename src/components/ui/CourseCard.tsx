'use client';

import { useLanguage } from '@/components/ui/LanguageToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GradeSelect } from '@/components/ui/GradeSelect';
import { ConflictBadge } from '@/components/ui/ConflictBadge';
import { Course, Progress } from '@/types';

interface CourseCardProps {
  course: Course;
  progress: Progress | undefined;
  schedules: any[];
  lang: 'ar' | 'en';
  onStatusChange: (courseId: string, status: Progress['status'], grade?: string) => void;
}

const CATEGORY_COLORS = {
  mandatory: 'border-red-500/50',
  elective: 'border-amber-500/50',
  thesis: 'border-cyan-500/50',
};

const CATEGORY_LABELS = {
  mandatory: { ar: 'إجباري', en: 'Mandatory' },
  elective: { ar: 'اختياري', en: 'Elective' },
  thesis: { ar: 'رسالة', en: 'Thesis' },
};

export function CourseCard({ course, progress, schedules, lang, onStatusChange }: CourseCardProps) {
  const status = progress?.status || 'pending';
  const grade = progress?.grade || '';
  const categoryLabel = CATEGORY_LABELS[course.category][lang];
  const categoryBorder = CATEGORY_COLORS[course.category];
  const name = lang === 'ar' ? course.name_ar : course.name_en;

  const conflicts = schedules
    .filter((s) => s.course_id === course.course_id)
    .flatMap((s) => s.conflicts || []);

  return (
    <GlassCard hover className={`border-l-4 ${categoryBorder} flex flex-col h-full`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-slate-400">{course.course_id}</span>
        <StatusBadge status={status} size="sm" />
      </div>

      <h3 className="font-semibold text-lg text-white mb-1 truncate">{name}</h3>
      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{lang === 'ar' ? course.name_en : course.name_ar}</p>

      <div className="flex items-center gap-3 mb-3">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-glass-dark border-glass-border text-slate-300">
          {course.credits}h
        </span>
        <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-glass-dark border-glass-border text-slate-300 capitalize">
          {categoryLabel}
        </span>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-glass-border">
        <GradeSelect
          value={grade}
          onChange={(g) => onStatusChange(course.course_id, status === 'passed' ? 'passed' : status, g)}
          disabled={status !== 'passed'}
        />
        <ConflictBadge conflicts={conflicts} />
      </div>
    </GlassCard>
  );
}