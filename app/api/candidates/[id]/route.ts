import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const candidateId = params.id;
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Try Supabase first if available
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: candidateData, error: candError } = await supabase
          .from('screening_results')
          .select(`
            *,
            job:jobs(title, description)
          `)
          .eq('id', candidateId)
          .single();

        if (!candError && candidateData) {
          const { data: commsData } = await supabase
            .from('communication_records')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('sent_at', { ascending: false });

          return NextResponse.json({
            success: true,
            candidate: {
              ...candidateData,
              job_title: candidateData.job?.title || 'General Position',
              job_description: candidateData.job?.description,
              communications: commsData || [],
            },
          });
        }
      } catch (e) {
        console.warn('Supabase fetch failed for candidate, checking mock db:', e);
      }
    }

    const candidate = mockDb.getCandidateById(candidateId);
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve candidate profile' },
      { status: 500 }
    );
  }
}
