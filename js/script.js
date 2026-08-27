/* ============================================================
   HM ARCHITECT — Main JavaScript
   Features: Navbar, Mobile Menu, Smooth Scroll, Dark Mode,
   Counters, Scroll Animations, Project Filter, Gallery
   Lightbox, Testimonials Slider, Form Validation, Back-to-Top
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     UTILITY HELPERS
  ============================================================ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ============================================================
     SCROLL PROGRESS INDICATOR
  ============================================================ */
  const scrollProgress = $('#scrollProgress');

  function updateScrollProgress() {
    const scrollY  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress) {
      scrollProgress.style.width = ((scrollY / maxScroll) * 100).toFixed(2) + '%';
    }
  }

  /* ============================================================
     NAVBAR — Scroll shadow + transparent-to-solid
  ============================================================ */
  const navbar = $('#navbar');

  function updateNavbar() {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* ============================================================
     BACK TO TOP BUTTON
  ============================================================ */
  const backToTopBtn = $('#backToTop');

  function updateBackToTop() {
    if (window.scrollY > 650) {
      backToTopBtn?.classList.add('visible');
    } else {
      backToTopBtn?.classList.remove('visible');
    }
  }

  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     ACTIVE NAV LINK ON SCROLL (Intersection Observer)
  ============================================================ */
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          // Only update active state if a nav link matches this section ID
          const matchingLink = navLinks.find(l => l.getAttribute('href') === `#${id}`);
          if (!matchingLink) return; // Sub-page: skip to keep HTML-set active class
          navLinks.forEach(link => {
            link.classList.toggle('active', link === matchingLink);
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ============================================================
     SMOOTH SCROLL FOR ANCHOR LINKS
  ============================================================ */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 76;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  /* ============================================================
     MOBILE HAMBURGER MENU
  ============================================================ */
  const hamburger  = $('#hamburger');
  const navMenu    = $('#navMenu');

  // Inject mobile CTA item
  const mobileCtaLi = document.createElement('li');
  mobileCtaLi.className = 'mobile-cta-li';
  mobileCtaLi.style.display = 'none';
  mobileCtaLi.innerHTML = `<a href="#contact">Get Consultation <i class="fas fa-arrow-right"></i></a>`;
  navMenu?.appendChild(mobileCtaLi);

  function openMenu() {
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('open');
    mobileCtaLi.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
    mobileCtaLi.style.display = 'none';
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on any nav link click
  navMenu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('open')) closeMenu();
  });

  /* ============================================================
     DARK MODE TOGGLE
  ============================================================ */
  const darkToggle = $('#darkModeToggle');
  const html = document.documentElement;

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    if (darkToggle) {
      darkToggle.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
      darkToggle.title = theme === 'dark'
        ? 'Switch to light mode'
        : 'Switch to dark mode';
    }
    localStorage.setItem('hm-theme', theme);
  }

  // Apply saved preference on load
  const savedTheme = localStorage.getItem('hm-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  darkToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* ============================================================
     GLOBAL SCROLL HANDLER (batched)
  ============================================================ */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavbar();
        updateBackToTop();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Run once on load
  updateScrollProgress();
  updateNavbar();
  updateBackToTop();

  /* ============================================================
     SCROLL REVEAL — Intersection Observer (generic fade-in)
  ============================================================ */
  function revealOnScroll(selector, extraClass = 'revealed', stagger = 0) {
    const elements = $$(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = stagger ? i * stagger : 0;
            setTimeout(() => {
              entry.target.classList.add(extraClass);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    elements.forEach(el => observer.observe(el));
  }

  // data-aos elements
  $$('[data-aos]').forEach(el => {
    const delay = el.getAttribute('data-delay') || '0';
    el.style.transitionDelay = (parseInt(delay) / 1000) + 's';
  });
  revealOnScroll('[data-aos]', 'aos-animate');

  // Service cards (staggered)
  revealOnScroll('.service-card', 'revealed', 90);

  // Project cards (staggered)
  revealOnScroll('.project-card', 'revealed', 80);

  // Feature items (staggered)
  revealOnScroll('.feature-item', 'revealed', 120);

  /* ============================================================
     ANIMATED COUNTERS
  ============================================================ */
  const counters = $$('.stat-number[data-target]');

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const el     = entry.target;
          const target = +el.getAttribute('data-target');
          const duration  = 1800; // ms
          const frameTime = 1000 / 60;
          const totalFrames = Math.round(duration / frameTime);
          let frame = 0;

          const timer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);

            if (frame >= totalFrames) {
              el.textContent = target;
              clearInterval(timer);
            }
          }, frameTime);

          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ============================================================
     PROJECT FILTER
  ============================================================ */
  const filterBtns   = $$('.filter-btn');
  const projectCards = $$('.project-card');

  if (filterBtns.length && projectCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');

        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards with animation
        projectCards.forEach((card) => {
          const category = card.getAttribute('data-category');
          const match = filter === 'all' || category === filter;

          if (match) {
            card.classList.remove('hidden');
            card.style.animation = 'none';
            // Trigger reflow for re-animation
            void card.offsetHeight;
            card.style.animation = 'filterFadeIn 0.45s ease forwards';
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ============================================================
     GALLERY LIGHTBOX
  ============================================================ */
  const galleryItems     = $$('.gallery-item');
  const lightbox         = $('#lightbox');
  const lightboxBackdrop = $('#lightboxBackdrop');
  const lightboxImg      = $('#lightboxImg');
  const lightboxClose    = $('#lightboxClose');
  const lightboxPrev     = $('#lightboxPrev');
  const lightboxNext     = $('#lightboxNext');
  const lightboxCounter  = $('#lightboxCounter');

  const galleryImages    = galleryItems.map(item => item.getAttribute('data-src'));
  const totalImgs        = galleryImages.length;
  let   currentLightbox  = 0;

  function openLightbox(index) {
    currentLightbox = ((index % totalImgs) + totalImgs) % totalImgs;
    lightboxImg.src = galleryImages[currentLightbox];
    lightboxImg.alt = `Gallery image ${currentLightbox + 1}`;
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightbox + 1} / ${totalImgs}`;
    lightbox?.classList.add('active');
    lightboxBackdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    lightbox?.classList.remove('active');
    lightboxBackdrop?.classList.remove('active');
    document.body.style.overflow = '';
    // Delay clearing src to allow fade-out
    setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 400);
  }

  function nextLightbox() {
    currentLightbox = (currentLightbox + 1) % totalImgs;
    lightboxImg.src = galleryImages[currentLightbox];
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightbox + 1} / ${totalImgs}`;
  }

  function prevLightbox() {
    currentLightbox = (currentLightbox - 1 + totalImgs) % totalImgs;
    lightboxImg.src = galleryImages[currentLightbox];
    if (lightboxCounter) lightboxCounter.textContent = `${currentLightbox + 1} / ${totalImgs}`;
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  lightboxNext?.addEventListener('click', nextLightbox);
  lightboxPrev?.addEventListener('click', prevLightbox);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  nextLightbox();
    if (e.key === 'ArrowLeft')   prevLightbox();
  });

  // Touch swipe support for lightbox
  let touchStartX = 0;
  lightbox?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox?.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextLightbox() : prevLightbox();
    }
  }, { passive: true });

  /* ============================================================
     TESTIMONIALS SLIDER (Auto-play + Manual)
  ============================================================ */
  const track        = $('#testimonialsTrack');
  const slides       = $$('.testimonial-slide');
  const dots         = $$('.dot');
  const testimPrev   = $('#testimPrev');
  const testimNext   = $('#testimNext');
  const totalSlides  = slides.length;
  let   currentSlide = 0;
  let   autoPlay;

  function goToSlide(index) {
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
      d.setAttribute('aria-selected', i === currentSlide ? 'true' : 'false');
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlay = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  testimPrev?.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoPlay(); });
  testimNext?.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoPlay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(+dot.getAttribute('data-index'));
      startAutoPlay();
    });
  });

  // Touch swipe for testimonials
  let sliderTouchX = 0;
  track?.addEventListener('touchstart', (e) => {
    sliderTouchX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });
  track?.addEventListener('touchend', (e) => {
    const diff = sliderTouchX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
    startAutoPlay();
  }, { passive: true });

  // Pause on hover
  track?.closest('.testimonials-slider')?.addEventListener('mouseenter', stopAutoPlay);
  track?.closest('.testimonials-slider')?.addEventListener('mouseleave', startAutoPlay);

  if (totalSlides > 0) startAutoPlay();

  /* ============================================================
     CONTACT FORM VALIDATION
  ============================================================ */
  const contactForm    = $('#contactForm');
  const successMsg     = $('#successMessage');
  const sendAnotherBtn = $('#sendAnotherBtn');

  function getEl(id) { return document.getElementById(id); }

  function showError(inputId, errorId, message) {
    const input = getEl(inputId);
    const error = getEl(errorId);
    if (input)  input.classList.add('error');
    if (error)  error.textContent = message;
    return false;
  }

  function clearError(inputId, errorId) {
    const input = getEl(inputId);
    const error = getEl(errorId);
    if (input)  input.classList.remove('error');
    if (error)  error.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm() {
    const name    = getEl('name')?.value.trim()    || '';
    const email   = getEl('email')?.value.trim()   || '';
    const message = getEl('message')?.value.trim() || '';
    let valid = true;

    // Name validation
    if (!name || name.length < 2) {
      showError('name', 'nameError', 'Please enter your full name (min. 2 characters).');
      valid = false;
    } else {
      clearError('name', 'nameError');
    }

    // Email validation
    if (!email) {
      showError('email', 'emailError', 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('email', 'emailError', 'Please enter a valid email address.');
      valid = false;
    } else {
      clearError('email', 'emailError');
    }

    // Message validation
    if (!message || message.length < 10) {
      showError('message', 'messageError', 'Please enter a message (at least 10 characters).');
      valid = false;
    } else {
      clearError('message', 'messageError');
    }

    return valid;
  }

  // Live error clearing
  ['name', 'email', 'message'].forEach(id => {
    getEl(id)?.addEventListener('input', () => {
      clearError(id, `${id}Error`);
    });
  });

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstError = contactForm.querySelector('input.error, textarea.error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate form submission
    const submitBtn = $('#submitBtn');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
      submitBtn.disabled  = true;
    }

    setTimeout(() => {
      contactForm.style.display = 'none';
      successMsg?.classList.add('show');
      successMsg?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1600);
  });

  sendAnotherBtn?.addEventListener('click', () => {
    contactForm.reset();
    contactForm.style.display = 'block';
    successMsg?.classList.remove('show');

    const submitBtn = $('#submitBtn');
    if (submitBtn) {
      submitBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
      submitBtn.disabled  = false;
    }

    ['name', 'email', 'message'].forEach(id => clearError(id, `${id}Error`));
  });

  /* ============================================================
     FOOTER — Dynamic Year
  ============================================================ */
  const yearEl = $('#currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     CSS KEYFRAME INJECTION (for filter animation)
  ============================================================ */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes filterFadeIn {
      from { opacity: 0; transform: scale(0.96) translateY(12px); }
      to   { opacity: 1; transform: scale(1)    translateY(0); }
    }
  `;
  document.head.appendChild(styleTag);

  /* ============================================================
     HERO PARALLAX (subtle)
  ============================================================ */
  const heroImg = $('.hero-img');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.18}px)`;
      }
    }, { passive: true });
  }

  /* ============================================================
     SERVICE CARD TILT EFFECT (desktop only)
  ============================================================ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = (e.clientX - rect.left) / rect.width  - 0.5;
        const y      = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `translateY(-8px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
     NAVBAR LOGO CLICK — scroll to top
  ============================================================ */
  $('.logo')?.addEventListener('click', (e) => {
    if (window.location.pathname === '/' || window.location.pathname.endsWith('.html')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  /* ============================================================
     PREVENT FLASH OF INVISIBLE CONTENT
     (ensure hero content is visible immediately)
  ============================================================ */
  document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-stats')
    .forEach(el => el.classList.add('hero-visible'));

  /* ============================================================
     INIT COMPLETE
  ============================================================ */
  console.log('%c🏛️ HM Architect — Website Ready', 'color:#C9A14A;font-size:14px;font-weight:bold;');

}); // END DOMContentLoaded
