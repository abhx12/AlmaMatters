use almamatters;

CREATE TABLE IF NOT EXISTS user_followers (
  follower_type ENUM('student', 'alumni', 'admin') NOT NULL,
  follower_id BIGINT NOT NULL,
  following_type ENUM('student', 'alumni', 'admin') NOT NULL,
  following_id BIGINT NOT NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
