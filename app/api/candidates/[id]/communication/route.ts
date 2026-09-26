import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { mockDb } from '@/lib/storage/mock-db';
import { getServerSupabase } from '@/lib/supabase/server';
import { sendRecruitmentEmail, isValidEmail } from '@/lib/email/service';

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

    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('communication_records')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('sent_at', { ascending: false });

        if (!error && data) {
          return NextResponse.json({ success: true, communications: data });
        }
      } catch (e) {
        console.warn('Supabase fetch failed for communication history:', e);
      }
    }

    const communications = mockDb.getCommunicationHistory(candidateId);
    return NextResponse.json({ success: true, communications });
  } catch (error) {
    console.error('Error fetching candidate communications:', error);
    return NextResponse.json({ error: 'Failed to retrieve communications' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Role check: HR User or Administrator
    if (user.role !== 'Administrator' && user.role !== 'HR User') {
      return NextResponse.json(
        { error: 'Forbidden. Only HR Users and Administrators can dispatch recruitment communication.' },
        { status: 403 }
      );
    }

    const candidateId = params.id;
    if (!candidateId) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const payload = await req.json();
    const recipient = payload.recipient || payload.recipient_email || payload.to;
    const emailType = payload.emailType || payload.templateName || payload.template_id;
    const subject = payload.subject;
    const body = payload.body;
    const candidateName = payload.candidateName || payload.candidate_name;

    if (!recipient || !isValidEmail(recipient)) {
      return NextResponse.json(
        { error: 'A valid candidate recipient email address is required.' },
        { status: 400 }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: 'Email subject cannot be empty.' }, { status: 400 });
    }

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: 'Email body cannot be empty.' }, { status: 400 });
    }

    // 1. Dispatch email (Live SMTP if configured, or transparent Academic Mock Mode)
    const emailResult = await sendRecruitmentEmail({
      to: recipient.trim(),
      candidateName: candidateName || 'Candidate',
      subject: subject.trim(),
      body: body.trim(),
      senderName: user.name,
      emailType: emailType || 'Custom Email',
    });

    const now = new Date().toISOString();

    // 2. Persist record in Supabase or MockDb
    const supabase = getServerSupabase();
    if (supabase) {
      try {
        const { data: commRecord, error: commErr } = await supabase
          .from('communication_records')
          .insert({
            candidate_id: candidateId,
            candidate_name: candidateName || 'Candidate',
            recipient: recipient.trim(),
            sender_id: user.id,
            sender_name: user.name,
            email_type: emailType || 'Custom Email',
            subject: subject.trim(),
            body: body.trim(),
            status: emailResult.status,
            delivery_mode: emailResult.deliveryMode,
            sent_at: now,
          })
          .select()
          .single();

        if (!commErr && commRecord) {
          // Update screening result record communication status
          await supabase
            .from('screening_results')
            .update({
              communication_status: emailResult.status,
              last_communication_type: emailType || 'Custom Email',
              last_communication_at: now,
            })
            .eq('id', candidateId);

          // Audit log
          await supabase.from('audit_logs').insert({
            user_id: user.id,
            user_name: user.name,
            action: 'RECRUITMENT_EMAIL_SENT',
            details: `Dispatched "${emailType}" to ${recipient}. Subject: "${subject}" (${emailResult.deliveryMode})`,
            ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
          });

          return NextResponse.json({
            success: emailResult.success,
            communication: commRecord,
            delivery_mode: emailResult.deliveryMode,
            info_note: emailResult.infoNote,
          });
        }
      } catch (e) {
        console.warn('Supabase comm save failed, saving to mock DB:', e);
      }
    }

    // Mock DB persistence
    const commRecord = mockDb.addCommunication({
      candidate_id: candidateId,
      candidate_name: candidateName || 'Candidate',
      recipient: recipient.trim(),
      sender_id: user.id,
      sender_name: user.name,
      email_type: emailType || 'Custom Email',
      subject: subject.trim(),
      body: body.trim(),
      status: emailResult.status,
      delivery_mode: emailResult.deliveryMode,
    });

    return NextResponse.json({
      success: emailResult.success,
      communication: commRecord,
      delivery_mode: emailResult.deliveryMode,
      info_note: emailResult.infoNote,
    });
  } catch (error) {
    console.error('Error sending recruitment communication:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch email: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
