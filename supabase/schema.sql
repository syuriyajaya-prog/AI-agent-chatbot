-- ==============================================================================
-- HireSense: An AI-Based Resume Screening System
-- Final Year Project (2026) - AIMST University
-- Student: Jayasyuriya S/O Jayakumaran (B23101149)
-- Supervisor: Ms. Noor Asmaliyana Ahmad
-- Database Schema for Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'HR User' CHECK (role IN ('Administrator', 'HR User')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- 2. JOBS TABLE
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. SCREENING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.screening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  run_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCREENING RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.screening_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.screening_sessions(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  candidate_phone TEXT,
  filename TEXT NOT NULL,
  score NUMERIC NOT NULL,
  matched_skills JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  experience TEXT,
  education TEXT,
  summary TEXT,
  recommendation TEXT CHECK (recommendation IN ('Highly Recommended', 'Recommended', 'Consider', 'Not Recommended')),
  rank INTEGER,
  hr_decision TEXT DEFAULT 'Pending' CHECK (hr_decision IN ('Shortlisted', 'Review Later', 'Rejected', 'Pending')),
  hr_notes TEXT,
  hr_decided_by TEXT,
  hr_decided_at TIMESTAMPTZ,
  communication_status TEXT DEFAULT 'Not Sent' CHECK (communication_status IN ('Not Sent', 'Sent', 'Failed')),
  last_communication_type TEXT,
  last_communication_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMUNICATION RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.communication_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.screening_results(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  recipient TEXT NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'Sent' CHECK (status IN ('Sent', 'Failed', 'Not Sent')),
  delivery_mode TEXT DEFAULT 'development_mock' CHECK (delivery_mode IN ('development_mock', 'smtp_live')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_screening_results_job ON public.screening_results(job_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_session ON public.screening_results(session_id);
CREATE INDEX IF NOT EXISTS idx_screening_results_score ON public.screening_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_screening_results_decision ON public.screening_results(hr_decision);
CREATE INDEX IF NOT EXISTS idx_communication_records_candidate ON public.communication_records(candidate_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for authenticated web access (and service role)
CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public write access to users" ON public.users FOR ALL USING (true);

CREATE POLICY "Allow public read access to jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Allow public write access to jobs" ON public.jobs FOR ALL USING (true);

CREATE POLICY "Allow public read access to sessions" ON public.screening_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public write access to sessions" ON public.screening_sessions FOR ALL USING (true);

CREATE POLICY "Allow public read access to results" ON public.screening_results FOR SELECT USING (true);
CREATE POLICY "Allow public write access to results" ON public.screening_results FOR ALL USING (true);

CREATE POLICY "Allow public read access to communications" ON public.communication_records FOR SELECT USING (true);
CREATE POLICY "Allow public write access to communications" ON public.communication_records FOR ALL USING (true);

CREATE POLICY "Allow public read access to audit" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public write access to audit" ON public.audit_logs FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Default Administrator & HR User
INSERT INTO public.users (id, name, email, role, is_active, created_at, last_login)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Jayasyuriya', 'admin@hiresense.ai', 'Administrator', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'HR Recruiter Noor', 'hr@hiresense.ai', 'HR User', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE
SET role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- Default Job Descriptions
INSERT INTO public.jobs (id, title, description, created_by, is_active, created_at)
VALUES
  (
    '33333333-3333-3333-3333-333333333331',
    'Software Engineer',
    'Seeking a skilled Software Engineer with 2 or more years of hands-on experience in Python, JavaScript, and RESTful API design. Must have proficiency with SQL databases, Git version control, and Agile development. Experience with AWS or Azure cloud platforms is valued. Bachelor degree in Computer Science or related field required.',
    '11111111-1111-1111-1111-111111111111',
    true,
    NOW() - INTERVAL '3 days'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'Data Analyst',
    'Looking for a Data Analyst proficient in Python, SQL, and Microsoft Excel. Must have practical experience with data visualisation tools such as Power BI or Tableau, statistical analysis, data cleaning, and business intelligence reporting. Exposure to machine learning concepts is an advantage.',
    '11111111-1111-1111-1111-111111111111',
    true,
    NOW() - INTERVAL '2 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'HR Manager',
    'Experienced HR Manager with 3 or more years in talent acquisition, employee relations, and performance management. Must be familiar with HRIS systems, Malaysian employment law, and digital recruitment platforms such as JobStreet and LinkedIn Recruiter. Excellent communication skills required.',
    '11111111-1111-1111-1111-111111111111',
    true,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO NOTHING;

-- Initial audit entry
INSERT INTO public.audit_logs (user_id, user_name, action, details, ip_address, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Admin Jayasyuriya', 'SYSTEM_INITIALIZED', 'HireSense v1.0 database seeded with default jobs and administrator accounts', '127.0.0.1', NOW());
