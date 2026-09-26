const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const downloadsDir = path.join(rootDir, 'public', 'downloads');
const artifactDocPath = 'C:\\Users\\Acer\\.gemini\\antigravity-ide\\brain\\ce56dd03-8f83-40c2-b991-c1d8859ddc68\\HireSense_Complete_Source_Code.md';

fs.mkdirSync(downloadsDir, { recursive: true });

// List of all source code files in logical order
const filesToInclude = [
  // 1. Configuration & Build
  'package.json',
  'tsconfig.json',
  'tailwind.config.js',
  'postcss.config.js',
  'next.config.mjs',
  'vercel.json',
  '.env.example',
  '.gitignore',

  // 2. Database & Schema
  'supabase/schema.sql',
  'prisma/schema.prisma',

  // 3. Core Libraries & NLP/AI Engines
  'lib/utils.ts',
  'lib/auth.ts',
  'lib/auth-context.tsx',
  'lib/storage/mock-db.ts',
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/parser/index.ts',
  'lib/tfidf/index.ts',
  'lib/ai/claude.ts',
  'lib/email/service.ts',
  'lib/email/templates.ts',

  // 4. UI Components & Recruitment Modals
  'components/ui/toast.tsx',
  'components/shared/candidate-comparison-modal.tsx',
  'components/shared/candidate-profile-modal.tsx',
  'components/shared/make-decision-modal.tsx',
  'components/shared/send-email-modal.tsx',
  'components/shared/bulk-email-modal.tsx',

  // 5. App Pages & Styles
  'app/globals.css',
  'app/layout.tsx',
  'app/page.tsx',
  'app/(auth)/login/page.tsx',
  'app/(dashboard)/layout.tsx',
  'app/(dashboard)/dashboard/page.tsx',
  'app/(dashboard)/screen/page.tsx',
  'app/(dashboard)/results/page.tsx',
  'app/(dashboard)/results/[id]/page.tsx',
  'app/(dashboard)/jobs/page.tsx',
  'app/(dashboard)/admin/page.tsx',
  'app/(dashboard)/about/page.tsx',

  // 6. Backend API Route Handlers
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/signup/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/jobs/route.ts',
  'app/api/jobs/[id]/route.ts',
  'app/api/screen/route.ts',
  'app/api/results/route.ts',
  'app/api/candidates/[id]/route.ts',
  'app/api/candidates/[id]/decision/route.ts',
  'app/api/candidates/[id]/communication/route.ts',
  'app/api/communication/bulk/route.ts',
  'app/api/templates/route.ts',
  'app/api/stats/route.ts',
  'app/api/users/route.ts',
  'app/api/users/[id]/route.ts',
  'app/api/audit/route.ts',

  // 7. PWA & Static Assets
  'public/manifest.json',
  'public/offline.html',
  'public/sw.js',

  // 8. Utility & Test Scripts
  'scripts/generate-icons.js',
  'scripts/generate-sample-pdfs.js',
  'scripts/test-pipeline.js',
  'scripts/e2e-test.js',
  'scripts/export-source-document.js'
];

function getLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.js':
    case '.mjs':
      return 'javascript';
    case '.json':
      return 'json';
    case '.css':
      return 'css';
    case '.html':
      return 'html';
    case '.sql':
      return 'sql';
    case '.prisma':
      return 'prisma';
    default:
      return 'text';
  }
}

// Build Markdown Document
let mdContent = `# HireSense — Complete System Source Code Documentation
**Platform:** HireSense: AI-Based Resume Screening & Candidate Ranking System
**Architecture:** Next.js 14+ App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL, Prisma ORM, Natural NLP (TF-IDF Cosine Similarity), Anthropic Claude 3.5 LLM Enrichment, PWA.
**Generated At:** ${new Date().toISOString()}

---

## 📑 Table of Contents

`;

filesToInclude.forEach((relPath, index) => {
  const anchor = relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');
  mdContent += `${index + 1}. [${relPath}](#${anchor})\n`;
});

mdContent += `\n---\n\n`;

let totalLines = 0;
let fileDetails = [];

