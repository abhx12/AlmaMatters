const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// ── Session Requests ──────────────────────────────────────────
// Student/Alumni request a new session
router.post('/request', sessionController.requestSession);

// Get own session requests (student/alumni)
router.get('/my', sessionController.getMySessionRequests);

// ── Admin ─────────────────────────────────────────────────────
// Admin: get pending session requests only
router.get('/pending', sessionController.getPendingSessions);

// Admin: get ALL sessions (all statuses)
router.get('/all', sessionController.getAllSessions);

// Admin: approve or reject a session
router.put('/:session_id/status', sessionController.updateSessionStatus);

// ── Public (students & alumni) ────────────────────────────────
// Fetch approved sessions
router.get('/', sessionController.getApprovedSessions);

// Apply to a session
router.post('/:session_id/apply', sessionController.applySession);

// Organiser-only: view applicants for their session
router.get('/:session_id/applicants', sessionController.getSessionApplicants);

// ── Notifications ─────────────────────────────────────────────
router.get('/notifications/:user_type/:user_id', sessionController.getNotifications);
router.patch('/notifications/:notification_id/read', sessionController.markNotificationRead);
router.patch('/notifications/read-all', sessionController.markAllNotificationsRead);

// ── User Profile ──────────────────────────────────────────────
router.get('/user/:userType/:userId/attended', sessionController.getUserAttendedSessions);

module.exports = router;
