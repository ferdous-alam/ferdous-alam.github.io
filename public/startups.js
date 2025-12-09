(function() {
  // ============================================
  // LOAD DATA FROM JSON FILE
  // ============================================
  let companies = [];
  let categories = [];

  // Fetch the data from JSON file
  fetch('posts/startups-data.json')
    .then(response => response.json())
    .then(data => {
      companies = data.companies;
      categories = data.categories;
      
      // Initialize the page once data is loaded
      renderFilterButtons();
      renderCompanies();
      initializeFilters();
    })
    .catch(error => {
      console.error('Error loading startup data:', error);
    });

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  function renderFilterButtons() {
    const container = document.querySelector('.filter-buttons');
    if (!container) return;
    container.innerHTML = categories.map(cat => 
      `<button class="filter-btn" data-category="${cat.id}">${cat.emoji} ${cat.label}</button>`
    ).join('');
  }

  function renderCompanies() {
    const grid = document.querySelector('.logo-grid');
    if (!grid) return;
    grid.innerHTML = companies.map(company => `
      <a href="${company.url}" target="_blank" rel="noopener" class="logo-card" data-category="${company.category}">
        <img src="${company.logo}" alt="${company.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="logo-fallback" style="display:none;">${company.fallback}</div>
        <div class="tooltip">
          <div class="tooltip-title">${company.name}</div>
          <div class="tooltip-desc">${company.description}</div>
        </div>
      </a>
    `).join('');
  }

  // ============================================
  // ANIMATION & FILTERING LOGIC
  // ============================================
  let animationTimeout = null;
  const activeCategories = new Set();
  
  function initializeFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const category = this.getAttribute('data-category');
        
        // Update button state immediately
        if (activeCategories.has(category)) {
          activeCategories.delete(category);
          this.classList.remove('active');
        } else {
          activeCategories.add(category);
          this.classList.add('active');
        }
        
        // Start animation without blocking
        updateFilter();
      });
    });
  }
  
  function updateFilter() {
    const logoCards = document.querySelectorAll('.logo-card');
    const shouldShowCard = (card) => {
      const cardCategory = card.getAttribute('data-category');
      return activeCategories.size === 0 || activeCategories.has(cardCategory);
    };
    
    // Cancel any ongoing animation cleanup
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    
    // Record positions of ALL cards (visible and hidden)
    const oldPositions = new Map();
    logoCards.forEach(card => {
      if (card.style.display !== 'none') {
        oldPositions.set(card, card.getBoundingClientRect());
      }
    });
    
    // Fade out cards that will be hidden
    logoCards.forEach(card => {
      if (!shouldShowCard(card) && card.style.display !== 'none') {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.85)';
      }
    });
    
    setTimeout(() => {
      // Update display and prepare cards
      logoCards.forEach(card => {
        if (!shouldShowCard(card)) {
          card.style.display = 'none';
        } else {
          if (card.style.display === 'none') {
            // Cards appearing for first time - start invisible
            card.style.display = 'flex';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.85)';
          }
        }
      });
      
      // Force layout recalculation
      void document.body.offsetHeight;
      
      // Get new positions
      const newPositions = new Map();
      logoCards.forEach(card => {
        if (shouldShowCard(card)) {
          newPositions.set(card, card.getBoundingClientRect());
        }
      });
      
      // FLIP: Apply transformations
      logoCards.forEach(card => {
        if (!shouldShowCard(card)) return;
        
        const oldPos = oldPositions.get(card);
        const newPos = newPositions.get(card);
        
        if (oldPos && newPos) {
          // Card was visible - animate from old position
          const deltaX = oldPos.left - newPos.left;
          const deltaY = oldPos.top - newPos.top;
          
          card.style.transition = 'none';
          card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1)`;
          card.style.opacity = '1';
        } else {
          // New card appearing - start at current position but scaled down
          card.style.transition = 'none';
          card.style.transform = 'scale(0.85)';
          card.style.opacity = '0';
        }
      });
      
      // Force reflow
      void document.body.offsetHeight;
      
      // Animate to final state
      requestAnimationFrame(() => {
        logoCards.forEach(card => {
          if (shouldShowCard(card)) {
            card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = 'translate(0, 0) scale(1)';
            card.style.opacity = '1';
          }
        });
      });
      
      animationTimeout = setTimeout(() => {
        // Clean up inline styles
        logoCards.forEach(card => {
          if (shouldShowCard(card)) {
            card.style.transition = '';
            card.style.transform = '';
          }
        });
      }, 500);
    }, 300);
  }
})();
