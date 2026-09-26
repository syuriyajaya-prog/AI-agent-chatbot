'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Eye,
  Edit3,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  EMAIL_TEMPLATES,
  EmailTemplateType,
  interpolatePlaceholders,
} from '@/lib/email/templates';
import { isValidEmail } from '@/lib/email/service';

interface SendEmailModalProps {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  hrDecision?: string;
  onClose: () => void;
  onEmailSent: (candidateId: string, emailType: string, sentAt: string) => void;
}

export default function SendEmailModal({
  candidateId,
  candidateName,
  candidateEmail,
  jobTitle,
  hrDecision,
  onClose,
  onEmailSent,
}: SendEmailModalProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Determine initial template based on HR Decision
  const getInitialTemplate = (): EmailTemplateType => {
    if (hrDecision === 'Shortlisted') return 'Shortlisted Notification';
    if (hrDecision === 'Rejected') return 'Rejection Notification';
    if (hrDecision === 'Review Later') return 'Application Under Review';
    return 'Shortlisted Notification';
  };

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(getInitialTemplate());
  const [recipient, setRecipient] = useState(candidateEmail || '');
  const [companyName, setCompanyName] = useState('HireSense Talent Organization');
  const [hrName, setHrName] = useState(user?.name || 'Talent Acquisition Team');
  const [interviewDate, setInterviewDate] = useState('Next Tuesday (DD/MM/YYYY)');
  const [interviewTime, setInterviewTime] = useState('10:00 AM (MYT)');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Initialize or update subject and body when template changes
  useEffect(() => {
    const tpl = EMAIL_TEMPLATES[selectedTemplate];
    if (tpl) {
      const interpolatedSubject = interpolatePlaceholders(tpl.subject, {
        candidateName,
        jobTitle,
        companyName,
        interviewDate,
        interviewTime,
        hrName,
      });

      const interpolatedBody = interpolatePlaceholders(tpl.body, {
        candidateName,
        jobTitle,
        companyName,
        interviewDate,
        interviewTime,
        hrName,
      });

      setSubject(interpolatedSubject);
      setBody(interpolatedBody);
    }
  }, [selectedTemplate, candidateName, jobTitle, companyName, interviewDate, interviewTime, hrName]);

  const handleSendEmail = async () => {
    if (!recipient.trim() || !isValidEmail(recipient.trim())) {
      toastError('Invalid Recipient', 'Please enter a valid recipient email address.');
      setShowConfirmDialog(false);
      return;
    }

    if (!subject.trim()) {
      toastError('Missing Subject', 'Please provide an email subject line.');
      setShowConfirmDialog(false);
      return;
    }

    if (!body.trim()) {
      toastError('Missing Body', 'Please provide email message content.');
      setShowConfirmDialog(false);
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`/api/candidates/${candidateId}/communication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          recipient: recipient.trim(),
          emailType: selectedTemplate,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send recruitment communication');
      }

      toastSuccess(
        'Recruitment Communication Sent',
        `Email "${selectedTemplate}" dispatched to ${recipient}.`
      );
      onEmailSent(candidateId, selectedTemplate, new Date().toISOString());
      setShowConfirmDialog(false);
      onClose();
    } catch (err) {
      toastError(
        'Dispatch Failed',
        err instanceof Error ? err.message : 'An error occurred during email transmission.'
      );
      setShowConfirmDialog(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl animate-slide-up my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#4F46E5]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Candidate Communication Console
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                Direct Dispatch
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Send recruitment notifications and interview invitations to <span className="font-semibold text-slate-800">{candidateName}</span> ({jobTitle})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development / Mock Mode Banner */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Development Evaluation Dispatcher Active</span>
            Simulated dispatch mode verifies formatting, placeholder tags, and records delivery into Candidate Communication History.
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Top Controls: Template Selector & Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Predefined Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as EmailTemplateType)}
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
              >
                <option value="Shortlisted Notification">Shortlisted Notification</option>
                <option value="Interview Invitation">Interview Invitation</option>
                <option value="Rejection Notification">Rejection Notification</option>
                <option value="Application Under Review">Application Under Review</option>
                <option value="Custom Email">Custom Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Recipient Email Address
              </label>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Dynamic Placeholders Config (Accordion/Row) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
              Dynamic Placeholder Values
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">
                  &#123;Company Name&#125;
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-medium mb-1">
                  &#123;HR Name&#125;
                </label>
                <input
                  type="text"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#4F46E5]"
                />
              </div>

              {selectedTemplate === 'Interview Invitation' ? (
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-1">
                    &#123;Interview Date & Time&#125;
                  </label>
                  <input
                    type="text"
                    value={`${interviewDate} @ ${interviewTime}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('@');
                      setInterviewDate(parts[0]?.trim() || '');
                      setInterviewTime(parts[1]?.trim() || '');
                    }}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#4F46E5]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] text-slate-500 font-medium mb-1">
                    &#123;Job Title&#125;
                  </label>
                  <input
                    type="text"
                    disabled
                    value={jobTitle}
                    className="w-full bg-slate-100 border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-slate-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Edit vs Preview Toggle */}
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
                <span>Editor</span>
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
                <span>Candidate Preview</span>
              </button>
            </div>
            <span className="text-[11px] text-[#64748B]">
              {activeTab === 'edit' ? 'Editable message body' : 'Final rendered candidate view'}
            </span>
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
                  placeholder="Email subject..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Message Body
                </label>
                <textarea
                  rows={9}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write recruitment email content..."
                  className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-[#E2E8F0] bg-slate-50/50 space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3 text-xs space-y-1">
                <div>
                  <span className="text-slate-400 font-medium">To: </span>
                  <span className="font-semibold text-slate-800">{candidateName} &lt;{recipient}&gt;</span>
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

              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-xl border border-slate-200">
                {body}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[11px] text-[#64748B]">
            Recipient: <strong className="text-slate-800">{recipient || 'Unspecified'}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDialog(true)}
              disabled={sending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
          </div>
        </div>

        {/* Confirmation Dialog Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A]">
                    Confirm Email Dispatch
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Please verify candidate recipient and template
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-1.5 my-4">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Recipient:</span>
                  <span className="font-bold text-slate-800">{candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Email Address:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Template:</span>
                  <span className="font-semibold text-[#4F46E5]">{selectedTemplate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Job Vacancy:</span>
                  <span className="font-semibold text-slate-700">{jobTitle}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Back to Edit
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
