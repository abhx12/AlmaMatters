const db = require('../database');

exports.requestSession = (req, res) => {
    const { requester_type, requester_id, title, description, scheduled_at } = req.body;
    const query = `INSERT INTO sessions (requester_type, requester_id, title, description, scheduled_at, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
    db.query(query, [requester_type, requester_id, title, description, scheduled_at], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(201).json({ message: "Session requested successfully", session_id: results.insertId });
    });
};

exports.getPendingSessions = (req, res) => {
    const query = `
        SELECT s.*, 
        COALESCE(st.full_name, al.linkedin_url) as requester_name 
        FROM sessions s
        LEFT JOIN student_personal_details st ON s.requester_type = 'student' AND s.requester_id = st.student_id
        LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
        WHERE s.status = 'pending'
        ORDER BY s.created_at DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(200).json({ sessions: results });
    });
};

exports.getApprovedSessions = (req, res) => {
    const query = `
        SELECT s.*, 
        COALESCE(st.full_name, al.linkedin_url) as requester_name 
        FROM sessions s
        LEFT JOIN student_personal_details st ON s.requester_type = 'student' AND s.requester_id = st.student_id
        LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
        WHERE s.status = 'approved' AND s.scheduled_at >= NOW()
        ORDER BY s.scheduled_at ASC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        res.status(200).json({ sessions: results });
    });
};

exports.updateSessionStatus = (req, res) => {
    const { session_id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }
    const query = `UPDATE sessions SET status = ? WHERE session_id = ?`;
    db.query(query, [status, session_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });
        if (results.affectedRows === 0) return res.status(404).json({ message: "Session not found" });
        res.status(200).json({ message: `Session ${status}` });
    });
};
