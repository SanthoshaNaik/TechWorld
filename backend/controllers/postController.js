const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private (Users must login to see gadget posts)
exports.getPosts = async (req, res, next) => {
  try {
    let query = {};

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex }
      ];
    }

    // Role-based or author specific filter
    if (req.query.author) {
      query.author = req.query.author;
    }

    const posts = await Post.find(query)
      .populate('author', 'username email profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private (Users must login)
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email profilePic')
      .populate('comments.user', 'username profilePic');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private/Publisher
exports.createPost = async (req, res, next) => {
  try {
    const { title, description, content } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    // Handle image upload
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      // Allow passing image URL (for seed data or external links)
      imagePath = req.body.image;
    } else {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const post = await Post.create({
      title,
      description,
      content,
      image: imagePath,
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private/Publisher
exports.updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Make sure user is the post author OR is admin (role publisher)
    // Here we authorize publishers to manage posts. If we want only the author to edit:
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'publisher') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user._id} is not authorized to update this post`
      });
    }

    const { title, description, content } = req.body;
    let updateFields = { title, description, content };

    // Handle image file upload update
    if (req.file) {
      // Delete old file if it was a local file upload
      if (post.image && post.image.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', post.image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateFields.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      updateFields.image = req.body.image;
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private/Publisher
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Make sure user is the post author OR has publisher role
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'publisher') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user._id} is not authorized to delete this post`
      });
    }

    // Delete image file if it exists locally
    if (post.image && post.image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', post.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Like on Post
// @route   PUT /api/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      likes: post.likes,
      likesCount: post.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to Post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.addCommentPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      username: req.user.username,
      comment: req.body.comment
    };

    post.comments.push(newComment);

    await post.save();

    // Populate user details for the newly added comment for immediate frontend render
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username profilePic');

    res.status(201).json({
      success: true,
      comments: updatedPost.comments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Bookmark on Post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
exports.toggleBookmarkPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.user._id);
    const bookmarkIndex = user.bookmarks.indexOf(post._id);

    let bookmarked = false;
    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      user.bookmarks.push(post._id);
      bookmarked = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarked,
      bookmarks: user.bookmarks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment from Post
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private (Either Comment Author OR Publisher/Admin)
exports.deleteCommentPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find the comment in the post's comments array
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Make sure user is the comment author OR is a publisher
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'publisher') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    // Pull/remove the comment
    post.comments.pull(req.params.commentId);
    await post.save();

    // Populate user details for comments before returning
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username profilePic');

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      comments: updatedPost.comments
    });
  } catch (error) {
    next(error);
  }
};
