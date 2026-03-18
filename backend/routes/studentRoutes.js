const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/studentController");

// Atomic full registration (all 7 steps in one transaction)
router.post("/register-full", ctrl.registerFull);

// Login endpoints
router.post("/login",          ctrl.loginStudent);
router.post("/login-by-email", ctrl.loginByEmail);

module.exports = router;