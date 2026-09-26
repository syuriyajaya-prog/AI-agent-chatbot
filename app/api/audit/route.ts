import { NextResponse } from 'next/server';
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
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data) {
          return NextResponse.json({ success: true, logs: data });
        }
      } catch (e) {
        console.warn('Supabase audit fetch failed, using fallback:', e);
      }
    }

    const logs = mockDb.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
