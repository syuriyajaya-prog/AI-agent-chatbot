import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendRecruitmentEmail, isValidEmail } from '@/lib/email/service';
import { interpolatePlaceholders } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    if (user.role !== 'Administrator' && user.role !== 'HR User') {
      return NextResponse.json(
        { error: 'Forbidden. Only HR Users and Administrators can perform bulk candidate communication.' },
        { status: 403 }
      );
    }

    const payload = await req.json();
    const {
      candidateIds,
      templateType,
      templateSubject,
      templateBody,
      companyName,
      interviewDate,
      interviewTime,
      confirmed,
    } = payload;

    // Strict confirmation check
    if (!confirmed) {
      return NextResponse.json(
        { error: 'Bulk communication requires explicit user confirmation before execution.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one candidate for bulk communication.' },
        { status: 400 }
      );
    }

    if (!templateSubject || !templateBody) {
      return NextResponse.json(
        { error: 'Template subject and body are required.' },
        { status: 400 }
      );
    }

    // Retrieve candidate records
    const allCandidates = mockDb.getResults();
    const targetCandidates = allCandidates.filter((c) => candidateIds.includes(c.id));

    if (targetCandidates.length === 0) {
      return NextResponse.json(
        { error: 'No valid matching candidate records found for selected IDs.' },
        { status: 404 }
      );
    }

    const results: Array<{
      candidateId: string;
      candidateName: string;
      recipient: string;
      status: 'Sent' | 'Failed';
      deliveryMode: string;
      error?: string;
    }> = [];

    // Process each candidate with individualized interpolation
    for (const candidate of targetCandidates) {
      const recipientEmail = candidate.candidate_email || `${candidate.candidate_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@email.com`;

      // Interpolate placeholders specifically for this candidate
      const personalizedSubject = interpolatePlaceholders(templateSubject, {
        candidateName: candidate.candidate_name,
        jobTitle: candidate.job_title,
        companyName: companyName || 'HireSense Talent Organization',
        interviewDate,
        interviewTime,
        hrName: user.name,
      });

      const personalizedBody = interpolatePlaceholders(templateBody, {
        candidateName: candidate.candidate_name,
        jobTitle: candidate.job_title,
        companyName: companyName || 'HireSense Talent Organization',
        interviewDate,
        interviewTime,
        hrName: user.name,
      });

      const emailResult = await sendRecruitmentEmail({
        to: recipientEmail,
        candidateName: candidate.candidate_name,
        subject: personalizedSubject,
        body: personalizedBody,
        senderName: user.name,
        emailType: templateType || 'Custom Email',
      });

      // Persist in mockDb
      mockDb.addCommunication({
        candidate_id: candidate.id,
        candidate_name: candidate.candidate_name,
        recipient: recipientEmail,
        sender_id: user.id,
        sender_name: user.name,
        email_type: templateType || 'Custom Email',
        subject: personalizedSubject,
        body: personalizedBody,
        status: emailResult.status,
        delivery_mode: emailResult.deliveryMode,
      });

      results.push({
        candidateId: candidate.id,
        candidateName: candidate.candidate_name,
        recipient: recipientEmail,
        status: emailResult.status,
        deliveryMode: emailResult.deliveryMode,
        error: emailResult.error,
      });
    }

    const successfulCount = results.filter((r) => r.status === 'Sent').length;

    return NextResponse.json({
      success: true,
      totalRequested: targetCandidates.length,
      successfulCount,
      templateType,
      results,
      message: `Successfully processed bulk communication for ${successfulCount} candidate(s).`,
    });
  } catch (error) {
    console.error('Bulk communication error:', error);
    return NextResponse.json(
      { error: 'Failed to execute bulk communication: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
