# HireSense: Enterprise AI-Based Resume Screening System

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Claude AI](https://img.shields.io/badge/Anthropic-Claude%203.5-D97706?style=flat)](https://anthropic.com/)

An enterprise-grade, decision-support platform designed for modern recruitment teams. HireSense automates candidate screening, eliminates unconscious human bias, and overcomes keyword-based ATS limitations by pairing **NLP TF-IDF cosine similarity** with **Anthropic Claude AI semantic enrichment**.

---

## 🚀 Key Modules & Capabilities

### 1. Unified Authentication (Email-Only)
- **Sign In:** Secure work email and password authentication with session cookies.
- **Create Account (Sign Up):** Seamless registration with name, work email, password, and role selection (`HR Recruiter` or `Administrator`).
- **Forgot Password & Reset:** Automated 6-digit verification code generation and instant password update.
- **Role-Based Access Control:** Strict permission boundaries between Administrators and HR Recruiters.

### 2. Executive Analytics & Screening Intelligence
- 📊 **Screening Activity Volume:** Interactive SVG chart tracking screening volume over the last **7 Days** vs **30 Days**, with period-over-period percentage trend indicators (+24% growth).
- 🎯 **Candidate Screening Pipeline (Funnel):** 5-stage conversion tracker (*Uploaded &rarr; Processed &rarr; Qualified &rarr; Shortlisted &rarr; Recommended*) with stage conversion ratios.
- 📈 **Average Match Score:** Primary KPI alongside Highest Match Score providing a holistic picture of applicant pool caliber.
- 🧠 **AI Screening Insights:** Automatic aggregation of most common candidate skills, critical skill gaps, and heuristic job requirement advisories.
- ⚠️ **Screening Alerts:** Real-time actionable alerts for missing mandatory competencies, borderline candidates requiring human review, new applicant queues, and close score ties.
- 🧩 **Skill Match Overview:** Required skills vs candidate fulfillment ratios (e.g. `Python 4/5`, `SQL 4/5`, `AWS 1/5`).
- 🕐 **Recent Screening Activity:** Real-time log of recent screening runs, applicant volumes, and top match percentages.

### 3. Core AI Screening Engine
- Multi-file drag-and-drop zone handling up to 150 PDF and DOCX resumes per batch.
- **5-Step Animated Progress Stepper:**
  1. Resume document text extraction (`pdf-parse` & `mammoth`)
  2. Vocabulary vectorization & stopword filtering (`natural` library)
  3. Mathematical TF-IDF cosine similarity scoring
  4. Claude 3.5 semantic skill validation & gap analysis
  5. Explainable ranking generation
- Ranked leaderboards with gold, silver, and bronze badges, colored score progress bars, and verdict chips.

### 4. 👥 Candidate Comparison Tool
- Checkbox selection in screening and results tables to select **2 to 3 candidates**.
- Floating bottom drawer launcher and side-by-side comparative analysis modal:
  - Match score ring and rank
  - Automated **"Top Pick"** recommendation star
  - Shared vs unique skill matrix
  - Missing skill gap analysis
  - Side-by-side experience & education comparison
  - Comparative Claude AI executive summaries

### 5. Job Descriptions & Admin Governance
- Job descriptions CRUD with candidate applicant volume tracking.
- System audit log tracking administrative, screening, and authentication events with timestamps and IP addresses.
- User management table for administrator accounts.

---

## 🎨 Professional Enterprise Design System

- **Sidebar:** Obsidian Slate (`#0B0F19`) with `#1E293B` dividers and `#4F46E5` active left indicators.
- **Workspace Canvas:** Neutral Slate-50 (`#F8FAFC`).
- **Cards & Surfaces:** Clean White (`#FFFFFF`) with sharp `#E2E8F0` borders.
- **Primary Brand:** Executive Indigo (`#4F46E5`) with hover `#4338CA`.
- **Status Badges:** Emerald (`#059669`), Indigo (`#4F46E5`), Amber (`#D97706`), Rose (`#E11D48`).
- **Typography:** Google Fonts Plus Jakarta Sans.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Start production server
npm run start
```

Visit [http://localhost:3000](http://localhost:3000) and access:
- **Admin Access:** `admin@hiresense.ai` / `Admin@2026`
- **HR Recruiter:** `hr@hiresense.ai` / `HRUser@2026`
- Or click **Create Account** to register a new work email.
