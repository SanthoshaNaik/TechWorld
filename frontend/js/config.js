const CONFIG = {
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000/api'
    : 'https://techworld-backend-ajm2.onrender.com/api', // For production Render server
  BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000'
    : 'https://techworld-backend-ajm2.onrender.com' // Server base URL for relative file paths like uploads
};
