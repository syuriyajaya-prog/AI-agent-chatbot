'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
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
  HelpCircle,
  History,
  Save,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatScore, getScoreColor, getRecommendationBadge, getHrDecisionBadge, getCommunicationBadge, formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth-context';
import type { CommunicationRecord } from '@/lib/storage/mock-db';

export interface CandidateProfileData {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  candidate_phone?: string;
  filename: string;
  job_id: string;
  job_title: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  certifications?: string[];
  experience: string;
  education: string;
  summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  rank?: number;
  hr_decision: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';
  hr_notes?: string;
  hr_decided_by?: string;
  hr_decided_at?: string;
  communication_status: 'Not Sent' | 'Sent' | 'Failed';
  last_communication_type?: string;
  last_communication_at?: string;
  created_at: string;
  communications?: CommunicationRecord[];
}

interface CandidateProfileModalProps {
  candidateId: string;
  initialData?: CandidateProfileData;
  onClose: () => void;
  onDecisionUpdated?: (candidateId: string, decision: any, notes: string) => void;
  onOpenSendEmail?: (candidate: CandidateProfileData) => void;
}

export default function CandidateProfileModal({
  candidateId,
  initialData,
  onClose,
  onDecisionUpdated,
  onOpenSendEmail,
}: CandidateProfileModalProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [candidate, setCandidate] = useState<CandidateProfileData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<'overview' | 'screening' | 'skills' | 'experience' | 'decision' | 'history'>('overview');

  // Form states for HR decision tab
  const [decision, setDecision] = useState<'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending'>(
    initialData?.hr_decision || 'Pending'
  );
  const [notes, setNotes] = useState(initialData?.hr_notes || '');
  const [savingDecision, setSavingDecision] = useState(false);

  // Fetch complete candidate record & communications
  const fetchCandidateData = async () => {
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
    fetchCandidateData();
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
      if (onDecisionUpdated) {
        onDecisionUpdated(candidateId, decision, notes);
      }
      fetchCandidateData();
    } catch (err) {
      toastError(
        'Save Failed',
        err instanceof Error ? err.message : 'Could not save recruitment decision.'
      );
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading && !candidate) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  const scoreNum = formatScore(candidate.score);
  const scoreColors = getScoreColor(scoreNum);
  const recBadge = getRecommendationBadge(candidate.recommendation);
  const hrBadge = getHrDecisionBadge(candidate.hr_decision);
  const commBadge = getCommunicationBadge(candidate.communication_status);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up my-auto max-h-[92vh] flex flex-col">
        {/* Top Header Card */}
        <div className="flex items-start justify-between pb-5 border-b border-[#E2E8F0] gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
              {candidate.candidate_name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-[#0F172A]">
                  {candidate.candidate_name}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hrBadge.color}`}>
                  HR: {hrBadge.label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${recBadge.color}`}>
                  AI: {recBadge.label}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${commBadge.color}`}>
                  Email: {commBadge.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#64748B] mt-1.5">
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

          {/* Quick Action Buttons & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenSendEmail) {
                  onOpenSendEmail(candidate);
                } else {
                  setActiveTab('history');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0] overflow-x-auto py-2 pr-1">
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
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-100 text-[#0F172A] border border-slate-200 shadow-2xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Score */}
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                      AI Match Score
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

                {/* AI Verdict */}
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                    AI Recommendation
                  </span>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${recBadge.color}`}>
                    {recBadge.label}
                  </span>
                  <p className="text-[11px] text-[#64748B] mt-1.5 line-clamp-1">
                    Decision-support rating
                  </p>
                </div>

                {/* HR Final Decision */}
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

              {/* Claude AI Executive Summary */}
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Claude AI Semantic Synthesis
                </h4>
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 leading-relaxed font-medium">
                  {candidate.summary}
                </div>
              </div>

              {/* Quick Skills Snippet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Key Matched Skills ({candidate.matched_skills.length})</span>
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

              {/* HR Notes Callout */}
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

              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Semantic Assessment Breakdown
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] leading-relaxed text-slate-800">
                  {candidate.summary}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS ANALYSIS */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Matched Competencies ({candidate.matched_skills.length})</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Verified
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matched_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 border border-emerald-300 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span>Identified Gaps ({candidate.missing_skills.length})</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Prerequisites
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-800 border border-slate-300 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certifications & Professional Badges */}
              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#4F46E5]" />
                  <span>Certifications & Accreditations</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.certifications && candidate.certifications.length > 0 ? (
                    candidate.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200"
                      >
                        {cert}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">
                      Standard industry qualifications documented in resume.
                    </span>
                  )}
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

              <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#4F46E5]" />
                  <span>Professional Certifications</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(candidate.certifications || ['Industry Professional Accreditation']).map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HR FINAL DECISION */}
          {activeTab === 'decision' && (
            <div className="space-y-5">
              {/* Human-in-the-Loop Callout */}
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

              {/* Decision Options Radio Cards */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
                  Select Recruitment Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Shortlisted */}
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

                  {/* Review Later */}
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

                  {/* Rejected */}
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

              {/* HR Notes / Comments */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  HR Review Notes & Assessment Comments
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter detailed recruitment evaluation notes, interviewer suggestions, salary discussions, or rejection justification..."
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none leading-relaxed"
                />
              </div>

              {/* Past Decision Metadata */}
              {candidate.hr_decided_at && (
                <div className="text-[11px] text-slate-500 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  Last updated on <strong>{formatDate(candidate.hr_decided_at)}</strong> by <strong>{candidate.hr_decided_by || 'HR User'}</strong>.
                </div>
              )}

              {/* Save Decision Action */}
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
                    Full history of recruitment emails dispatched to this applicant
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onOpenSendEmail) onOpenSendEmail(candidate);
                  }}
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

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <div className="text-[11px] text-[#64748B]">
            Current HR Decision: <strong className="text-slate-800">{hrBadge.label}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
