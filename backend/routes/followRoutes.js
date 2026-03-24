const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');

router.get('/search', followController.searchUsers);
router.post('/follow', followController.followUser);
router.put('/follow/accept', followController.acceptFollow);
router.put('/follow/reject', followController.rejectFollow);
router.delete('/follow', followController.unfollowUser);
router.get('/follow/status', followController.getFollowStatus);

router.get('/:userType/:userId/profile', followController.getProfile);
router.get('/:userType/:userId/followers', followController.getFollowers);
router.get('/:userType/:userId/following', followController.getFollowing);
router.get('/:userType/:userId/requests', followController.getPendingRequests);

module.exports = router;
