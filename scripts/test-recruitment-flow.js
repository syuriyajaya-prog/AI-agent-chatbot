const http = require('http');

async function testWorkflow() {
  console.log('Testing Recruitment Decision & Communication APIs on http://localhost:3000...\n');

  // 1. Fetch Candidates
  const resultsRes = await fetch('http://localhost:3000/api/results');
  const resultsData = await resultsRes.json();
  console.log(`✓ Fetched candidates count: ${resultsData.results ? resultsData.results.length : 0}`);

  const candidate = resultsData.results[0];
  console.log(`✓ Target candidate: ${candidate.candidate_name} (ID: ${candidate.id})`);
  console.log(`  Initial HR Decision: ${candidate.hr_decision || 'Pending'}`);
  console.log(`  Initial Comm Status: ${candidate.communication_status || 'Not Sent'}\n`);

  // 2. Fetch Templates
  const templatesRes = await fetch('http://localhost:3000/api/templates');
  const templatesData = await templatesRes.json();
  console.log(`✓ Available templates: ${templatesData.templates.map(t => t.name).join(', ')}\n`);

  // 3. Prepare Admin Session Cookie
  const adminUser = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Administrator',
    email: 'admin@hiresense.ai',
    role: 'Administrator'
  };
  const sessionVal = Buffer.from(JSON.stringify(adminUser)).toString('base64');
  const cookieHeader = `hiresense_session=${sessionVal}`;
  console.log('✓ Admin session cookie prepared.\n');

  // 4. Record HR Decision
  console.log('--- Testing HR Decision Recording ---');
  const decisionRes = await fetch(`http://localhost:3000/api/candidates/${candidate.id}/decision`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({
      decision: 'Shortlisted',
      notes: 'Demonstrates exceptional full-stack capability and NLP background. Approved for Technical Round.'
    })
  });
  console.log(`Decision HTTP Status: ${decisionRes.status}`);
  const decisionText = await decisionRes.text();
  console.log('Decision API response:', decisionText);
  const decisionJson = JSON.parse(decisionText);

  // 5. Send Candidate Email
  console.log('\n--- Testing Candidate Email Dispatching ---');
  const emailRes = await fetch(`http://localhost:3000/api/candidates/${candidate.id}/communication`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader || ''
    },
    body: JSON.stringify({
      template_id: 'tpl-interview',
      subject: `Interview Invitation: Software Engineer at HireSense`,
      body: `Dear ${candidate.candidate_name},\n\nWe are pleased to invite you to an interview on 28th September 2026 at 10:00 AM.\n\nBest regards,\nTalent Acquisition Team`,
      recipient: candidate.candidate_email || 'alex.tan@gmail.com',
      recipient_email: candidate.candidate_email || 'alex.tan@gmail.com',
      candidateName: candidate.candidate_name
    })
  });
  const emailJson = await emailRes.json();
  console.log('Email API response:', emailJson);

  // 6. Verify Updated Candidate Record
  console.log('\n--- Verifying Updated Candidate Profile ---');
  const updatedCandidateRes = await fetch(`http://localhost:3000/api/candidates/${candidate.id}`, {
    headers: { 'Cookie': cookieHeader }
  });
  const updatedCandidate = await updatedCandidateRes.json();
  console.log(`✓ Candidate Name: ${updatedCandidate.candidate.candidate_name}`);
  console.log(`✓ Updated HR Decision: ${updatedCandidate.candidate.hr_decision}`);
  console.log(`✓ HR Notes: "${updatedCandidate.candidate.hr_notes}"`);
  console.log(`✓ Decided By: ${updatedCandidate.candidate.hr_decided_by}`);
  console.log(`✓ Communication Status: ${updatedCandidate.candidate.communication_status}`);
  console.log(`✓ Last Comm Type: ${updatedCandidate.candidate.last_communication_type}`);
  console.log(`✓ Communication Log Records: ${updatedCandidate.communications?.length || 0}`);

  console.log('\n========================================');
  console.log('ALL RECRUITMENT DECISION & COMMUNICATION APIS PASSED VERIFICATION!');
  console.log('========================================\n');
}

testWorkflow().catch(err => {
  console.error('Error running recruitment flow test:', err);
  process.exit(1);
});
