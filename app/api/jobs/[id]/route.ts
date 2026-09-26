import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const job = mockDb.getJobById(id);
    if (!job) {
      return NextResponse.json({ error: 'Job description not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to retrieve job' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    const body = await req.json();
    const { title, description } = body;

    const userId = user?.id || '11111111-1111-1111-1111-111111111111';
    const userName = user?.name || 'Administrator';

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .update({
            ...(title ? { title: title.trim() } : {}),
            ...(description ? { description: description.trim() } : {}),
          })
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          await supabase.from('audit_logs').insert({
            user_id: userId,
            user_name: userName,
            action: 'JOB_UPDATED',
            details: `Updated job description for "${data.title}"`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, job: data });
        }
      } catch (e) {
        console.warn('Supabase job update failed, using fallback:', e);
      }
    }

    const updated = mockDb.updateJob(id, {
      ...(title ? { title: title.trim() } : {}),
      ...(description ? { description: description.trim() } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    mockDb.addAuditLog({
      user_id: userId,
      user_name: userName,
      action: 'JOB_UPDATED',
      details: `Updated job description for "${updated.title}"`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getCurrentUser();
    const userId = user?.id || '11111111-1111-1111-1111-111111111111';
    const userName = user?.name || 'Administrator';

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { error } = await supabase
          .from('jobs')
          .update({ is_active: false })
          .eq('id', id);

        if (!error) {
          await supabase.from('audit_logs').insert({
            user_id: userId,
            user_name: userName,
            action: 'JOB_DELETED',
            details: `Archived job ID ${id}`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, message: 'Job deleted successfully' });
        }
      } catch (e) {
        console.warn('Supabase delete failed, using fallback:', e);
      }
    }

    const deleted = mockDb.deleteJob(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    mockDb.addAuditLog({
      user_id: userId,
      user_name: userName,
      action: 'JOB_DELETED',
      details: `Archived job ID ${id}`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
