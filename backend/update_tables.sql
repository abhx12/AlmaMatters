use almamatters;

CREATE TABLE IF NOT EXISTS user_followers (
  follower_type ENUM('student', 'alumni', 'admin') NOT NULL,
  follower_id BIGINT NOT NULL,
  following_type ENUM('student', 'alumni', 'admin') NOT NULL,
  following_id BIGINT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_type, follower_id, following_type, following_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  requester_type ENUM('student', 'alumni') NOT NULL,
  requester_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at DATETIME,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by_admin_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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
);

CREATE TABLE IF NOT EXISTS job_applications (
    application_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    job_id BIGINT NOT NULL,
    applicant_type ENUM('student', 'alumni') NOT NULL,
    applicant_id BIGINT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_job_application (job_id, applicant_type, applicant_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);
