'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Download,
  Filter,
  Eye,
  Award,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Send,
  Shield,
  Clock,
  XCircle,
  Users,
  Mail,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  formatScore,
  getScoreColor,
  getRecommendationBadge,
  getHrDecisionBadge,
  getCommunicationBadge,
  formatDate,
} from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import CandidateComparisonModal, { ComparisonCandidate } from '@/components/shared/candidate-comparison-modal';
import CandidateProfileModal, { CandidateProfileData } from '@/components/shared/candidate-profile-modal';
import MakeDecisionModal, { HrDecisionType } from '@/components/shared/make-decision-modal';
import SendEmailModal from '@/components/shared/send-email-modal';
import BulkEmailModal, { BulkCandidateItem } from '@/components/shared/bulk-email-modal';

interface ResultItem {
  id: string;
  candidate_name: string;
  candidate_email?: string;
  candidate_phone?: string;
  filename: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  certifications?: string[];
  experience: string;
  education: string;
  summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  rank: number;
  job_id: string;
  job_title: string;
  hr_decision?: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';
  hr_notes?: string;
  hr_decided_by?: string;
  hr_decided_at?: string;
  communication_status?: 'Not Sent' | 'Sent' | 'Failed';
  last_communication_type?: string;
  last_communication_at?: string;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
}

