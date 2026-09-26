import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'Administrator') {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 403 });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, users: data });
        }
      } catch (e) {
        console.warn('Supabase users fetch failed, using fallback:', e);
      }
    }

    const users = mockDb.getUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to retrieve users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'Administrator') {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role === 'Administrator' ? 'Administrator' : 'HR User';

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        // Try creating Supabase auth user
        if (password) {
          await supabase.auth.admin.createUser({
            email: cleanEmail,
            password: password,
            email_confirm: true,
          });
        }

        const { data, error } = await supabase
          .from('users')
          .insert({
            name: name.trim(),
            email: cleanEmail,
            role: cleanRole,
            is_active: true,
          })
          .select()
          .single();

        if (!error && data) {
          await supabase.from('audit_logs').insert({
            user_id: currentUser.id,
            user_name: currentUser.name,
            action: 'USER_CREATED',
            details: `Created new ${cleanRole} account for ${cleanEmail}`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, user: data }, { status: 201 });
        }
      } catch (e) {
        console.warn('Supabase user creation failed, using fallback:', e);
      }
    }

    // Check if email already exists in mockDb
    if (mockDb.getUserByEmail(cleanEmail)) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const created = mockDb.addUser({
      name: name.trim(),
      email: cleanEmail,
      role: cleanRole,
      is_active: true,
      last_login: null,
    });

    mockDb.addAuditLog({
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: 'USER_CREATED',
      details: `Created new ${cleanRole} account for ${cleanEmail}`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, user: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
