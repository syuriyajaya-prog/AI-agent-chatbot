import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get('candidate_id');
    const jobId = searchParams.get('job_id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from('communication_records')
          .select('*')
          .order('sent_at', { ascending: false });

        if (candidateId) query = query.eq('candidate_id', candidateId);
        if (type && type !== 'all') query = query.eq('email_type', type);
        if (status && status !== 'all') query = query.eq('status', status);

        const { data, error } = await query;

        if (!error && data) {
          // Join candidate/job info if needed
          let results = data;
          if (search && search.trim().length > 0) {
            const s = search.toLowerCase().trim();
            results = results.filter((c) =>
              c.candidate_name?.toLowerCase().includes(s) ||
              c.recipient?.toLowerCase().includes(s) ||
              c.subject?.toLowerCase().includes(s) ||
              c.sender_name?.toLowerCase().includes(s)
            );
          }
          return NextResponse.json({ success: true, communications: results });
        }
      } catch (e) {
        console.warn('Supabase fetch failed for communication records, using mock fallback:', e);
      }
    }

    // Mock DB Fallback
    let comms = mockDb.getAllCommunications();
    const allResults = mockDb.getResults();

    // Map candidate & job details onto communication records
    let enrichedComms = comms.map((comm) => {
      const candidate = allResults.find((r) => r.id === comm.candidate_id);
      return {
        ...comm,
        job_id: candidate?.job_id,
        job_title: candidate?.job_title || 'Target Role',
        hr_decision: candidate?.hr_decision || 'Pending',
        score: candidate?.score || 0,
      };
    });

    if (candidateId) {
      enrichedComms = enrichedComms.filter((c) => c.candidate_id === candidateId);
    }

    if (jobId && jobId !== 'all') {
      enrichedComms = enrichedComms.filter((c) => c.job_id === jobId);
    }

    if (type && type !== 'all') {
      enrichedComms = enrichedComms.filter((c) => c.email_type === type);
    }

    if (status && status !== 'all') {
      enrichedComms = enrichedComms.filter((c) => c.status === status);
    }

    if (search && search.trim().length > 0) {
      const s = search.toLowerCase().trim();
      enrichedComms = enrichedComms.filter((c) =>
        c.candidate_name?.toLowerCase().includes(s) ||
        c.recipient?.toLowerCase().includes(s) ||
        c.subject?.toLowerCase().includes(s) ||
        c.sender_name?.toLowerCase().includes(s) ||
        c.job_title?.toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ success: true, communications: enrichedComms });
  } catch (error) {
    console.error('Error fetching communication records:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve communication records' },
      { status: 500 }
    );
  }
}
