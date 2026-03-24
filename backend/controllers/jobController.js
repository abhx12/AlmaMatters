const db = require('../database');

// GET /api/jobs/active
exports.getActiveJobs = async (req, res) => {
  try {
    const query = `
      SELECT j.*, 
             COALESCE(spd.full_name, CONCAT(spd.first_name, ' ', IFNULL(spd.last_name, ''))) AS poster_name,
             spd.profile_photo_url AS poster_avatar,
             apd.company_name, apd.job_title AS poster_title
      FROM jobs j
      JOIN alumni a ON j.alumni_id = a.alumni_id
      JOIN student_personal_details spd ON spd.student_id = a.student_id
      LEFT JOIN alumni_professional_details apd ON apd.alumni_id = a.alumni_id
      WHERE j.application_deadline > NOW()
      ORDER BY j.created_at DESC
    `;
    const [jobs] = await db.execute(query);
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('getActiveJobs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch active jobs' });
  }
};

// GET /api/jobs/alumni/:alumniId
exports.getAlumniJobs = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const query = `
      SELECT j.*, 
             (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_id = j.job_id) AS applicant_count
      FROM jobs j
      WHERE j.alumni_id = ?
      ORDER BY j.created_at DESC
    `;
    const [jobs] = await db.execute(query, [alumniId]);
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('getAlumniJobs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch alumni jobs' });
  }
};

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const { alumni_id, title, description, required_skills, stipend_salary, expectations, qualification, application_deadline } = req.body;
    
    if (!alumni_id || !title || !description || !application_deadline) {
      return res.status(400).json({ success: false, message: 'Missing mandatory fields' });
    }

    const [result] = await db.execute(
      `INSERT INTO jobs (alumni_id, title, description, required_skills, stipend_salary, expectations, qualification, application_deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [alumni_id, title, description, required_skills || null, stipend_salary || null, expectations || null, qualification || null, application_deadline]
    );

    res.status(201).json({ success: true, job_id: result.insertId });
  } catch (err) {
    console.error('createJob error:', err);
    res.status(500).json({ success: false, message: 'Failed to create job posting' });
  }
};

// POST /api/jobs/:jobId/apply
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applicant_type, applicant_id } = req.body;

    if (!applicant_type || !applicant_id) {
      return res.status(400).json({ success: false, message: 'Applicant type and ID required' });
    }

    const [result] = await db.execute(
      `INSERT INTO job_applications (job_id, applicant_type, applicant_id) VALUES (?, ?, ?)`,
      [jobId, applicant_type, applicant_id]
    );

    res.status(201).json({ success: true, application_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }
    console.error('applyForJob error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
};

// GET /api/jobs/:jobId/applications
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const query = `
      SELECT ja.*,
             COALESCE(spd.full_name, CONCAT(spd.first_name, ' ', IFNULL(spd.last_name, ''))) AS applicant_name,
             spd.profile_photo_url AS applicant_avatar,
             scd.email AS applicant_email,
             scd.phone_number AS applicant_phone,
             sad.academic_status AS student_academic_status
      FROM job_applications ja
      JOIN students s ON (ja.applicant_type = 'student' AND ja.applicant_id = s.student_id)
        OR (ja.applicant_type = 'alumni' AND ja.applicant_id = (SELECT a.alumni_id FROM alumni a WHERE a.alumni_id = ja.applicant_id LIMIT 1)) -- Wait this relies on student id so we'll just join student table directly via logic below
    `;
    
    // Actually, both student and alumni map back to the student_personal_details.
    // Let's do a smarter query that handles this uniformly since alumni are just graduated students with an alumni_id that points to student_id.
    const improvedQuery = `
      SELECT ja.*,
             COALESCE(spd.full_name, CONCAT(spd.first_name, ' ', IFNULL(spd.last_name, ''))) AS applicant_name,
             spd.profile_photo_url AS applicant_avatar,
             scd.email AS applicant_email,
             scd.phone_number AS applicant_phone,
             COALESCE(apd.job_title, sad.academic_status, 'Unknown') AS applicant_headline
      FROM job_applications ja
      LEFT JOIN alumni a ON ja.applicant_type = 'alumni' AND ja.applicant_id = a.alumni_id
      LEFT JOIN students s ON (ja.applicant_type = 'student' AND ja.applicant_id = s.student_id) OR (a.student_id = s.student_id)
      LEFT JOIN student_personal_details spd ON s.student_id = spd.student_id
      LEFT JOIN student_contact_details scd ON s.student_id = scd.student_id
      LEFT JOIN student_academic_details sad ON s.student_id = sad.student_id
      LEFT JOIN alumni_professional_details apd ON a.alumni_id = apd.alumni_id
      WHERE ja.job_id = ?
      ORDER BY ja.applied_at DESC
    `;

    const [applications] = await db.execute(improvedQuery, [jobId]);
    res.json({ success: true, applications });
  } catch (err) {
    console.error('getJobApplications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
};

// PUT /api/jobs/applications/:applicationId/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await db.execute(
      `UPDATE job_applications SET status = ? WHERE application_id = ?`,
      [status, applicationId]
    );

    // Fetch details to push notification
    const [apps] = await db.execute(`SELECT * FROM job_applications WHERE application_id = ?`, [applicationId]);
    if (apps.length > 0) {
      const app = apps[0];
      const [jobs] = await db.execute(`SELECT title FROM jobs WHERE job_id = ?`, [app.job_id]);
      const jobTitle = jobs.length > 0 ? jobs[0].title : 'a job';
      
      const message = `Your application for "${jobTitle}" has been ${status}.`;
      await db.execute(
        `INSERT INTO notifications (user_type, user_id, message) VALUES (?, ?, ?)`,
        [app.applicant_type, app.applicant_id, message]
      );
    }

    res.json({ success: true, message: `Application ${status}` });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update application status' });
  }
};
