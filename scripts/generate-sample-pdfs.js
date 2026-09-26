const fs = require('fs');
const path = require('path');

function createSimplePdf(filename, title, textLines) {
  // Build a basic single-page PDF with text stream
  const contentStream = [
    'BT',
    '/F1 14 Tf',
    '50 750 Td',
    `(${title}) Tj`,
    '/F1 10 Tf',
    '0 -24 Td',
  ];

  textLines.forEach(line => {
    // Escape parens
    const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    contentStream.push(`(${escaped}) Tj`);
    contentStream.push('0 -16 Td');
  });

  contentStream.push('ET');
  const streamData = contentStream.join('\n');
  const streamLength = Buffer.byteLength(streamData);

  const objects = [
    // 1: Catalog
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    // 2: Pages
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    // 3: Page
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj',
    // 4: Contents
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamData}\nendstream\nendobj`,
    // 5: Font
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];

  objects.forEach(obj => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += obj + '\n';
  });

  const xrefOffset = Buffer.byteLength(pdf);
  pdf += 'xref\n0 6\n0000000000 65535 f \n';
  offsets.forEach(off => {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  });

  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, Buffer.from(pdf));
  console.log(`Generated sample resume PDF: ${filename}`);
}

const outDir = path.join(__dirname, '..', 'sample_resumes');

createSimplePdf(
  path.join(outDir, 'Alex_Tan_Software_Engineer.pdf'),
  'ALEX TAN WEI MING - SOFTWARE ENGINEER',
  [
    'Email: alex.tan@email.com | Phone: +6012-3456789 | Location: Penang, Malaysia',
    'SUMMARY: Innovative Software Engineer with 3+ years experience building RESTful APIs in Python and JavaScript.',
    'Proficient with PostgreSQL databases, Git version control, Docker containers, and Agile Scrum methodologies.',
    'EXPERIENCE:',
    '- Backend Software Engineer at TechGlobal (2023 - Present)',
    '  Architected microservices using Python FastAPI and Node.js RESTful API endpoints.',
    '  Managed AWS cloud deployments (EC2, S3, RDS) and streamlined CI/CD Git workflows.',
    '  Collaborated within Agile 2-week sprint cycles with cross-functional product teams.',
    'EDUCATION: Bachelor of Science (Hons) in Computer Science - Universiti Malaya (2022)',
    'SKILLS: Python, JavaScript, RESTful API, SQL, PostgreSQL, Git, AWS, Docker, Agile Scrum'
  ]
);

createSimplePdf(
  path.join(outDir, 'Priya_Shanmugam_Developer.pdf'),
  'PRIYA A/P SHANMUGAM - FULL STACK DEVELOPER',
  [
    'Email: priya.shanmugam@email.com | Phone: +6017-9876543 | Location: Kuala Lumpur, Malaysia',
    'SUMMARY: Full Stack Web Developer with 2.5 years experience in JavaScript, React, and RESTful APIs.',
    'Solid database design skills in SQL databases and version control with Git.',
    'EXPERIENCE:',
    '- Web Application Developer at Nova Solutions (2023 - Present)',
    '  Designed responsive web frontend and integrated RESTful APIs.',
    '  Optimized SQL queries and maintained Git repositories.',
    '  Practiced Agile software development with sprint retrospectives.',
    'EDUCATION: BSc (Hons) in Software Engineering - Universiti Sains Malaysia (2023)',
    'SKILLS: JavaScript, React, SQL, Git, RESTful API, Agile, HTML5, CSS3'
  ]
);

createSimplePdf(
  path.join(outDir, 'Daniel_Lim_Data_Analyst.pdf'),
  'DANIEL LIM KOK LEONG - DATA ANALYST',
  [
    'Email: daniel.lim@email.com | Phone: +6019-1122334 | Location: Kedah, Malaysia',
    'SUMMARY: Analytical Data Analyst with 2 years practical experience in Python, SQL, and Excel.',
    'Experienced in business intelligence reporting, data cleaning, and dashboard design using Tableau and Power BI.',
    'EXPERIENCE:',
    '- Junior Data Analyst at Apex Analytics (2024 - Present)',
    '  Conducted statistical analysis and automated data cleaning pipelines with Python.',
    '  Built executive dashboards in Tableau and Power BI for decision support.',
    '  Extracted large datasets using complex SQL queries and Excel pivot models.',
    'EDUCATION: Bachelor of Science in Information Systems - AIMST University (2024)',
    'SKILLS: Python, SQL, Microsoft Excel, Tableau, Power BI, Statistical Analysis, Data Cleaning'
  ]
);
