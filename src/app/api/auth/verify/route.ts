import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { otpVerifySchema } from '@/lib/validations';

export async function POST(request: Request) {
  const supabase = createClient();
  
  try {
    const body = await request.json();
    const { email, code } = otpVerifySchema.parse(body);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Successfully verified', 
      user: data.user,
      session: data.session 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}