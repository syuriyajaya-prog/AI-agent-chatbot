# HireSense — Complete Production Deployment & Setup Guide

**Project Title:** HireSense: An AI-Based Resume Screening System
**Final Year Project (2026):** AIMST University, Kedah, Malaysia
**Degree:** Bachelor of Science (Hons) in Management Information Systems
**Student:** Jayasyuriya S/O Jayakumaran (Student ID: B23101149)
**Supervisor:** Ms. Noor Asmaliyana Ahmad

---

## 📋 Executive Overview

HireSense is an enterprise-grade AI decision-support platform that automates candidate resume screening. It eliminates unconscious human bias, drastically cuts hiring overhead (saving 50+ recruiter hours per vacancy), and overcomes keyword-based ATS limitations by combining:
1. **Mathematical Natural Language Processing (NLP):** Stopword removal, tokenization, and **TF-IDF cosine similarity** via the `natural` library.
2. **Anthropic Claude 3.5 Semantic Enrichment:** Deep contextual understanding of semantic equivalence (e.g. recognizing that *"RESTful APIs in Node.js"* matches *"backend microservices in JavaScript"*).
3. **Enterprise SaaS UI/UX:** Built with Next.js 14 App Router, Plus Jakarta Sans typography, dark slate sidebar (`#0F172A`), light grey workspace (`#F3F4F6`), and candidate ranking leaderboards.
4. **PWA Support:** Installable on desktop and mobile browsers with offline service worker.

---

## 🛠️ Prerequisites

Before you begin, ensure you have installed:
- **Node.js:** v18.17+ or v20+ (tested with v22.14.0)
- **npm:** v9+ or v10+
- **Git**

---

## 🚀 Step 1: Set Up Supabase (PostgreSQL Database & Auth)

1. Create a free account at [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project** and configure:
   - **Name:** `hiresense-db`
   - **Database Password:** Enter a strong password and save it securely.
   - **Region:** Choose `Singapore (ap-southeast-1)` (closest to Malaysia) or your preferred region.
3. Once the database is provisioned (approx 1-2 minutes):
   - Navigate to the **SQL Editor** tab from the left sidebar.
   - Click **New Query**.
   - Copy the entire SQL script from [`supabase/schema.sql`](supabase/schema.sql) in this repository and paste it into the editor.
   - Click **Run** (or press Ctrl+Enter).
   - *This creates all tables (`users`, `jobs`, `screening_sessions`, `screening_results`, `audit_logs`), enables Row Level Security (RLS), adds performance indexes, and seeds the default administrator account, HR account, and 3 starter job descriptions.*
4. Configure Authentication:
   - Navigate to **Authentication** &rarr; **Providers** &rarr; ensure **Email** is enabled.
   - Under **Authentication** &rarr; **URL Configuration**, set the Site URL to `http://localhost:3000` (or your live Vercel URL once deployed).
   - Under **Authentication** &rarr; **Settings**, disable **Confirm email** for instant evaluation without email delivery delays.
5. Obtain API Keys:
   - Navigate to **Project Settings** &rarr; **API**.
   - Copy:
     - **Project URL** (e.g., `https://your-project-id.supabase.co`)
     - **anon / public key**
     - **service_role key** (secret key used by backend serverless functions)

---

## 🤖 Step 2: Set Up Anthropic API Key (Claude AI)

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/) and register or sign in.
2. Navigate to **API Keys** &rarr; click **Create Key**.
3. Name the key (e.g., `hiresense-prod`).
4. Copy the generated key (starts with `sk-ant-...`).
5. Ensure your Anthropic account has initial credits.
   > **Note:** If an API key is not yet set or reaches credit exhaustion, HireSense automatically activates its built-in local heuristic engine so testing and evaluation never fail.

---

## 💻 Step 3: Run and Test Locally

1. Clone or navigate to the repository directory:
   ```bash
   cd hiresense
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` in your editor and supply your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ANTHROPIC_API_KEY=sk-ant-api03-...
   NEXTAUTH_SECRET=hiresense-aimst-fyp-2026-secure-secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your web browser.

5. Test default evaluation credentials:
   - **Administrator:** `admin@hiresense.ai` / `Admin@2026`
   - **HR Recruiter:** `hr@hiresense.ai` / `HRUser@2026`

6. Validate production build locally:
   ```bash
   npm run build
   npm run start
   ```
   Confirm that the production build completes with **0 errors**.

---

## 📦 Step 4: Push to GitHub

```bash
git init
git add .
git commit -m "feat: HireSense v1.0 — AI Resume Screening System"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/hiresense.git
git push -u origin main
```

---

## ☁️ Step 5: Deploy to Vercel

1. Log in to [https://vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** &rarr; **Project**.
3. Select your `hiresense` repository from GitHub and click **Import**.
4. Configure Project Settings:
   - **Framework Preset:** Next.js (automatically detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Expand **Environment Variables** and enter the following keys:
   | Variable Name | Description | Example Value |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | `eyJh...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | `eyJh...` |
   | `ANTHROPIC_API_KEY` | Anthropic Claude API Key | `sk-ant-...` |
   | `NEXTAUTH_SECRET` | 32-byte Base64 Secret | Run `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | Your live Vercel URL | `https://hiresense.vercel.app` |
6. Click **Deploy**.
7. Vercel will build the Next.js App Router project and publish it to a global edge CDN.

---

## ✅ Step 6: Post-Deployment Verification

1. **Access Live Application:** Open your live URL (e.g., `https://hiresense.vercel.app`).
2. **Sign In:** Use `admin@hiresense.ai` and `Admin@2026`.
3. **Verify Dashboard Metrics:** Check that active jobs, screened resumes count, and session metrics appear.
4. **Create a Job:** Navigate to **Job Descriptions** &rarr; click **New Job Description** &rarr; submit a test role.
5. **Screen Resumes:** Navigate to **Screen Resumes** &rarr; select the job &rarr; drag and drop the sample PDF resumes located in `sample_resumes/` &rarr; click **Run AI Resume Screening**.
6. **Inspect Results:**
   - Watch the animated 5-step pipeline progress.
   - Review the ranked table with gold, silver, and bronze badges.
   - Click **View Detail** on the top candidate to verify the score ring, Claude AI summary, green matched skills chips, and grey missing skills chips.
7. **Export CSV:** Go to **Results & Rankings** &rarr; click **Export CSV** &rarr; verify the `.csv` file downloads with complete candidate metadata.
8. **Verify Admin Role Access:** Navigate to **Admin Panel** &rarr; review users and system audit logs. Log in with `hr@hiresense.ai` and confirm the Admin Panel is appropriately guarded.
9. **Verify PWA Installation:** Open the web app in Google Chrome or Microsoft Edge &rarr; observe the install prompt icon in the address bar &rarr; install the app to desktop or mobile home screen.

---

## 🎓 Academic Accreditation

**HireSense** was developed as an undergraduate Final Year Project (FYP) for the Bachelor of Science (Hons) in Management Information Systems at **AIMST University**, Semeling, Kedah, Malaysia (2026).

- **Student Author:** Jayasyuriya S/O Jayakumaran (B23101149)
- **Academic Supervisor:** Ms. Noor Asmaliyana Ahmad
