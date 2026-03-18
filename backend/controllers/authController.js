const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID");

// Basic in-memory OTP store (for demo purposes)
const otpStore = {};

exports.googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;
        
        // Here you would look up the user in dbschema.sql (students/alumni/admins)
        // For now, we just return a success payload.
        
        const jwtToken = jwt.sign({ email, name }, "supersecretkey", { expiresIn: '1h' });
        
        res.json({
            message: "Google login successful",
            token: jwtToken,
            user: { email, name, picture }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Invalid Google token" });
    }
};

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60000 }; // 5 minutes

    console.log(`[DEV MODE] OTP for ${email} is ${otp}`);

    // If real credentials are provided in env, use them:
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your AlmaMatters Login OTP',
                text: `Your OTP is ${otp}. It is valid for 5 minutes.`
            });
            return res.json({ message: "OTP sent to email" });
        } catch (error) {
            console.error("Nodemailer error:", error);
            return res.status(500).json({ message: "Error sending OTP email" });
        }
    } else {
        // Fallback for dev mode
        return res.json({ message: "OTP printed to server console (dev mode)" });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP requested for this email" });
    
    if (Date.now() > record.expires) {
        delete otpStore[email];
        return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp === otp) {
        // OTP matches
        delete otpStore[email];
        const jwtToken = jwt.sign({ email }, "supersecretkey", { expiresIn: '1h' });
        res.json({
            message: "OTP correct, login successful",
            token: jwtToken,
            user: { email }
        });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
};

exports.loginUnified = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required." });

    db.query(
        `SELECT sla.student_id as id, sla.password_hash, sla.account_status,
                spd.first_name, spd.full_name, spd.profile_photo_url as avatar, 'student' as type
         FROM student_login_accounts sla
         LEFT JOIN student_personal_details spd ON spd.student_id = sla.student_id
         WHERE sla.username = ?`, 
        [username],
        (err, studentRows) => {
            if (err) return res.status(500).json({ message: "Database error" });
            
            if (studentRows.length > 0) {
                // Found Student
                const user = studentRows[0];
                if (user.account_status !== "ACTIVE") return res.status(403).json({ message: "Account inactive." });
                if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ message: "Invalid credentials." });
                
                return res.json({
                    message: "Login successful",
                    student_id: user.id, // For legacy compat
                    id: user.id,
                    name: user.full_name || user.first_name || username,
                    avatar: user.avatar,
                    type: "student"
                });
            }

            // Not found in students, check alumni
            db.query(
                `SELECT ala.alumni_id as id, ala.password_hash, ala.account_status,
                        st.full_name as name, 'alumni' as type
                 FROM alumni_login_accounts ala
                 LEFT JOIN alumni a ON a.alumni_id = ala.alumni_id
                 LEFT JOIN student_personal_details st ON st.student_id = a.student_id
                 WHERE ala.username = ?`,
                [username],
                (err2, alumniRows) => {
                    if (err2) return res.status(500).json({ message: "Database error" });
                    
                    if (alumniRows.length > 0) {
                        const user = alumniRows[0];
                        if (user.account_status !== "ACTIVE") return res.status(403).json({ message: "Account inactive." });
                        if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ message: "Invalid credentials." });
                        
                        return res.json({
                            message: "Login successful",
                            id: user.id,
                            name: user.name || username,
                            avatar: null, // Alumni table currently doesn't have an avatar column
                            type: "alumni"
                        });
                    }
                    
                    return res.status(401).json({ message: "Invalid username or password." });
                }
            );
        }
    );
};

exports.loginAdmin = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password required." });

    db.query(
        `SELECT ala.admin_id as id, ala.password_hash, ala.account_status,
                apd.first_name, apd.full_name, apd.profile_photo_url as avatar
         FROM admin_login_accounts ala
         LEFT JOIN admin_personal_details apd ON apd.admin_id = ala.admin_id
         WHERE ala.username = ?`,
        [username],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Database error" });
            
            if (rows.length > 0) {
                const user = rows[0];
                if (user.account_status !== "ACTIVE") return res.status(403).json({ message: "Account inactive." });
                if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ message: "Invalid credentials." });
                
                return res.json({
                    message: "Login successful",
                    id: user.id,
                    name: user.full_name || user.first_name || username,
                    avatar: user.avatar,
                    type: "admin"
                });
            }
            
            return res.status(401).json({ message: "Invalid credentials." });
        }
    );
};

