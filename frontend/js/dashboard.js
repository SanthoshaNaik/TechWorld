document.addEventListener('DOMContentLoaded', () => {
  // Page guard
  if (!Auth.checkPublisher()) return;

  // DOM Elements - Sidebar / Layout
  const menuStats = document.getElementById('menu-stats');
  const menuPosts = document.getElementById('menu-posts');
  const menuUsers = document.getElementById('menu-users');
  
  const statsSection = document.getElementById('stats-section');
  const panelPosts = document.getElementById('panel-posts');
  const panelUsers = document.getElementById('panel-users');
  
  const dashboardHeaderTitle = document.getElementById('dashboard-header-title');
  const btnCreatePostShortcut = document.getElementById('btn-create-post-shortcut');

  // Stats Counters
  const statsTotalPosts = document.getElementById('stats-total-posts');
  const statsTotalUsers = document.getElementById('stats-total-users');
  const statsTotalComments = document.getElementById('stats-total-comments');

  // Table Bodies
  const postsTableBody = document.getElementById('posts-table-body');
  const usersTableBody = document.getElementById('users-table-body');

  // Modals & Forms
  const postModal = document.getElementById('post-modal');
  const postForm = document.getElementById('post-form');
  const modalTitle = document.getElementById('modal-title');
  const editPostId = document.getElementById('edit-post-id');
  
  const titleInput = document.getElementById('post-title-input');
  const descInput = document.getElementById('post-desc-input');
  const imageInput = document.getElementById('post-image-input');
  const contentInput = document.getElementById('post-content-input');
  const btnSubmitPost = document.getElementById('btn-submit-post');
  
  const btnAddPost = document.getElementById('btn-add-post');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const imagePreviewContainer = document.getElementById('image-preview-container');
  const imagePreview = document.getElementById('image-preview');

  // State Data
  let posts = [];
  let users = [];

  // Initialize and Fetch Datasets
  async function initDashboard() {
    await fetchPosts();
    await fetchUsers();
    calculateStats();
  }

  // Fetch all posts
  async function fetchPosts() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/posts`, {
        method: 'GET',
        headers: Auth.getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        posts = data.data;
        renderPostsTable();
      }
    } catch (error) {
      console.error(error);
      UI.showToast('Error loading posts list', 'error');
    }
  }

  // Fetch all users
  async function fetchUsers() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/users`, {
        method: 'GET',
        headers: Auth.getHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        users = data.data;
        renderUsersTable();
      }
    } catch (error) {
      console.error(error);
      UI.showToast('Error loading users list', 'error');
    }
  }

  // Calculate overview counts
  function calculateStats() {
    statsTotalPosts.textContent = posts.length;
    statsTotalUsers.textContent = users.length;
    
    // Sum comment sizes
    let commentCount = 0;
    posts.forEach(post => {
      if (post.comments) commentCount += post.comments.length;
    });
    statsTotalComments.textContent = commentCount;
  }

  // Render articles table
  function renderPostsTable() {
    if (posts.length === 0) {
      postsTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No posts created yet.</td></tr>`;
      return;
    }

    postsTableBody.innerHTML = posts.map(post => {
      let imageUrl = post.image;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
      }

      const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <tr>
          <td><img src="${imageUrl}" alt="Thumbnail" class="table-img"></td>
          <td style="font-weight: 600;">${post.title}</td>
          <td class="text-muted" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${post.description}</td>
          <td>${post.likes ? post.likes.length : 0}</td>
          <td>${post.comments ? post.comments.length : 0}</td>
          <td>${dateStr}</td>
          <td>
            <div class="table-actions">
              <button class="action-btn edit" data-id="${post._id}" title="Edit Post"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete" data-id="${post._id}" title="Delete Post"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind edit/delete buttons
    postsTableBody.querySelectorAll('.action-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openEditPostModal(id);
      });
    });

    postsTableBody.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deletePostAction(id);
      });
    });
  }

  // Render users table
  function renderUsersTable() {
    if (users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No readers registered.</td></tr>`;
      return;
    }

    const currentUser = Auth.getUser();

    usersTableBody.innerHTML = users.map(user => {
      const avatar = user.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
      const dateStr = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const deleteBtn = user.role === 'publisher' 
        ? `<span class="text-muted" style="font-size: 0.8rem;">Publisher</span>`
        : `<button class="action-btn delete" data-id="${user._id}" title="Delete User Account"><i class="fas fa-user-slash"></i></button>`;

      const isSelf = user._id === currentUser._id;
      const roleColumn = isSelf
        ? `<span class="profile-role-badge" style="font-size: 0.75rem; text-transform: capitalize;">${user.role}</span>`
        : `
          <select class="role-select" data-id="${user._id}" style="padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border); background-color: var(--surface); color: var(--text); font-size: 0.8rem; font-weight: 600; outline: none; cursor: pointer;">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>User (Reader)</option>
            <option value="publisher" ${user.role === 'publisher' ? 'selected' : ''}>Publisher</option>
          </select>
        `;

      return `
        <tr>
          <td><img src="${avatar}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"></td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${roleColumn}</td>
          <td>${dateStr}</td>
          <td>${deleteBtn}</td>
        </tr>
      `;
    }).join('');

    // Bind delete user button
    usersTableBody.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteUserAction(id);
      });
    });

    // Bind role select change
    usersTableBody.querySelectorAll('.role-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const newRole = e.currentTarget.value;
        await updateUserRoleAction(id, newRole);
      });
    });
  }

  // Panel toggles
  function showPanel(panel) {
    // Hide all
    statsSection.style.display = 'none';
    panelPosts.classList.remove('active');
    panelUsers.classList.remove('active');
    
    menuStats.classList.remove('active');
    menuPosts.classList.remove('active');
    menuUsers.classList.remove('active');
    
    btnCreatePostShortcut.style.display = 'none';

    // Show selected
    if (panel === 'stats') {
      statsSection.style.display = 'grid';
      menuStats.classList.add('active');
      dashboardHeaderTitle.textContent = 'Overview Analytics';
    } else if (panel === 'posts') {
      panelPosts.classList.add('active');
      menuPosts.classList.add('active');
      btnCreatePostShortcut.style.display = 'inline-flex';
      dashboardHeaderTitle.textContent = 'Manage Gadget Articles';
    } else if (panel === 'users') {
      panelUsers.classList.add('active');
      menuUsers.classList.add('active');
      dashboardHeaderTitle.textContent = 'Manage Readers';
    }
  }

  menuStats.addEventListener('click', (e) => { e.preventDefault(); showPanel('stats'); });
  menuPosts.addEventListener('click', (e) => { e.preventDefault(); showPanel('posts'); });
  menuUsers.addEventListener('click', (e) => { e.preventDefault(); showPanel('users'); });

  // Add shortcuts
  btnCreatePostShortcut.addEventListener('click', () => openAddPostModal());
  btnAddPost.addEventListener('click', () => openAddPostModal());

  // Modal open helpers
  function openAddPostModal() {
    modalTitle.textContent = 'Create Gadget Post';
    editPostId.value = '';
    postForm.reset();
    
    // Require image for new posts
    imageInput.setAttribute('required', 'required');
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '';
    
    btnSubmitPost.textContent = 'Publish Post';
    postModal.classList.add('active');
  }

  function openEditPostModal(id) {
    const post = posts.find(p => p._id === id);
    if (!post) return;

    modalTitle.textContent = 'Modify Gadget Post';
    editPostId.value = post._id;
    titleInput.value = post.title;
    descInput.value = post.description;
    contentInput.value = post.content;

    // Image upload not strictly required when editing
    imageInput.removeAttribute('required');

    let imageUrl = post.image;
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
    }
    imagePreview.src = imageUrl;
    imagePreviewContainer.style.display = 'block';

    btnSubmitPost.textContent = 'Save Changes';
    postModal.classList.add('active');
  }

  // Close Modals
  function closeModal() {
    postModal.classList.remove('active');
    postForm.reset();
  }

  modalCloseBtn.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Close modal when clicking outside
  postModal.addEventListener('click', (e) => {
    if (e.target === postModal) closeModal();
  });

  // Handle Post Form Submit (Add/Edit)
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = editPostId.value;
    const isEdit = !!id;

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const content = contentInput.value.trim();
    const file = imageInput.files[0];

    // Basic Validation
    if (!title || !description || !content) {
      UI.showToast('Please fill out all fields', 'error');
      return;
    }

    if (!isEdit && !file) {
      UI.showToast('Please upload an image for the gadget', 'error');
      return;
    }

    // Set up FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('content', content);
    
    if (file) {
      formData.append('image', file);
    }

    try {
      UI.showLoader();

      let url = `${CONFIG.API_URL}/posts`;
      let method = 'POST';

      if (isEdit) {
        url += `/${id}`;
        method = 'PUT';
      }

      // Headers for file upload MUST NOT set 'Content-Type' (browser handles boundaries)
      const token = Auth.getToken();
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: formData
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        UI.showToast(isEdit ? 'Article updated!' : 'Article published!', 'success');
        closeModal();
        initDashboard(); // Reload data
      } else {
        UI.showToast(data.message || 'Operation failed', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please try again', 'error');
    }
  });

  // Delete Post Action
  async function deletePostAction(id) {
    if (!confirm('Are you sure you want to delete this gadget post? This cannot be undone.')) {
      return;
    }

    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: Auth.getHeaders()
      });
      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        UI.showToast('Post deleted successfully', 'success');
        initDashboard(); // Refresh stats/lists
      } else {
        UI.showToast(data.message || 'Could not delete post', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, action failed', 'error');
    }
  }

  // Delete User Action
  async function deleteUserAction(id) {
    if (!confirm('Are you sure you want to delete this reader account? They will lose access immediately.')) {
      return;
    }

    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: Auth.getHeaders()
      });
      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        UI.showToast('Reader account deleted', 'success');
        initDashboard(); // Refresh stats/lists
      } else {
        UI.showToast(data.message || 'Could not delete user', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, action failed', 'error');
    }
  }

  // Update User Role Action
  async function updateUserRoleAction(id, role) {
    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/users/${id}/role`, {
        method: 'PUT',
        headers: Auth.getHeaders(),
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        UI.showToast(`User role updated to ${role}`, 'success');
        initDashboard(); // Refresh stats/lists
      } else {
        UI.showToast(data.message || 'Could not update user role', 'error');
        initDashboard(); // Revert selection by reloading
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, role update failed', 'error');
      initDashboard(); // Revert
    }
  }

  // Rich Text Editor Simulator Toolbar Actions
  document.querySelectorAll('.rich-editor-toolbar .toolbar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tag = e.currentTarget.getAttribute('data-tag');
      insertTag(tag);
    });
  });

  function insertTag(tag) {
    const startPos = contentInput.selectionStart;
    const endPos = contentInput.selectionEnd;
    const text = contentInput.value;
    const selectedText = text.substring(startPos, endPos);
    
    let replacement = '';
    if (tag === 'li') {
      replacement = `<li>${selectedText || 'List item'}</li>`;
    } else if (tag === 'h3') {
      replacement = `<h3>${selectedText || 'Section Heading'}</h3>\n`;
    } else if (tag === 'b') {
      replacement = `<strong>${selectedText || 'bold text'}</strong>`;
    } else if (tag === 'i') {
      replacement = `<em>${selectedText || 'italic text'}</em>`;
    } else if (tag === 'p') {
      replacement = `<p>${selectedText || 'Paragraph content'}</p>\n`;
    }

    contentInput.value = text.substring(0, startPos) + replacement + text.substring(endPos);
    contentInput.focus();
    
    // Put cursor after inserted element
    const newCursorPos = startPos + replacement.length;
    contentInput.setSelectionRange(newCursorPos, newCursorPos);
  }

  // Boot UI
  initDashboard();
});
