'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  GraduationCap,
  Sparkles,
  Send,
  Calendar,
  Shield,
  History,
  Save,
  Check,
} from 'lucide-react';
import { formatScore, getScoreColor, getRecommendationBadge, getHrDecisionBadge, getCommunicationBadge, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import type { CandidateProfileData } from '@/components/shared/candidate-profile-modal';
import SendEmailModal from '@/components/shared/send-email-modal';
import MakeDecisionModal from '@/components/shared/make-decision-modal';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [candidate, setCandidate] = useState<CandidateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'skills' | 'experience' | 'decision' | 'history'>('overview');

  // Decision editing
  const [decision, setDecision] = useState<'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending'>('Pending');
  const [notes, setNotes] = useState('');
  const [savingDecision, setSavingDecision] = useState(false);

  // Email modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/candidates/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.candidate) {
          setCandidate(data.candidate);
          setDecision(data.candidate.hr_decision || 'Pending');
          setNotes(data.candidate.hr_notes || '');
        }
      }
    } catch (err) {
      console.error('Failed to load candidate details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  const handleSaveDecision = async () => {
    try {
      setSavingDecision(true);
      const res = await fetch(`/api/candidates/${candidateId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save decision');
      }

      toastSuccess('Decision Saved', `Candidate marked as "${decision}".`);
      fetchCandidate();
    } catch (err) {
      toastError(
        'Save Failed',
        err instanceof Error ? err.message : 'Could not save recruitment decision.'
      );
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-9 h-9 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#64748B]">Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center space-y-4">
        <p className="text-base font-bold text-[#0F172A]">Candidate Profile Not Found</p>
        <p className="text-xs text-[#64748B]">The candidate record may have been removed or does not exist.</p>
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
  const commBadge = getCommunicationBadge(candidate.communication_status);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/results"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Screening Results & Rankings</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
            {candidate.candidate_name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A]">
                {candidate.candidate_name}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${hrBadge.color}`}>
                HR: {hrBadge.label}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${recBadge.color}`}>
                AI: {recBadge.label}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${commBadge.color}`}>
                Email: {commBadge.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1 text-slate-800 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {candidate.job_title}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {candidate.candidate_email || `${candidate.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
              </span>
              {candidate.candidate_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.candidate_phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('decision')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-slate-800 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#4F46E5]" />
            <span>Make Decision</span>
          </button>
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-[#E2E8F0] overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'screening', label: 'AI Screening' },
            { id: 'skills', label: 'Skills Analysis' },
            { id: 'experience', label: 'Experience & Education' },
            { id: 'decision', label: 'HR Final Decision' },
            { id: 'history', label: `Recruitment History (${candidate.communications?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#4F46E5] text-[#4F46E5]'
                  : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      Match Score
                    </span>
                    <p className="text-xs text-[#64748B] mt-0.5">TF-IDF Vector Cosine</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-extrabold ${scoreColors.text}`}>
                      {scoreNum}%
                    </span>
                    {candidate.rank && (
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                        Rank #{candidate.rank}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                    AI Recommendation
                  </span>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${recBadge.color}`}>
                    {recBadge.label}
                  </span>
                  <p className="text-[11px] text-[#64748B] mt-1.5">Decision-support advisory</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                    HR Final Decision
                  </span>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${hrBadge.color}`}>
                    {hrBadge.label}
                  </span>
                  <p className="text-[11px] text-[#64748B] mt-1.5 truncate">
                    {candidate.hr_decided_by ? `By ${candidate.hr_decided_by}` : 'Pending review'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Claude AI Semantic Synthesis
                </h4>
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 leading-relaxed font-medium">
                  {candidate.summary}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched Skills ({candidate.matched_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matched_skills.slice(0, 6).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Identified Gaps ({candidate.missing_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missing_skills.slice(0, 4).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 border border-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {candidate.hr_notes && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                    Recorded HR Notes / Comments
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    &ldquo;{candidate.hr_notes}&rdquo;
                  </p>
                  {candidate.hr_decided_at && (
                    <span className="text-[10px] text-amber-700 mt-2 block">
                      Logged on {formatDate(candidate.hr_decided_at)} by {candidate.hr_decided_by || 'HR Recruiter'}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI SCREENING */}
          {activeTab === 'screening' && (
            <div className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#0F172A] text-sm">
                    AI Decision-Support System Architecture
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    HireSense combines <strong>mathematical TF-IDF Vector Space Modeling</strong> (cosine similarity of job requirements vs extracted resume tokens) with <strong>Claude 3.5 Semantic Enrichment</strong>. The AI serves exclusively as decision support; recruitment authority remains with HR.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Mathematical Similarity Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-extrabold ${scoreColors.text}`}>
                      {scoreNum}%
                    </span>
                    <span className="text-slate-500 font-medium">Match Coefficient</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${scoreColors.bar} rounded-full`}
                      style={{ width: `${scoreNum}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] pt-1">
                    Evaluated against active requirements in &ldquo;{candidate.job_title}&rdquo;.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Screening Status & Filename
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">
                      {candidate.filename}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Screened on {formatDate(candidate.created_at)}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${recBadge.color}`}>
                      AI Classification: {recBadge.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Competencies ({candidate.matched_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 border border-emerald-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <span>Identified Gaps ({candidate.missing_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 border border-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#4F46E5]" />
                  <span>Certifications & Accreditations</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(candidate.certifications || ['Industry Professional Accreditation']).map((cert, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE & EDUCATION */}
          {activeTab === 'experience' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                  <span>Relevant Industry Experience</span>
                </h4>
                <p className="text-slate-800 font-medium bg-slate-50 p-3.5 rounded-lg border border-[#E2E8F0] leading-relaxed">
                  {candidate.experience}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
                  <span>Academic Education & Credentials</span>
                </h4>
                <p className="text-slate-800 font-medium bg-slate-50 p-3.5 rounded-lg border border-[#E2E8F0] leading-relaxed">
                  {candidate.education}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: HR FINAL DECISION */}
          {activeTab === 'decision' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#0F172A]">
                    Human Recruiter Authority (FYP Decision-Support Compliance)
                  </h4>
                  <p className="leading-relaxed">
                    AI screening rankings provide preliminary advisory recommendations. The <strong>final recruitment decision is exclusively made and signed off by HR/Admin</strong>. The AI will never alter an HR-assigned decision.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Select Recruitment Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('Shortlisted')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      decision === 'Shortlisted'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-[#E2E8F0] bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 ${decision === 'Shortlisted' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">Shortlisted</span>
                      <span className="text-[11px] text-slate-500">Proceed to interview</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('Review Later')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      decision === 'Review Later'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-[#E2E8F0] bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50/30'
                    }`}
                  >
                    <Clock className={`w-6 h-6 ${decision === 'Review Later' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">Review Later</span>
                      <span className="text-[11px] text-slate-500">Awaiting technical check</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision('Rejected')}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      decision === 'Rejected'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-[#E2E8F0] bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50/30'
                    }`}
                  >
                    <XCircle className={`w-6 h-6 ${decision === 'Rejected' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">Rejected</span>
                      <span className="text-[11px] text-slate-500">Not suitable for vacancy</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  HR Review Notes & Assessment Comments
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed recruitment evaluation notes..."
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none"
                />
              </div>

              {candidate.hr_decided_at && (
                <div className="text-[11px] text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  Last updated on <strong>{formatDate(candidate.hr_decided_at)}</strong> by <strong>{candidate.hr_decided_by || 'HR User'}</strong>.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDecision}
                  disabled={savingDecision}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {savingDecision ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Decision...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save HR Decision</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: COMMUNICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Recruitment Communication Audit Log
                  </h4>
                  <p className="text-xs text-[#64748B]">
                    History of recruitment emails sent to this candidate
                  </p>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send New Email</span>
                </button>
              </div>

              {candidate.communications && candidate.communications.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Email Type</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Recipient</th>
                        <th className="py-2.5 px-3">Sender</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] bg-white">
                      {candidate.communications.map((comm) => (
                        <tr key={comm.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">
                            {formatDate(comm.sent_at)}
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#0F172A] whitespace-nowrap">
                            {comm.email_type}
                          </td>
                          <td className="py-3 px-3 text-slate-700 max-w-xs truncate">
                            {comm.subject}
                          </td>
                          <td className="py-3 px-3 text-[#64748B] font-mono text-[11px]">
                            {comm.recipient}
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            {comm.sender_name}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                comm.status === 'Sent'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              {comm.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-2">
                  <Mail className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-[#0F172A]">No communications dispatched yet</p>
                  <p className="text-[11px] text-[#64748B]">
                    Send a Shortlisted Notification, Interview Invitation, or Rejection Email to start the thread.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <SendEmailModal
          candidateId={candidate.id}
          candidateName={candidate.candidate_name}
          candidateEmail={candidate.candidate_email || `${candidate.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
          jobTitle={candidate.job_title}
          hrDecision={candidate.hr_decision}
          onClose={() => setIsEmailModalOpen(false)}
          onEmailSent={() => {
            fetchCandidate();
          }}
        />
      )}
    </div>
  );
}
