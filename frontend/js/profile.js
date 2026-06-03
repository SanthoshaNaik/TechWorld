document.addEventListener('DOMContentLoaded', () => {
  // Page guard
  if (!Auth.checkAuthentication()) return;

  // DOM Elements
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const sidebarUsername = document.getElementById('sidebar-username');
  const sidebarRole = document.getElementById('sidebar-role');
  const sidebarEmail = document.getElementById('sidebar-email');
  const sidebarJoined = document.getElementById('sidebar-joined');

  const editTabBtn = document.getElementById('tab-btn-edit');
  const bookmarksTabBtn = document.getElementById('tab-btn-bookmarks');
  const editPanel = document.getElementById('panel-edit');
  const bookmarksPanel = document.getElementById('panel-bookmarks');

  const profileForm = document.getElementById('profile-edit-form');
  const usernameInput = document.getElementById('profile-username');
  const emailInput = document.getElementById('profile-email');
  const profilePicInput = document.getElementById('profile-pic-file');
  const passwordInput = document.getElementById('profile-password');

  const bookmarksGrid = document.getElementById('bookmarks-grid');

  // Loaded user state
  let userData = null;

  // Fetch profile details
  async function fetchProfile() {
    try {
      UI.showLoader();
      const res = await fetch(`${CONFIG.API_URL}/auth/me`, {
        method: 'GET',
        headers: Auth.getHeaders()
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        userData = data;
        populateProfileInfo();
        populateFormFields();
        renderBookmarks();
      } else {
        UI.showToast(data.message || 'Failed to load profile data', 'error');
        if (res.status === 401) {
          Auth.logout();
        }
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please try again', 'error');
    }
  }

  // Populate profile UI
  function populateProfileInfo() {
    sidebarUsername.textContent = userData.username;
    sidebarEmail.textContent = userData.email;
    sidebarRole.textContent = userData.role;
    
    if (userData.profilePic) {
      let avatarUrl = userData.profilePic;
      if (avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
        avatarUrl = `${CONFIG.BASE_URL}${avatarUrl}`;
      }
      sidebarAvatar.src = avatarUrl;
    } else {
      sidebarAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    }

    const date = new Date(userData.createdAt);
    sidebarJoined.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Populate input fields
  function populateFormFields() {
    usernameInput.value = userData.username;
    emailInput.value = userData.email;
    profilePicInput.value = ''; // Reset file input
    passwordInput.value = ''; // Keep password blank
  }

  // Render bookmarked posts
  function renderBookmarks() {
    const bookmarks = userData.bookmarks || [];

    if (bookmarks.length === 0) {
      bookmarksGrid.innerHTML = `
        <div class="text-center" style="grid-column: 1/-1; padding: 40px; background-color: var(--bg); border-radius: var(--radius-md);">
          <i class="fas fa-bookmark" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 12px;"></i>
          <h4>No bookmarked gadgets</h4>
          <p class="text-muted">Save articles to read them later!</p>
        </div>
      `;
      return;
    }

    bookmarksGrid.innerHTML = bookmarks.map(post => {
      let imageUrl = post.image;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
      }

      return `
        <article class="post-card" onclick="window.location.href='post-detail.html?id=${post._id}'" style="cursor: pointer; height: 420px;">
          <div class="card-img-wrapper" style="height: 180px;">
            <img class="card-img" src="${imageUrl}" alt="${post.title}" loading="lazy">
          </div>
          <div class="card-content" style="padding: 16px;">
            <h3 class="card-title" style="font-size: 1.1rem; height: 44px;">${post.title}</h3>
            <p class="card-desc" style="font-size: 0.85rem; height: 60px; -webkit-line-clamp: 2;">${post.description}</p>
            <div class="card-footer" style="padding-top: 10px;">
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">
                <i class="fas fa-eye"></i> View details
              </span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Tab Navigation Handling
  editTabBtn.addEventListener('click', () => {
    editTabBtn.classList.add('active');
    bookmarksTabBtn.classList.remove('active');
    editPanel.style.display = 'block';
    bookmarksPanel.style.display = 'none';
  });

  bookmarksTabBtn.addEventListener('click', () => {
    bookmarksTabBtn.classList.add('active');
    editTabBtn.classList.remove('active');
    bookmarksPanel.style.display = 'block';
    editPanel.style.display = 'none';
  });

  // Handle Form Submission
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validations
    if (!username || !email) {
      UI.showToast('Username and Email are required', 'error');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      UI.showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password && password.length < 6) {
      UI.showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    
    if (password) {
      formData.append('password', password);
    }

    // If file is selected, append it
    if (profilePicInput.files && profilePicInput.files.length > 0) {
      formData.append('profilePic', profilePicInput.files[0]);
    }

    try {
      UI.showLoader();

      // Get authorization header without setting Content-Type
      const headers = {};
      const token = Auth.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${CONFIG.API_URL}/auth/profile`, {
        method: 'PUT',
        headers: headers,
        body: formData
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        // Save new token and user details to localStorage
        Auth.login(data.token, {
          _id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
          profilePic: data.profilePic
        });

        UI.showToast('Profile updated successfully!', 'success');
        
        // Refresh profile page fields
        fetchProfile();
        
        // Re-render navbar
        UI.renderNavbar();
      } else {
        UI.showToast(data.message || 'Profile update failed', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please try again later', 'error');
    }
  });

  // Fetch info on load
  fetchProfile();
});
