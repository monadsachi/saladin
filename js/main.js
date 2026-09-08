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

      const filterValue = button.getAttribute('data-filter');

      workItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
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

  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalClose');

  window.openModal = function(title, contentHtml) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody) modalBody.innerHTML = contentHtml;
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
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

  // Attach quick view to catalog cards
  document.querySelectorAll('.btn-quick-view').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.catalog-card') || button.closest('.work-card');
      if (!card) return;

      const title = card.querySelector('.catalog-title, .work-card-title')?.textContent || 'Design Details';
      const imgSrc = card.querySelector('img')?.getAttribute('src') || '';
      const category = card.querySelector('.catalog-category, .work-card-category')?.textContent || '';
      const specs = card.querySelector('.catalog-specs, .work-card-specs')?.innerHTML || '';

      const content = `
        <div class="modal-quickview-grid">
          <div class="modal-quickview-media">
            <img src="${imgSrc}" alt="${title}">
          </div>
          <div>
            <div style="font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-base); font-weight: 600; margin-bottom: 0.5rem;">${category}</div>
            <h3 style="margin-bottom: 1rem; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--text-dark);">${title}</h3>
            <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 1.5rem;">${specs}</div>
            <p style="font-size: 0.88rem; color: var(--text-body); margin-bottom: 1.5rem;">
              Crafted with archival pigment inks on reinforced heavyweight substrate. Precision trimmed for edge-to-edge seamless installation by our certified artisans.
            </p>
            <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
              <a href="contact.html?inquiry=${encodeURIComponent(title)}" class="btn btn-gold btn-sm">Request Installation Quote</a>
              <button onclick="orderSample('${title.replace(/'/g, "\\'")}')" class="btn btn-outline-dark btn-sm">Order Physical Swatch</button>
            </div>
          </div>
        </div>
      `;

      window.openModal(title, content);
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
              Priority Booking Hotline: <strong style="color: var(--text-dark);">+1 (800) 725-2346</strong>
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


