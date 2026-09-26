'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  X,
  Loader2,
  Search,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface Job {
  id: string;
  title: string;
  description: string;
  candidate_count: number;
  created_at: string;
  is_active: boolean;
}

export default function JobsPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setFormTitle('');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormTitle(job.title);
    setFormDescription(job.description);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      toastError('Validation Error', 'Title and description cannot be empty.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingJob) {
        const res = await fetch(`/api/jobs/${editingJob.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toastSuccess('Job Updated', `Updated "${formTitle}" successfully.`);
          setIsModalOpen(false);
          loadJobs();
        } else {
          toastError('Error', data.error || 'Failed to update job');
        }
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toastSuccess('Job Created', `Created "${formTitle}" successfully.`);
          setIsModalOpen(false);
          loadJobs();
        } else {
          toastError('Error', data.error || 'Failed to create job');
        }
      }
    } catch (err) {
      toastError('Save Failed', err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete "${job.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toastSuccess('Job Deleted', `Archived "${job.title}".`);
        loadJobs();
      } else {
        toastError('Delete Failed', data.error || 'Could not delete job');
      }
    } catch (err) {
      toastError('Delete Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search job titles or requirements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
          />
        </div>

        <button
          onClick={openCreateModal}
          id="create-new-job-button"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Description</span>
        </button>
      </div>

      {/* Job Descriptions Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#64748B]">Loading job vacancies...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors">
                    {job.title}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex-shrink-0">
                    {job.candidate_count} Screened
                  </span>
                </div>

                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-5 mb-4">
                  {job.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(job.created_at)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/results?job_id=${job.id}`}
                    className="p-1.5 text-slate-500 hover:text-[#4F46E5] hover:bg-slate-100 rounded-md transition-colors"
                    title="View Candidates"
                  >
                    <Users className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => openEditModal(job)}
                    className="p-1.5 text-slate-500 hover:text-[#4F46E5] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Edit Description"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Archive Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-16 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#0F172A]">No Job Descriptions Found</h4>
          <p className="text-xs text-[#64748B] mt-1">
            Create a new job description to begin screening candidate resumes.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-lg hover:bg-[#4338CA] cursor-pointer"
          >
            Create Job Description
          </button>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  {editingJob ? 'Edit Job Description' : 'Create New Job Description'}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Prerequisites, required skills, responsibilities, and qualifications
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Job Position Title
                </label>
                <input
                  type="text"
                  required
                  id="job-title-input"
                  placeholder="e.g. Senior Full Stack Engineer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Comprehensive Description & Requirements
                </label>
                <p className="text-[11px] text-[#64748B] mb-2">
                  Include key programming languages, database knowledge, cloud platforms, education degrees, and required years of experience.
                </p>
                <textarea
                  required
                  id="job-description-textarea"
                  rows={6}
                  placeholder="Seeking a skilled Software Engineer with 2+ years experience in Python, JavaScript, REST APIs, SQL, Git, and Agile development..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  id="save-job-submit-button"
                  className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingJob ? 'Update Position' : 'Save Job Position'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
