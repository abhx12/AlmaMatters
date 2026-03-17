const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

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
