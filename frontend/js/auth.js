// Session keys
const TOKEN_KEY = 'techworld_token';
const USER_KEY = 'techworld_user';

const Auth = {
  // Save token and user details to localStorage
  login(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Log user out
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  },

  // Check if token exists
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get authentication token
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get authenticated user object
  getUser() {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Update saved user object
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get request headers with Authorization token
  getHeaders(customHeaders = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Secure a page: redirect to login if unauthenticated
  checkAuthentication() {
    if (!this.isAuthenticated()) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }
    return true;
  },

  // Secure a publisher dashboard page: redirect if not publisher
  checkPublisher() {
    if (!this.checkAuthentication()) return false;
    const user = this.getUser();
    if (!user || user.role !== 'publisher') {
      alert('Access Denied. Publishers only.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};
