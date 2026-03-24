const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

router.get('/active', jobController.getActiveJobs);
router.get('/alumni/:alumniId', jobController.getAlumniJobs);
router.post('/', jobController.createJob);
router.post('/:jobId/apply', jobController.applyForJob);
router.get('/:jobId/applications', jobController.getJobApplications);
router.put('/applications/:applicationId/status', jobController.updateApplicationStatus);

module.exports = router;
