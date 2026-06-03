const UI = {
  // Show a toast message
  showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} slide-in`;
    
    // Add icon
    let iconClass = 'fas fa-check-circle';
    if (type === 'error') iconClass = 'fas fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fas fa-exclamation-triangle';
    if (type === 'info') iconClass = 'fas fa-info-circle';

    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close-btn">&times;</button>
    `;

    container.appendChild(toast);

    // Bind close button
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      this.removeToast(toast);
    });

    // Auto remove
    setTimeout(() => {
      this.removeToast(toast);
    }, duration);
  },

  removeToast(toast) {
    toast.classList.replace('slide-in', 'slide-out');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  },

  // Toggle loading spinner
  showLoader() {
    let loader = document.getElementById('loading-overlay');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'loading-overlay';
      loader.innerHTML = `
        <div class="spinner-container">
          <div class="double-bounce1"></div>
          <div class="double-bounce2"></div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.add('active');
  },

  hideLoader() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.classList.remove('active');
    }
  },

  // Render navigation bar dynamically
  renderNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const user = Auth.getUser();
    const isLoggedIn = Auth.isAuthenticated();

    let navLinks = '';
    if (isLoggedIn) {
      if (user && user.role === 'publisher') {
        navLinks += `<a href="dashboard.html" class="nav-link"><i class="fas fa-chart-line"></i> Dashboard</a>`;
      }
      navLinks += `
        <a href="profile.html" class="nav-link"><i class="fas fa-user-circle"></i> Profile</a>
        <button id="logout-btn" class="btn btn-outline btn-sm"><i class="fas fa-sign-out-alt"></i> Logout</button>
      `;
    } else {
      navLinks += `
        <a href="login.html" class="btn btn-outline btn-sm"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a href="register.html" class="btn btn-primary btn-sm"><i class="fas fa-user-plus"></i> Register</a>
      `;
    }

    container.innerHTML = `
      <nav class="navbar">
        <div class="nav-brand">
          <a href="index.html" class="brand-link">
            <span class="brand-logo"><img src="images/logo.jpg" alt="TechWorld Logo"></span>
            <span class="brand-name">Tech<span class="text-red">World</span></span>
          </a>
        </div>
        <button class="menu-toggle" id="menu-toggle-btn" aria-label="Toggle navigation">
          <i class="fas fa-bars"></i>
        </button>
        <div class="nav-menu" id="nav-menu">
          <a href="index.html" class="nav-link"><i class="fas fa-home"></i> Home</a>
          ${navLinks}
          <button id="theme-toggle-btn" class="theme-toggle-btn" aria-label="Toggle Theme">
            <i class="fas fa-moon"></i>
          </button>
        </div>
      </nav>
    `;

    // Handle hamburger menu toggle on mobile
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-menu');
    if (toggleBtn && navMenu) {
      toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        toggleBtn.querySelector('i').classList.toggle('fa-bars');
        toggleBtn.querySelector('i').classList.toggle('fa-times');
      });
    }

    // Bind logout action
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Auth.logout();
      });
    }

    // Sync theme icon
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
      themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  },

  // Render footer dynamically
  renderFooter() {
    const container = document.getElementById('footer-container');
    if (!container) return;

    container.innerHTML = `
      <footer class="footer">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>Tech<span class="text-red">World</span></h3>
            <p>Your premier destination for the latest technology news, reviews, and gadget trends.</p>
          </div>
          <div class="footer-social">
            <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Tech-World. All rights reserved. Created with passion for tech publishers and readers.</p>
        </div>
      </footer>
    `;
  }
};

// Initialize navbar and footer on page load
document.addEventListener('DOMContentLoaded', () => {
  UI.renderNavbar();
  UI.renderFooter();
});
