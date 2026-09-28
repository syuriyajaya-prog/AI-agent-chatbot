'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Mail,
  User,
  Briefcase,
  Calendar,
  Clock,
  Eye,
  X,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Send,
  Shield,
  Download,
} from 'lucide-react';
import { formatDate, formatScore, getScoreColor, getHrDecisionBadge } from '@/lib/utils';

interface CommunicationRecord {
  id: string;
  candidate_id: string;
  candidate_name: string;
  recipient: string;
  sender_id?: string;
  sender_name: string;
  email_type: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Failed' | 'Draft' | 'Not Sent';
  delivery_mode?: string;
  sent_at: string;
  error_message?: string;
  // Joined fields
  job_id?: string;
  job_title?: string;
  hr_decision?: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';
  score?: number;
}

export default function CommunicationHistoryPage() {
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState('all');

  // Detail Modal
  const [activeRecord, setActiveRecord] = useState<CommunicationRecord | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedType !== 'all') queryParams.set('type', selectedType);
      if (selectedStatus !== 'all') queryParams.set('status', selectedStatus);
      if (selectedJob !== 'all') queryParams.set('job_id', selectedJob);
      if (search) queryParams.set('search', search);

      const res = await fetch(`/api/communication?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.communications) {
          setCommunications(data.communications);
        }
      }
    } catch (err) {
      console.error('Failed to load communication history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedType, selectedStatus, selectedJob]);

  // Handle client-side search filtering
  const filteredRecords = communications.filter((c) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase().trim();
    return (
      c.candidate_name?.toLowerCase().includes(s) ||
      c.recipient?.toLowerCase().includes(s) ||
      c.subject?.toLowerCase().includes(s) ||
      c.sender_name?.toLowerCase().includes(s) ||
      c.job_title?.toLowerCase().includes(s)
    );
  });

  const jobsList = Array.from(new Set(communications.map((c) => c.job_title).filter(Boolean)));

  const totalSent = communications.filter((c) => c.status === 'Sent').length;
  const totalFailed = communications.filter((c) => c.status === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-lg font-bold text-[#0F172A]">
              Recruitment Communication History & Audit Log
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Complete Records
            </span>
          </div>
          <p className="text-xs text-[#64748B]">
            Immutable record of all candidate notifications, interview invitations, and status updates dispatched by HR.
          </p>
        </div>

        <Link
          href="/communication"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>New Communication</span>
        </Link>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
            Total Dispatched
          </span>
          <div className="text-2xl font-extrabold text-[#0F172A]">
            {communications.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Recorded threads</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block mb-1">
            Successfully Sent
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {totalSent}
          </div>
          <span className="text-[11px] text-emerald-800 font-medium">
            {communications.length > 0 ? Math.round((totalSent / communications.length) * 100) : 100}% Delivery Rate
          </span>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
            Interview Invites
          </span>
          <div className="text-2xl font-extrabold text-[#4F46E5]">
            {communications.filter((c) => c.email_type === 'Interview Invitation').length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Scheduled sessions</span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 block mb-1">
            Failed / Undelivered
          </span>
          <div className="text-2xl font-extrabold text-rose-700">
            {totalFailed}
          </div>
          <span className="text-[11px] text-rose-800 font-medium">Action required</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate, email, subject, sender..."
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All Communication Types</option>
            <option value="Shortlisted Notification">Shortlisted Notification</option>
            <option value="Interview Invitation">Interview Invitation</option>
            <option value="Rejection Notification">Rejection Notification</option>
            <option value="Application Under Review">Application Under Review</option>
            <option value="Custom Email">Custom Email</option>
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
          >
            <option value="all">All Applied Jobs</option>
            {jobsList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#64748B]">Loading communication records...</p>
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Recipient Email</th>
                  <th className="py-3.5 px-4">Sender (HR/Admin)</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Subject Line</th>
                  <th className="py-3.5 px-4">Applied Job</th>
                  <th className="py-3.5 px-4">HR Decision</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {filteredRecords.map((c) => {
                  const hrBadge = getHrDecisionBadge(c.hr_decision);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0F172A] whitespace-nowrap">
                        <Link
                          href={`/communication/${c.candidate_id}`}
                          className="hover:text-[#4F46E5] transition-colors"
                        >
                          {c.candidate_name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                        {c.recipient}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {c.sender_name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {c.email_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 max-w-xs truncate font-medium">
                        {c.subject}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                        {c.job_title || 'Software Engineer'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${hrBadge.color}`}>
                          {hrBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] whitespace-nowrap">
                        {formatDate(c.sent_at)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            c.status === 'Sent'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : c.status === 'Failed'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setActiveRecord(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E2E8F0] hover:border-[#4F46E5] hover:text-[#4F46E5] text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
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
        ) : (
          <div className="p-12 text-center space-y-3">
            <Mail className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-base font-bold text-[#0F172A]">No Communication Records Found</p>
            <p className="text-xs text-[#64748B]">Try clearing your search query or changing active filter criteria.</p>
          </div>
        )}
      </div>

      {/* Detail Modal View */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Communication Record Detail
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      activeRecord.status === 'Sent'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : activeRecord.status === 'Failed'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {activeRecord.status}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Dispatched on {formatDate(activeRecord.sent_at)} by <span className="font-semibold text-slate-800">{activeRecord.sender_name}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-5 text-xs">
              {/* Metadata Grid */}
              <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Candidate Name:</span>
                  <span className="font-bold text-[#0F172A]">{activeRecord.candidate_name}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Recipient Email:</span>
                  <span className="font-mono text-slate-800 font-medium">{activeRecord.recipient}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Applied Job Vacancy:</span>
                  <span className="font-semibold text-slate-800">{activeRecord.job_title || 'Software Engineer'}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Communication Type:</span>
                  <span className="font-semibold text-[#4F46E5]">{activeRecord.email_type}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Related HR Decision:</span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${getHrDecisionBadge(activeRecord.hr_decision).color}`}>
                    {getHrDecisionBadge(activeRecord.hr_decision).label}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase">Delivery Transport Mode:</span>
                  <span className="font-semibold text-slate-700">
                    {activeRecord.delivery_mode === 'smtp_live' ? 'Live SMTP Transport' : 'Academic Development Mock Mode'}
                  </span>
                </div>
              </div>

              {activeRecord.error_message && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-bold block text-xs">Delivery Exception Error:</span>
                  <p className="text-xs mt-0.5">{activeRecord.error_message}</p>
                </div>
              )}

              {/* Subject Line */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Subject Line
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] font-bold text-slate-800">
                  {activeRecord.subject}
                </div>
              </div>

              {/* Email Content Body */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1">
                  Full Email Message Content
                </span>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                  {activeRecord.body}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
              <Link
                href={`/communication/${activeRecord.candidate_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
              >
                <span>Go to Candidate Communication Console</span>
              </Link>

              <button
                onClick={() => setActiveRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