export default function ResultsPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [results, setResults] = useState<ResultItem[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedDecisionFilter, setSelectedDecisionFilter] = useState<string>('all');
  const [selectedCommFilter, setSelectedCommFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'date'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  // Multi-Selection State (for comparison or bulk email)
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Modals state
  const [profileModalCandidate, setProfileModalCandidate] = useState<CandidateProfileData | null>(null);
  const [decisionModalCandidate, setDecisionModalCandidate] = useState<ResultItem | null>(null);
  const [emailModalCandidate, setEmailModalCandidate] = useState<ResultItem | null>(null);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsRes, resultsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch(`/api/results${selectedJobId !== 'all' ? `?job_id=${selectedJobId}` : ''}`),
      ]);

      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        if (jData.success) setJobs(jData.jobs);
      }

      if (resultsRes.ok) {
        const rData = await resultsRes.json();
        if (rData.success) setResults(rData.results);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJobId]);

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedCandidateIds.length === filteredAndSortedResults.length) {
      setSelectedCandidateIds([]);
    } else {
      setSelectedCandidateIds(filteredAndSortedResults.map((r) => r.id));
    }
  };

  const getCandidatesForComparison = (): ComparisonCandidate[] => {
    return results.filter((c) => selectedCandidateIds.includes(c.id));
  };

  const getCandidatesForBulkEmail = (): BulkCandidateItem[] => {
    return results
      .filter((c) => selectedCandidateIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        candidate_name: c.candidate_name,
        candidate_email: c.candidate_email,
        job_title: c.job_title,
        hr_decision: c.hr_decision,
        score: c.score,
      }));
  };

  const filteredAndSortedResults = useMemo(() => {
    let list = results;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.candidate_name.toLowerCase().includes(q) ||
          r.job_title.toLowerCase().includes(q) ||
          (r.candidate_email && r.candidate_email.toLowerCase().includes(q)) ||
          r.matched_skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // HR Decision Filter
    if (selectedDecisionFilter !== 'all') {
      list = list.filter((r) => (r.hr_decision || 'Pending') === selectedDecisionFilter);
    }

    // Communication Status Filter
    if (selectedCommFilter !== 'all') {
      list = list.filter((r) => (r.communication_status || 'Not Sent') === selectedCommFilter);
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' ? b.score - a.score : a.score - b.score;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc'
          ? b.candidate_name.localeCompare(a.candidate_name)
          : a.candidate_name.localeCompare(b.candidate_name);
      }
      return sortOrder === 'desc'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [results, searchQuery, selectedDecisionFilter, selectedCommFilter, sortBy, sortOrder]);

  const handleDecisionUpdated = (candidateId: string, newDecision: HrDecisionType, notes: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === candidateId
          ? {
              ...r,
              hr_decision: newDecision,
              hr_notes: notes,
              hr_decided_at: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleEmailSent = (candidateId: string, emailType: string) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === candidateId
          ? {
              ...r,
              communication_status: 'Sent',
              last_communication_type: emailType,
              last_communication_at: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const handleExportCsv = () => {
    if (filteredAndSortedResults.length === 0) {
      toastError('Export Empty', 'No results available to export.');
      return;
    }

    const headers = [
      'Rank',
      'Candidate Name',
      'Candidate Email',
      'Job Title',
      'Match Score (%)',
      'AI Recommendation',
      'HR Final Decision',
      'HR Notes',
      'Communication Status',
      'Last Communication',
      'Matched Skills',
      'Missing Skills',
      'Experience Summary',
      'Education',
      'AI Summary',
      'Filename',
      'Screened At',
    ];

    const rows = filteredAndSortedResults.map((r, idx) => [
      idx + 1,
      `"${r.candidate_name.replace(/"/g, '""')}"`,
      `"${(r.candidate_email || '').replace(/"/g, '""')}"`,
      `"${r.job_title.replace(/"/g, '""')}"`,
      formatScore(r.score),
      `"${r.recommendation}"`,
      `"${r.hr_decision || 'Pending'}"`,
      `"${(r.hr_notes || '').replace(/"/g, '""')}"`,
      `"${r.communication_status || 'Not Sent'}"`,
      `"${(r.last_communication_type || 'None').replace(/"/g, '""')}"`,
      `"${(r.matched_skills || []).join(', ')}"`,
      `"${(r.missing_skills || []).join(', ')}"`,
      `"${(r.experience || '').replace(/"/g, '""')}"`,
      `"${(r.education || '').replace(/"/g, '""')}"`,
      `"${(r.summary || '').replace(/"/g, '""')}"`,
      `"${r.filename}"`,
      `"${new Date(r.created_at).toISOString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hiresense_candidate_recruitment_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toastSuccess('CSV Exported', `Downloaded ${filteredAndSortedResults.length} candidate records.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs space-y-4">
        {/* Search & Select Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate name, email, role, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
            />
          </div>

          {/* Action Buttons: Compare + Bulk Email + CSV Export */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedCandidateIds.length >= 1 && (
              <button
                onClick={() => setIsBulkEmailModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Bulk Email ({selectedCandidateIds.length})</span>
              </button>
            )}

            {selectedCandidateIds.length >= 2 && selectedCandidateIds.length <= 3 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Compare ({selectedCandidateIds.length})</span>
              </button>
            )}

            <button
              onClick={handleExportCsv}
              id="export-csv-button"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
          {/* Job Vacancy Filter */}
          <div className="relative min-w-[190px]">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] pr-8 cursor-pointer"
            >
              <option value="all">All Job Vacancies</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* HR Decision Filter */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedDecisionFilter}
              onChange={(e) => setSelectedDecisionFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] pr-8 cursor-pointer"
            >
              <option value="all">All HR Decisions</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Review Later">Review Later</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending Decision</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Communication Status Filter */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedCommFilter}
              onChange={(e) => setSelectedCommFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] pr-8 cursor-pointer"
            >
              <option value="all">All Communications</option>
              <option value="Sent">Email Sent</option>
              <option value="Not Sent">Not Sent</option>
              <option value="Failed">Failed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sort By */}
          <div className="relative min-w-[170px] ml-auto">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="w-full appearance-none bg-slate-50 border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] pr-8 cursor-pointer"
            >
              <option value="score-desc">Score: Highest First</option>
              <option value="score-asc">Score: Lowest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="date-desc">Date: Most Recent</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              Screening Results & Recruitment Decision Management
            </h3>
            <p className="text-xs text-[#64748B]">
              Showing {filteredAndSortedResults.length} candidates &bull; Select checkboxes for bulk communication or comparison
            </p>
          </div>

          {selectedCandidateIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B]">
                {selectedCandidateIds.length} candidate(s) selected
              </span>
              <button
                onClick={() => setSelectedCandidateIds([])}
                className="text-xs text-[#4F46E5] hover:underline font-semibold"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#64748B]">Loading screening records...</p>
          </div>
        ) : filteredAndSortedResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={
                        selectedCandidateIds.length === filteredAndSortedResults.length
                          ? 'Deselect All'
                          : 'Select All'
                      }
                    >
                      {selectedCandidateIds.length === filteredAndSortedResults.length &&
                      filteredAndSortedResults.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#4F46E5]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-2 w-12 text-center">Rank</th>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Target Role</th>
                  <th className="py-3 px-3">Match Score</th>
                  <th className="py-3 px-3">AI Verdict</th>
                  <th className="py-3 px-3">HR Decision</th>
                  <th className="py-3 px-3">Communication</th>
                  <th className="py-3 px-3">Screened</th>
                  <th className="py-3 px-3 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredAndSortedResults.map((r, idx) => {
                  const scoreNum = formatScore(r.score);
                  const colors = getScoreColor(scoreNum);
                  const badge = getRecommendationBadge(r.recommendation);
                  const hrBadge = getHrDecisionBadge(r.hr_decision);
                  const commBadge = getCommunicationBadge(r.communication_status);
                  const displayRank = idx + 1;
                  const isChecked = selectedCandidateIds.includes(r.id);

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCandidate(r.id)}
                          className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="py-3.5 px-2 text-center">
                        {displayRank === 1 && (
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs inline-flex items-center justify-center border border-amber-300">
                            🥇
                          </span>
                        )}
                        {displayRank === 2 && (
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center border border-slate-300">
                            🥈
                          </span>
                        )}
                        {displayRank === 3 && (
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs inline-flex items-center justify-center border border-orange-300">
                            🥉
                          </span>
                        )}
                        {displayRank > 3 && (
                          <span className="text-xs font-bold text-slate-500">
                            #{displayRank}
                          </span>
                        )}
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {r.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] block leading-tight">
                              {r.candidate_name}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate max-w-[200px]">
                              {r.candidate_email || r.filename}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target Role */}
                      <td className="py-3.5 px-3 text-xs text-[#64748B]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {r.job_title}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-3">
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs font-bold mb-1">
                            <span className={colors.text}>{scoreNum}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colors.bar} rounded-full`}
                              style={{ width: `${scoreNum}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* AI Verdict */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* HR Decision */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${hrBadge.color}`}
                        >
                          {hrBadge.label}
                        </span>
                      </td>

                      {/* Communication Status */}
                      <td className="py-3.5 px-3">
                        <div>
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${commBadge.color}`}
                          >
                            {commBadge.label}
                          </span>
                          {r.last_communication_type && (
                            <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[130px]">
                              {r.last_communication_type}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Screened Date */}
                      <td className="py-3.5 px-3 text-xs text-[#64748B] whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>

                      {/* Actions: View Profile, Make Decision, Send Email */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Profile Button */}
                          <button
                            onClick={() =>
                              setProfileModalCandidate({
                                ...r,
                                hr_decision: r.hr_decision || 'Pending',
                                communication_status: r.communication_status || 'Not Sent',
                              })
                            }
                            title="View Candidate HR Profile"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5] text-xs font-semibold text-slate-700 bg-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>

                          {/* Make Decision Button */}
                          <button
                            onClick={() => setDecisionModalCandidate(r)}
                            title="Record HR Recruitment Decision"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E2E8F0] hover:border-emerald-600 hover:text-emerald-700 text-xs font-semibold text-slate-700 bg-white transition-colors cursor-pointer"
                          >
                            <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Decision</span>
                          </button>

                          {/* Send Email Button */}
                          <button
                            onClick={() => setEmailModalCandidate(r)}
                            title="Send Candidate Recruitment Email"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Email</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm font-semibold text-[#0F172A]">No records match your filter criteria</p>
            <p className="text-xs text-[#64748B]">
              Try clearing search terms or resetting the HR Decision / Vacancy filters.
            </p>
          </div>
        )}
      </div>

      {/* 1. Candidate Full Profile Modal */}
      {profileModalCandidate && (
        <CandidateProfileModal
          candidateId={profileModalCandidate.id}
          initialData={profileModalCandidate}
          onClose={() => setProfileModalCandidate(null)}
          onDecisionUpdated={(id, newDecision, notes) => {
            handleDecisionUpdated(id, newDecision, notes);
          }}
          onOpenSendEmail={(c) => {
            setEmailModalCandidate(c as any);
          }}
        />
      )}

      {/* 2. Quick Make Decision Modal */}
      {decisionModalCandidate && (
        <MakeDecisionModal
          candidateId={decisionModalCandidate.id}
          candidateName={decisionModalCandidate.candidate_name}
          jobTitle={decisionModalCandidate.job_title}
          currentDecision={decisionModalCandidate.hr_decision || 'Pending'}
          currentNotes={decisionModalCandidate.hr_notes || ''}
          aiScore={decisionModalCandidate.score}
          aiRecommendation={decisionModalCandidate.recommendation}
          onClose={() => setDecisionModalCandidate(null)}
          onDecisionUpdated={(id, newDecision, notes) => {
            handleDecisionUpdated(id, newDecision, notes);
          }}
        />
      )}

      {/* 3. Send Email Modal */}
      {emailModalCandidate && (
        <SendEmailModal
          candidateId={emailModalCandidate.id}
          candidateName={emailModalCandidate.candidate_name}
          candidateEmail={
            emailModalCandidate.candidate_email ||
            `${emailModalCandidate.candidate_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@email.com`
          }
          jobTitle={emailModalCandidate.job_title}
          hrDecision={emailModalCandidate.hr_decision}
          onClose={() => setEmailModalCandidate(null)}
          onEmailSent={(id, emailType) => {
            handleEmailSent(id, emailType);
          }}
        />
      )}

      {/* 4. Bulk Email Modal */}
      {isBulkEmailModalOpen && (
        <BulkEmailModal
          candidates={getCandidatesForBulkEmail()}
          onClose={() => setIsBulkEmailModalOpen(false)}
          onBulkComplete={() => {
            loadData();
            setSelectedCandidateIds([]);
          }}
        />
      )}

      {/* 5. Candidate Comparison Modal */}
      {isCompareModalOpen && (
        <CandidateComparisonModal
          candidates={getCandidatesForComparison()}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </div>
  );
}
