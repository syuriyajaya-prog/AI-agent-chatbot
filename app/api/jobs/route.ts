import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select(`
            *,
            screening_results:screening_results(count)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && jobs) {
          const formatted = jobs.map(j => ({
            ...j,
            candidate_count: j.screening_results?.[0]?.count || 0,
          }));
          return NextResponse.json({ success: true, jobs: formatted });
        }
      } catch (e) {
        console.warn('Supabase jobs fetch failed, using fallback:', e);
      }
    }

    const jobs = mockDb.getJobs(true);
    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to retrieve job descriptions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Job title and description are required' },
        { status: 400 }
      );
    }

    const userId = user?.id || '11111111-1111-1111-1111-111111111111';
    const userName = user?.name || 'Administrator';

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .insert({
            title: title.trim(),
            description: description.trim(),
            created_by: userId,
            is_active: true,
          })
          .select()
          .single();

        if (!error && data) {
          // Log audit
          await supabase.from('audit_logs').insert({
            user_id: userId,
            user_name: userName,
            action: 'JOB_CREATED',
            details: `Created job posting "${title}"`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({ success: true, job: { ...data, candidate_count: 0 } }, { status: 201 });
        }
      } catch (e) {
        console.warn('Supabase job insertion failed, falling back:', e);
      }
    }

    const created = mockDb.addJob({
      title: title.trim(),
      description: description.trim(),
      created_by: userId,
      is_active: true,
    });

    mockDb.addAuditLog({
      user_id: userId,
      user_name: userName,
      action: 'JOB_CREATED',
      details: `Created job posting "${title}"`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
    });

    return NextResponse.json({ success: true, job: { ...created, candidate_count: 0 } }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job description' }, { status: 500 });
  }
}
