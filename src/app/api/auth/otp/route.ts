import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { otpSendSchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { email } = otpSendSchema.parse(body);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}