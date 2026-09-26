// Predefined Recruitment Email Templates & Dynamic Placeholder Interpolator

export type EmailTemplateType =
  | 'Shortlisted Notification'
  | 'Interview Invitation'
  | 'Rejection Notification'
  | 'Application Under Review'
  | 'Custom Email';

export interface EmailTemplate {
  id: string;
  name: EmailTemplateType;
  subject: string;
  body: string;
  recommendedForDecision?: 'Shortlisted' | 'Review Later' | 'Rejected';
  description: string;
}

export interface EmailPlaceholders {
  candidateName: string;
  jobTitle: string;
  companyName?: string;
  interviewDate?: string;
  interviewTime?: string;
  hrName?: string;
}

export const EMAIL_TEMPLATES: Record<EmailTemplateType, EmailTemplate> = {
  'Shortlisted Notification': {
    id: 'tpl-shortlisted',
    name: 'Shortlisted Notification',
    recommendedForDecision: 'Shortlisted',
    description: 'Notifies the candidate that their resume and profile have successfully passed the screening stage and were shortlisted.',
    subject: 'Application Shortlisted: {Job Title} - {Company Name}',
    body: `Dear {Candidate Name},

Thank you for your application for the {Job Title} position at {Company Name}.

We are pleased to inform you that following our comprehensive screening and profile evaluation, your application has been shortlisted for the next stage of our recruitment process. Your technical background, relevant experience, and qualifications strongly align with our team's requirements.

Our talent acquisition team will be in touch shortly with detailed instructions regarding the subsequent interview and assessment schedule.

In the meantime, if you have any questions or require special accommodations, please feel free to reply to this email.

Best regards,

{HR Name}
Talent Acquisition Team
{Company Name}`,
  },

  'Interview Invitation': {
    id: 'tpl-interview',
    name: 'Interview Invitation',
    recommendedForDecision: 'Shortlisted',
    description: 'Invites a shortlisted candidate to an official recruitment interview with proposed date, time, and session format.',
    subject: 'Interview Invitation: {Job Title} at {Company Name}',
    body: `Dear {Candidate Name},

Following the review of your qualifications for the {Job Title} position at {Company Name}, we would like to invite you for an official interview.

Interview Details:
• Position: {Job Title}
• Proposed Date: {Interview Date}
• Proposed Time: {Interview Time}
• Format / Mode: Video Conference (Meeting link will be shared upon confirmation)
• Session Focus: Technical discussion, past experience overview, and role expectations

Please reply to this email to confirm whether this proposed timing suits your schedule, or provide 2–3 alternative time slots if you require a reschedule.

We look forward to speaking with you and exploring how your talents fit our vision.

Warm regards,

{HR Name}
Recruitment & Talent Team
{Company Name}`,
  },

  'Rejection Notification': {
    id: 'tpl-rejection',
    name: 'Rejection Notification',
    recommendedForDecision: 'Rejected',
    description: 'Respectful, professional notification thanking the candidate and advising that other applicants were selected for this vacancy.',
    subject: 'Update on your application for {Job Title} - {Company Name}',
    body: `Dear {Candidate Name},

Thank you for taking the time to apply for the {Job Title} position at {Company Name} and for your interest in joining our organization.

We received a very high volume of qualified applications for this opening. While your qualifications and credentials are commendable, after careful evaluation against our specific technical prerequisites and immediate vacancy priorities, we have decided to proceed with other candidates whose profiles more closely align with the current requirements.

We sincerely appreciate your effort in submitting your application. With your permission, we will keep your profile in our talent pool for future openings that match your skill set.

We wish you the very best in your job search and future professional endeavors.

Sincerely,

{HR Name}
Human Resources Department
{Company Name}`,
  },

  'Application Under Review': {
    id: 'tpl-under-review',
    name: 'Application Under Review',
    recommendedForDecision: 'Review Later',
    description: 'Informs the candidate that their application is undergoing detailed review by the hiring manager or committee.',
    subject: 'Application Under Review: {Job Title} - {Company Name}',
    body: `Dear {Candidate Name},

Thank you for applying for the {Job Title} position at {Company Name}.

This email is to confirm that our hiring team has received your application and resume. Your credentials are currently undergoing detailed review by our talent acquisition team and engineering hiring managers.

Due to the volume of applicants, our review cycle typically takes 3 to 5 business days. We will reach out to you with an update as soon as the initial review process has concluded.

Thank you for your patience and enthusiasm for {Company Name}.

Best regards,

{HR Name}
Hiring Committee
{Company Name}`,
  },

  'Custom Email': {
    id: 'tpl-custom',
    name: 'Custom Email',
    description: 'Draft a fully customized recruitment email with automatic placeholder interpolation.',
    subject: 'Update regarding your application for {Job Title} - {Company Name}',
    body: `Dear {Candidate Name},

Thank you for your interest in the {Job Title} role at {Company Name}.

[Enter your custom recruitment message or instructions here]

Should you have any questions, please do not hesitate to contact us.

Regards,

{HR Name}
{Company Name}`,
  },
};

/**
 * Replaces placeholders in template string with provided values
 */
export function interpolatePlaceholders(templateText: string, placeholders: EmailPlaceholders): string {
  const companyName = placeholders.companyName || 'HireSense Talent Organization';
  const hrName = placeholders.hrName || 'Talent Acquisition Team';
  const interviewDate = placeholders.interviewDate || 'Next Tuesday (DD/MM/YYYY)';
  const interviewTime = placeholders.interviewTime || '10:00 AM (MYT)';

  return templateText
    .replace(/\{Candidate Name\}/gi, placeholders.candidateName || 'Candidate')
    .replace(/\{Job Title\}/gi, placeholders.jobTitle || 'Target Position')
    .replace(/\{Company Name\}/gi, companyName)
    .replace(/\{Interview Date\}/gi, interviewDate)
    .replace(/\{Interview Time\}/gi, interviewTime)
    .replace(/\{HR Name\}/gi, hrName);
}

/**
 * Returns list of available templates
 */
export function getEmailTemplatesList(): EmailTemplate[] {
  return Object.values(EMAIL_TEMPLATES);
}
