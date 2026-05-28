document.addEventListener('DOMContentLoaded', () => {
  // If already authenticated, redirect to home page
  if (Auth.isAuthenticated()) {
    window.location.href = 'index.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye');
    togglePasswordBtn.querySelector('i').classList.toggle('fa-eye-slash');
  });

  // Handle Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Client-side validations
    if (!email || !password) {
      UI.showToast('Please fill out all fields', 'error');
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

    try {
      UI.showLoader();

      const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        // Save auth data
        Auth.login(data.token, {
          _id: data._id,
          username: data.username,
          email: data.email,
          role: data.role,
          profilePic: data.profilePic
        });

        UI.showToast('Logged in successfully!', 'success');

        // Check if there is a redirect parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');
        
        setTimeout(() => {
          if (redirectUrl) {
            window.location.href = decodeURIComponent(redirectUrl);
          } else {
            window.location.href = 'index.html';
          }
        }, 1000);
      } else {
        UI.showToast(data.message || 'Login failed. Invalid credentials.', 'error');
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please try again later', 'error');
    }
  });
});
