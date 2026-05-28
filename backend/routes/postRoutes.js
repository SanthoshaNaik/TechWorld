const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addCommentPost,
  toggleBookmarkPost
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all posts, and create a post (publisher only)
router
  .route('/')
  .get(protect, getPosts)
  .post(protect, authorize('publisher'), upload.single('image'), createPost);

// Get single, update (publisher only), and delete (publisher only)
router
  .route('/:id')
  .get(protect, getPostById)
  .put(protect, authorize('publisher'), upload.single('image'), updatePost)
  .delete(protect, authorize('publisher'), deletePost);

// Social interactions
router.put('/:id/like', protect, toggleLikePost);
router.post('/:id/comment', protect, addCommentPost);
router.put('/:id/bookmark', protect, toggleBookmarkPost);

module.exports = router;
