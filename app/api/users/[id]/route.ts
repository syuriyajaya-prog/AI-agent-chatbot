import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'Administrator') {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting own account
    if (currentUser.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own active administrator account' }, { status: 400 });
    }

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) {
          await supabase.from('audit_logs').insert({
            user_id: currentUser.id,
            user_name: currentUser.name,
            action: 'USER_DELETED',
            details: `Deleted user ID ${id}`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, message: 'User deleted successfully' });
        }
      } catch (e) {
        console.warn('Supabase user delete failed, using fallback:', e);
      }
    }

    const deleted = mockDb.deleteUser(id);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    mockDb.addAuditLog({
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: 'USER_DELETED',
      details: `Deleted user ID ${id}`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'Administrator') {
      return NextResponse.json({ error: 'Unauthorized: Administrator access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { is_active, role } = body;

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            ...(typeof is_active === 'boolean' ? { is_active } : {}),
            ...(role ? { role } : {}),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          await supabase.from('audit_logs').insert({
            user_id: currentUser.id,
            user_name: currentUser.name,
            action: 'USER_UPDATED',
            details: `Updated user ${data.email} status/role`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, user: data });
        }
      } catch (e) {
        console.warn('Supabase user patch failed, using fallback:', e);
      }
    }

    const updated = mockDb.updateUser(id, {
      ...(typeof is_active === 'boolean' ? { is_active } : {}),
      ...(role ? { role } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    mockDb.addAuditLog({
      user_id: currentUser.id,
      user_name: currentUser.name,
      action: 'USER_UPDATED',
      details: `Updated user ${updated.email} status/role`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
