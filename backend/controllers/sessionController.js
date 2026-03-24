const db = require('../database');

// ── Helper: get user display name ─────────────────────────────
async function getUserName(type, id) {
  if (type === 'student') {
    const [rows] = await db.query(
      `SELECT full_name FROM student_personal_details WHERE student_id = ?`, [id]
    );
    return rows[0]?.full_name || `Student #${id}`;
  }
  if (type === 'alumni') {
    const [rows] = await db.query(
      `SELECT spd.full_name FROM student_personal_details spd
       JOIN alumni a ON a.student_id = spd.student_id
       WHERE a.alumni_id = ?`, [id]
    );
    return rows[0]?.full_name || `Alumni #${id}`;
  }
  return `User #${id}`;
}

// ── Helper: send notification (silent-fail) ───────────────────
async function sendNotification(userType, userId, message) {
  try {
    await db.query(
      `INSERT INTO notifications (user_type, user_id, message) VALUES (?, ?, ?)`,
      [userType, userId, message]
    );
  } catch (err) {
    console.warn('Notification insert failed:', err.message);
  }
}

// POST /api/sessions/request
exports.requestSession = async (req, res) => {
  try {
    const { requester_type, requester_id, title, description, scheduled_at } = req.body;
    if (!requester_type || !requester_id || !title) {
      return res.status(400).json({ message: 'requester_type, requester_id, and title are required.' });
    }
    const [result] = await db.query(
      `INSERT INTO sessions (requester_type, requester_id, title, description, scheduled_at, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [requester_type, requester_id, title, description, scheduled_at]
    );
    res.status(201).json({ message: 'Session requested successfully', session_id: result.insertId });
  } catch (err) {
    console.error('requestSession error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/pending  (admin only)
exports.getPendingSessions = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT s.*,
        CASE
          WHEN s.requester_type = 'student' THEN spd.full_name
          WHEN s.requester_type = 'alumni'  THEN aspd.full_name
          ELSE NULL
        END AS requester_name
      FROM sessions s
      LEFT JOIN student_personal_details spd
        ON s.requester_type = 'student' AND s.requester_id = spd.student_id
      LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
      LEFT JOIN student_personal_details aspd ON al.student_id = aspd.student_id
      WHERE s.status = 'pending'
      ORDER BY s.created_at DESC
    `);
    res.status(200).json({ sessions: results });
  } catch (err) {
    console.error('getPendingSessions error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions  (approved upcoming — students & alumni)
exports.getApprovedSessions = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT s.*,
        CASE
          WHEN s.requester_type = 'student' THEN spd.full_name
          WHEN s.requester_type = 'alumni'  THEN aspd.full_name
          ELSE NULL
        END AS requester_name
      FROM sessions s
      LEFT JOIN student_personal_details spd
        ON s.requester_type = 'student' AND s.requester_id = spd.student_id
      LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
      LEFT JOIN student_personal_details aspd ON al.student_id = aspd.student_id
      WHERE s.status = 'approved' AND s.scheduled_at >= NOW()
      ORDER BY s.scheduled_at ASC
    `);
    res.status(200).json({ sessions: results });
  } catch (err) {
    console.error('getApprovedSessions error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/all  (admin — all statuses)
exports.getAllSessions = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT s.*,
        CASE
          WHEN s.requester_type = 'student' THEN spd.full_name
          WHEN s.requester_type = 'alumni'  THEN aspd.full_name
          ELSE NULL
        END AS requester_name,
        admin.full_name AS approved_by_admin_name,
        (SELECT COUNT(*) FROM session_applications sa WHERE sa.session_id = s.session_id) AS applicant_count
      FROM sessions s
      LEFT JOIN student_personal_details spd
        ON s.requester_type = 'student' AND s.requester_id = spd.student_id
      LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
      LEFT JOIN student_personal_details aspd ON al.student_id = aspd.student_id
      LEFT JOIN admin_personal_details admin ON s.approved_by_admin_id = admin.admin_id
      ORDER BY s.created_at DESC
    `);
    res.status(200).json({ sessions: results });
  } catch (err) {
    console.error('getAllSessions error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/my?requester_type=...&requester_id=...
exports.getMySessionRequests = async (req, res) => {
  try {
    const { requester_type, requester_id } = req.query;
    if (!requester_type || !requester_id) {
      return res.status(400).json({ message: 'requester_type and requester_id are required.' });
    }
    const [results] = await db.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM session_applications sa WHERE sa.session_id = s.session_id) AS applicant_count
      FROM sessions s
      WHERE s.requester_type = ? AND s.requester_id = ?
      ORDER BY s.created_at DESC
    `, [requester_type, requester_id]);
    res.status(200).json({ sessions: results });
  } catch (err) {
    console.error('getMySessionRequests error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// PUT /api/sessions/:session_id/status  (admin approve/reject)
exports.updateSessionStatus = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { status, admin_id } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Use approved or rejected.' });
    }

    const [sessionRows] = await db.query(
      `SELECT requester_type, requester_id, title FROM sessions WHERE session_id = ?`,
      [session_id]
    );
    if (sessionRows.length === 0) return res.status(404).json({ message: 'Session not found' });

    const [result] = await db.query(
      `UPDATE sessions SET status = ?, approved_by_admin_id = ? WHERE session_id = ?`,
      [status, admin_id || null, session_id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Session not found' });

    const session = sessionRows[0];

    // Fetch approving admin name
    let adminName = "An Admin";
    if (admin_id) {
      const [adminRows] = await db.query(`SELECT full_name FROM admin_personal_details WHERE admin_id = ?`, [admin_id]);
      if (adminRows.length > 0) adminName = adminRows[0].full_name;
    }

    if (status === 'approved') {
      // Notify the organiser
      await sendNotification(
        session.requester_type, session.requester_id,
        `🎉 Your session request "${session.title}" has been approved by ${adminName} and is now live!`
      );
    } else {
      // Notify the organiser
      await sendNotification(
        session.requester_type, session.requester_id,
        `❌ Your session request "${session.title}" has been rejected by ${adminName}.`
      );
      // Notify all existing applicants (shouldn't happen for pending, but guard anyway)
      const [applicants] = await db.query(
        `SELECT applicant_type, applicant_id FROM session_applications WHERE session_id = ?`,
        [session_id]
      );
      for (const app of applicants) {
        await sendNotification(
          app.applicant_type, app.applicant_id,
          `❌ The session "${session.title}" you applied to has been cancelled.`
        );
      }
    }

    res.status(200).json({ message: `Session ${status} successfully.` });
  } catch (err) {
    console.error('updateSessionStatus error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// POST /api/sessions/:session_id/apply
exports.applySession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { applicant_type, applicant_id } = req.body;

    const [sessionRows] = await db.query(
      `SELECT * FROM sessions WHERE session_id = ? AND status = 'approved'`,
      [session_id]
    );
    if (sessionRows.length === 0)
      return res.status(400).json({ message: 'Session not found or not yet approved.' });

    // Prevent organiser from applying to their own session
    const sess = sessionRows[0];
    if (sess.requester_type === applicant_type && Number(sess.requester_id) === Number(applicant_id)) {
      return res.status(400).json({ message: 'You cannot apply to your own session.' });
    }

    const [exists] = await db.query(
      `SELECT application_id FROM session_applications
       WHERE session_id = ? AND applicant_type = ? AND applicant_id = ?`,
      [session_id, applicant_type, applicant_id]
    );
    if (exists.length > 0) return res.status(409).json({ message: 'You have already applied to this session.' });

    await db.query(
      `INSERT INTO session_applications (session_id, applicant_type, applicant_id) VALUES (?, ?, ?)`,
      [session_id, applicant_type, applicant_id]
    );

    // Get applicant's name to notify organiser
    const applicantName = await getUserName(applicant_type, applicant_id);
    await sendNotification(
      sess.requester_type, sess.requester_id,
      `📩 ${applicantName} (${applicant_type}) has applied to your session "${sess.title}".`
    );

    res.status(201).json({ message: 'Applied successfully.' });
  } catch (err) {
    console.error('applySession error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/:session_id/applicants  (organiser only)
exports.getSessionApplicants = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { requester_type, requester_id } = req.query;

    const [sessionRows] = await db.query(
      `SELECT requester_type, requester_id, title FROM sessions WHERE session_id = ?`,
      [session_id]
    );
    if (sessionRows.length === 0) return res.status(404).json({ message: 'Session not found' });

    const session = sessionRows[0];
    if (session.requester_type !== requester_type || Number(session.requester_id) !== Number(requester_id)) {
      return res.status(403).json({ message: 'Only the organiser can view applicants.' });
    }

    const [applicants] = await db.query(`
      SELECT sa.*,
        CASE
          WHEN sa.applicant_type = 'student' THEN spd.full_name
          WHEN sa.applicant_type = 'alumni'  THEN aspd.full_name
          ELSE NULL
        END AS applicant_name
      FROM session_applications sa
      LEFT JOIN student_personal_details spd
        ON sa.applicant_type = 'student' AND sa.applicant_id = spd.student_id
      LEFT JOIN alumni al ON sa.applicant_type = 'alumni' AND sa.applicant_id = al.alumni_id
      LEFT JOIN student_personal_details aspd ON al.student_id = aspd.student_id
      WHERE sa.session_id = ?
      ORDER BY sa.applied_at DESC
    `, [session_id]);

    res.status(200).json({ applicants });
  } catch (err) {
    console.error('getSessionApplicants error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/notifications/:user_type/:user_id
exports.getNotifications = async (req, res) => {
  try {
    const { user_type, user_id } = req.params;
    const [notifications] = await db.query(
      `SELECT * FROM notifications WHERE user_type = ? AND user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [user_type, user_id]
    );
    res.status(200).json({ notifications });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// PATCH /api/sessions/notifications/:notification_id/read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    await db.query(`UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`, [notification_id]);
    res.status(200).json({ message: 'Marked as read.' });
  } catch (err) {
    console.error('markNotificationRead error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// PATCH /api/sessions/notifications/read-all
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const { user_type, user_id } = req.body;
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_type = ? AND user_id = ? AND is_read = FALSE`,
      [user_type, user_id]
    );
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllNotificationsRead error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};

// GET /api/sessions/user/:userType/:userId/attended
exports.getUserAttendedSessions = async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    // Attended = approved sessions that the user either requested or applied to
    const query = `
      SELECT DISTINCT s.*,
        CASE
          WHEN s.requester_type = 'student' THEN spd.full_name
          WHEN s.requester_type = 'alumni'  THEN aspd.full_name
          ELSE NULL
        END AS requester_name
      FROM sessions s
      LEFT JOIN session_applications sa ON s.session_id = sa.session_id
      LEFT JOIN student_personal_details spd
        ON s.requester_type = 'student' AND s.requester_id = spd.student_id
      LEFT JOIN alumni al ON s.requester_type = 'alumni' AND s.requester_id = al.alumni_id
      LEFT JOIN student_personal_details aspd ON al.student_id = aspd.student_id
      WHERE s.status = 'approved' 
        AND (
          (s.requester_type = ? AND s.requester_id = ?) OR
          (sa.applicant_type = ? AND sa.applicant_id = ?)
        )
      ORDER BY s.scheduled_at DESC
    `;
    
    const [results] = await db.query(query, [userType, userId, userType, userId]);
    
    res.status(200).json({ sessions: results });
  } catch (err) {
    console.error('getUserAttendedSessions error:', err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
};
