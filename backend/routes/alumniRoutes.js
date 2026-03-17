const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');

router.post('/register-step', alumniController.registerStep);

module.exports = router;