filesToInclude.forEach((relPath, index) => {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${relPath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n').length;
  totalLines += lines;
  const lang = getLanguage(relPath);
  const anchor = relPath.toLowerCase().replace(/[^a-z0-9]/g, '-');

  fileDetails.push({
    index: index + 1,
    path: relPath,
    lines,
    lang,
    content,
    anchor
  });

  mdContent += `### ${index + 1}. \`${relPath}\`\n\n`;
  mdContent += `- **File Path:** \`${relPath}\`\n`;
  mdContent += `- **Language:** ${lang}\n`;
  mdContent += `- **Lines of Code:** ${lines}\n\n`;
  mdContent += `\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
});

// Write Markdown to public/downloads/
const mdOutPath = path.join(downloadsDir, 'HireSense_Complete_Source_Code.md');
fs.writeFileSync(mdOutPath, mdContent, 'utf-8');
console.log(`Exported Markdown: ${mdOutPath} (${totalLines} lines across ${fileDetails.length} files)`);

// Also save directly into artifacts directory
try {
  fs.writeFileSync(artifactDocPath, mdContent, 'utf-8');
  console.log(`Saved to artifact path: ${artifactDocPath}`);
} catch (e) {
  console.warn('Could not write artifact doc directly:', e.message);
}

// Build Standalone Styled HTML Document (Printable / Save as PDF)
let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HireSense - Complete System Source Code</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      line-height: 1.6;
      padding: 32px 20px;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 4px 20px -2px rgba(11, 15, 25, 0.05);
    }
    .header {
      border-b: 2px solid #E2E8F0;
      padding-bottom: 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
      background: #EEF2FF;
      color: #4F46E5;
      border: 1px solid #C7D2FE;
      margin-bottom: 8px;
    }
    h1 { font-size: 26px; font-weight: 800; color: #0B0F19; margin-bottom: 6px; }
    .subtitle { font-size: 13px; color: #64748B; }
    .btn-print {
      background: #4F46E5;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .btn-print:hover { background: #4338CA; }
    .toc {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }
    .toc h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-bottom: 16px; color: #0F172A; }
    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 8px;
    }
    .toc-item { font-size: 12px; }
    .toc-item a { color: #4F46E5; text-decoration: none; font-weight: 500; }
    .toc-item a:hover { text-decoration: underline; }
    .file-card {
      margin-bottom: 40px;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      overflow: hidden;
      background: #FFFFFF;
    }
    .file-header {
      background: #0B0F19;
      color: #FFFFFF;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 600;
    }
    .file-meta {
      font-size: 11px;
      color: #94A3B8;
      font-weight: 400;
    }
    pre {
      padding: 20px;
      background: #060911;
      color: #E2E8F0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      overflow-x: auto;
      max-height: 800px;
    }
    @media print {
      body { background: #FFF; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; }
      .btn-print { display: none; }
      pre { max-height: none; overflow: visible; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="badge">Complete Source Code Document</span>
        <h1>HireSense Application Codebase</h1>
        <p class="subtitle">Complete full-stack implementation &bull; ${fileDetails.length} files &bull; ${totalLines.toLocaleString()} lines of code</p>
      </div>
      <div>
        <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>

    <div class="toc">
      <h2>Table of Contents</h2>
      <div class="toc-grid">
`;

fileDetails.forEach(f => {
  htmlContent += `        <div class="toc-item">${f.index}. <a href="#${f.anchor}">${f.path}</a> <span style="color:#94A3B8">(${f.lines} lines)</span></div>\n`;
});

htmlContent += `      </div>
    </div>

    <div class="files-wrapper">
`;

fileDetails.forEach(f => {
  // Escape HTML in content
  const escaped = f.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  htmlContent += `      <div class="file-card" id="${f.anchor}">
        <div class="file-header">
          <span>${f.index}. ${f.path}</span>
          <span class="file-meta">${f.lines} lines &bull; ${f.lang}</span>
        </div>
        <pre><code>${escaped}</code></pre>
      </div>\n`;
});

htmlContent += `    </div>
  </div>
</body>
</html>
`;

const htmlOutPath = path.join(downloadsDir, 'HireSense_Complete_Source_Code.html');
fs.writeFileSync(htmlOutPath, htmlContent, 'utf-8');
console.log(`Exported HTML: ${htmlOutPath}`);

console.log('Document export completed successfully.');
