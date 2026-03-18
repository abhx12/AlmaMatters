const db = require("../database");
const bcrypt = require("bcryptjs");

exports.registerStep = (req, res) => {
    const { step, data, adminId } = req.body;

    /* STEP 1 — ADMINS TABLE */
    if (step === 1) {
        const sql = `INSERT INTO admins (employee_id) VALUES (?)`;
        db.query(sql, [data.employee_id], (err, result) => {
            if (err) return res.status(500).json({ message: "Error inserting admin" });
            return res.json({ message: "Admin basic info saved", admin_id: result.insertId });
        });
    }

    /* STEP 2 — PERSONAL DETAILS */
    else if (step === 2) {
        const sql = `
            INSERT INTO admin_personal_details
            (admin_id, first_name, last_name, full_name, date_of_birth, gender, profile_photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            adminId, data.first_name, data.last_name, data.full_name, data.date_of_birth, data.gender, data.profile_photo_url
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting personal details" });
            res.json({ message: "Personal details saved" });
        });
    }

    /* STEP 3 — CONTACT DETAILS */
    else if (step === 3) {
        const sql = `
            INSERT INTO admin_contact_details
            (admin_id, email, phone_number, alternate_phone_number)
            VALUES (?, ?, ?, ?)
        `;
        db.query(sql, [
            adminId, data.email, data.phone_number, data.alternate_phone_number
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting contact details" });
            res.json({ message: "Contact details saved" });
        });
    }

    /* STEP 4 — ADDRESS DETAILS */
    else if (step === 4) {
        const sql = `
            INSERT INTO admin_address_details
            (admin_id, address_line1, address_line2, city, state, pincode, country)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            adminId, data.address_line1, data.address_line2, data.city, data.state, data.pincode, data.country
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error inserting address details" });
            res.json({ message: "Address saved" });
        });
    }

    /* STEP 5 — LOGIN DETAILS */
    else if (step === 5) {
        const sql = `
            INSERT INTO admin_login_accounts
            (admin_id, username, password_hash, account_status)
            VALUES (?, ?, ?, ?)
        `;
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.password, salt);
        
        db.query(sql, [
            adminId, data.username, hashedPassword, "ACTIVE"
        ], (err) => {
            if (err) return res.status(500).json({ message: "Error creating login" });
            res.json({ message: "Signup completed successfully" });
        });
    }
    else {
        res.status(400).json({ message: "Invalid step" });
    }
};
