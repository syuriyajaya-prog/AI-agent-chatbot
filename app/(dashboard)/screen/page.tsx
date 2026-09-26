'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Briefcase,
  ChevronDown,
  Layers,
  Award,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatScore, getScoreColor, getRecommendationBadge } from '@/lib/utils';
import CandidateComparisonModal, { ComparisonCandidate } from '@/components/shared/candidate-comparison-modal';

interface Job {
  id: string;
  title: string;
  description: string;
  candidate_count: number;
}

interface ScreeningResult {
  id?: string;
  candidate_name: string;
  filename: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience: string;
  education: string;
  summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  rank: number;
}

export default function ScreenPage() {
  const { error: toastError, success: toastSuccess } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [results, setResults] = useState<ScreeningResult[] | null>(null);

  // Detail Modal & Comparison Modal
  const [activeModalCandidate, setActiveModalCandidate] = useState<ScreeningResult | null>(null);
  const [selectedCandidateNames, setSelectedCandidateNames] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const steps = [
    'Parsing resume documents (pdf-parse & mammoth)...',
    'Preprocessing text & building vocabulary vectors...',
    'Computing TF-IDF cosine similarity scores...',
    'Performing Claude AI semantic enrichment & skill validation...',
    'Synthesizing explainable candidate rankings...',
  ];

  // Fetch available jobs
  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.jobs) {
            setJobs(data.jobs);
            if (data.jobs.length > 0) {
              setSelectedJobId(data.jobs[0].id);
              setSelectedJob(data.jobs[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
      }
    }
    loadJobs();
  }, []);

  const handleJobChange = (id: string) => {
    setSelectedJobId(id);
    const j = jobs.find((x) => x.id === id) || null;
    setSelectedJob(j);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const validExtensions = ['pdf', 'docx', 'doc', 'txt'];
    const newFiles: File[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (validExtensions.includes(ext)) {
        newFiles.push(file);
      } else {
        toastError('Unsupported File', `${file.name} is not a PDF or DOCX resume.`);
      }
    }

    if (files.length + newFiles.length > 150) {
      toastError('Limit Exceeded', 'Maximum 150 resumes can be screened per session.');
      return;
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setResults(null);
    setSelectedCandidateNames([]);
  };

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      toastError('Selection Required', 'Please select a job description to screen against.');
      return;
    }

    if (files.length === 0) {
      toastError('No Files Uploaded', 'Please upload at least one PDF or DOCX resume.');
      return;
    }

    setIsProcessing(true);
    setResults(null);
    setCurrentStepIndex(0);
    setSelectedCandidateNames([]);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const formData = new FormData();
      formData.append('job_id', selectedJobId);
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/screen', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Screening request failed');
      }

      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
        toastSuccess('Screening Completed', `Successfully screened and ranked ${data.results.length} candidates.`);
      }
    } catch (err) {
      clearInterval(interval);
      console.error('Screening failed:', err);
      toastError('Screening Failed', err instanceof Error ? err.message : 'An error occurred during screening');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelectCandidate = (name: string) => {
    setSelectedCandidateNames((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= 3) return [prev[1], prev[2], name];
      return [...prev, name];
    });
  };

  const getCandidatesForComparison = (): ComparisonCandidate[] => {
    if (!results) return [];
    return results
      .filter((r) => selectedCandidateNames.includes(r.candidate_name))
      .map((r) => ({
        id: r.candidate_name,
        candidate_name: r.candidate_name,
        job_title: selectedJob?.title,
        score: r.score,
        matched_skills: r.matched_skills,
        missing_skills: r.missing_skills,
        experience: r.experience,
        education: r.education,
        summary: r.summary,
        recommendation: r.recommendation,
        rank: r.rank,
      }));
  };

  return (
    <div className="space-y-8">
      {/* Configuration Section: Select Job & Drag Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Selector & Preview */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-[#4F46E5]" />
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                1. Select Target Job Description
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Select the role whose requirements and semantic profile will be vectorized for matching.
            </p>

            <div className="relative mb-4">
              <select
                id="job-select-dropdown"
                value={selectedJobId}
                onChange={(e) => handleJobChange(e.target.value)}
                disabled={isProcessing}
                className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] pr-10 cursor-pointer"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.candidate_count} screened)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {selectedJob && (
              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0F172A]">{selectedJob.title}</span>
                  <span className="text-[10px] font-semibold text-[#4F46E5] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Active Opening
                  </span>
                </div>
                <p className="text-[#64748B] leading-relaxed line-clamp-4">
                  {selectedJob.description}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
            Automated blinding: Personal attributes and layout formatting are bypassed during scoring.
          </div>
        </div>

        {/* Right Column (2 cols): File Upload Zone & File List */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  2. Upload Candidate Resumes (PDF / DOCX)
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#64748B]">
                {files.length} / 150 Resumes
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-4">
              Drag and drop candidate resumes into the screening buffer. Maximum 150 resumes per session.
            </p>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileSelect(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#4F46E5] bg-indigo-50/40'
                  : 'border-[#CBD5E1] hover:border-[#4F46E5] bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mx-auto mb-2.5">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#0F172A]">
                Click to browse or drag and drop resume files here
              </p>
              <p className="text-[11px] text-[#64748B] mt-1">
                Supports Adobe PDF (.pdf) and Microsoft Word (.docx). Up to 150 files per batch.
              </p>
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  <span>Queued Documents ({files.length})</span>
                  <button
                    onClick={clearAllFiles}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {files.map((file, idx) => {
                    const isPdf = file.name.endsWith('.pdf');
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                              isPdf ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isPdf ? 'PDF' : 'DOC'}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end">
            <button
              onClick={handleStartScreening}
              disabled={isProcessing || files.length === 0}
              id="execute-screening-button"
              className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Resume Screening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Progress Box while Processing */}
      {isProcessing && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-md animate-pulse-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full border-2 border-[#4F46E5] border-t-transparent animate-spin" />
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Processing Screening Pipeline...
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#4F46E5]">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
            <div
              className="bg-[#4F46E5] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-[11px] leading-snug flex items-center gap-2 ${
                    isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : isCurrent
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${
                        isCurrent ? 'border-[#4F46E5] bg-[#4F46E5]' : 'border-slate-300'
                      }`}
                    />
                  )}
                  <span className="truncate">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Screening Results Section */}
      {results && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#4F46E5]" />
                <h3 className="text-base font-bold text-[#0F172A]">
                  Ranked Screening Results ({results.length} Candidates)
                </h3>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Sorted objectively by TF-IDF cosine similarity and Claude AI semantic evaluation for{' '}
                <span className="font-semibold text-slate-800">{selectedJob?.title}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedCandidateNames.length >= 2 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Compare {selectedCandidateNames.length} Candidates
                </button>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Session Persisted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10">Select</th>
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Candidate</th>
                  <th className="py-3 px-3">Match Score</th>
                  <th className="py-3 px-3">Top Matched Skills</th>
                  <th className="py-3 px-3">Recommendation</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {results.map((r) => {
                  const scoreNum = formatScore(r.score);
                  const colors = getScoreColor(scoreNum);
                  const badge = getRecommendationBadge(r.recommendation);
                  const isChecked = selectedCandidateNames.includes(r.candidate_name);

                  return (
                    <tr key={r.rank} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCandidate(r.candidate_name)}
                          className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-3 font-bold">
                        {r.rank === 1 && (
                          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-300">
                            🥇
                          </span>
                        )}
                        {r.rank === 2 && (
                          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300">
                            🥈
                          </span>
                        )}
                        {r.rank === 3 && (
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center border border-orange-300">
                            🥉
                          </span>
                        )}
                        {r.rank > 3 && (
                          <span className="text-slate-500 pl-2">
                            #{r.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {r.candidate_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] block">
                              {r.candidate_name}
                            </span>
                            <span className="text-[11px] text-[#64748B] block truncate max-w-xs">
                              {r.filename}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="w-32">
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
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {r.matched_skills.slice(0, 3).map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {r.matched_skills.length > 3 && (
                            <span className="text-[10px] font-medium text-slate-400 self-center">
                              +{r.matched_skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setActiveModalCandidate(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5] text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Detail Modal */}
      {activeModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#0F172A]">
                    {activeModalCandidate.candidate_name}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      getRecommendationBadge(activeModalCandidate.recommendation).color
                    }`}
                  >
                    {activeModalCandidate.recommendation}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1">
                  Evaluated from: {activeModalCandidate.filename}
                </p>
              </div>
              <button
                onClick={() => setActiveModalCandidate(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-6">
              {/* Score Ring Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Overall Semantic Fit
                  </span>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    TF-IDF cosine similarity blended with Claude AI evaluation
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`text-2xl font-extrabold ${
                        getScoreColor(activeModalCandidate.score).text
                      }`}
                    >
                      {formatScore(activeModalCandidate.score)}%
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                      Rank #{activeModalCandidate.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                  Claude AI Executive Summary
                </h4>
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs text-indigo-950 leading-relaxed font-medium">
                  {activeModalCandidate.summary}
                </div>
              </div>

              {/* Matched Skills & Missing Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalCandidate.matched_skills.map((s, idx) => (
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
                    <span>Missing / Skill Gaps</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalCandidate.missing_skills.map((s, idx) => (
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

              {/* Experience and Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Relevant Experience
                  </h4>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-[#E2E8F0]">
                    {activeModalCandidate.experience}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                    Educational Qualifications
                  </h4>
                  <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-[#E2E8F0]">
                    {activeModalCandidate.education}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setActiveModalCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

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
