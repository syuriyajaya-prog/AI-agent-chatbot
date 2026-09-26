import { NextResponse } from 'next/server';
import { getEmailTemplatesList } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = getEmailTemplatesList();
    const availablePlaceholders = [
      '{Candidate Name}',
      '{Job Title}',
      '{Company Name}',
      '{Interview Date}',
      '{Interview Time}',
      '{HR Name}',
    ];

    return NextResponse.json({
      success: true,
      templates,
      placeholders: availablePlaceholders,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to retrieve email templates' }, { status: 500 });
  }
}
