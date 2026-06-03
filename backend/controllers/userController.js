const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Publisher
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Publisher
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow publishers to delete their own accounts from this endpoint
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own publisher account' });
    }

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Publisher
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow publishers to change their own role to avoid lockout
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own publisher role' });
    }

    user.role = req.body.role || user.role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated successfully to ${user.role}`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
