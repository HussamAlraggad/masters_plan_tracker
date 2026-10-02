import { NextResponse } from 'next/server';
import { z } from 'zod';

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Check if user exists in Supabase Auth using Admin API
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Use listUsers and filter by email (no direct getUserByEmail in Admin API)
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('List users error:', usersError);
      return NextResponse.json(
        { error: 'Failed to check user' },
        { status: 500 }
      );
    }

    const user = usersData.users.find(u => u.email === email);

    if (!user) {
      // User doesn't exist - return signup URL
      return NextResponse.json(
        { 
          error: 'Email not found. Please check your email or create an account.',
          signupUrl: '/signup'
        },
        { status: 404 }
      );
    }

// Generate a magic link for the existing user
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Magic link generation error:', linkError);
      return NextResponse.json(
        { error: 'Failed to create login link' },
        { status: 500 }
      );
    }

    const magicLink = linkData.properties.action_link;

    // Return the magic link to the client - client will navigate to it
    return NextResponse.json({ 
      success: true, 
      magicLink,
      user: { id: user.id, email: user.email }
    });

  } catch (error: any) {
    console.error('Email login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}