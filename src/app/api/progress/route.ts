import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { gradeSchema, courseStatusSchema, progressUpdateSchema } from '@/lib/validations';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('progress')
    .select('*, courses(*)')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = progressUpdateSchema.parse(body);

    const { data, error } = await supabase
      .from('progress')
      .upsert({
        user_id: user.id,
        course_id: validated.course_id,
        status: validated.status,
        grade: validated.grade || null,
        semester_taken: validated.semester_taken || null,
        notes: validated.notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}