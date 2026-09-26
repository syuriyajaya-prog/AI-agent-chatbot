import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatScore(score: number | string): number {
  const num = typeof score === "string" ? parseFloat(score) : score;
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function getScoreColor(score: number): {
  text: string;
  bg: string;
  border: string;
  bar: string;
  badge: string;
} {
  const s = formatScore(score);
  if (s >= 75) {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      bar: "bg-emerald-600",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    };
  }
  if (s >= 55) {
    return {
      text: "text-indigo-700",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      bar: "bg-[#4F46E5]",
      badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    };
  }
  if (s >= 35) {
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      bar: "bg-amber-500",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    };
  }
  return {
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    bar: "bg-rose-500",
    badge: "bg-rose-50 text-rose-800 border-rose-200",
  };
}

export function getRecommendationBadge(recommendation: string): {
  color: string;
  label: string;
} {
  switch (recommendation) {
    case "Highly Recommended":
      return { color: "bg-emerald-50 text-emerald-800 border-emerald-300", label: "Highly Recommended" };
    case "Recommended":
      return { color: "bg-indigo-50 text-indigo-800 border-indigo-300", label: "Recommended" };
    case "Consider":
      return { color: "bg-amber-50 text-amber-800 border-amber-300", label: "Consider" };
    default:
      return { color: "bg-rose-50 text-rose-800 border-rose-300", label: "Not Recommended" };
  }
}

export function getHrDecisionBadge(decision: string | null | undefined): {
  color: string;
  badgeBg: string;
  textColor: string;
  label: string;
} {
  switch (decision) {
    case "Shortlisted":
      return {
        color: "bg-emerald-50 text-emerald-800 border-emerald-300",
        badgeBg: "bg-emerald-100",
        textColor: "text-emerald-800",
        label: "Shortlisted",
      };
    case "Review Later":
      return {
        color: "bg-amber-50 text-amber-800 border-amber-300",
        badgeBg: "bg-amber-100",
        textColor: "text-amber-800",
        label: "Review Later",
      };
    case "Rejected":
      return {
        color: "bg-rose-50 text-rose-800 border-rose-300",
        badgeBg: "bg-rose-100",
        textColor: "text-rose-800",
        label: "Rejected",
      };
    default:
      return {
        color: "bg-slate-100 text-slate-700 border-slate-300",
        badgeBg: "bg-slate-200",
        textColor: "text-slate-700",
        label: "Pending",
      };
  }
}

export function getCommunicationBadge(status: string | null | undefined): {
  color: string;
  label: string;
} {
  switch (status) {
    case "Sent":
      return { color: "bg-emerald-50 text-emerald-800 border-emerald-300", label: "Sent" };
    case "Failed":
      return { color: "bg-rose-50 text-rose-800 border-rose-300", label: "Failed" };
    default:
      return { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Not Sent" };
  }
}
