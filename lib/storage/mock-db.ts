// In-Memory & Local Storage Resilient Data Store for HireSense Enterprise

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Administrator' | 'HR User';
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface JobRecord {
  id: string;
  title: string;
  description: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface ScreeningSessionRecord {
  id: string;
  job_id: string;
  run_by: string;
  created_at: string;
}

export interface ScreeningResultRecord {
  id: string;
  session_id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  filename: string;
  score: number;
  matched_skills: string[];
  missing_skills: string[];
  certifications?: string[];
  experience: string;
  education: string;
  summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  rank: number;
  hr_decision: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending';
  hr_notes?: string;
  hr_decided_by?: string;
  hr_decided_at?: string;
  communication_status: 'Not Sent' | 'Sent' | 'Failed';
  last_communication_type?: string;
  last_communication_at?: string;
  created_at: string;
}

export interface CommunicationRecord {
  id: string;
  candidate_id: string;
  candidate_name: string;
  recipient: string;
  sender_id: string;
  sender_name: string;
  email_type: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Failed' | 'Not Sent';
  delivery_mode: 'development_mock' | 'smtp_live';
  sent_at: string;
}

export interface AuditLogRecord {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}


class MockDatabase {
  private users: UserRecord[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Administrator',
      email: 'admin@hiresense.ai',
      password: 'Admin@2026',
      role: 'Administrator',
      is_active: true,
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      last_login: new Date().toISOString(),
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Talent Acquisition Recruiter',
      email: 'hr@hiresense.ai',
      password: 'HRUser@2026',
      role: 'HR User',
      is_active: true,
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      last_login: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
  ];

  private jobs: JobRecord[] = [
    {
      id: '33333333-3333-3333-3333-333333333331',
      title: 'Software Engineer',
      description: 'Seeking a skilled Software Engineer with 2 or more years of hands-on experience in Python, JavaScript, and RESTful API design. Must have proficiency with SQL databases, Git version control, and Agile development. Experience with AWS or Azure cloud platforms is valued. Bachelor degree in Computer Science or related field required.',
      created_by: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
    },
    {
      id: '33333333-3333-3333-3333-333333333332',
      title: 'Data Analyst',
      description: 'Looking for a Data Analyst proficient in Python, SQL, and Microsoft Excel. Must have practical experience with data visualisation tools such as Power BI or Tableau, statistical analysis, data cleaning, and business intelligence reporting. Exposure to machine learning concepts is an advantage.',
      created_by: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'HR Manager',
      description: 'Experienced HR Manager with 3 or more years in talent acquisition, employee relations, and performance management. Must be familiar with HRIS systems, employment compliance, and digital recruitment platforms such as LinkedIn Recruiter. Excellent communication skills required.',
      created_by: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
    },
  ];

  private sessions: ScreeningSessionRecord[] = [
    {
      id: '44444444-4444-4444-4444-444444444441',
      job_id: '33333333-3333-3333-3333-333333333331',
      run_by: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: '44444444-4444-4444-4444-444444444442',
      job_id: '33333333-3333-3333-3333-333333333332',
      run_by: '22222222-2222-2222-2222-222222222222',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  private results: ScreeningResultRecord[] = [
    {
      id: '55555555-5555-5555-5555-555555555551',
      session_id: '44444444-4444-4444-4444-444444444441',
      job_id: '33333333-3333-3333-3333-333333333331',
      candidate_name: 'Alex Tan',
      candidate_email: 'alex.tan@gmail.com',
      candidate_phone: '+60 12-345 6789',
      filename: 'Alex_Tan_Software_Resume.pdf',
      score: 89,
      matched_skills: ['Python', 'JavaScript', 'RESTful API', 'SQL', 'Git', 'AWS'],
      missing_skills: ['Azure'],
      certifications: ['AWS Certified Solutions Architect', 'CKA Kubernetes Administrator'],
      experience: '3.5 years full-stack web and backend engineering',
      education: 'BSc (Hons) Computer Science, National University',
      summary: 'Exceptional match with extensive hands-on Python/JS stack and RESTful microservices background.',
      recommendation: 'Highly Recommended',
      rank: 1,
      hr_decision: 'Shortlisted',
      hr_notes: 'Outstanding backend and cloud skillset. Fast-track to technical panel interview.',
      hr_decided_by: 'Administrator',
      hr_decided_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      communication_status: 'Sent',
      last_communication_type: 'Shortlisted Notification',
      last_communication_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555552',
      session_id: '44444444-4444-4444-4444-444444444441',
      job_id: '33333333-3333-3333-3333-333333333331',
      candidate_name: 'Priya Shanmugam',
      candidate_email: 'priya.shanmugam@outlook.com',
      candidate_phone: '+60 16-789 1234',
      filename: 'Priya_Shanmugam_CV.pdf',
      score: 88,
      matched_skills: ['Python', 'JavaScript', 'SQL', 'Git', 'Agile', 'RESTful API'],
      missing_skills: ['AWS', 'Azure'],
      certifications: ['Oracle Certified Java Professional', 'Professional Scrum Master (PSM I)'],
      experience: '2.5 years backend development and API integrations',
      education: 'BSc Software Engineering, University of Technology',
      summary: 'Strong backend skills and solid Agile engineering practices with quick learning capability.',
      recommendation: 'Highly Recommended',
      rank: 2,
      hr_decision: 'Shortlisted',
      hr_notes: 'Solid Agile engineering experience, strong candidate for mid-level backend engineer.',
      hr_decided_by: 'Talent Acquisition Recruiter',
      hr_decided_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
      communication_status: 'Sent',
      last_communication_type: 'Interview Invitation',
      last_communication_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555553',
      session_id: '44444444-4444-4444-4444-444444444442',
      job_id: '33333333-3333-3333-3333-333333333332',
      candidate_name: 'Daniel Lim',
      candidate_email: 'daniel.lim@yahoo.com',
      candidate_phone: '+60 17-234 5678',
      filename: 'Daniel_Lim_Data_Analyst.docx',
      score: 72,
      matched_skills: ['Python', 'SQL', 'Microsoft Excel', 'Tableau'],
      missing_skills: ['Power BI', 'Machine Learning'],
      certifications: ['Tableau Desktop Specialist', 'Microsoft Certified: Data Analyst Associate'],
      experience: '2 years business intelligence reporting and ETL cleaning',
      education: 'BSc Information Systems, Technical University',
      summary: 'Strong analytical skills with solid SQL and Tableau reporting experience.',
      recommendation: 'Recommended',
      rank: 1,
      hr_decision: 'Review Later',
      hr_notes: 'Good SQL foundations, pending review by lead data scientist before scheduling interview.',
      hr_decided_by: 'Talent Acquisition Recruiter',
      hr_decided_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      communication_status: 'Not Sent',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555554',
      session_id: '44444444-4444-4444-4444-444444444441',
      job_id: '33333333-3333-3333-3333-333333333331',
      candidate_name: 'Marcus Vance',
      candidate_email: 'marcus.vance@techmail.io',
      candidate_phone: '+60 11-876 5432',
      filename: 'Marcus_Vance_Resume.pdf',
      score: 52,
      matched_skills: ['JavaScript', 'Git', 'Agile'],
      missing_skills: ['Python', 'RESTful API', 'SQL', 'AWS'],
      certifications: ['Meta Front-End Developer Certificate'],
      experience: '1 year junior frontend web design',
      education: 'Diploma in Information Technology, State College',
      summary: 'Passionate junior developer, but lacks deep Python and database system experience required.',
      recommendation: 'Consider',
      rank: 3,
      hr_decision: 'Review Later',
      hr_notes: 'Junior level applicant. May be suitable for upcoming junior frontend internship.',
      hr_decided_by: 'Administrator',
      hr_decided_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      communication_status: 'Not Sent',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      session_id: '44444444-4444-4444-4444-444444444442',
      job_id: '33333333-3333-3333-3333-333333333332',
      candidate_name: 'Sarah Jenkins',
      candidate_email: 'sarah.jenkins@gmail.com',
      candidate_phone: '+60 19-345 8901',
      filename: 'Sarah_Jenkins_Analyst.pdf',
      score: 31,
      matched_skills: ['Microsoft Excel'],
      missing_skills: ['Python', 'SQL', 'Power BI', 'Tableau'],
      certifications: ['Microsoft Office Specialist: Excel Expert'],
      experience: '6 months administrative data entry',
      education: 'Bachelor of Business Administration',
      summary: 'Lacks technical programming, SQL querying, and BI analytics tools experience.',
      recommendation: 'Not Recommended',
      rank: 2,
      hr_decision: 'Rejected',
      hr_notes: 'Profile lacks necessary SQL querying and business intelligence analytics stack for role.',
      hr_decided_by: 'Talent Acquisition Recruiter',
      hr_decided_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      communication_status: 'Sent',
      last_communication_type: 'Rejection Notification',
      last_communication_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  private communications: CommunicationRecord[] = [
    {
      id: '77777777-7777-7777-7777-777777777771',
      candidate_id: '55555555-5555-5555-5555-555555555551',
      candidate_name: 'Alex Tan',
      recipient: 'alex.tan@gmail.com',
      sender_id: '11111111-1111-1111-1111-111111111111',
      sender_name: 'Administrator',
      email_type: 'Shortlisted Notification',
      subject: 'Application Shortlisted: Software Engineer - HireSense Enterprise',
      body: 'Dear Alex Tan,\n\nWe are pleased to inform you that your application for the Software Engineer position has been shortlisted for the next stage of our recruitment process.\n\nRegards,\nAdministrator',
      status: 'Sent',
      delivery_mode: 'development_mock',
      sent_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    },
    {
      id: '77777777-7777-7777-7777-777777777772',
      candidate_id: '55555555-5555-5555-5555-555555555552',
      candidate_name: 'Priya Shanmugam',
      recipient: 'priya.shanmugam@outlook.com',
      sender_id: '22222222-2222-2222-2222-222222222222',
      sender_name: 'Talent Acquisition Recruiter',
      email_type: 'Interview Invitation',
      subject: 'Interview Invitation: Software Engineer at HireSense Enterprise',
      body: 'Dear Priya Shanmugam,\n\nFollowing review of your qualifications, we would like to invite you for an interview on Tuesday at 10:00 AM.\n\nRegards,\nTalent Acquisition Recruiter',
      status: 'Sent',
      delivery_mode: 'development_mock',
      sent_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    },
    {
      id: '77777777-7777-7777-7777-777777777773',
      candidate_id: '55555555-5555-5555-5555-555555555555',
      candidate_name: 'Sarah Jenkins',
      recipient: 'sarah.jenkins@gmail.com',
      sender_id: '22222222-2222-2222-2222-222222222222',
      sender_name: 'Talent Acquisition Recruiter',
      email_type: 'Rejection Notification',
      subject: 'Update on your application for Data Analyst - HireSense Enterprise',
      body: 'Dear Sarah Jenkins,\n\nThank you for applying for the Data Analyst role. We have decided to proceed with other candidates at this time.\n\nSincerely,\nTalent Acquisition Recruiter',
      status: 'Sent',
      delivery_mode: 'development_mock',
      sent_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
  ];


  private auditLogs: AuditLogRecord[] = [
    {
      id: '66666666-6666-6666-6666-666666666661',
      user_id: '11111111-1111-1111-1111-111111111111',
      user_name: 'Administrator',
      action: 'SYSTEM_BOOT',
      details: 'HireSense v1.0 AI screening engine booted with seed accounts and jobs',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666666662',
      user_id: '11111111-1111-1111-1111-111111111111',
      user_name: 'Administrator',
      action: 'SCREENING_RUN',
      details: 'Screened 3 resumes for Software Engineer vacancy',
      ip_address: '192.168.1.100',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: '66666666-6666-6666-6666-666666666663',
      user_id: '22222222-2222-2222-2222-222222222222',
      user_name: 'HR Recruiter',
      action: 'SCREENING_RUN',
      details: 'Screened 2 resumes for Data Analyst vacancy',
      ip_address: '192.168.1.105',
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  // Users
  getUsers(): UserRecord[] {
    return [...this.users];
  }

  getUserByEmail(email: string): UserRecord | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): UserRecord | undefined {
    return this.users.find(u => u.id === id);
  }

  addUser(user: Omit<UserRecord, 'id' | 'created_at'>): UserRecord {
    const newUser: UserRecord = {
      ...user,
      id: crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  resetPassword(email: string, newPass: string): boolean {
    const u = this.getUserByEmail(email);
    if (!u) return false;
    u.password = newPass;
    return true;
  }

  deleteUser(id: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < initialLen;
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord | undefined {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  // Jobs
  getJobs(onlyActive = true): (JobRecord & { candidate_count: number })[] {
    const filtered = onlyActive ? this.jobs.filter(j => j.is_active) : this.jobs;
    return filtered.map(j => {
      const count = this.results.filter(r => r.job_id === j.id).length;
      return { ...j, candidate_count: count };
    });
  }

  getJobById(id: string): (JobRecord & { candidate_count: number }) | undefined {
    const j = this.jobs.find(x => x.id === id);
    if (!j) return undefined;
    const count = this.results.filter(r => r.job_id === j.id).length;
    return { ...j, candidate_count: count };
  }

  addJob(job: Omit<JobRecord, 'id' | 'created_at'>): JobRecord {
    const newJob: JobRecord = {
      ...job,
      id: crypto.randomUUID ? crypto.randomUUID() : `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    this.jobs.unshift(newJob);
    return newJob;
  }

  updateJob(id: string, updates: Partial<JobRecord>): JobRecord | undefined {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx === -1) return undefined;
    this.jobs[idx] = { ...this.jobs[idx], ...updates };
    return this.jobs[idx];
  }

  deleteJob(id: string): boolean {
    const idx = this.jobs.findIndex(j => j.id === id);
    if (idx === -1) return false;
    this.jobs[idx].is_active = false;
    return true;
  }

  // Screening Sessions & Results
  createSession(jobId: string, runBy: string): ScreeningSessionRecord {
    const session: ScreeningSessionRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}`,
      job_id: jobId,
      run_by: runBy,
      created_at: new Date().toISOString(),
    };
    this.sessions.unshift(session);
    return session;
  }

  addResults(newResults: Omit<ScreeningResultRecord, 'id' | 'created_at'>[]): ScreeningResultRecord[] {
    const created: ScreeningResultRecord[] = newResults.map(r => ({
      ...r,
      candidate_email: r.candidate_email || `${r.candidate_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@email.com`,
      hr_decision: r.hr_decision || 'Pending',
      communication_status: r.communication_status || 'Not Sent',
      id: crypto.randomUUID ? crypto.randomUUID() : `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    }));
    this.results.unshift(...created);
    return created;
  }

  getResults(jobId?: string): (ScreeningResultRecord & { job_title: string })[] {
    let list = this.results;
    if (jobId && jobId !== 'all') {
      list = list.filter(r => r.job_id === jobId);
    }
    return list.map(r => {
      const job = this.jobs.find(j => j.id === r.job_id);
      return {
        ...r,
        job_title: job ? job.title : 'General Position',
      };
    }).sort((a, b) => b.score - a.score);
  }

  getCandidateById(id: string): (ScreeningResultRecord & { job_title: string; job_description?: string; communications: CommunicationRecord[] }) | undefined {
    const candidate = this.results.find(r => r.id === id);
    if (!candidate) return undefined;

    const job = this.jobs.find(j => j.id === candidate.job_id);
    const candidateComms = this.getCommunicationHistory(candidate.id);

    return {
      ...candidate,
      job_title: job ? job.title : 'General Position',
      job_description: job ? job.description : undefined,
      communications: candidateComms,
    };
  }

  updateCandidateDecision(
    id: string,
    decision: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending',
    notes: string,
    userName: string,
    userId?: string
  ): ScreeningResultRecord | undefined {
    const idx = this.results.findIndex(r => r.id === id);
    if (idx === -1) return undefined;

    const prevDecision = this.results[idx].hr_decision;
    const now = new Date().toISOString();

    this.results[idx] = {
      ...this.results[idx],
      hr_decision: decision,
      hr_notes: notes !== undefined ? notes : this.results[idx].hr_notes,
      hr_decided_by: userName,
      hr_decided_at: now,
    };

    // Audit log
    this.addAuditLog({
      user_id: userId || '11111111-1111-1111-1111-111111111111',
      user_name: userName,
      action: 'HR_DECISION_UPDATED',
      details: `Updated decision for ${this.results[idx].candidate_name} from "${prevDecision}" to "${decision}". Notes: ${notes ? notes.slice(0, 80) : 'None'}`,
      ip_address: '127.0.0.1',
    });

    return this.results[idx];
  }

  bulkUpdateDecision(
    ids: string[],
    decision: 'Shortlisted' | 'Review Later' | 'Rejected' | 'Pending',
    notes: string,
    userName: string,
    userId?: string
  ): ScreeningResultRecord[] {
    const updated: ScreeningResultRecord[] = [];
    const now = new Date().toISOString();

    ids.forEach(id => {
      const idx = this.results.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.results[idx] = {
          ...this.results[idx],
          hr_decision: decision,
          hr_notes: notes || this.results[idx].hr_notes,
          hr_decided_by: userName,
          hr_decided_at: now,
        };
        updated.push(this.results[idx]);
      }
    });

    if (updated.length > 0) {
      this.addAuditLog({
        user_id: userId || '11111111-1111-1111-1111-111111111111',
        user_name: userName,
        action: 'BULK_HR_DECISION_UPDATED',
        details: `Bulk marked ${updated.length} candidate(s) as "${decision}"`,
        ip_address: '127.0.0.1',
      });
    }

    return updated;
  }

  // Communications
  getCommunicationHistory(candidateId: string): CommunicationRecord[] {
    return this.communications
      .filter(c => c.candidate_id === candidateId)
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  getAllCommunications(): CommunicationRecord[] {
    return [...this.communications].sort(
      (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
    );
  }

  addCommunication(record: Omit<CommunicationRecord, 'id' | 'sent_at'>): CommunicationRecord {
    const now = new Date().toISOString();
    const entry: CommunicationRecord = {
      ...record,
      id: crypto.randomUUID ? crypto.randomUUID() : `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sent_at: now,
    };
    this.communications.unshift(entry);

    // Update candidate's communication_status and last_communication info
    const idx = this.results.findIndex(r => r.id === record.candidate_id);
    if (idx !== -1) {
      this.results[idx] = {
        ...this.results[idx],
        communication_status: record.status,
        last_communication_type: record.email_type,
        last_communication_at: now,
      };
    }

    // Add audit log
    this.addAuditLog({
      user_id: record.sender_id || '11111111-1111-1111-1111-111111111111',
      user_name: record.sender_name,
      action: 'RECRUITMENT_EMAIL_SENT',
      details: `Dispatched "${record.email_type}" to ${record.recipient} (${record.candidate_name}). Subject: "${record.subject}" [Status: ${record.status}]`,
      ip_address: '127.0.0.1',
    });

    return entry;
  }

  bulkAddCommunications(records: Omit<CommunicationRecord, 'id' | 'sent_at'>[]): CommunicationRecord[] {
    const created: CommunicationRecord[] = [];
    const now = new Date().toISOString();

    records.forEach(rec => {
      const entry: CommunicationRecord = {
        ...rec,
        id: crypto.randomUUID ? crypto.randomUUID() : `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sent_at: now,
      };
      this.communications.unshift(entry);
      created.push(entry);

      const idx = this.results.findIndex(r => r.id === rec.candidate_id);
      if (idx !== -1) {
        this.results[idx] = {
          ...this.results[idx],
          communication_status: rec.status,
          last_communication_type: rec.email_type,
          last_communication_at: now,
        };
      }
    });

    if (records.length > 0) {
      this.addAuditLog({
        user_id: records[0].sender_id || '11111111-1111-1111-1111-111111111111',
        user_name: records[0].sender_name,
        action: 'BULK_RECRUITMENT_EMAILS_SENT',
        details: `Dispatched bulk "${records[0].email_type}" emails to ${records.length} candidates.`,
        ip_address: '127.0.0.1',
      });
    }

    return created;
  }


  // Audit Logs
  getAuditLogs(): AuditLogRecord[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addAuditLog(log: Omit<AuditLogRecord, 'id' | 'created_at'>): AuditLogRecord {
    const entry: AuditLogRecord = {
      ...log,
      id: crypto.randomUUID ? crypto.randomUUID() : `aud-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // Enhanced Analytics & Intelligence Stats
  getEnhancedStats() {
    const activeJobs = this.jobs.filter(j => j.is_active).length;
    const totalScreened = this.results.length;
    const sessionsRun = this.sessions.length;

    // Highest and Average Scores
    const scores = this.results.map(r => Number(r.score));
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // 1. Candidate Screening Pipeline (Funnel)
    // Uploaded -> Processed -> Qualified (>=50%) -> Shortlisted (>=70%) -> Recommended (>=80% or Highly Recommended)
    const uploaded = totalScreened + 2; // includes queued
    const processed = totalScreened;
    const qualified = this.results.filter(r => r.score >= 50).length;
    const shortlisted = this.results.filter(r => r.score >= 70).length;
    const recommended = this.results.filter(r => r.score >= 80 || r.recommendation === 'Highly Recommended').length;

    const screeningPipeline = {
      uploaded,
      processed,
      qualified,
      shortlisted,
      recommended,
      conversionRate: uploaded > 0 ? Math.round((recommended / uploaded) * 100) : 0,
    };

    // 2. Activity Chart (7 Days vs 30 Days)
    const now = new Date();
    const last7Days: { date: string; day: string; count: number }[] = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysOfWeek[d.getDay()];

      // Match results created on that date or distribute realistic volume
      let count = this.results.filter(r => r.created_at.startsWith(dateStr)).length;
      if (i === 1) count += 3;
      if (i === 0) count += 2;
      if (i === 3) count += 4;
      if (i === 4) count += 2;
      if (i === 6) count += 1;

      last7Days.push({
        date: dateStr,
        day: dayName,
        count,
      });
    }

    const last30Days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      // Generate daily counts with weekly surge pattern
      const base = (i % 7 === 0 || i % 7 === 6) ? 1 : (i % 3 === 0 ? 4 : 2);
      last30Days.push({ date: dateStr, count: base });
    }

    const activityChart = {
      days7: last7Days,
      days30: last30Days,
      trendPercent: 24,
      isIncreasing: true,
      periodComparisonText: '+24% vs. previous 7-day period',
    };

    // 3. AI Screening Insights
    // Frequency of matched and missing skills
    const skillCounts: Record<string, number> = {};
    const missingCounts: Record<string, number> = {};

    this.results.forEach(r => {
      (r.matched_skills || []).forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
      (r.missing_skills || []).forEach(s => {
        missingCounts[s] = (missingCounts[s] || 0) + 1;
      });
    });

    const mostCommonSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: totalScreened > 0 ? Math.round((count / totalScreened) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const mostMissingSkills = Object.entries(missingCounts)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: totalScreened > 0 ? Math.round((count / totalScreened) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const jobInsights = [
      'Cloud Architecture (AWS / Azure) is the #1 skill gap across 62% of engineering applicants; consider expanding on-the-job cloud training.',
      'Core SQL and Python proficiency remains high with 85% candidate coverage across screening runs.',
      'Average match score for Software Engineer (78%) is significantly higher than Data Analyst (62%), indicating tighter talent availability in data analytics.'
    ];

    const aiInsights = {
      mostCommonSkills,
      mostMissingSkills,
      averageScore,
      jobInsights,
    };

    // 4. Screening Alerts
    const screeningAlerts = [
      {
        id: 'alt-1',
        type: 'missing_mandatory',
        level: 'warning',
        title: 'Missing Mandatory Cloud Skills',
        message: 'Top-tier candidate Priya Shanmugam (88% Match) lacks AWS/Azure certification requirements.',
        actionLabel: 'Review Candidate',
        jobId: '33333333-3333-3333-3333-333333333331',
      },
      {
        id: 'alt-2',
        type: 'similar_scores',
        level: 'info',
        title: 'Close Score Tie Detected',
        message: 'Alex Tan (89%) and Priya Shanmugam (88%) are within 1% match score. Manual tie-breaker comparison advised.',
        actionLabel: 'Compare Candidates',
        candidateIds: ['55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555552'],
      },
      {
        id: 'alt-3',
        type: 'manual_review',
        level: 'warning',
        title: 'Borderline Score Flag',
        message: 'Candidate Marcus Vance scored 52% (Consider). Technical portfolio warrants recruiter review.',
        actionLabel: 'Open Profile',
        candidateId: '55555555-5555-5555-5555-555555555554',
      },
      {
        id: 'alt-4',
        type: 'new_applications',
        level: 'info',
        title: 'Screening Queue Ready',
        message: '2 unparsed resumes pending screening in background buffer.',
        actionLabel: 'Go to Screen',
      }
    ];

    // 5. Skill Match Overview (Required skills vs candidate coverage)
    const requiredSkillsMap: Record<string, { matched: number; total: number }> = {
      'Python': { matched: 4, total: totalScreened },
      'SQL / Databases': { matched: 4, total: totalScreened },
      'RESTful APIs': { matched: 3, total: totalScreened },
      'Git Version Control': { matched: 4, total: totalScreened },
      'AWS / Cloud': { matched: 1, total: totalScreened },
      'Data Analysis / BI': { matched: 2, total: totalScreened },
    };

    const skillMatchOverview = Object.entries(requiredSkillsMap).map(([skill, data]) => ({
      skill,
      matchedCount: data.matched,
      totalCount: data.total,
      percentage: data.total > 0 ? Math.round((data.matched / data.total) * 100) : 0,
      ratio: `${data.matched}/${data.total}`,
    }));

    // 6. Recent Screening Activity
    const recentActivity = [
      {
        id: 'act-1',
        job_title: 'Software Engineer',
        resumes_screened: 3,
        highest_score: 89,
        date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'Completed',
      },
      {
        id: 'act-2',
        job_title: 'Data Analyst',
        resumes_screened: 2,
        highest_score: 72,
        date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        status: 'Completed',
      },
      {
        id: 'act-3',
        job_title: 'HR Manager',
        resumes_screened: 0,
        highest_score: 0,
        date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        status: 'Awaiting Resumes',
      }
    ];

    // Top 5 Candidates
    const topCandidates = [...this.results]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r, idx) => {
        const job = this.jobs.find(j => j.id === r.job_id);
        return {
          ...r,
          rank: idx + 1,
          job_title: job ? job.title : 'Target Role',
        };
      });

    const activeJobsList = this.getJobs(true);

    return {
      activeJobs,
      totalScreened,
      sessionsRun,
      highestScore,
      averageScore,
      screeningPipeline,
      activityChart,
      aiInsights,
      screeningAlerts,
      skillMatchOverview,
      recentActivity,
      topCandidates,
      activeJobsList,
    };
  }
}

// Global singleton instance
const globalForDb = globalThis as unknown as { mockDb?: MockDatabase };
export const mockDb = globalForDb.mockDb || new MockDatabase();
if (process.env.NODE_ENV !== 'production') globalForDb.mockDb = mockDb;
