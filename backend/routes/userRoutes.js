const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Secure all routes with protect and publisher authorization
router.use(protect);
router.use(authorize('publisher'));

router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .delete(deleteUser);

module.exports = router;
