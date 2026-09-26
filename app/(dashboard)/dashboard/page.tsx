'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Layers,
  TrendingUp,
  ArrowRight,
  UploadCloud,
  PlusCircle,
  FileCheck,
  Award,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  BarChart3,
  Clock,
  ArrowUpRight,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { formatScore, getScoreColor, getRecommendationBadge, formatDate } from '@/lib/utils';
import CandidateComparisonModal, { ComparisonCandidate } from '@/components/shared/candidate-comparison-modal';

interface EnhancedStats {
  activeJobs: number;
  totalScreened: number;
  sessionsRun: number;
  highestScore: number;
  averageScore: number;
  screeningPipeline: {
    uploaded: number;
    processed: number;
    qualified: number;
    shortlisted: number;
    recommended: number;
    conversionRate: number;
  };
  activityChart: {
    days7: { date: string; day: string; count: number }[];
    days30: { date: string; count: number }[];
    trendPercent: number;
    isIncreasing: boolean;
    periodComparisonText: string;
  };
  aiInsights: {
    mostCommonSkills: { skill: string; count: number; percentage: number }[];
    mostMissingSkills: { skill: string; count: number; percentage: number }[];
    averageScore: number;
    jobInsights: string[];
  };
  screeningAlerts: {
    id: string;
    type: string;
    level: string;
    title: string;
    message: string;
    actionLabel?: string;
  }[];
  skillMatchOverview: {
    skill: string;
    matchedCount: number;
    totalCount: number;
    percentage: number;
    ratio: string;
  }[];
  recentActivity: {
    id: string;
    job_title: string;
    resumes_screened: number;
    highest_score: number;
    date: string;
    status: string;
  }[];
  topCandidates: {
    id: string;
    candidate_name: string;
    job_title: string;
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    experience: string;
    education: string;
    summary: string;
    recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
    rank: number;
  }[];
  activeJobsList: {
    id: string;
    title: string;
    candidate_count: number;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<EnhancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7' | '30'>('7');

  // Candidate Comparison State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], id]; // keep max 3
      }
      return [...prev, id];
    });
  };

  const getCandidatesForComparison = (): ComparisonCandidate[] => {
    if (!stats?.topCandidates) return [];
    return stats.topCandidates.filter((c) => selectedCandidateIds.includes(c.id));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-8 bg-slate-200 rounded w-16 mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Openings',
      value: stats?.activeJobs ?? 0,
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-[#4F46E5]',
      footer: 'Active vacancies being screened',
    },
    {
      title: 'Total Resumes Screened',
      value: stats?.totalScreened ?? 0,
      icon: Users,
      iconBg: 'bg-emerald-50 text-[#059669]',
      footer: 'Processed through NLP TF-IDF',
    },
    {
      title: 'Average Match Score',
      value: `${stats?.averageScore ?? 0}%`,
      icon: BarChart3,
      iconBg: 'bg-blue-50 text-blue-600',
      footer: 'Calibrated applicant pool average',
      highlight: true,
    },
    {
      title: 'Highest Match Score',
      value: `${stats?.highestScore ?? 0}%`,
      icon: TrendingUp,
      iconBg: 'bg-purple-50 text-purple-600',
      footer: 'Best candidate-to-job alignment',
    },
  ];

  const pipeline = stats?.screeningPipeline || {
    uploaded: 0,
    processed: 0,
    qualified: 0,
    shortlisted: 0,
    recommended: 0,
    conversionRate: 0,
  };

  const chartData = chartPeriod === '7'
    ? stats?.activityChart?.days7 || []
    : stats?.activityChart?.days30 || [];

  const maxChartCount = Math.max(1, ...chartData.map((d) => d.count));

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
              Recruitment Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-500 font-medium">Enterprise Pipeline Active</span>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Candidate Screening & Match Intelligence
          </h2>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Objective candidate ranking combining mathematical TF-IDF cosine similarity with Claude AI semantic skill enrichment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/screen"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Screen Resumes</span>
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-500" />
            <span>New Job</span>
          </Link>
          <Link
            href="/results"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4 text-slate-500" />
            <span>View Rankings</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                card.highlight ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  {card.value}
                </span>
              </div>
              <div className="border-t border-[#E2E8F0] mt-3 pt-2.5">
                <p className="text-[11px] text-[#64748B]">{card.footer}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🎯 Candidate Screening Pipeline Funnel */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Candidate Screening Pipeline Funnel
            </h3>
            <p className="text-xs text-[#64748B]">
              Progression from raw upload to qualified shortlist recommendations
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {pipeline.conversionRate}% Final Fit Ratio
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Resumes Uploaded
            </span>
            <span className="text-xl font-extrabold text-[#0F172A] block mt-1">
              {pipeline.uploaded}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">100% of buffer</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              2. Parsed & Processed
            </span>
            <span className="text-xl font-extrabold text-blue-600 block mt-1">
              {pipeline.processed}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Extraction OK</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              3. Qualified (&ge;50%)
            </span>
            <span className="text-xl font-extrabold text-amber-600 block mt-1">
              {pipeline.qualified}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Foundational fit</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              4. Shortlisted (&ge;70%)
            </span>
            <span className="text-xl font-extrabold text-indigo-600 block mt-1">
              {pipeline.shortlisted}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Strong alignment</span>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              5. Recommended (&ge;80%)
            </span>
            <span className="text-xl font-extrabold text-emerald-700 block mt-1">
              {pipeline.recommended}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">Top-Tier Picks</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: 📊 Screening Activity Chart + ⚠️ Screening Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 📊 Screening Activity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#4F46E5]" />
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    Screening Activity Volume
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Resume volume screened across recruitment sessions
                </p>
              </div>

              {/* 7 Days / 30 Days Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{stats?.activityChart?.trendPercent}% Trend</span>
                </span>
                <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setChartPeriod('7')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      chartPeriod === '7' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartPeriod('30')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      chartPeriod === '30' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="pt-4">
              <div className="h-44 w-full flex items-end gap-2 sm:gap-3 pb-2 border-b border-[#E2E8F0]">
                {chartData.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.count / maxChartCount) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-8 bg-[#0B0F19] text-white text-[10px] font-semibold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                        {item.count} Resumes ({item.date})
                      </div>
                      <div
                        className="w-full max-w-[32px] bg-indigo-500 hover:bg-[#4F46E5] rounded-t-md transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Labels below chart */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
                {chartPeriod === '7' ? (
                  stats?.activityChart?.days7.map((d, i) => (
                    <span key={i} className="flex-1 text-center truncate">
                      {d.day}
                    </span>
                  ))
                ) : (
                  <>
                    <span>30 days ago</span>
                    <span>15 days ago</span>
                    <span>Today</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
            <span>{stats?.activityChart?.periodComparisonText}</span>
            <span className="font-semibold text-[#4F46E5]">Screening Activity Increasing</span>
          </div>
        </div>

        {/* ⚠️ Screening Alerts (1 col) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Recruitment Alerts
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Real-time actionable flags detected by the NLP engine
            </p>

            <div className="space-y-3">
              {(stats?.screeningAlerts || []).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    alert.level === 'warning'
                      ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                      : 'bg-blue-50/50 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span>{alert.title}</span>
                    <span className="text-[10px] uppercase font-semibold">
                      {alert.level === 'warning' ? 'Action Required' : 'Notice'}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2E8F0]">
            <Link
              href="/results"
              className="text-xs font-semibold text-[#4F46E5] hover:underline flex items-center justify-between"
            >
              <span>View flagged candidates in Results &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Grid: 🧠 AI Screening Insights & 🧩 Skill Match Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🧠 AI Screening Insights */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                AI Screening Insights
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Automated talent pool skill frequencies and requirement alignment
            </p>
          </div>

          {/* Top Common vs Missing Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Common Skills */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                Top Identified Skills
              </span>
              <div className="space-y-1.5">
                {(stats?.aiInsights?.mostCommonSkills || []).map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-emerald-950 truncate max-w-[110px]">{s.skill}</span>
                    <span className="text-emerald-700 font-bold">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills Gaps */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Top Skill Gaps
              </span>
              <div className="space-y-1.5">
                {(stats?.aiInsights?.mostMissingSkills || []).map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 truncate max-w-[110px]">{s.skill}</span>
                    <span className="text-slate-600 font-bold">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Requirement Insight Note */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#4F46E5] block">
              Heuristic Job Advisory
            </span>
            <p className="text-[11px] leading-relaxed">
              {stats?.aiInsights?.jobInsights?.[0] || 'Applicant pool demonstrates strong foundational competency in database management and backend design.'}
            </p>
          </div>
        </div>

        {/* 🧩 Skill Match Overview */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Skill Match Overview
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Required job competencies vs candidate fulfillment ratio
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {(stats?.skillMatchOverview || []).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#0F172A]">{item.skill}</span>
                  <span className="text-slate-600 font-mono text-[11px]">
                    {item.ratio} candidates ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🕐 Recent Screening Activity & Top Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Candidates Leaderboard with Comparison Multi-select */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Top Screened Candidates
              </h3>
              <p className="text-xs text-[#64748B]">
                Select 2–3 candidates to launch side-by-side comparison
              </p>
            </div>

            {selectedCandidateIds.length >= 2 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Compare {selectedCandidateIds.length} Selected</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Select</th>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {(stats?.topCandidates || []).map((candidate) => {
                  const scoreNum = formatScore(candidate.score);
                  const colors = getScoreColor(scoreNum);
                  const isChecked = selectedCandidateIds.includes(candidate.id);

                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCandidate(candidate.id)}
                          className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700">
                        {candidate.rank === 1 && '🥇'}
                        {candidate.rank === 2 && '🥈'}
                        {candidate.rank === 3 && '🥉'}
                        {candidate.rank > 3 && `#${candidate.rank}`}
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-[#0F172A] block">{candidate.candidate_name}</span>
                          <span className="text-[10px] text-slate-500">{candidate.job_title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-24">
                          <span className={`font-bold ${colors.text}`}>{scoreNum}%</span>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className={`h-full ${colors.bar}`} style={{ width: `${scoreNum}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRecommendationBadge(candidate.recommendation).color}`}>
                          {candidate.recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: 🕐 Recent Screening Activity Feed */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Recent Screening Runs
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">Batch execution logs & performance</p>

            <div className="space-y-3">
              {(stats?.recentActivity || []).map((act) => (
                <div key={act.id} className="p-3 rounded-xl border border-[#E2E8F0] bg-slate-50/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#0F172A]">
                    <span>{act.job_title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {act.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{act.resumes_screened} resumes screened</span>
                    <span className="font-semibold text-emerald-700">Top: {act.highest_score}%</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{formatDate(act.date)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2E8F0]">
            <Link
              href="/screen"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Launch New Batch</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Candidate Comparison Modal */}
      {isCompareModalOpen && (
        <CandidateComparisonModal
          candidates={getCandidatesForComparison()}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
    </div>
  );
}
