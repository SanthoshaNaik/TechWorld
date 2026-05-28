document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect
  if (Auth.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const registerForm = document.getElementById('register-form');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const roleInput = document.getElementById('role');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  const togglePasswordBtn = document.getElementById('toggle-password');
  const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
  });

  toggleConfirmPasswordBtn.addEventListener('click', () => {
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    toggleConfirmPasswordBtn.querySelector('i').classList.toggle('fa-eye');
    toggleConfirmPasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
  });

  // Handle Form Submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Client-side validations
    if (!username || !email || !password || !confirmPassword) {
      UI.showToast('Please fill out all fields', 'error');
      return;
    }

    if (username.length < 3) {
      UI.showToast('Username must be at least 3 characters long', 'error');
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      UI.showToast('Please enter a valid email address', 'error');
      return;
    }

    if (password.length < 6) {
      UI.showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      UI.showToast('Passwords do not match', 'error');
      return;
    }

    try {
      UI.showLoader();

      const res = await fetch(`${CONFIG.API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          role,
          password
        })
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        Auth.login(data.token, {
          _id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
          profilePic: data.profilePic
        });

        UI.showToast('Account created successfully!', 'success');

        setTimeout(() => {
          if (data.role === 'publisher') {
            window.location.href = 'dashboard.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 1000);
      } else {
        UI.showToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please check connection', 'error');
    }
  });
});
