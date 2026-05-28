const THEME_KEY = 'techworld_theme';

const Theme = {
  init() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    this.updateToggleIcon(theme);
  },

  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  },

  updateToggleIcon(theme) {
    const icon = document.querySelector('#theme-toggle-btn i');
    if (icon) {
      if (theme === 'dark') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }
};

// Initialize theme on script load to avoid flash of light mode
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => Theme.toggle());
  }
});
