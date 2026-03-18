const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/google-login', authController.googleLogin);
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

router.post('/login', authController.loginUnified);
router.post('/admin-login', authController.loginAdmin);

module.exports = router;
