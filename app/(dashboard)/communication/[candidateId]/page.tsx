'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Send,
  User,
  Briefcase,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  Sparkles,
  Info,
  Shield,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  EMAIL_TEMPLATES,
  EmailTemplateType,
  interpolatePlaceholders,
} from '@/lib/email/templates';
import { isValidEmail } from '@/lib/email/service';
import { formatScore, getScoreColor, getRecommendationBadge, getHrDecisionBadge, formatDate } from '@/lib/utils';
import type { CandidateProfileData } from '@/components/shared/candidate-profile-modal';

export default function CandidateCommunicationPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loadingCandidate, setLoadingCandidate] = useState(true);

  // Template & Email Form State
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>('Shortlisted Notification');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Interview Details
  const [interviewDate, setInterviewDate] = useState('Next Tuesday (DD/MM/YYYY)');
  const [interviewTime, setInterviewTime] = useState('10:00 AM (MYT)');
  const [interviewLocation, setInterviewLocation] = useState('Google Meet / Video Conference');
  const [additionalInstructions, setAdditionalInstructions] = useState('Please have a copy of your CV and portfolio ready.');

  // Placeholders
  const [companyName, setCompanyName] = useState('HireSense Talent Organization');
  const [hrName, setHrName] = useState(user?.name || 'Talent Acquisition Team');

  // Modes
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [statusMode, setStatusMode] = useState<'Draft' | 'Sent' | 'Failed'>('Draft');
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch candidate details
  const fetchCandidateData = async () => {
    try {
      setLoadingCandidate(true);
      const res = await fetch(`/api/candidates/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.candidate) {
          const c = data.candidate;
          setCandidate(c);
          setRecipient(c.candidate_email || `${c.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`);

          // Choose initial template based on HR Decision
          if (c.hr_decision === 'Shortlisted') setSelectedTemplate('Shortlisted Notification');
          else if (c.hr_decision === 'Rejected') setSelectedTemplate('Rejection Notification');
          else if (c.hr_decision === 'Review Later') setSelectedTemplate('Application Under Review');
          else setSelectedTemplate('Shortlisted Notification');
        }
      }
    } catch (err) {
      console.error('Failed to load candidate for communication:', err);
    } finally {
      setLoadingCandidate(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId]);

  // Interpolate placeholders whenever candidate, template or variables change
  useEffect(() => {
    if (!candidate) return;

    const tpl = EMAIL_TEMPLATES[selectedTemplate];
    if (tpl) {
      let rawSubject = tpl.subject;
      let rawBody = tpl.body;

      // Special customization for Interview Invitation
      if (selectedTemplate === 'Interview Invitation') {
        rawBody = `Dear {Candidate Name},

Following the review of your qualifications for the {Job Title} position at {Company Name}, we would like to invite you for an official interview.

Interview Details:
• Position: {Job Title}
• Date: {Interview Date}
• Time: {Interview Time}
• Location / Format: ${interviewLocation}
${additionalInstructions ? `• Instructions: ${additionalInstructions}\n` : ''}
Please reply to this email to confirm whether this proposed timing suits your schedule, or provide 2–3 alternative time slots if you require a reschedule.

We look forward to speaking with you.

Warm regards,

{HR Name}
Recruitment & Talent Team
{Company Name}`;
      }

      const interpolatedSubject = interpolatePlaceholders(rawSubject, {
        candidateName: candidate.candidate_name,
        jobTitle: candidate.job_title,
        companyName,
        interviewDate,
        interviewTime,
        hrName,
      });

      const interpolatedBody = interpolatePlaceholders(rawBody, {
        candidateName: candidate.candidate_name,
        jobTitle: candidate.job_title,
        companyName,
        interviewDate,
        interviewTime,
        hrName,
      });

      setSubject(interpolatedSubject);
      setBody(interpolatedBody);
    }
  }, [
    selectedTemplate,
    candidate,
    companyName,
    hrName,
    interviewDate,
    interviewTime,
    interviewLocation,
    additionalInstructions,
  ]);

  // Save draft locally
  const handleSaveDraft = () => {
    setStatusMode('Draft');
    toastSuccess('Draft Saved', 'Email draft saved for candidate record.');
  };

  // Perform Email Dispatch
  const handleSendEmail = async () => {
    // Validations
    if (!recipient.trim() || !isValidEmail(recipient.trim())) {
      toastError('Invalid Recipient Email', 'Please enter a valid candidate email address.');
      setShowConfirmModal(false);
      return;
    }

    if (!subject.trim()) {
      toastError('Subject Required', 'Please provide an email subject line.');
      setShowConfirmModal(false);
      return;
    }

    if (!body.trim()) {
      toastError('Message Content Required', 'Email message body cannot be empty.');
      setShowConfirmModal(false);
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`/api/candidates/${candidateId}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate?.candidate_name,
          recipient: recipient.trim(),
          emailType: selectedTemplate,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMode('Failed');
        throw new Error(data.error || 'Failed to dispatch recruitment email');
      }

      setStatusMode('Sent');
      toastSuccess(
        'Communication Dispatched',
        `Email "${selectedTemplate}" dispatched to ${recipient}. Recorded in history.`
      );
      setShowConfirmModal(false);
      fetchCandidateData();
    } catch (err) {
      setStatusMode('Failed');
      toastError(
        'Dispatch Error',
        err instanceof Error ? err.message : 'An error occurred during communication dispatch.'
      );
      setShowConfirmModal(false);
    } finally {
      setSending(false);
    }
  };

  if (loadingCandidate) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-9 h-9 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#64748B]">Loading candidate communication details...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-4">
        <p className="text-base font-bold text-[#0F172A]">Candidate Profile Not Found</p>
        <p className="text-xs text-[#64748B]">The candidate record does not exist.</p>
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] text-white text-xs font-bold rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Rankings</span>
        </Link>
      </div>
    );
  }

  const scoreNum = formatScore(candidate.score);
  const scoreColors = getScoreColor(scoreNum);
  const recBadge = getRecommendationBadge(candidate.recommendation);
  const hrBadge = getHrDecisionBadge(candidate.hr_decision);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/communication"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Communication Console</span>
        </Link>
      </div>

      {/* Candidate 360° Summary Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white font-bold text-lg flex items-center justify-center shrink-0">
              {candidate.candidate_name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-[#0F172A]">{candidate.candidate_name}</h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${hrBadge.color}`}>
                  HR Decision: {hrBadge.label}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${recBadge.color}`}>
                  AI Advisory: {recBadge.label}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Role: <strong className="text-slate-800">{candidate.job_title}</strong> &bull; Match Score:{' '}
                <strong className={scoreColors.text}>{scoreNum}%</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/results/${candidate.id}`}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
            >
              View 360° Profile
            </Link>
          </div>
        </div>

        {/* HR Notes & AI Recommendation Disclaimer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950">
            <span className="font-bold text-[10px] uppercase tracking-wider block text-indigo-900 mb-1">
              Human-In-The-Loop Principle
            </span>
            <p className="leading-relaxed text-[11px]">
              The AI recommendation (<strong>{candidate.recommendation}</strong>) does NOT automatically send emails. The final decision and communication dispatch are explicitly controlled by HR.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-900 mb-1">
              Recorded HR Notes
            </span>
            <p className="leading-relaxed text-[11px] font-medium">
              {candidate.hr_notes ? `"${candidate.hr_notes}"` : 'No custom evaluation notes recorded.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Communication Editor Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-base font-bold text-[#0F172A]">
              Compose & Personalize Candidate Communication
            </h3>
          </div>

          {/* Status Chip */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] font-semibold">Status:</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                statusMode === 'Sent'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : statusMode === 'Failed'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {statusMode}
            </span>
          </div>
        </div>

        {/* 1. Select Communication Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Communication Type / Category
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplateType)}
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            >
              <option value="Shortlisted Notification">1. Shortlisted Notification</option>
              <option value="Interview Invitation">2. Interview Invitation</option>
              <option value="Rejection Notification">3. Rejection Notification</option>
              <option value="Application Under Review">4. Application Under Review</option>
              <option value="Custom Email">5. Custom Email</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Recipient Email Address
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="candidate@example.com"
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        </div>

        {/* 2. Specific Interview Invitation Fields if selected */}
        {selectedTemplate === 'Interview Invitation' && (
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-3 text-xs">
            <span className="font-bold text-xs text-indigo-950 uppercase tracking-wider block">
              Interview Logistics & Schedule Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Interview Date
                </label>
                <input
                  type="text"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Interview Time
                </label>
                <input
                  type="text"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Location or Meeting Link
                </label>
                <input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">
                Additional Candidate Instructions
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Please bring technical portfolio..."
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        )}

        {/* 3. Placeholder Interpolation Inputs */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Dynamic Information Variables
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Company / Recruiting Organization
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-medium mb-1">
                Sender / HR Name
              </label>
              <input
                type="text"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* 4. Editor vs Preview Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-[#4F46E5] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Message Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-[#4F46E5] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Candidate View Preview</span>
              </button>
            </div>
          </div>

          {activeTab === 'edit' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Email Message Body
                </label>
                <textarea
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Compose message..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl p-4 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-[#E2E8F0] bg-slate-50/50 space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3 text-xs space-y-1">
                <div>
                  <span className="text-slate-400 font-medium">To: </span>
                  <span className="font-semibold text-slate-800">{candidate.candidate_name} &lt;{recipient}&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">From: </span>
                  <span className="font-semibold text-slate-800">{hrName} &lt;recruitment@{companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&gt;</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Subject: </span>
                  <span className="font-bold text-[#0F172A]">{subject}</span>
                </div>
              </div>

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white p-5 rounded-xl border border-slate-200">
                {body}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={sending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Communication</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0F172A]">
                  Confirm Candidate Communication
                </h4>
                <p className="text-xs text-[#64748B]">
                  Verify details before sending
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-2 my-4">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Candidate Name:</span>
                <span className="font-bold text-slate-800">{candidate.candidate_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Recipient Email:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Communication Type:</span>
                <span className="font-semibold text-[#4F46E5]">{selectedTemplate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">HR Decision:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full border text-[10px] ${hrBadge.color}`}>
                  {hrBadge.label}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Send</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
