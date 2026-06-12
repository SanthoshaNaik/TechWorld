document.addEventListener('DOMContentLoaded', () => {
  // Check auth state - redirect to login if not authenticated
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  // State
  let posts = [];
  let currentSlide = 0;
  let slideInterval;

  // DOM Elements
  const postsGrid = document.getElementById('posts-grid');
  const searchInput = document.getElementById('search-input');
  const heroSlider = document.getElementById('hero-slider');
  const sliderDots = document.getElementById('slider-dots');

  // Fetch posts from API
  async function fetchPosts(searchQuery = '') {
    try {
      UI.showLoader();
      let url = `${CONFIG.API_URL}/posts`;
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: Auth.getHeaders()
      });

      const data = await res.json();
      UI.hideLoader();

      if (res.ok && data.success) {
        posts = data.data;
        renderPosts();
        if (!searchQuery) {
          setupSlider();
        }
      } else {
        UI.showToast(data.message || 'Failed to fetch posts', 'error');
        if (res.status === 401) {
          Auth.logout();
        }
      }
    } catch (error) {
      UI.hideLoader();
      console.error(error);
      UI.showToast('Network error, please check connection', 'error');
    }
  }

  // Render Post Cards
  function renderPosts() {
    if (posts.length === 0) {
      postsGrid.innerHTML = `
        <div class="text-center" style="grid-column: 1/-1; padding: 40px;">
          <i class="fas fa-laptop" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 16px;"></i>
          <h3>No gadget posts found</h3>
          <p class="text-muted">Try modifying your search or check back later.</p>
        </div>
      `;
      return;
    }

    postsGrid.innerHTML = posts.map(post => {
      // Determine image URL
      let imageUrl = post.image;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
      }

      const dateStr = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const likesCount = post.likes ? post.likes.length : 0;
      const commentsCount = post.comments ? post.comments.length : 0;

      let avatarUrl = post.author.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
      if (avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')) {
        avatarUrl = `${CONFIG.BASE_URL}${avatarUrl}`;
      }

      return `
        <article class="post-card" onclick="window.location.href='post-detail.html?id=${post._id}'" style="cursor: pointer;">
          <div class="card-img-wrapper">
            <img class="card-img" src="${imageUrl}" alt="${post.title}" loading="lazy">
            <span class="card-badge"><i class="fas fa-heart"></i> ${likesCount}</span>
          </div>
          <div class="card-content">
            <h3 class="card-title">${post.title}</h3>
            <p class="card-desc">${post.description}</p>
            <div class="card-footer">
              <div class="author-info">
                <img class="author-avatar" src="${avatarUrl}" alt="${post.author.username}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';">
                <div>
                  <span class="author-name">${post.author.username}</span>
                </div>
              </div>
              <span class="post-date">${dateStr}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Setup Carousel / Slider
  function setupSlider() {
    if (posts.length === 0) {
      heroSlider.style.display = 'none';
      return;
    }

    // Clear previous slides
    const dots = heroSlider.querySelector('.slider-dots');
    heroSlider.innerHTML = '';
    heroSlider.appendChild(dots);
    dots.innerHTML = '';

    // Take top 3 posts for the slider
    const sliderPosts = posts.slice(0, 3);

    sliderPosts.forEach((post, index) => {
      let imageUrl = post.image;
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${CONFIG.BASE_URL}${imageUrl}`;
      }

      const slide = document.createElement('div');
      slide.className = `slide ${index === 0 ? 'active' : ''}`;
      slide.innerHTML = `
        <img src="${imageUrl}" alt="${post.title}" class="slide-img">
        <div class="slide-content">
          <h2 class="text-gradient">${post.title}</h2>
          <p>${post.description}</p>
          <a href="post-detail.html?id=${post._id}" class="btn btn-primary">Read Article <i class="fas fa-arrow-right"></i></a>
        </div>
      `;
      heroSlider.appendChild(slide);

      const dot = document.createElement('span');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      dots.appendChild(dot);
    });

    currentSlide = 0;
    startSlideShow();
  }

  function startSlideShow() {
    stopSlideShow();
    slideInterval = setInterval(() => {
      const slides = heroSlider.querySelectorAll('.slide');
      if (slides.length > 0) {
        goToSlide((currentSlide + 1) % slides.length);
      }
    }, 5000);
  }

  function stopSlideShow() {
    if (slideInterval) clearInterval(slideInterval);
  }

  function goToSlide(index) {
    const slides = heroSlider.querySelectorAll('.slide');
    const dots = heroSlider.querySelectorAll('.dot');
    
    if (slides.length === 0) return;

    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  // Debounced Search Input
  let debounceTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchPosts(e.target.value.trim());
    }, 400);
  });

  // Init fetch
  fetchPosts();
});
