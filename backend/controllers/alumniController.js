const db = require("../database");

exports.registerStep = (req, res) => {
    const { step, data, alumniId } = req.body;

    /* STEP 1 — ALUMNI TABLE */
    if (step === 1) {
        const sql = `INSERT INTO alumni (student_id, graduation_year) VALUES (?, ?)`;
        db.query(sql, [data.student_id, data.graduation_year], (err, result) => {
            if (err) return res.status(500).json({ message: "Error inserting alumni" });
            return res.json({ message: "Alumni basic info saved", alumni_id: result.insertId });
        });
    }

    /* STEP 2 — PERSONAL DETAILS */
    else if (step === 2) {
        const sql = `
            INSERT INTO alumni_personal_details
            (alumni_id, linkedin_url, current_city)
            VALUES (?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.linkedin_url, data.current_city
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting personal details" });
            res.json({ message: "Personal details saved" });
        });
    }

    /* STEP 3 — PROFESSIONAL DETAILS */
    else if (step === 3) {
        const sql = `
            INSERT INTO alumni_professional_details
            (alumni_id, company_name, job_title, industry, years_of_experience)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.company_name, data.job_title, data.industry, data.years_of_experience
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting professional details" });
            res.json({ message: "Professional details saved" });
        });
    }

    /* STEP 4 — HIGHER STUDIES DETAILS */
    else if (step === 4) {
        const sql = `
            INSERT INTO alumni_higher_studies_details
            (alumni_id, university_name, degree, field_of_study, country, start_year, end_year)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.university_name, data.degree, data.field_of_study, data.country, data.start_year, data.end_year
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting higher studies details" });
            res.json({ message: "Higher studies details saved" });
        });
    }

    /* STEP 5 — ACADEMIC DETAILS */
    else if (step === 5) {
        const sql = `
            INSERT INTO alumni_academic_details
            (alumni_id, department, program, course, batch_year, graduation_year, cgpa, class_obtained)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.department, data.program, data.course, data.batch_year, data.graduation_year, data.cgpa, data.class_obtained
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting academic details" });
            res.json({ message: "Academic details saved" });
        });
    }

    /* STEP 6 — ADDRESS DETAILS */
    else if (step === 6) {
        const sql = `
            INSERT INTO alumni_address_details
            (alumni_id, address_line1, address_line2, city, state, pincode, country)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.address_line1, data.address_line2, data.city, data.state, data.pincode, data.country
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting address details" });
            res.json({ message: "Address saved" });
        });
    }

    /* STEP 7 — LOGIN ACCOUNTS */
    else if (step === 7) {
        const sql = `
            INSERT INTO alumni_login_accounts
            (alumni_id, username, password_hash, account_status)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [
            alumniId, data.username, data.password, "ACTIVE"
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error creating login" });
            res.json({ message: "Signup completed successfully" });
        });
    }

    else {
        res.status(400).json({ message: "Invalid step" });
    }
};
