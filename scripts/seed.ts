import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const courses = [
  // Mandatory (15h)
  { course_id: '121003723', name_ar: 'هندسة البرمجيات المتقدمة', name_en: 'Advanced Software Engineering', credits: 3, category: 'mandatory', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003732', name_ar: 'تصميم وهيكلة البرمجيات', name_en: 'Software Design and Architecture', credits: 3, category: 'mandatory', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003740', name_ar: 'هندسة جودة البرمجيات', name_en: 'Software Quality Engineering', credits: 3, category: 'mandatory', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003710', name_ar: 'فحص البرمجيات', name_en: 'Software Testing', credits: 3, category: 'mandatory', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003763', name_ar: 'موضوعات خاصة في هندسة البرمجيات', name_en: 'Special Topics in Software Engineering', credits: 3, category: 'mandatory', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  // Elective (24h available, need 9h)
  { course_id: '121002771', name_ar: 'أمن المعلومات', name_en: 'Information Security', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003714', name_ar: 'طرق وادوات هندسة البرمجيات', name_en: 'Software Engineering Methods and Tools', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003721', name_ar: 'هندسة المتطلبات', name_en: 'Requirements Engineering', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121002751', name_ar: 'منهجيات برمجية متقدمة', name_en: 'Advanced Programming Methodologies', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003752', name_ar: 'إدارة مشاريع البرمجيات', name_en: 'Software Project Management', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003795', name_ar: 'موضوعات خاصة في هندسة البرمجيات', name_en: 'Special Topics in Software Engineering II', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003724', name_ar: 'تطوير البرمجيات الموزعة', name_en: 'Distributed Software Development', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003751', name_ar: 'صيانة وتطور البرمجيات', name_en: 'Software Maintenance and Evolution', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '121003736', name_ar: 'التنقيب عن البيانات', name_en: 'Data Mining', credits: 3, category: 'elective', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  // Thesis
  { course_id: '121003799', name_ar: 'الرسالة', name_en: 'Thesis', credits: 9, category: 'thesis', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '31003799', name_ar: 'الرسالة', name_en: 'Thesis', credits: 3, category: 'thesis', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '61003799', name_ar: 'الرسالة', name_en: 'Thesis', credits: 6, category: 'thesis', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
  { course_id: '91003799', name_ar: 'الرسالة', name_en: 'Thesis', credits: 0, category: 'thesis', prerequisites: [], semester_offered: ['first','second'], track: 'thesis', active: true },
];

const thesisMilestones = [
  { title: 'Proposal', order: 1 },
  { title: 'Literature Review', order: 2 },
  { title: 'Data Collection', order: 3 },
  { title: 'Analysis', order: 4 },
  { title: 'Writing', order: 5 },
  { title: 'Defense', order: 6 },
];

const initialProgress = [
  // Passed
  { course_id: '121003740', status: 'passed', grade: 'A+', semester_taken: '2025-2026-first', notes: '' },
  { course_id: '121003710', status: 'passed', grade: 'B+', semester_taken: '2025-2026-first', notes: '' },
  { course_id: '121003763', status: 'passed', grade: 'B+', semester_taken: '2025-2026-second', notes: '' },
  { course_id: '121003795', status: 'passed', grade: 'B', semester_taken: '2025-2026-second', notes: '' },
  // Registered
  { course_id: '121003723', status: 'registered', grade: '', semester_taken: '', notes: '' },
  { course_id: '121003732', status: 'registered', grade: '', semester_taken: '', notes: '' },
  { course_id: '121003714', status: 'registered', grade: '', semester_taken: '', notes: '' },
];

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Seed courses
  console.log('📚 Seeding courses...');
  const { error: coursesError } = await supabase
    .from('courses')
    .upsert(courses, { onConflict: 'course_id' });
  
  if (coursesError) {
    console.error('❌ Courses error:', coursesError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${courses.length} courses`);

  // 2. Get current user (must be logged in first via OTP)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('❌ User not authenticated. Please log in first via the app, then run this script.');
    process.exit(1);
  }

  console.log(`👤 Seeding for user: ${user.id} (${user.email})`);

  // 3. Seed progress
  console.log('📝 Seeding progress...');
  const { error: progressError } = await supabase
    .from('progress')
    .upsert(
      initialProgress.map(p => ({ ...p, user_id: user.id })),
      { onConflict: 'user_id,course_id' }
    );
  
  if (progressError) {
    console.error('❌ Progress error:', progressError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${initialProgress.length} progress entries`);

  // 4. Seed thesis milestones
  console.log('🎓 Seeding thesis milestones...');
  const { error: milestonesError } = await supabase
    .from('thesis_milestones')
    .upsert(
      thesisMilestones.map(m => ({ ...m, user_id: user.id })),
      { onConflict: 'user_id,title' }
    );
  
  if (milestonesError) {
    console.error('❌ Milestones error:', milestonesError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${thesisMilestones.length} thesis milestones`);

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch(console.error);