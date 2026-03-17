use almamatters;
CREATE TABLE students (

student_id BIGINT PRIMARY KEY AUTO_INCREMENT,

roll_number VARCHAR(50) UNIQUE NOT NULL,

register_number VARCHAR(50) UNIQUE,

admission_number VARCHAR(50) UNIQUE,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

CREATE TABLE student_personal_details (

student_id BIGINT PRIMARY KEY,

first_name VARCHAR(100) NOT NULL,

last_name VARCHAR(100),

full_name VARCHAR(200),

date_of_birth DATE,

gender VARCHAR(10),

blood_group VARCHAR(5),

nationality VARCHAR(50),

religion VARCHAR(50),

caste_category VARCHAR(50),

aadhaar_number VARCHAR(20),

pan_number VARCHAR(20),

passport_number VARCHAR(20),

profile_photo_url TEXT,

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE student_contact_details (

student_id BIGINT PRIMARY KEY,

email VARCHAR(150),

phone_number VARCHAR(15),

alternate_phone_number VARCHAR(15),

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE student_address_details (

student_id BIGINT PRIMARY KEY,

address_line1 VARCHAR(255),

address_line2 VARCHAR(255),

city VARCHAR(100),

state VARCHAR(100),

pincode VARCHAR(10),

country VARCHAR(100),

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE student_guardian_details (

student_id BIGINT PRIMARY KEY,

father_name VARCHAR(150),

father_phone VARCHAR(15),

father_occupation VARCHAR(100),

mother_name VARCHAR(150),

mother_phone VARCHAR(15),

mother_occupation VARCHAR(100),

guardian_name VARCHAR(150),

guardian_phone VARCHAR(15),

guardian_relation VARCHAR(50),

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE student_academic_details (

student_id BIGINT PRIMARY KEY,

batch_year YEAR,

admission_date DATE,

expected_graduation_date DATE,

current_year INT,

current_semester INT,

section VARCHAR(10),

academic_status VARCHAR(50),

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE student_login_accounts (

student_id BIGINT PRIMARY KEY,

username VARCHAR(100) UNIQUE NOT NULL,

password_hash TEXT NOT NULL,

last_login TIMESTAMP,

account_status VARCHAR(50),

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

alter table students
drop column register_number
alter table students
drop column admission_number
CREATE TABLE alumni (

alumni_id BIGINT PRIMARY KEY AUTO_INCREMENT,

student_id BIGINT UNIQUE NOT NULL,

graduation_year YEAR NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE

);

CREATE TABLE alumni_personal_details (

alumni_id BIGINT PRIMARY KEY,

linkedin_url TEXT,

current_city VARCHAR(100),

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);

CREATE TABLE alumni_professional_details (

alumni_id BIGINT PRIMARY KEY,

company_name VARCHAR(150),

job_title VARCHAR(150),

industry VARCHAR(150),

years_of_experience DECIMAL(4,1),

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);
CREATE TABLE alumni_login_accounts (

alumni_id BIGINT PRIMARY KEY,

username VARCHAR(100) UNIQUE,

password_hash TEXT,

last_login TIMESTAMP,

account_status VARCHAR(50),

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);
CREATE TABLE alumni_higher_studies_details (

alumni_id BIGINT PRIMARY KEY,

university_name VARCHAR(150),

degree VARCHAR(150),

field_of_study VARCHAR(150),

country VARCHAR(100),

start_year YEAR,

end_year YEAR,

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);
CREATE TABLE alumni_academic_details (

alumni_id BIGINT PRIMARY KEY,

department VARCHAR(150),

program VARCHAR(100),

course VARCHAR(150),

batch_year YEAR,

graduation_year YEAR,

cgpa DECIMAL(4,2),

class_obtained VARCHAR(50),

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);
CREATE TABLE alumni_address_details (

alumni_id BIGINT PRIMARY KEY,

address_line1 VARCHAR(255),

address_line2 VARCHAR(255),

city VARCHAR(100),

state VARCHAR(100),

pincode VARCHAR(10),

country VARCHAR(100),

FOREIGN KEY (alumni_id) REFERENCES alumni(alumni_id) ON DELETE CASCADE

);

CREATE TABLE admins (

admin_id BIGINT PRIMARY KEY AUTO_INCREMENT,

employee_id VARCHAR(50) UNIQUE NOT NULL,

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

);

CREATE TABLE admin_personal_details (

admin_id BIGINT PRIMARY KEY,

first_name VARCHAR(100) NOT NULL,

last_name VARCHAR(100),

full_name VARCHAR(200),

date_of_birth DATE,

gender VARCHAR(10),

profile_photo_url TEXT,

FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE

);

CREATE TABLE admin_contact_details (

admin_id BIGINT PRIMARY KEY,

email VARCHAR(150),

phone_number VARCHAR(15),

alternate_phone_number VARCHAR(15),

FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE

);

CREATE TABLE admin_address_details (

admin_id BIGINT PRIMARY KEY,

address_line1 VARCHAR(255),

address_line2 VARCHAR(255),

city VARCHAR(100),

state VARCHAR(100),

pincode VARCHAR(10),

country VARCHAR(100),

FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE

);

CREATE TABLE admin_login_accounts (

admin_id BIGINT PRIMARY KEY,

username VARCHAR(100) UNIQUE NOT NULL,

password_hash TEXT NOT NULL,

last_login TIMESTAMP,

account_status VARCHAR(50),

FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE

);