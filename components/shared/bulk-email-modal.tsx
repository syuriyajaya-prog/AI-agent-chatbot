'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/toast';
import {
  EMAIL_TEMPLATES,
  EmailTemplateType,
  interpolatePlaceholders,
} from '@/lib/email/templates';
import { getHrDecisionBadge } from '@/lib/utils';

export interface BulkCandidateItem {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  job_title: string;
  hr_decision?: string;
  score: number;
}

interface BulkEmailModalProps {
  candidates: BulkCandidateItem[];
  onClose: () => void;
  onBulkComplete: () => void;
}

export default function BulkEmailModal({
  candidates,
  onClose,
  onBulkComplete,
}: BulkEmailModalProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Check predominant decision among selected
  const allDecisions = candidates.map((c) => c.hr_decision || 'Pending');
  const isAllRejected = allDecisions.every((d) => d === 'Rejected');
  const isAllShortlisted = allDecisions.every((d) => d === 'Shortlisted');
  const isAllReviewLater = allDecisions.every((d) => d === 'Review Later');

  const getInitialTemplate = (): EmailTemplateType => {
    if (isAllRejected) return 'Rejection Notification';
    if (isAllShortlisted) return 'Shortlisted Notification';
    if (isAllReviewLater) return 'Application Under Review';
    return 'Shortlisted Notification';
  };

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>(getInitialTemplate());
  const [companyName, setCompanyName] = useState('HireSense Talent Organization');
  const [interviewDate, setInterviewDate] = useState('Next Tuesday (DD/MM/YYYY)');
  const [interviewTime, setInterviewTime] = useState('10:00 AM (MYT)');
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const tpl = EMAIL_TEMPLATES[selectedTemplate];

  const handleSendBulk = async () => {
    try {
      setSending(true);
      const res = await fetch('/api/communication/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateIds: candidates.map((c) => c.id),
          templateType: selectedTemplate,
          templateSubject: tpl.subject,
          templateBody: tpl.body,
          companyName,
          interviewDate,
          interviewTime,
          confirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Bulk dispatch failed');
      }

      toastSuccess(
        'Bulk Communication Completed',
        `Dispatched ${selectedTemplate} to ${data.successfulCount} candidate(s).`
      );
      setShowConfirmDialog(false);
      onBulkComplete();
      onClose();
    } catch (err) {
      toastError(
        'Bulk Dispatch Failed',
        err instanceof Error ? err.message : 'An error occurred during bulk sending.'
      );
      setShowConfirmDialog(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-slide-up my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4F46E5]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Bulk Candidate Communication
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                {candidates.length} Selected
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Send personalized email notifications to multiple evaluated applicants simultaneously
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Development Mode Notice */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold block">Development Evaluation Dispatcher</span>
            Individual placeholder variables will be interpolated for each candidate and logged into candidate records.
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Selected Candidates Summary */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Selected Recipients ({candidates.length})
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-[#E2E8F0] divide-y divide-[#E2E8F0] bg-slate-50/50">
              {candidates.map((c) => {
                const badge = getHrDecisionBadge(c.hr_decision);
                return (
                  <div key={c.id} className="p-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{c.candidate_name}</span>
                      <span className="text-[11px] text-[#64748B] ml-2">
                        {c.candidate_email || `${c.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium">{c.job_title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              Email Template
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

          {/* Placeholders Configuration */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Dynamic Values Applied Across Recipients
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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

              {selectedTemplate === 'Interview Invitation' && (
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
              )}
            </div>
            <p className="text-[11px] text-[#64748B]">
              <strong>Note:</strong> &#123;Candidate Name&#125; and &#123;Job Title&#125; are dynamically personalized for each candidate.
            </p>
          </div>

          {/* Template Preview Sample */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Sample Rendered Preview (First Candidate: {candidates[0]?.candidate_name})
            </span>
            <div className="bg-white p-3 rounded-lg border border-[#E2E8F0] text-slate-800 space-y-1.5 leading-relaxed whitespace-pre-wrap font-sans text-xs">
              <strong className="block text-[#0F172A]">
                {interpolatePlaceholders(tpl.subject, {
                  candidateName: candidates[0]?.candidate_name || 'Candidate',
                  jobTitle: candidates[0]?.job_title || 'Position',
                  companyName,
                  interviewDate,
                  interviewTime,
                  hrName: user?.name || 'Talent Acquisition Team',
                })}
              </strong>
              <div>
                {interpolatePlaceholders(tpl.body, {
                  candidateName: candidates[0]?.candidate_name || 'Candidate',
                  jobTitle: candidates[0]?.job_title || 'Position',
                  companyName,
                  interviewDate,
                  interviewTime,
                  hrName: user?.name || 'Talent Acquisition Team',
                }).slice(0, 320)}
                ...
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            Total recipients: <strong className="text-slate-800">{candidates.length}</strong>
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Review & Send ({candidates.length})</span>
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A]">
                    Confirm Bulk Communication
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    Explicit confirmation required before dispatch
                  </p>
                </div>
              </div>

              <div className="my-4 p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs space-y-2">
                <p className="text-slate-800 font-semibold leading-relaxed">
                  You are about to send &ldquo;{selectedTemplate}&rdquo; emails to{' '}
                  <span className="text-[#4F46E5] font-bold">{candidates.length} candidates</span>.
                </p>
                <p className="text-[#64748B]">
                  Each candidate will receive an individualized email with personalized placeholders. This action will update their communication status and log to the recruitment audit trail.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendBulk}
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching to {candidates.length}...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Dispatch</span>
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
