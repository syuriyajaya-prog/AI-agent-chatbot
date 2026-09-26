import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie, getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user) {
      mockDb.addAuditLog({
        user_id: user.id,
        user_name: user.name,
        action: 'USER_LOGOUT',
        details: 'User logged out of HireSense',
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      });
    }

    clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
