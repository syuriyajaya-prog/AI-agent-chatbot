import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('job_id') || undefined;

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        let query = supabase
          .from('screening_results')
          .select(`
            *,
            job:jobs(title)
          `)
          .order('score', { ascending: false });

        if (jobId && jobId !== 'all') {
          query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;
        if (!error && data) {
          const formatted = data.map((item, idx) => ({
            ...item,
            rank: idx + 1,
            job_title: item.job?.title || 'General Position',
          }));
          return NextResponse.json({ success: true, results: formatted });
        }
      } catch (e) {
        console.warn('Supabase results fetch failed, using fallback:', e);
      }
    }

    const results = mockDb.getResults(jobId);
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching screening results:', error);
    return NextResponse.json({ error: 'Failed to retrieve screening results' }, { status: 500 });
  }
}
