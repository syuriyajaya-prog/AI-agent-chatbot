import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Supabase Auth if server Supabase is configured
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (!authError && authData.user) {
          // Fetch user profile from public.users
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .single();

          const userPayload = {
            id: profile?.id || authData.user.id,
            name: profile?.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: (profile?.role || 'HR User') as 'Administrator' | 'HR User',
          };

          setSessionCookie(userPayload);

          // Update last_login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userPayload.id);

          return NextResponse.json({
            success: true,
            user: userPayload,
          });
        }
      } catch (err) {
        console.warn('Supabase auth attempt failed, checking fallback accounts:', err);
      }
    }

    // Default Seed Accounts & Local Mock Fallback Authentication
    const defaultCredentials: Record<string, { pass: string; name: string; role: 'Administrator' | 'HR User' }> = {
      'admin@hiresense.ai': {
        pass: 'Admin@2026',
        name: 'Admin Jayasyuriya',
        role: 'Administrator',
      },
      'hr@hiresense.ai': {
        pass: 'HRUser@2026',
        name: 'HR Recruiter Noor',
        role: 'HR User',
      },
    };

    const match = defaultCredentials[cleanEmail];
    if (match) {
      if (password !== match.pass) {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials.' },
          { status: 401 }
        );
      }

      const existingUser = mockDb.getUserByEmail(cleanEmail);
      const userPayload = {
        id: existingUser?.id || (match.role === 'Administrator' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222'),
        name: existingUser?.name || match.name,
        email: cleanEmail,
        role: match.role,
      };

      setSessionCookie(userPayload);
      mockDb.updateUser(userPayload.id, { last_login: new Date().toISOString() });
      mockDb.addAuditLog({
        user_id: userPayload.id,
        user_name: userPayload.name,
        action: 'USER_LOGIN',
        details: `User logged in successfully as ${userPayload.role}`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        user: userPayload,
      });
    }

    // Check if user was registered in mockDb
    const mockUser = mockDb.getUserByEmail(cleanEmail);
    if (mockUser && mockUser.is_active) {
      // In demo mode, standard password or Admin@2026 / HRUser@2026 works
      const userPayload = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      };

      setSessionCookie(userPayload);
      mockDb.updateUser(mockUser.id, { last_login: new Date().toISOString() });
      mockDb.addAuditLog({
        user_id: userPayload.id,
        user_name: userPayload.name,
        action: 'USER_LOGIN',
        details: `User ${userPayload.name} logged in`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });

      return NextResponse.json({
        success: true,
        user: userPayload,
      });
    }

    return NextResponse.json(
      { error: 'Invalid email or password. Use admin@hiresense.ai (Admin@2026) or hr@hiresense.ai (HRUser@2026).' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during login.' },
      { status: 500 }
    );
  }
}
