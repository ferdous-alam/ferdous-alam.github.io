// Search button ripple and input toggle
document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.querySelector('.search-btn');
  const searchInput = document.querySelector('.search-input');
  const searchBar = document.querySelector('.search-bar-container');
  if (searchBtn && searchInput && searchBar) {
    searchBtn.addEventListener('click', function(e) {
      searchBar.classList.toggle('active');
      if (searchBar.classList.contains('active')) {
        searchInput.focus();
      } else {
        searchInput.value = '';
      }
    });
    // Optional: Hide input on blur
    searchInput.addEventListener('blur', function() {
      setTimeout(() => searchBar.classList.remove('active'), 120);
    });
    // Blog search filter
    searchInput.addEventListener('input', function() {
      const query = searchInput.value.trim().toLowerCase();
      const blogs = document.querySelectorAll('.blog-item');
      blogs.forEach(blog => {
        const title = blog.querySelector('.blog-title')?.textContent?.toLowerCase() || '';
        const keywords = blog.getAttribute('data-keywords')?.toLowerCase() || '';
        const year = blog.getAttribute('data-year') || '';
        const meta = blog.querySelector('.blog-meta')?.textContent?.toLowerCase() || '';
        if (
          title.includes(query) ||
          keywords.includes(query) ||
          year.includes(query) ||
          meta.includes(query)
        ) {
          blog.style.display = '';
        } else {
          blog.style.display = 'none';
        }
      });
    });
  }
});
// theme.js: toggles dark/light mode and persists preference
(function() {
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function getPreferredTheme() {
    return localStorage.getItem('theme') || (darkQuery.matches ? 'dark' : 'light');
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Set initial theme
  setTheme(getPreferredTheme());

  // Listen for toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  darkQuery.addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
