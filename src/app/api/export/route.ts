import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { exportFormatSchema } from '@/lib/validations';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'xlsx';
  
  try {
    exportFormatSchema.parse(format);
  } catch {
    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  }

  try {
    // Fetch all data
    const [progressRes, coursesRes, semestersRes, milestonesRes] = await Promise.all([
      supabase.from('progress').select('*').eq('user_id', user.id),
      supabase.from('courses').select('*').eq('active', true).order('course_id'),
      supabase.from('semesters').select('*').eq('user_id', user.id).order('year', { ascending: false }),
      supabase.from('thesis_milestones').select('*').eq('user_id', user.id).order('"order"', { ascending: true }),
    ]);

    const progress = progressRes.data || [];
    const courses = coursesRes.data || [];
    const semesters = semestersRes.data || [];
    const milestones = milestonesRes.data || [];

    const courseMap = new Map(courses.map(c => [c.course_id, c]));
    
    const exportData = {
      progress: progress.map(p => ({
        course_id: p.course_id,
        course_name_ar: courseMap.get(p.course_id)?.name_ar || '',
        course_name_en: courseMap.get(p.course_id)?.name_en || '',
        credits: courseMap.get(p.course_id)?.credits || 0,
        category: courseMap.get(p.course_id)?.category || '',
        status: p.status,
        grade: p.grade,
        semester_taken: p.semester_taken,
        notes: p.notes,
        updated_at: p.updated_at,
      })),
      courses: courses.map(c => ({
        course_id: c.course_id,
        name_ar: c.name_ar,
        name_en: c.name_en,
        credits: c.credits,
        category: c.category,
        prerequisites: c.prerequisites?.join(', ') || '',
        semester_offered: c.semester_offered?.join(', ') || '',
        track: c.track,
      })),
      semesters,
      thesis_milestones: milestones,
      exported_at: new Date().toISOString(),
      version: '1.0',
    };

    const filename = `masters-progress-${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    }

    // Create workbook for xlsx/ods/csv
    const wb = XLSX.utils.book_new();

    // Progress sheet
    const progressWS = XLSX.utils.json_to_sheet(exportData.progress);
    XLSX.utils.book_append_sheet(wb, progressWS, 'Progress');

    // Courses sheet
    const coursesWS = XLSX.utils.json_to_sheet(exportData.courses);
    XLSX.utils.book_append_sheet(wb, coursesWS, 'Courses');

    // Semesters sheet
    const semestersWS = XLSX.utils.json_to_sheet(exportData.semesters);
    XLSX.utils.book_append_sheet(wb, semestersWS, 'Semesters');

    // Thesis Milestones sheet
    const milestonesWS = XLSX.utils.json_to_sheet(exportData.thesis_milestones);
    XLSX.utils.book_append_sheet(wb, milestonesWS, 'Thesis Milestones');

    // Summary sheet
    const summaryWS = XLSX.utils.json_to_sheet([{
      exported_at: exportData.exported_at,
      version: exportData.version,
      total_courses: courses.length,
      passed_courses: exportData.progress.filter(p => p.status === 'passed').length,
      registered_courses: exportData.progress.filter(p => p.status === 'registered').length,
      pending_courses: exportData.progress.filter(p => p.status === 'pending').length,
      failed_courses: exportData.progress.filter(p => p.status === 'failed').length,
    }]);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');

    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    if (format === 'xlsx') {
      buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
    } else if (format === 'ods') {
      buffer = XLSX.write(wb, { type: 'buffer', bookType: 'ods' });
      mimeType = 'application/vnd.oasis.opendocument.spreadsheet';
      extension = 'ods';
    } else { // csv
      // For CSV, only export progress sheet
      const csv = XLSX.utils.sheet_to_csv(progressWS);
      buffer = Buffer.from(csv);
      mimeType = 'text/csv';
      extension = 'csv';
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}.${extension}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}