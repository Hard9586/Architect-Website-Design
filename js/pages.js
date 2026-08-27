/* ============================================================
   PAGES.JS — HM Architect Sub-Page JavaScript
   Handles: FAQ, Project Tabs, Gallery Filter, Before-After
   Slider, Progress Bars, Timeline, Services Quick Nav,
   Masonry Lightbox, Scroll Reveals for new page elements
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ==========================================================
     1. FOOTER YEAR (shared with script.js — safe to re-run)
  ========================================================== */
  const yr = document.getElementById('currentYear');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ==========================================================
     2. FAQ ACCORDION
  ========================================================== */
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const body     = item.querySelector('.faq-body');
    if (!question || !body) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const ob = other.querySelector('.faq-body');
          if (ob) ob.style.maxHeight = '0';
        }
      });

      // Toggle current
      item.classList.toggle('open', !isOpen);
      body.style.maxHeight = isOpen ? '0' : body.scrollHeight + 'px';
    });

    // Keyboard
    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ==========================================================
     3. PROJECT TABS (Past / Ongoing / Future)
  ========================================================== */
  const tabBtns  = $$('.tab-btn');
  const tabPanes = $$('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');

      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      tabPanes.forEach(pane => {
        const active = pane.id === `${target}-tab`;
        pane.classList.toggle('active', active);
      });

      // Trigger progress bars when ongoing tab becomes visible
      if (target === 'ongoing') {
        setTimeout(animateProgressBars, 150);
      }
    });
  });

  /* ==========================================================
     4. PROGRESS BAR ANIMATIONS (Intersection + tab trigger)
  ========================================================== */
  function animateProgressBars() {
    $$('.progress-fill').forEach(fill => {
      const target = fill.getAttribute('data-progress');
      if (target) {
        fill.style.width = target + '%';
      }
    });
  }

  const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateProgressBars();
        progressObserver.disconnect();
      }
    });
  }, { threshold: 0.15 });

  const progressSection = document.querySelector('.ongoing-grid');
  if (progressSection) progressObserver.observe(progressSection);

  /* ==========================================================
     5. TIMELINE REVEAL (Intersection Observer)
  ========================================================== */
  const tlItems = $$('.timeline-item');
  if (tlItems.length) {
    let tlDelay = 0;
    const tlObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const i  = tlItems.indexOf(el);
          setTimeout(() => el.classList.add('revealed'), i * 80);
          tlObserver.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    tlItems.forEach(el => tlObserver.observe(el));
  }

  /* ==========================================================
     6. TEAM CARD STAGGERED REVEAL
  ========================================================== */
  const teamCards = $$('.team-card');
  if (teamCards.length) {
    const teamObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = teamCards.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('revealed'), i * 100);
          teamObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    teamCards.forEach(card => teamObserver.observe(card));
  }

  /* ==========================================================
     7. MASONRY ITEM STAGGERED REVEAL
  ========================================================== */
  const masonryItems = $$('.masonry-item');
  if (masonryItems.length) {
    const masonryObserver = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), i * 60);
          masonryObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
    masonryItems.forEach(item => masonryObserver.observe(item));
  }

  /* ==========================================================
     8. GALLERY PAGE FILTER
  ========================================================== */
  const gfBtns  = $$('.gf-btn');
  const gfItems = $$('.masonry-item');

  gfBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-gfilter');

      gfBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      gfItems.forEach(item => {
        const cat = item.getAttribute('data-gcat');
        const show = filter === 'all' || cat === filter;
        item.style.display = show ? 'block' : 'none';
        if (show) {
          item.style.animation = 'filterFadeIn 0.4s ease forwards';
        }
      });
    });
  });

  /* ==========================================================
     9. GALLERY PAGE LIGHTBOX (for gallery.html masonry grid)
  ========================================================== */
  const lightbox         = document.getElementById('lightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg      = document.getElementById('lightboxImg');
  const lightboxClose    = document.getElementById('lightboxClose');
  const lightboxPrev     = document.getElementById('lightboxPrev');
  const lightboxNext     = document.getElementById('lightboxNext');
  const lightboxCounter  = document.getElementById('lightboxCounter');

  // Only run on gallery.html (lightbox elements exist on that page)
  if (lightbox && masonryItems.length) {
    const galleryImages = masonryItems.map(item => item.getAttribute('data-src'));
    const total = galleryImages.length;
    let current = 0;

    function openLightbox(index) {
      current = ((index % total) + total) % total;
      lightboxImg.src = galleryImages[current];
      lightboxImg.alt = masonryItems[current].querySelector('img')?.getAttribute('alt') || '';
      if (lightboxCounter) lightboxCounter.textContent = `${current + 1} / ${total}`;
      lightbox.classList.add('active');
      lightboxBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      lightboxClose?.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightboxBackdrop.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { if (lightboxImg) lightboxImg.src = ''; }, 400);
    }

    function goPrev() {
      current = (current - 1 + total) % total;
      lightboxImg.src = galleryImages[current];
      if (lightboxCounter) lightboxCounter.textContent = `${current + 1} / ${total}`;
    }

    function goNext() {
      current = (current + 1) % total;
      lightboxImg.src = galleryImages[current];
      if (lightboxCounter) lightboxCounter.textContent = `${current + 1} / ${total}`;
    }

    masonryItems.forEach((item, i) => {
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
      });
    });

    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxBackdrop?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', goPrev);
    lightboxNext?.addEventListener('click', goNext);

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    });

    // Touch swipe
    let touchX = 0;
    lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
      const diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
    }, { passive: true });
  }

  /* ==========================================================
     10. BEFORE & AFTER SLIDER
  ========================================================== */
  const baWrapper   = document.getElementById('baWrapper');
  const baAfterArea = document.getElementById('baAfterArea');
  const baLine      = document.getElementById('baLine');
  const baHandle    = document.getElementById('baHandle');

  if (baWrapper && baAfterArea && baLine && baHandle) {
    let isDragging = false;

    function setPosition(pct) {
      pct = Math.max(2, Math.min(98, pct));
      baAfterArea.style.clipPath   = `inset(0 ${100 - pct}% 0 0)`;
      baLine.style.left            = pct + '%';
      baHandle.style.left          = pct + '%';
    }

    function getPercent(clientX) {
      const rect = baWrapper.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    }

    // Mouse events
    baHandle.addEventListener('mousedown', e => { isDragging = true; e.preventDefault(); });
    document.addEventListener('mousemove', e => {
      if (isDragging) setPosition(getPercent(e.clientX));
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
    baWrapper.addEventListener('click', e => setPosition(getPercent(e.clientX)));

    // Touch events
    baHandle.addEventListener('touchstart', e => { isDragging = true; e.preventDefault(); }, { passive: false });
    document.addEventListener('touchmove', e => {
      if (isDragging) setPosition(getPercent(e.touches[0].clientX));
    }, { passive: true });
    document.addEventListener('touchend', () => { isDragging = false; });
  }

  /* ==========================================================
     11. SERVICES QUICK NAV — Active State on Scroll
  ========================================================== */
  const quickNavLinks = $$('.quick-nav-link');
  if (quickNavLinks.length) {
    const serviceIds = quickNavLinks.map(link => {
      const href = link.getAttribute('href');
      return href?.replace('#', '');
    });

    const serviceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          quickNavLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    serviceIds.forEach(id => {
      const el = id ? document.getElementById(id) : null;
      if (el) serviceObserver.observe(el);
    });
  }

  /* ==========================================================
     12. ANIMATED COUNTERS — for per-page stat numbers
         (complements the one in script.js if any overlap)
  ========================================================== */
  const pageCounters = $$('.mega-num[data-target], .gstat-item .num[data-target]');

  if (pageCounters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = +el.getAttribute('data-target');
        if (!target) return;
        const duration   = 1800;
        const frameTime  = 1000 / 60;
        const frames     = Math.round(duration / frameTime);
        let frame = 0;
        const timer = setInterval(() => {
          frame++;
          const eased = 1 - Math.pow(1 - frame / frames, 3);
          el.textContent = Math.floor(eased * target);
          if (frame >= frames) { el.textContent = target; clearInterval(timer); }
        }, frameTime);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.6 });

    pageCounters.forEach(el => counterObserver.observe(el));
  }

  /* ==========================================================
     13. VALUE CARD, AWARD CARD, PROCESS STEP REVEAL
  ========================================================== */
  function staggerReveal(selector, cls = 'revealed', delay = 80) {
    const els = $$(selector);
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const i = els.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add(cls), i * delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => obs.observe(el));
  }

  // ---- Entrance animation for card-type elements ----
  const REVEAL_SELECTORS = [
    '.value-card', '.award-card', '.process-step',
    '.past-project-card', '.future-card', '.ongoing-card'
  ].join(', ');

  // Set initial hidden state via inline styles
  $$(REVEAL_SELECTORS).forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(22px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });

  const revealGeneric = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const siblings = Array.from(el.parentElement?.children || [])
                            .filter(c => c.matches(REVEAL_SELECTORS));
      const delay = siblings.indexOf(el) * 70;

      setTimeout(() => {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
        // After entrance completes, clear inline styles so CSS hover
        // transitions (border-color, box-shadow, all) resume normally
        setTimeout(() => {
          el.style.opacity    = '';
          el.style.transform  = '';
          el.style.transition = '';
        }, 700);
      }, delay);

      revealGeneric.unobserve(el);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$(REVEAL_SELECTORS).forEach(el => revealGeneric.observe(el));

  /* ==========================================================
     14. VIDEO WRAP — Click to open YouTube (placeholder)
  ========================================================== */
  const videoWrap = document.getElementById('videoWrap');
  if (videoWrap) {
    videoWrap.addEventListener('click', () => {
      // Replace with actual YouTube embed URL when available
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
      iframe.allow = 'autoplay; encrypted-media';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;border-radius:var(--radius-lg);';
      videoWrap.style.position = 'relative';
      videoWrap.appendChild(iframe);
      videoWrap.querySelector('.video-overlay').style.display = 'none';
      videoWrap.querySelector('.video-thumb').style.display = 'none';
    });
  }

  /* ==========================================================
     15. CSS KEYFRAMES INJECTION
  ========================================================== */
  if (!document.getElementById('pages-keyframes')) {
    const style = document.createElement('style');
    style.id = 'pages-keyframes';
    style.textContent = `
      @keyframes filterFadeIn {
        from { opacity: 0; transform: scale(0.96) translateY(10px); }
        to   { opacity: 1; transform: scale(1)    translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ==========================================================
     INIT COMPLETE
  ========================================================== */
  console.log('%c📄 HM Architect — Page JS Loaded', 'color:#C9A14A; font-size:13px; font-weight:600;');

});
