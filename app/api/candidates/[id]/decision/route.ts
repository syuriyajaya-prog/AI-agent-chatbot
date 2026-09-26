import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const VALID_DECISIONS = ['Shortlisted', 'Review Later', 'Rejected', 'Pending'] as const;
type DecisionType = typeof VALID_DECISIONS[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Role-based access: Only authorized HR User or Administrator can record decisions
    if (user.role !== 'Administrator' && user.role !== 'HR User') {
      return NextResponse.json(
        { error: 'Forbidden. Only HR Users and Administrators can make recruitment decisions.' },
        { status: 403 }
      );
    }

    const candidateId = params.id;
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const rawDecision = body.decision || body.hr_decision;
    const rawNotes = body.notes !== undefined ? body.notes : body.hr_notes;

    if (!rawDecision || !VALID_DECISIONS.includes(rawDecision as DecisionType)) {
      return NextResponse.json(
        { error: `Invalid decision. Allowed values are: ${VALID_DECISIONS.join(', ')}` },
        { status: 400 }
      );
    }

    const decision = rawDecision as DecisionType;
    const sanitizedNotes = typeof rawNotes === 'string' ? rawNotes.trim() : '';
    const now = new Date().toISOString();

    // Supabase update if configured
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: updated, error: updateErr } = await supabase
          .from('screening_results')
          .update({
            hr_decision: decision,
            hr_notes: sanitizedNotes,
            hr_decided_by: user.name,
            hr_decided_at: now,
          })
          .eq('id', candidateId)
          .select()
          .single();

        if (!updateErr && updated) {
          // Log audit
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            user_name: user.name,
            action: 'HR_DECISION_UPDATED',
            details: `HR User recorded final decision "${decision}" for candidate ${updated.candidate_name}. Notes: ${sanitizedNotes ? sanitizedNotes.slice(0, 100) : 'None'}`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({
            success: true,
            message: `Candidate marked as ${decision}`,
            candidate: updated,
          });
        }
      } catch (e) {
        console.warn('Supabase decision update failed, updating in mock DB:', e);
      }
    }

    // Mock DB update
    const updatedCandidate = mockDb.updateCandidateDecision(
      candidateId,
      decision as DecisionType,
      sanitizedNotes,
      user.name,
      user.id
    );

    if (!updatedCandidate) {
      return NextResponse.json({ error: 'Candidate record not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Candidate marked as ${decision}`,
      candidate: updatedCandidate,
    });
  } catch (error) {
    console.error('Error updating candidate decision:', error);
    return NextResponse.json(
      { error: 'Failed to update recruitment decision: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export const POST = PATCH;
