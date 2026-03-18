const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

// Student/Alumni Request Session
router.post('/request', sessionController.requestSession);

// Admin Get Pending Requests
router.get('/pending', sessionController.getPendingSessions);

// Fetch upcoming approved sessions for all
router.get('/', sessionController.getApprovedSessions);

// Admin Approve/Reject a session
router.put('/:session_id/status', sessionController.updateSessionStatus);

module.exports = router;
