'use client';

import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Download,
} from 'lucide-react';
import { formatScore, getScoreColor, getRecommendationBadge } from '@/lib/utils';

export interface ComparisonCandidate {
  id: string;
  candidate_name: string;
  job_title?: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience: string;
  education: string;
  summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  rank?: number;
}

interface CandidateComparisonModalProps {
  candidates: ComparisonCandidate[];
  onClose: () => void;
}

export default function CandidateComparisonModal({
  candidates,
  onClose,
}: CandidateComparisonModalProps) {
  if (!candidates || candidates.length === 0) return null;

  // Find candidate with highest score
  const highestScore = Math.max(...candidates.map((c) => Number(c.score)));

  // Identify common skills across all selected candidates
  const allMatched = candidates.map((c) => new Set(c.matched_skills || []));
  const commonSkills = (candidates[0]?.matched_skills || []).filter((skill) =>
    allMatched.every((set) => set.has(skill))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#4F46E5]" />
              <h3 className="text-lg font-bold text-[#0F172A]">
                Side-by-Side Candidate Evaluation
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200">
                {candidates.length} Candidates Selected
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Direct comparative analysis of semantic match scores, core competencies, and background criteria
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-1">
          {/* Top Level Summary Cards Grid */}
          <div
            className={`grid gap-4 ${
              candidates.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {candidates.map((c) => {
              const scoreNum = formatScore(c.score);
              const isTopPick = scoreNum === highestScore;
              const colors = getScoreColor(scoreNum);
              const badge = getRecommendationBadge(c.recommendation);

              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isTopPick
                      ? 'border-[#4F46E5] bg-indigo-50/20 shadow-xs'
                      : 'border-[#E2E8F0] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A]">
                          {c.candidate_name}
                        </span>
                        {isTopPick && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>Top Pick</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] block mt-0.5">
                        {c.job_title || 'Target Position'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-2xl font-extrabold ${colors.text}`}>
                        {scoreNum}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
                    <div
                      className={`h-full ${colors.bar} rounded-full`}
                      style={{ width: `${scoreNum}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {(c.matched_skills || []).length} Matched Skills
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Common Skills Highlight */}
          {commonSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0]">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                Shared Core Competencies (Found in all {candidates.length} candidates)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {commonSkills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Deep Side-by-Side Breakdown Matrix */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
              Detailed Criteria Comparison
            </h4>

            {/* Matrix Columns */}
            <div
              className={`grid gap-4 ${
                candidates.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {candidates.map((c) => (
                <div
                  key={c.id}
                  className="space-y-4 p-4 rounded-xl border border-[#E2E8F0] bg-slate-50/40 text-xs"
                >
                  {/* Candidate Name Banner */}
                  <div className="pb-2 border-b border-[#E2E8F0]">
                    <span className="font-bold text-sm text-[#0F172A]">{c.candidate_name}</span>
                  </div>

                  {/* AI Summary */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Claude AI Synthesis
                    </span>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                      {c.summary}
                    </p>
                  </div>

                  {/* Matched Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1.5">
                      Matched Skills ({(c.matched_skills || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(c.matched_skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Identified Gaps ({(c.missing_skills || []).length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(c.missing_skills || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 border border-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Professional Experience
                    </span>
                    <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                      {c.experience}
                    </p>
                  </div>

                  {/* Education */}
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                      Education Credentials
                    </span>
                    <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                      {c.education}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-xs text-[#64748B]">
            Automated ranking based on calibrated TF-IDF cosine distance and semantic model validation.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
