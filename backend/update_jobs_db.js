const db = require('./database');

async function createJobsTables() {
  try {
    const jobsSql = `
      CREATE TABLE IF NOT EXISTS jobs (
          job_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          alumni_id BIGINT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          required_skills TEXT,
          stipend_salary VARCHAR(100),
          expectations TEXT,
          qualification VARCHAR(255),
          application_deadline DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE
      )
    `;
    await db.execute(jobsSql);
    console.log('Jobs table created or already exists.');

    const applicationsSql = `
      CREATE TABLE IF NOT EXISTS job_applications (
          application_id BIGINT PRIMARY KEY AUTO_INCREMENT,
          job_id BIGINT NOT NULL,
          applicant_type ENUM('student', 'alumni') NOT NULL,
          applicant_id BIGINT NOT NULL,
          status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_job_application (job_id, applicant_type, applicant_id),
          FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
      )
    `;
    await db.execute(applicationsSql);
    console.log('Job Applications table created or already exists.');

  } catch (err) {
    console.error('Error creating jobs tables:', err);
  } finally {
    process.exit(0);
  }
}

createJobsTables();
