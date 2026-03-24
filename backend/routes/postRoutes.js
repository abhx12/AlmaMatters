const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/postController');

// Feed
router.get('/feed',           ctrl.getFeed);

// Post CRUD
router.post('/',              ctrl.createPost);
router.delete('/:postId',     ctrl.deletePost);

// Likes
router.post('/:postId/like',  ctrl.likePost);
router.delete('/:postId/like',ctrl.unlikePost);

// Comments
router.get('/:postId/comments',              ctrl.getComments);
router.post('/:postId/comments',             ctrl.addComment);
router.delete('/:postId/comments/:commentId',ctrl.deleteComment);

// Shares
router.post('/:postId/share', ctrl.sharePost);

// User Profile
router.get('/user/:userType/:userId', ctrl.getUserPosts);
router.get('/user/:userType/:userId/activity', ctrl.getUserActivity);

module.exports = router;
