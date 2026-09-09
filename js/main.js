/**
 * SALADIN WALLCOVERING - JAVASCRIPT INTERACTIONS
 * Core interactive controller for navigation, portfolio filtering,
 * catalog search, wallpaper calculator, modals, and quote requests.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure Gilded Imperial theme is active & clean up legacy storage
  try {
    localStorage.removeItem('saladin_theme');
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', 'gilded');

  initNavigation();
  initStickyHeader();
  initPortfolioFilters();
  initCatalogFilters();
  initWallpaperCalculator();
  initModals();
  initContactForm();
  initFaqAccordion();
  initNewsletter();
  initHomeMuralSlider();
});

/* -------------------------------------------------------------------------- */
/* Navigation & Mobile Drawer                                                 */
/* -------------------------------------------------------------------------- */
function initNavigation() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const closeBtn = document.querySelector('.drawer-close');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.mobile-drawer-backdrop');

  if (!drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Highlight active link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* -------------------------------------------------------------------------- */
/* Portfolio / Work Filtering                                                 */
/* -------------------------------------------------------------------------- */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const workItems = document.querySelectorAll('.work-card');

  if (!filterButtons.length || !workItems.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active class
      filterButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      const filterValue = (button.getAttribute('data-filter') || '').toLowerCase().trim();

      workItems.forEach(item => {
        const itemCategory = (item.getAttribute('data-category') || '').toLowerCase().trim();
        if (filterValue === 'all' || filterValue === itemCategory) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(15px)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Wallpaper Catalog Search & Filter                                          */
/* -------------------------------------------------------------------------- */
function initCatalogFilters() {
  const searchInput = document.getElementById('catalogSearch');
  const categorySelect = document.getElementById('catalogCategory');
  const materialSelect = document.getElementById('catalogMaterial');
  const catalogItems = document.querySelectorAll('.catalog-card');
  const countDisplay = document.getElementById('catalogResultsCount');

  if (!catalogItems.length) return;

  function filterCatalog() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const selectedCategory = categorySelect ? categorySelect.value : 'all';
    const selectedMaterial = materialSelect ? materialSelect.value : 'all';

    let visibleCount = 0;

    catalogItems.forEach(card => {
      const title = (card.querySelector('.catalog-title')?.textContent || '').toLowerCase();
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const material = (card.getAttribute('data-material') || '').toLowerCase();
      const specs = (card.querySelector('.catalog-specs')?.textContent || '').toLowerCase();

      const matchesQuery = !query || title.includes(query) || specs.includes(query) || category.includes(query);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory.toLowerCase();
      const matchesMaterial = selectedMaterial === 'all' || material === selectedMaterial.toLowerCase();

      if (matchesQuery && matchesCategory && matchesMaterial) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} design${visibleCount === 1 ? '' : 's'}`;
    }
  }

  if (searchInput) searchInput.addEventListener('input', filterCatalog);
  if (categorySelect) categorySelect.addEventListener('change', filterCatalog);
  if (materialSelect) materialSelect.addEventListener('change', filterCatalog);
}

/* -------------------------------------------------------------------------- */
/* Wallpaper Quantity Calculator                                              */
/* -------------------------------------------------------------------------- */
function initWallpaperCalculator() {
  const calcForm = document.getElementById('wallpaperCalculatorForm');
  if (!calcForm) return;

  const widthInput = document.getElementById('wallWidth');
  const heightInput = document.getElementById('wallHeight');
  const doorsInput = document.getElementById('wallDoors');
  const windowsInput = document.getElementById('wallWindows');
  const repeatSelect = document.getElementById('patternRepeat');
  const rollTypeSelect = document.getElementById('rollType');

  const rollsOutput = document.getElementById('calcRollsOutput');
  const areaOutput = document.getElementById('calcAreaOutput');
  const wasteOutput = document.getElementById('calcWasteOutput');

  function calculateRolls() {
    const width = parseFloat(widthInput?.value) || 0;
    const height = parseFloat(heightInput?.value) || 0;
    const doors = parseInt(doorsInput?.value) || 0;
    const windows = parseInt(windowsInput?.value) || 0;
    const repeatWasteFactor = parseFloat(repeatSelect?.value) || 1.15; // 10% - 25% waste
    const rollCoverageSqFt = parseFloat(rollTypeSelect?.value) || 56; // Standard US double roll ~56 sq ft, euro roll ~53 sq ft

    if (width <= 0 || height <= 0) {
      if (rollsOutput) rollsOutput.textContent = '0';
      if (areaOutput) areaOutput.textContent = '0 sq ft';
      if (wasteOutput) wasteOutput.textContent = '0 sq ft';
      return;
    }

    // Gross Wall Area
    const grossArea = width * height;

    // Deductions: typical door is ~20 sq ft, window is ~15 sq ft
    const deductions = (doors * 20) + (windows * 15);
    const netArea = Math.max(grossArea - deductions, grossArea * 0.75); // Safe margin

    // Apply repeat waste factor
    const totalAreaWithWaste = netArea * repeatWasteFactor;
    const wasteAdded = totalAreaWithWaste - netArea;

    // Usable coverage per roll accounting for drop match (~85% of nominal)
    const effectiveRollCoverage = rollCoverageSqFt * 0.88;
    const rollsNeeded = Math.ceil(totalAreaWithWaste / effectiveRollCoverage);

    if (rollsOutput) rollsOutput.textContent = rollsNeeded.toString();
    if (areaOutput) areaOutput.textContent = `${Math.round(netArea)} sq ft`;
    if (wasteOutput) wasteOutput.textContent = `+${Math.round(wasteAdded)} sq ft pattern repeat allowance`;
  }

  const inputs = [widthInput, heightInput, doorsInput, windowsInput, repeatSelect, rollTypeSelect];
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateRolls);
      input.addEventListener('change', calculateRolls);
    }
  });

  calculateRolls();
}

/* -------------------------------------------------------------------------- */
/* Modal System (Quick View & Swatch Order)                                   */
/* -------------------------------------------------------------------------- */
function initModals() {
  const modalBackdrop = document.getElementById('globalModal');
  if (!modalBackdrop) return;

  const modalBox = modalBackdrop.querySelector('.modal-box');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalClose');

  let activeSliderKeyHandler = null;

  window.openModal = function(title, contentHtml, isLarge = false) {
    if (modalTitle) {
      modalTitle.textContent = title;
      modalTitle.style.display = isLarge ? 'none' : 'block';
    }
    if (modalBody) modalBody.innerHTML = contentHtml;
    if (modalBox) {
      if (isLarge) {
        modalBox.classList.add('modal-box-large');
      } else {
        modalBox.classList.remove('modal-box-large');
      }
    }
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    if (activeSliderKeyHandler) {
      document.removeEventListener('keydown', activeSliderKeyHandler);
      activeSliderKeyHandler = null;
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', window.closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) window.closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      window.closeModal();
    }
  });

  // Open interactive image slider for a catalog item
  window.openCatalogSlider = function(card) {
    if (!card) return;

    const titleEl = card.querySelector('.catalog-title, .work-card-title');
    const altText = card.querySelector('img')?.getAttribute('alt') || 'Design Details';
    const titleHtml = titleEl ? titleEl.innerHTML.trim() : altText;
    const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : altText;
    const title = titleText;
    const category = card.querySelector('.catalog-category, .work-card-category, .work-badge')?.textContent.trim() || 'Wallcovering Collection';
    const specs = card.querySelector('.catalog-specs, .work-card-specs')?.innerHTML.trim() || '';
    const primaryImg = card.querySelector('.catalog-card-media img, img')?.getAttribute('src') || '';

    // Collect gallery images
    let images = [];
    const galleryAttr = card.getAttribute('data-gallery') || card.querySelector('.catalog-card-media')?.getAttribute('data-gallery');
    if (galleryAttr) {
      try {
        images = JSON.parse(galleryAttr);
      } catch (e) {
        images = galleryAttr.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (!Array.isArray(images) || images.length === 0) {
      if (primaryImg) images = [primaryImg];
    } else if (primaryImg && !images.includes(primaryImg)) {
      images.unshift(primaryImg);
    }

    // Curated complementary fallbacks if only 1 image exists
    if (images.length === 1) {
      const fallbacks = [
        'assets/images/hero-wallcovering.jpg',
        'assets/images/gilded-powder-room.jpg'
      ];
      fallbacks.forEach(fb => {
        if (fb !== primaryImg && !images.includes(fb)) images.push(fb);
      });
    }

    // Build slide items & thumbnails
    let slidesHtml = '';
    let thumbsHtml = '';
    images.forEach((imgSrc, idx) => {
      slidesHtml += `
        <div class="catalog-slider-slide ${idx === 0 ? 'active' : ''}" data-slide-index="${idx}">
          <img src="${imgSrc}" alt="${titleText} view ${idx + 1}" loading="eager">
        </div>
      `;
      thumbsHtml += `
        <button type="button" class="catalog-thumb-item ${idx === 0 ? 'active' : ''}" data-thumb-index="${idx}" aria-label="View slide ${idx + 1}">
          <img src="${imgSrc}" alt="Thumbnail ${idx + 1}">
        </button>
      `;
    });

    const content = `
      <div class="catalog-slider-layout">
        <div class="catalog-slider-container">
          <div class="catalog-slider-viewport" id="catalogSliderViewport">
            ${slidesHtml}
            ${images.length > 1 ? `
              <button type="button" class="catalog-slider-btn prev" id="sliderPrevBtn" aria-label="Previous image">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button type="button" class="catalog-slider-btn next" id="sliderNextBtn" aria-label="Next image">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <div class="catalog-slider-badge" id="sliderCounterBadge">1 / ${images.length}</div>
            ` : ''}
          </div>
          ${images.length > 1 ? `
            <div class="catalog-slider-thumbs" id="sliderThumbs">
              ${thumbsHtml}
            </div>
          ` : ''}
        </div>

        <div class="catalog-slider-info">
          <div class="catalog-slider-category">${category}</div>
          <h3 class="catalog-slider-title">${titleHtml}</h3>
          <div class="catalog-slider-specs">${specs}</div>
         
          <div class="catalog-slider-actions">
            <button onclick="orderSample('${titleText.replace(/'/g, "\\'")}')" class="btn btn-gold btn-sm">Order Physical Swatch</button>
            <a href="contact.html?inquiry=${encodeURIComponent(titleText)}" class="btn btn-outline-dark btn-sm">Request Installation Quote</a>
          </div>
        
        </div>
      </div>
    `;

    window.openModal(title, content, true);

    // Initialize slider interactions
    if (images.length > 1) {
      setupCatalogSliderInteractivity(images.length);
    }
  };

  function setupCatalogSliderInteractivity(totalSlides) {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.catalog-slider-slide');
    const thumbs = document.querySelectorAll('.catalog-thumb-item');
    const badge = document.getElementById('sliderCounterBadge');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');
    const viewport = document.getElementById('catalogSliderViewport');

    function goToSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      slides.forEach((s, idx) => {
        s.classList.toggle('active', idx === currentSlide);
      });
      thumbs.forEach((t, idx) => {
        t.classList.toggle('active', idx === currentSlide);
        if (idx === currentSlide) {
          t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
      if (badge) badge.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
      });
    }

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.getAttribute('data-thumb-index'), 10);
        goToSlide(idx);
      });
    });

    // Keyboard navigation (Arrow keys)
    if (activeSliderKeyHandler) {
      document.removeEventListener('keydown', activeSliderKeyHandler);
    }
    activeSliderKeyHandler = (e) => {
      if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
      if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    };
    document.addEventListener('keydown', activeSliderKeyHandler);

    // Touch Swipe gesture support
    if (viewport) {
      let touchStartX = 0;
      let touchEndX = 0;
      viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
          if (diff < 0) goToSlide(currentSlide + 1);
          else goToSlide(currentSlide - 1);
        }
      }, { passive: true });
    }
  }

  // Attach triggers to Quick View buttons
  document.querySelectorAll('.btn-quick-view').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.catalog-card') || button.closest('.work-card');
      if (card) window.openCatalogSlider(card);
    });
  });

  // Attach triggers to card images (clicking on card media opens slider)
  document.querySelectorAll('.catalog-card .catalog-card-media, .work-card, .work-card-media').forEach(media => {
    media.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      const card = media.closest('.catalog-card') || (media.classList.contains('work-card') ? media : media.closest('.work-card'));
      if (card) window.openCatalogSlider(card);
    });
  });

  // Attach sample order triggers
  window.orderSample = function(patternName) {
    const content = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="width: 56px; height: 56px; background: var(--gold-tint); border: 1px solid var(--gold-base); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem auto; color: var(--gold-base); font-size: 1.5rem;">✓</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 1.8rem; margin-bottom: 0.6rem; color: var(--text-dark);">Complimentary Swatch Reserved</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 440px; margin: 0 auto 1.5rem auto;">
          We have marked <strong>${patternName}</strong> (8" × 10" textured memo) for complimentary courier delivery.
        </p>
        <form onsubmit="handleSampleSubmit(event)" style="text-align: left; max-width: 440px; margin: 0 auto;">
          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size:0.75rem; text-transform:uppercase; font-weight:600; margin-bottom:0.3rem; color:var(--text-dark);">Shipping Address</label>
            <input type="text" required placeholder="Street address, city, state, zip" style="width:100%; padding:0.75rem; border:1px solid var(--border-mid); border-radius:3px; background:var(--bg-primary); color:var(--text-dark);">
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display:block; font-size:0.75rem; text-transform:uppercase; font-weight:600; margin-bottom:0.3rem; color:var(--text-dark);">Contact Email</label>
            <input type="email" required placeholder="your@email.com" style="width:100%; padding:0.75rem; border:1px solid var(--border-mid); border-radius:3px; background:var(--bg-primary); color:var(--text-dark);">
          </div>
          <button type="submit" class="btn btn-gold" style="width: 100%;">Dispatch Swatch Package</button>
        </form>
      </div>
    `;
    window.openModal('Sample Order Confirmation', content);
  };

  window.handleSampleSubmit = function(e) {
    e.preventDefault();
    const content = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 2.5rem; color: var(--gold-base); margin-bottom: 1rem;">✦</div>
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; margin-bottom: 0.8rem; color: var(--text-dark);">Swatch Dispatched</h3>
        <p style="color: var(--text-muted); max-width: 420px; margin: 0 auto 1.5rem auto;">
          Thank you. Your curated swatch package is being prepared with tactile material samples and full specifications. Tracking details will be emailed to you shortly.
        </p>
        <button onclick="closeModal()" class="btn btn-black">Back to Browsing</button>
      </div>
    `;
    window.openModal('Order Completed', content);
  };
}

/* -------------------------------------------------------------------------- */
/* Contact & Consultation Form Handler                                        */
/* -------------------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('consultationForm');
  if (!contactForm) return;

  // Pre-fill from URL parameters (e.g., ?service=residential, ?inquiry=Emerald, ?project=rotunda)
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  const inquiryParam = urlParams.get('inquiry');
  const projectParam = urlParams.get('project');

  const projectTypeSelect = document.getElementById('projectType');
  const wallpaperBrandInput = document.getElementById('wallpaperBrand');
  const projectNotesTextarea = document.getElementById('projectNotes');

  if (serviceParam && projectTypeSelect) {
    if (serviceParam === 'residential') projectTypeSelect.value = 'residential';
    else if (serviceParam === 'murals') projectTypeSelect.value = 'scenic';
    else if (serviceParam === 'commercial') projectTypeSelect.value = 'commercial';
    else if (serviceParam === 'grasscloth') projectTypeSelect.value = 'residential';
    else if (serviceParam === 'removal') projectTypeSelect.value = 'removal';
  }

  if (inquiryParam) {
    if (inquiryParam === 'trade' && projectTypeSelect) {
      projectTypeSelect.value = 'trade';
    } else if (wallpaperBrandInput) {
      wallpaperBrandInput.value = inquiryParam;
    }
  }

  if (projectParam && projectNotesTextarea) {
    projectNotesTextarea.value = `Inquiry regarding the ${projectParam} case study installation parameters.`;
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : 'Submit';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';
    }

    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
      contactForm.reset();

      if (window.openModal) {
        const successHtml = `
          <div style="text-align: center; padding: 1.5rem 0.5rem;">
            <div style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--gold-base); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto; color: var(--gold-base); font-size: 1.6rem;">✓</div>
            <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 2rem; margin-bottom: 0.8rem; color: var(--text-dark);">Consultation Request Received</h3>
            <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.7; max-width: 480px; margin: 0 auto 1.8rem auto;">
              Thank you for considering <strong>Saladin Wallcovering</strong>. One of our senior master installers will review your project parameters and contact you within 24 business hours with an initial estimate and calendar availability.
            </p>
            <div style="background: var(--bg-secondary); border: 1px solid var(--gold-border); padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
              Priority Booking Hotline: <strong style="color: var(--text-dark);">+1 (704) 957-0044</strong>
            </div>
            <button onclick="closeModal()" class="btn btn-gold">Return to Saladin</button>
          </div>
        `;
        window.openModal('Request Received', successHtml);
      } else {
        alert('Thank you! Your consultation request has been submitted.');
      }
    }, 900);
  });
}

/* -------------------------------------------------------------------------- */
/* FAQ Accordion                                                              */
/* -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Close others
        faqItems.forEach(i => i.classList.remove('active'));

        // Toggle current
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* -------------------------------------------------------------------------- */
/* Newsletter Subscription                                                    */
/* -------------------------------------------------------------------------- */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        input.value = '';
        if (window.openModal) {
          window.openModal('Subscribed', `
            <div style="text-align:center; padding: 1.5rem;">
              <h3 style="font-family:'Cormorant Garamond',serif; font-size:1.8rem; margin-bottom:0.6rem; color:var(--text-dark);">Welcome to the Inner Circle</h3>
              <p style="color:var(--text-muted); margin-bottom:1.2rem;">You are now subscribed to Saladin Wallcovering's seasonal design digests, exclusive pattern previews, and architectural installation stories.</p>
              <button onclick="closeModal()" class="btn btn-gold">Close</button>
            </div>
          `);
        } else {
          alert('Thank you for subscribing to Saladin Wallcovering updates!');
        }
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* Voyager Portrait Mural Slider Controller                                    */
/* -------------------------------------------------------------------------- */
function initHomeMuralSlider() {
  const slider = document.getElementById('homeMuralSlider');
  if (!slider) return;

  const track = document.getElementById('homeSliderTrack');
  const cards = slider.querySelectorAll('.voyager-card');
  const prevBtn = document.getElementById('homeSliderPrev');
  const nextBtn = document.getElementById('homeSliderNext');
  const counter = document.getElementById('homeSliderCounter');
  const dotsContainer = document.getElementById('homeSliderDots');
  const progressBar = document.getElementById('homeSliderProgress');

  if (!track || !cards.length) return;

  const total = cards.length;
  let current = 0;
  let autoPlayTimer = null;
  const slideDuration = 4000; // 4 seconds per slide
  let isPaused = false;

  function formatNum(n) {
    return (n < 10 ? '0' : '') + n;
  }

  // Generate pagination dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `voyager-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to mural ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  // Center active portrait card in Voyager view
  function updateCarouselPosition(animated = true) {
    if (!cards[current]) return;

    const containerWidth = slider.offsetWidth;
    const activeCard = cards[current];
    const cardOffsetInTrack = activeCard.offsetLeft;
    const cardWidth = activeCard.offsetWidth;

    const targetTranslateX = (containerWidth / 2) - (cardOffsetInTrack + (cardWidth / 2));

    track.style.transition = animated ? 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    track.style.transform = `translateX(${targetTranslateX}px)`;

    cards.forEach((c, idx) => {
      c.classList.toggle('active', idx === current);
    });

    if (counter) {
      const activeNum = counter.querySelector('.active-num');
      if (activeNum) {
        activeNum.textContent = formatNum(current + 1);
      } else {
        counter.textContent = `${formatNum(current + 1)} / ${formatNum(total)}`;
      }
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.voyager-dot');
      dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    restartProgressBar();
  }

  function goToSlide(index) {
    current = (index + total) % total;
    updateCarouselPosition(true);
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function prevSlide() {
    goToSlide(current - 1);
  }

  // Click on any side card to center it, or click active card to view full uncropped image
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (idx !== current) {
        goToSlide(idx);
        resetAutoPlay();
      } else {
        const img = card.querySelector('img');
        const badge = card.querySelector('.voyager-card-badge')?.textContent || `Mural ${formatNum(idx + 1)}`;
        if (img && window.openModal) {
          window.openModal(badge, `
            <div style="text-align: center; padding: 0.5rem;">
              <img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt')}" style="max-width: 100%; max-height: 75vh; object-fit: contain; border: 1px solid #f3c761; padding: 8px; background: var(--bg-card); border-radius: var(--radius-xs);">
              <div style="margin-top: 1.2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <a href="contact.html?inquiry=${encodeURIComponent(badge)}" class="btn btn-gold btn-sm">Request Installation Quote</a>
                <button onclick="closeModal()" class="btn btn-outline-dark btn-sm">Close</button>
              </div>
            </div>
          `, true);
        }
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetAutoPlay();
    });
  }

  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoPlay();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoPlay();
    }
  });

  // Touch / Swipe gestures
  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide();
      else prevSlide();
      resetAutoPlay();
    }
  }, { passive: true });

  // Progress bar & auto-play timer
  function restartProgressBar() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth;
    if (!isPaused) {
      progressBar.style.transition = `width ${slideDuration}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    isPaused = false;
    restartProgressBar();
    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, slideDuration);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    isPaused = true;
    if (progressBar) {
      const computedWidth = window.getComputedStyle(progressBar).width;
      progressBar.style.transition = 'none';
      progressBar.style.width = computedWidth;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // Pause on hover
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  // Recalculate on window resize
  window.addEventListener('resize', () => {
    updateCarouselPosition(false);
  });

  // Initial layout calculation and auto-play
  setTimeout(() => {
    updateCarouselPosition(false);
    startAutoPlay();
  }, 50);
}



