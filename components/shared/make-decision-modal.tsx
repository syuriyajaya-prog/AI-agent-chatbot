'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  HelpCircle,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getHrDecisionBadge } from '@/lib/utils';

export type HrDecisionType = 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';

interface MakeDecisionModalProps {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  currentDecision?: HrDecisionType;
  currentNotes?: string;
  aiScore: number;
  aiRecommendation: string;
  onClose: () => void;
  onDecisionUpdated: (candidateId: string, newDecision: HrDecisionType, notes: string) => void;
}

export default function MakeDecisionModal({
  candidateId,
  candidateName,
  jobTitle,
  currentDecision = 'Pending',
  currentNotes = '',
  aiScore,
  aiRecommendation,
  onClose,
  onDecisionUpdated,
}: MakeDecisionModalProps) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [decision, setDecision] = useState<HrDecisionType>(currentDecision);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/candidates/${candidateId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record decision');
      }

      toastSuccess(
        'Recruitment Decision Recorded',
        `Candidate ${candidateName} has been marked as "${decision}".`
      );
      onDecisionUpdated(candidateId, decision, notes);
      onClose();
    } catch (err) {
      toastError(
        'Decision Update Failed',
        err instanceof Error ? err.message : 'An error occurred while saving decision.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
              <h3 className="text-base font-bold text-[#0F172A]">
                Record Recruitment Decision
              </h3>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Candidate: <span className="font-semibold text-slate-800">{candidateName}</span> &bull; {jobTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Context Callout */}
        <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              AI Recommendation (Decision Support)
            </span>
            <span className="font-bold text-slate-800">{aiRecommendation}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Match Score
            </span>
            <span className="font-bold text-[#4F46E5]">{Math.round(aiScore)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Decision Selection Options */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
              Final HR Decision
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Shortlisted */}
              <button
                type="button"
                onClick={() => setDecision('Shortlisted')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'Shortlisted'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 mb-1 ${decision === 'Shortlisted' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Shortlisted</span>
              </button>

              {/* Review Later */}
              <button
                type="button"
                onClick={() => setDecision('Review Later')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'Review Later'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                <Clock className={`w-5 h-5 mb-1 ${decision === 'Review Later' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Review Later</span>
              </button>

              {/* Rejected */}
              <button
                type="button"
                onClick={() => setDecision('Rejected')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  decision === 'Rejected'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-[#E2E8F0] bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50/40'
                }`}
              >
                <XCircle className={`w-5 h-5 mb-1 ${decision === 'Rejected' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Rejected</span>
              </button>
            </div>
          </div>

          {/* HR Notes / Comments */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
              HR Notes & Decision Comments
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add review feedback, justification, interview scheduling remarks, or technical assessment notes..."
              className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white resize-none"
            />
            <p className="text-[11px] text-[#64748B] mt-1">
              Notes are logged into recruitment history and visible to authorized HR/Admin team members.
            </p>
          </div>

          {/* Academic / Audit Notice */}
          <div className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
            <span>
              <strong>Human-in-the-Loop Governance:</strong> The final recruitment decision is retained exclusively by HR. AI recommendations will never overwrite human decisions.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 mt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Decision</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
