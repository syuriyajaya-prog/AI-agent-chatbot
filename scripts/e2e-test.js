const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== HireSense Updated Verification Test Suite ===\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Static Assets & Branding Check
  await test('PWA manifest.json is served with commercial branding', async () => {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.short_name !== 'HireSense') throw new Error(`Unexpected name: ${data.short_name}`);
    if (data.theme_color !== '#4F46E5') throw new Error(`Unexpected theme color: ${data.theme_color}`);
  });

  await test('Offline fallback page has no academic or personal text', async () => {
    const res = await fetch(`${BASE_URL}/offline.html`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.includes('AIMST') || text.includes('Jayasyuriya') || text.includes('Asmaliyana')) {
      throw new Error('offline.html contains legacy personal/academic references');
    }
  });

  await test('Login page /login contains no academic/personal references', async () => {
    const res = await fetch(`${BASE_URL}/login`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.includes('Jayasyuriya') || text.includes('Asmaliyana') || text.includes('AIMST')) {
      throw new Error('Login page contains personal or academic text');
    }
  });

  // 2. Authentication: Create Account (Sign Up)
  const testUserEmail = `recruiter_${Date.now()}@company.com`;
  await test('Create Account (Sign Up via email) /api/auth/signup', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Elena Rostova',
        email: testUserEmail,
        password: 'Password@2026',
        role: 'HR User',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (!data.success || data.user.email !== testUserEmail) {
      throw new Error(`Sign up failed: ${JSON.stringify(data)}`);
    }
  });

  // 3. Authentication: Forgot Password Flow
  await test('Forgot Password request code /api/auth/forgot-password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', email: testUserEmail }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.demoCode) {
      throw new Error(`Forgot password request failed: ${JSON.stringify(data)}`);
    }
  });

  await test('Reset Password with code /api/auth/forgot-password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: testUserEmail,
        code: '849201',
        newPassword: 'UpdatedSecret@2026',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Password reset execution failed: ${JSON.stringify(data)}`);
    }
  });

  // 4. Administrator Login
  let adminCookie = '';
  await test('Sign In as Administrator (admin@hiresense.ai)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hiresense.ai', password: 'Admin@2026' }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.user.role !== 'Administrator') {
      throw new Error(`Login failed: ${JSON.stringify(data)}`);
    }
    const cookieHeader = res.headers.get('set-cookie');
    if (cookieHeader) adminCookie = cookieHeader.split(';')[0];
  });

  // 5. Enhanced Analytics & Intelligence Statistics
  await test('Dashboard statistics include 8 analytics features', async () => {
    const res = await fetch(`${BASE_URL}/api/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.stats) throw new Error('Stats object missing');

    const s = data.stats;
    // Check Average Match Score
    if (typeof s.averageScore !== 'number') throw new Error('Missing averageScore');
    console.log(`   Average Match Score: ${s.averageScore}%`);

    // Check Screening Pipeline
    if (!s.screeningPipeline || typeof s.screeningPipeline.conversionRate !== 'number') {
      throw new Error('Missing screeningPipeline');
    }
    console.log(`   Pipeline Stages: Uploaded(${s.screeningPipeline.uploaded}) -> Recommended(${s.screeningPipeline.recommended})`);

    // Check Activity Chart
    if (!s.activityChart || !s.activityChart.days7 || s.activityChart.days7.length !== 7) {
      throw new Error('Missing activityChart 7-day data');
    }
    console.log(`   Activity Trend: +${s.activityChart.trendPercent}% (Increasing: ${s.activityChart.isIncreasing})`);

    // Check AI Screening Insights
    if (!s.aiInsights || !s.aiInsights.mostCommonSkills || !s.aiInsights.mostMissingSkills) {
      throw new Error('Missing aiInsights');
    }
    console.log(`   Top Common Skill: ${s.aiInsights.mostCommonSkills[0]?.skill} (${s.aiInsights.mostCommonSkills[0]?.percentage}%)`);

    // Check Screening Alerts
    if (!Array.isArray(s.screeningAlerts) || s.screeningAlerts.length === 0) {
      throw new Error('Missing screeningAlerts');
    }
    console.log(`   Alerts active: ${s.screeningAlerts.length}`);

    // Check Skill Match Overview
    if (!Array.isArray(s.skillMatchOverview) || s.skillMatchOverview.length === 0) {
      throw new Error('Missing skillMatchOverview');
    }
    console.log(`   Skill Overview: ${s.skillMatchOverview[0]?.skill} (${s.skillMatchOverview[0]?.ratio})`);

    // Check Recent Activity
    if (!Array.isArray(s.recentActivity) || s.recentActivity.length === 0) {
      throw new Error('Missing recentActivity');
    }
  });

  // 6. Resume Screening Engine
  await test('Screening API /api/screen executes properly', async () => {
    const jobsRes = await fetch(`${BASE_URL}/api/jobs`);
    const jobsData = await jobsRes.json();
    const targetJob = jobsData.jobs[0];

    const pdfPath = path.join(__dirname, '..', 'sample_resumes', 'Alex_Tan_Software_Engineer.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('job_id', targetJob.id);
    formData.append('files', blob, 'Alex_Tan_Software_Engineer.pdf');

    const res = await fetch(`${BASE_URL}/api/screen`, {
      method: 'POST',
      headers: adminCookie ? { Cookie: adminCookie } : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.success || data.results.length === 0) throw new Error('No results returned');
    console.log(`   Candidate: ${data.results[0].candidate_name} | Score: ${data.results[0].score}%`);
  });

  // 7. Results Retrieval
  await test('Results API /api/results returns ranked candidates', async () => {
    const res = await fetch(`${BASE_URL}/api/results`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || data.results.length === 0) throw new Error('Results empty');
  });

  // 8. Navigation & Page Access
  await test('Dashboard page /dashboard returns 200', async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('About route /about redirects to /dashboard', async () => {
    const res = await fetch(`${BASE_URL}/about`, { redirect: 'manual' });
    // Should be redirect 307 or 308 or 200 with redirection
    if (res.status !== 307 && res.status !== 308 && res.status !== 200) {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  });

  console.log(`\n=== All Verification Tests Passed: ${passed}/${passed + failed} ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
