import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { suggestionInputSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { year, term, max_courses, max_credits, user_id } = suggestionInputSchema.parse(body);

    // Verify user matches authenticated user
    if (user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Get user's progress
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', user.id);

    const passedCourseIds = new Set(
      progress?.filter(p => p.status === 'passed').map(p => p.course_id) || []
    );
    const registeredCourseIds = new Set(
      progress?.filter(p => p.status === 'registered').map(p => p.course_id) || []
    );

    // 2. Get available courses (not passed, not registered, active, thesis track)
    const { data: courses } = await supabase
      .from('courses')
      .select('*')
      .eq('active', true)
      .eq('track', 'thesis')
      .not('course_id', 'in', `(${Array.from(passedCourseIds).concat(Array.from(registeredCourseIds)).join(',')})`);

    if (!courses || courses.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // 3. Filter by semester offered
    const availableCourses = courses.filter(c => 
      c.semester_offered?.includes(term)
    );

    // 4. Get schedule for conflict detection
    const { data: schedule } = await supabase
      .from('schedules')
      .select('*')
      .eq('year', year)
      .eq('term', term);

    const scheduleMap = buildScheduleMap(schedule || []);

    // 5. Score each course
    const scored = availableCourses.map(course => {
      let score = 0;
      const reasons: string[] = [];

      // Category priority
      if (course.category === 'mandatory') { score += 100; reasons.push('Mandatory requirement'); }
      else if (course.category === 'elective') { score += 50; reasons.push('Elective credit'); }
      else if (course.category === 'thesis') { score += 10; reasons.push('Thesis requirement'); }

      // Prerequisite unlock value
      const unlocks = countUnlocks(course.course_id, courses, passedCourseIds);
      if (unlocks > 0) { score += unlocks * 20; reasons.push(`Unlocks ${unlocks} courses`); }

      // Schedule conflicts
      const conflicts = detectConflicts(course.course_id, scheduleMap);
      if (conflicts.length > 0) { score -= 50; reasons.push(`⚠️ ${conflicts.length} schedule conflict(s)`); }

      // Credits efficiency
      score += Math.max(0, 10 - course.credits);

      return { course, score, reasons, conflicts, schedule: scheduleMap[course.course_id] || [] };
    });

    // 6. Greedy pack
    const selected = greedyPack(scored.sort((a, b) => b.score - a.score), max_courses, max_credits);

    return NextResponse.json({ suggestions: selected });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

function buildScheduleMap(schedule: any[]) {
  const map: Record<string, any[]> = {};
  for (const s of schedule) {
    if (!map[s.course_id]) map[s.course_id] = [];
    map[s.course_id].push(s);
  }
  return map;
}

function countUnlocks(courseId: string, courses: any[], passed: Set<string>): number {
  let count = 0;
  for (const c of courses) {
    if (c.prerequisites?.includes(courseId) && !passed.has(c.course_id)) {
      count++;
    }
  }
  return count;
}

function detectConflicts(courseId: string, scheduleMap: Record<string, any[]>): any[] {
  const sections = scheduleMap[courseId] || [];
  // Simplified conflict detection - would need actual time parsing in production
  return sections.length > 1 ? sections.slice(1) : [];
}

function greedyPack(scored: any[], maxCourses: number, maxCredits: number) {
  const selected = [];
  let totalCredits = 0;
  
  for (const item of scored) {
    if (selected.length >= maxCourses) break;
    if (totalCredits + item.course.credits > maxCredits) continue;
    
    selected.push(item);
    totalCredits += item.course.credits;
  }
  
  return selected;
}