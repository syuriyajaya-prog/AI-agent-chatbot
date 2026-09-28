'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  User,
  Briefcase,
  Search,
  ChevronRight,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatScore, getScoreColor, getRecommendationBadge, getHrDecisionBadge } from '@/lib/utils';

interface Candidate {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  score: number;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  hr_decision: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';
  hr_notes?: string;
  communication_status: 'Not Sent' | 'Sent' | 'Failed';
  last_communication_type?: string;
}

export default function CommunicationHubPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedDecision, setSelectedDecision] = useState('all');

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        const res = await fetch('/api/results');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.results) {
            setCandidates(data.results);
          }
        }
      } catch (err) {
        console.error('Failed to load candidate list:', err);
      } fontFinally: {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  const jobsList = Array.from(new Set(candidates.map((c) => c.job_title).filter(Boolean)));

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.candidate_email && c.candidate_email.toLowerCase().includes(search.toLowerCase())) ||
      (c.job_title && c.job_title.toLowerCase().includes(search.toLowerCase()));

    const matchesJob = selectedJob === 'all' || c.job_title === selectedJob;
    const matchesDecision = selectedDecision === 'all' || c.hr_decision === selectedDecision;

    return matchesSearch && matchesJob && matchesDecision;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-lg font-bold text-[#0F172A]">Candidate Communication Console</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
              Human-in-the-Loop Dispatch
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Select a candidate to compose, personalize, and send shortlisted notifications, interview invitations, or rejection updates.
          </p>
        </div>

        <Link
          href="/communication-history"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-[#4F46E5]" />
          <span>View Communication History</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, email, or role..."
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All Job Vacancies</option>
            {jobsList.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDecision}
            onChange={(e) => setSelectedDecision(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All HR Decisions</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Review Later">Review Later</option>
            <option value="Rejected">Rejected</option>
            <option value="Pending">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Candidate List Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-[#E2E8F0]">
          <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#64748B]">Loading candidate records...</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((c) => {
            const scoreNum = formatScore(c.score);
            const colors = getScoreColor(scoreNum);
            const recBadge = getRecommendationBadge(c.recommendation);
            const hrBadge = getHrDecisionBadge(c.hr_decision);

            return (
              <div
                key={c.id}
                className="bg-white border border-[#E2E8F0] hover:border-[#4F46E5] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-base flex items-center justify-center shrink-0">
                        {c.candidate_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#0F172A] truncate group-hover:text-[#4F46E5] transition-colors">
                          {c.candidate_name}
                        </h3>
                        <p className="text-xs text-[#64748B] truncate">
                          {c.candidate_email || `${c.candidate_name.toLowerCase().replace(/\s+/g, '.')}@email.com`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs my-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B] font-medium">Applied Role:</span>
                      <span className="font-bold text-[#0F172A]">{c.job_title}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B] font-medium">AI Match Score:</span>
                      <span className={`font-bold ${colors.text}`}>{scoreNum}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B] font-medium">AI Advisory:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${recBadge.color}`}>
                        {recBadge.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-[#64748B] font-bold">HR Decision:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${hrBadge.color}`}>
                        {hrBadge.label}
                      </span>
                    </div>
                  </div>

                  {c.hr_notes && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200 line-clamp-2">
                      &ldquo;{c.hr_notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[10px] text-[#64748B] font-semibold">
                    Status: {c.communication_status || 'Not Sent'}
                  </span>

                  <Link
                    href={`/communication/${c.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  >
                    <span>Communicate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <Mail className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#0F172A]">No Candidates Found</h3>
          <p className="text-xs text-[#64748B]">Try adjusting your search query or filters.</p>
        </div>
      )}
    </div>
  );
}
