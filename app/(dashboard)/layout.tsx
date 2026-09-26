'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileSearch,
  Award,
  Briefcase,
  Shield,
  LogOut,
  Menu,
  X,
  PlusCircle,
  UploadCloud,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-[#0F172A]">Loading HireSense...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Navigation Items (About Project removed as requested)
  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Screen Resumes',
      href: '/screen',
      icon: FileSearch,
    },
    {
      name: 'Results & Rankings',
      href: '/results',
      icon: Award,
    },
    {
      name: 'Job Descriptions',
      href: '/jobs',
      icon: Briefcase,
    },
    ...(user.role === 'Administrator'
      ? [
          {
            name: 'Admin Panel',
            href: '/admin',
            icon: Shield,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  // Dynamic Page Header Info
  const getPageTitle = () => {
    if (pathname.startsWith('/screen')) return { title: 'Screen Resumes', badge: 'AI Screening Engine' };
    if (pathname.startsWith('/results')) return { title: 'Screening Results', badge: 'Candidate Rankings' };
    if (pathname.startsWith('/jobs')) return { title: 'Job Descriptions', badge: 'Talent Profiles' };
    if (pathname.startsWith('/admin')) return { title: 'Admin Panel', badge: 'System Governance' };
    return { title: 'Recruitment Analytics Dashboard', badge: 'Decision Support' };
  };

  const headerInfo = getPageTitle();

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Fixed Obsidian Slate Sidebar (#0B0F19) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0F19] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-[#1E293B]`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#1E293B]">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-[#4F46E5] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-[#4338CA] transition-colors">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-none">
                  HireSense
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase mt-0.5">
                  AI Screening Platform
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links with Active Indigo Left Border Indicator */}
          <div className="py-6 px-3">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Recruitment Workspace
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-[#1E293B] text-white font-bold border-l-4 border-[#4F46E5] shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-[#1E293B]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-[#4F46E5]' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Chip at Bottom */}
        <div className="p-4 border-t border-[#1E293B]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#1E293B]/70 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                  user.role === 'Administrator'
                    ? 'bg-amber-900/50 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-900/50 text-emerald-300 border border-emerald-800/60'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              id="sidebar-logout-button"
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Topbar: Clean white header with title, category badge, and action buttons */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
                {headerInfo.title}
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {headerInfo.badge}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons in Topbar */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/screen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Screen Resumes</span>
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[#E2E8F0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Create Job</span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
