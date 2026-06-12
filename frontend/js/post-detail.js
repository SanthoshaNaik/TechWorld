document.addEventListener('DOMContentLoaded', () => {
  // Page guard
  if (!Auth.checkAuthentication()) return;

  // Retrieve post ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const postTitle = document.getElementById('post-title');
  const postAuthorAvatar = document.getElementById('post-author-avatar');
  const postAuthorName = document.getElementById('post-author-name');
  const postDate = document.getElementById('post-date');
  const postImage = document.getElementById('post-image');
  const likesCount = document.getElementById('likes-count');
  const bookmarkText = document.getElementById('bookmark-text');
  const postDescription = document.getElementById('post-description');
  const postRichContent = document.getElementById('post-rich-content');
  const commentsCount = document.getElementById('comments-count');
  const commentsList = document.getElementById('comments-list');
  
  const likeBtn = document.getElementById('like-btn');
  const bookmarkBtn = document.getElementById('bookmark-btn');
  const commentForm = document.getElementById('comment-form');
  const commentText = document.getElementById('comment-text');

  // Page State
  let post = null;
  const currentUser = Auth.getUser();

  // Fetch full details
  async function fetchPostDetails() {
    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/posts/${postId}`, {
        method: 'GET',
        headers: Auth.getHeaders()
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        post = data.data;
        renderPost();
      } else {
        UI.showToast(data.message || 'Failed to load post details', 'error');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please try again', 'error');
    }
  }

  // Render Post to DOM
  function renderPost() {
    // Basic Details
    postTitle.textContent = post.title;
    
    // Author Details
    postAuthorName.textContent = post.author.username;
    if (post.author.profilePic) {
      let authorAvatarUrl = post.author.profilePic;
      if (authorAvatarUrl && !authorAvatarUrl.startsWith('http://') && !authorAvatarUrl.startsWith('https://')) {
        authorAvatarUrl = `${CONFIG.BASE_URL}${authorAvatarUrl}`;
      }
      postAuthorAvatar.src = authorAvatarUrl;
      postAuthorAvatar.onerror = () => {
        postAuthorAvatar.onerror = null;
        postAuthorAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
      };
    }

    // Date
    const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    postDate.textContent = `Published on ${dateStr}`;

    // Image
    let imageUrl = post.image;
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
    }
    postImage.src = imageUrl;

    // Body
    postDescription.textContent = post.description;
    postRichContent.innerHTML = post.content;

    // Likes sync
    likesCount.textContent = post.likes.length;
    const isLiked = post.likes.includes(currentUser._id);
    if (isLiked) {
      likeBtn.classList.add('liked');
      likeBtn.querySelector('i').className = 'fas fa-heart';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.querySelector('i').className = 'far fa-heart';
    }

    // Bookmarks sync from fresh database profile fetch (cached user bookmarks check)
    checkBookmarkState();

    // Comments sync
    commentsCount.textContent = post.comments.length;
    renderComments();
  }

  // Sync Bookmarks UI
  function checkBookmarkState() {
    // We check using local storage user bookmarks list if populated, but to be safe let's check
    const user = Auth.getUser();
    const isBookmarked = user.bookmarks && user.bookmarks.includes(postId);
    
    if (isBookmarked) {
      bookmarkBtn.classList.add('bookmarked');
      bookmarkBtn.querySelector('i').className = 'fas fa-bookmark';
      bookmarkText.textContent = 'Bookmarked';
    } else {
      bookmarkBtn.classList.remove('bookmarked');
      bookmarkBtn.querySelector('i').className = 'far fa-bookmark';
      bookmarkText.textContent = 'Bookmark';
    }
  }

  // Render comments list
  function renderComments() {
    const comments = post.comments || [];
    if (comments.length === 0) {
      commentsList.innerHTML = `
        <div class="text-muted" style="padding: 20px 0; text-align: center;">
          No comments yet. Be the first to share your thoughts!
        </div>
      `;
      return;
    }

    // Sort comments newest first
    const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    commentsList.innerHTML = sortedComments.map(comment => {
      const dateStr = new Date(comment.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      let avatar = comment.user && comment.user.profilePic 
        ? comment.user.profilePic 
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
      if (avatar && !avatar.startsWith('http://') && !avatar.startsWith('https://')) {
        avatar = `${CONFIG.BASE_URL}${avatar}`;
      }

      // Check delete permission (comment author OR publisher)
      const isCommentAuthor = comment.user && (comment.user._id === currentUser._id || comment.user === currentUser._id);
      const isPublisher = currentUser && currentUser.role === 'publisher';
      const canDelete = isCommentAuthor || isPublisher;

      const deleteBtn = canDelete
        ? `<button class="delete-comment-btn" data-comment-id="${comment._id}" title="Delete Comment">
             <i class="fas fa-trash-alt"></i>
           </button>`
        : '';

      return `
        <div class="comment-card">
          <img src="${avatar}" alt="${comment.username}" class="comment-avatar" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';">
          <div class="comment-content">
            <div class="comment-user">
              ${comment.username}
              <span class="comment-time">${dateStr}</span>
            </div>
            <p class="comment-text">${comment.comment}</p>
          </div>
          ${deleteBtn}
        </div>
      `;
    }).join('');
  }

  // Handle Like Button Toggle
  likeBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/posts/${postId}/like`, {
        method: 'PUT',
        headers: Auth.getHeaders()
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local post state
        post.likes = data.likes;
        
        // Re-sync UI
        likesCount.textContent = data.likesCount;
        const isLiked = data.likes.includes(currentUser._id);
        if (isLiked) {
          likeBtn.classList.add('liked');
          likeBtn.querySelector('i').className = 'fas fa-heart';
          UI.showToast('Post liked!', 'success');
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.querySelector('i').className = 'far fa-heart';
          UI.showToast('Like removed', 'info');
        }
      } else {
        UI.showToast(data.message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error(error);
      UI.showToast('Network error, could not complete action', 'error');
    }
  });

  // Handle Bookmark Button Toggle
  bookmarkBtn.addEventListener('click', async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/posts/${postId}/bookmark`, {
        method: 'PUT',
        headers: Auth.getHeaders()
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update user bookmarks in localStorage
        const user = Auth.getUser();
        user.bookmarks = data.bookmarks;
        Auth.setUser(user);

        // Update UI
        checkBookmarkState();

        if (data.bookmarked) {
          UI.showToast('Saved to Bookmarks!', 'success');
        } else {
          UI.showToast('Removed from Bookmarks', 'info');
        }
      } else {
        UI.showToast(data.message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error(error);
      UI.showToast('Network error, could not complete action', 'error');
    }
  });

  // Handle Comment Submission
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const comment = commentText.value.trim();
    if (!comment) return;

    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: Auth.getHeaders(),
        body: JSON.stringify({ comment })
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        // Clear textarea
        commentText.value = '';
        UI.showToast('Comment posted!', 'success');
        
        // Update comments in local state
        post.comments = data.comments;
        commentsCount.textContent = data.comments.length;
        renderComments();
      } else {
        UI.showToast(data.message || 'Could not post comment', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, comment not sent', 'error');
    }
  });

  // Handle Comment Deletion
  commentsList.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-comment-btn');
    if (!deleteBtn) return;

    const commentId = deleteBtn.getAttribute('data-comment-id');
    if (!commentId) return;

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: Auth.getHeaders()
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        UI.showToast('Comment deleted successfully!', 'success');
        
        // Update comments in local state
        post.comments = data.comments;
        commentsCount.textContent = data.comments.length;
        renderComments();
      } else {
        UI.showToast(data.message || 'Could not delete comment', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, comment not deleted', 'error');
    }
  });

  // Load details
  fetchPostDetails();
});
