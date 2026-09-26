import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const assignedRole = role === 'Administrator' ? 'Administrator' : 'HR User';

    // Check if user already exists
    const existing = mockDb.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please sign in.' },
        { status: 400 }
      );
    }

    // Try Supabase auth if configured
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData.user) {
          const { data: profile } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              name: cleanName,
              email: cleanEmail,
              role: assignedRole,
              is_active: true,
            })
            .select()
            .single();

          const userPayload = {
            id: profile?.id || authData.user.id,
            name: cleanName,
            email: cleanEmail,
            role: assignedRole as 'Administrator' | 'HR User',
          };

          setSessionCookie(userPayload);

          return NextResponse.json({
            success: true,
            user: userPayload,
            message: 'Account created successfully',
          });
        }
      } catch (err) {
        console.warn('Supabase signup fallback to local store:', err);
      }
    }

    // Save to local resilient store
    const createdUser = mockDb.addUser({
      name: cleanName,
      email: cleanEmail,
      password,
      role: assignedRole,
      is_active: true,
      last_login: new Date().toISOString(),
    });

    const userPayload = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    };

    setSessionCookie(userPayload);

    mockDb.addAuditLog({
      user_id: userPayload.id,
      user_name: userPayload.name,
      action: 'USER_REGISTERED',
      details: `New account created via email (${userPayload.role})`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({
      success: true,
      user: userPayload,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during account creation' },
      { status: 500 }
    );
  }
}
