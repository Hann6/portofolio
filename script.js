(() => {
  const body = document.body;
  const root = document.documentElement;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const navLinks = Array.from(document.querySelectorAll('.nav a, .mobile-nav a'));
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const timeValue = document.getElementById('jakarta-time');
  const timeDate = document.getElementById('jakarta-date');
  const toast = document.getElementById('toast');
  const contactForm = document.getElementById('contact-form');
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('back-to-top');
  const yearEl = document.getElementById('footer-year');
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const rotatorWords = Array.from(document.querySelectorAll('.rotator-word'));
  const copyButtons = Array.from(document.querySelectorAll('[data-copy]'));
  const workCards = Array.from(document.querySelectorAll('.work-card'));

  const mouse = { x: 0, y: 0, active: false };
  const dots = [];
  const blobs = [
    { x: 0.15, y: 0.2, r: 280, hue: 24, speed: 0.0007 },
    { x: 0.5, y: 0.3, r: 230, hue: 18, speed: 0.001 },
    { x: 0.8, y: 0.25, r: 250, hue: 30, speed: 0.0009 },
    { x: 0.2, y: 0.75, r: 290, hue: 22, speed: 0.0008 },
    { x: 0.65, y: 0.7, r: 270, hue: 28, speed: 0.0011 },
  ];

  /* -------------------- Theme -------------------- */
  const THEME_KEY = 'ht-theme';
  const applyTheme = (theme) => {
    body.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1a1410' : '#f6f0e6');
  };

  const initTheme = () => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    } else {
      applyTheme('light');
    }
  };
  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = body.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  /* -------------------- Footer year -------------------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- Reveal on scroll -------------------- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  window.addEventListener('load', () => {
    body.classList.remove('preload');
    requestAnimationFrame(() => {
      revealItems.forEach((item, index) => {
        if (item.classList.contains('is-visible')) return;
        item.style.transitionDelay = `${index * 50}ms`;
        item.classList.add('is-visible');
      });
    });
  });

  /* -------------------- Animated counters -------------------- */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && counters.length) {
    const counterObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => counterObs.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* -------------------- Tagline rotator -------------------- */
  if (rotatorWords.length > 1) {
    let i = 0;
    setInterval(() => {
      rotatorWords[i].classList.remove('is-active');
      i = (i + 1) % rotatorWords.length;
      rotatorWords[i].classList.add('is-active');
    }, 2800);
  }

  /* -------------------- Jakarta clock -------------------- */
  const updateJakartaTime = () => {
    if (!timeValue || !timeDate) return;
    const now = new Date();
    const tFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit',
    });
    const dFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta', weekday: 'short', day: '2-digit', month: 'short',
    });
    timeValue.textContent = tFmt.format(now);
    timeDate.textContent = dFmt.format(now);
  };
  updateJakartaTime();
  setInterval(updateJakartaTime, 1000);

  /* -------------------- Toast -------------------- */
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  };

  /* -------------------- Form submit -------------------- */
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    showToast('Your message has been sent.');
    params.delete('sent');
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const labelEl = submitButton ? submitButton.querySelector('.button-label') : null;
      const originalLabel = labelEl ? labelEl.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        if (labelEl) labelEl.textContent = 'Sending...';
      }
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (response.ok) {
          contactForm.reset();
          showToast('Your message has been sent.');
        } else {
          showToast('Something went wrong. Please email me directly.');
        }
      } catch (error) {
        showToast('Network error. Please try again.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (labelEl) labelEl.textContent = originalLabel;
        }
      }
    });
  }

  /* -------------------- Click-to-copy -------------------- */
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied: ${text}`);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast(`Copied: ${text}`); }
        catch { showToast('Copy failed. Please select manually.'); }
        finally { document.body.removeChild(ta); }
      }
    });
  });

  /* -------------------- Nav active state + smooth scroll -------------------- */
  const clearActive = () => navLinks.forEach((l) => l.classList.remove('is-active'));

  const updateActiveFromScroll = () => {
    const sections = navLinks
      .map((link) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return null;
        const section = document.querySelector(href);
        if (!section) return null;
        return { link, section };
      })
      .filter(Boolean);
    if (!sections.length) return;
    const triggerY = window.scrollY + 140;
    let current = sections[0].link;
    sections.forEach(({ link, section }) => {
      if (section.offsetTop <= triggerY) current = link;
    });
    clearActive();
    if (current) current.classList.add('is-active');
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      clearActive();
      link.classList.add('is-active');
      closeMobileNav();
    });
  });

  /* -------------------- Mobile nav -------------------- */
  const openMobileNav = () => {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = false;
    requestAnimationFrame(() => mobileNav.classList.add('is-open'));
    menuToggle.setAttribute('aria-expanded', 'true');
  };
  const closeMobileNav = () => {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => { mobileNav.hidden = true; }, 250);
  };
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }
  document.addEventListener('click', (e) => {
    if (!mobileNav || mobileNav.hidden) return;
    if (mobileNav.contains(e.target) || menuToggle.contains(e.target)) return;
    closeMobileNav();
  });

  /* -------------------- Scroll progress + back-to-top -------------------- */
  const updateScrollProgress = () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docH > 0 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
    if (scrollProgress) scrollProgress.style.width = `${ratio * 100}%`;
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateActiveFromScroll();
  }, { passive: true });
  window.addEventListener('resize', () => {
    updateScrollProgress();
    updateActiveFromScroll();
  });
  updateScrollProgress();
  updateActiveFromScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------------------- Work card spotlight -------------------- */
  workCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
    });
  });

  /* -------------------- Canvas background -------------------- */
  if (canvas && ctx) {
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const seedDots = () => {
      dots.length = 0;
      const count = Math.min(110, Math.floor(window.innerWidth / 9));
      for (let i = 0; i < count; i += 1) {
        dots.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 1 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          alpha: 0.1 + Math.random() * 0.18,
        });
      }
    };

    const tick = (time = 0) => {
      const isDark = body.dataset.theme === 'dark';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      blobs.forEach((blob, index) => {
        const drift = Math.sin(time * blob.speed + index) * 0.5 + 0.5;
        const driftX = (Math.cos(time * blob.speed * 1.4 + index) * 0.06) + blob.x;
        const driftY = (Math.sin(time * blob.speed * 1.1 + index) * 0.06) + blob.y;
        const offsetX = mouse.active ? (mouse.x / window.innerWidth - 0.5) * 50 : 0;
        const offsetY = mouse.active ? (mouse.y / window.innerHeight - 0.5) * 50 : 0;
        const centerX = driftX * window.innerWidth + offsetX;
        const centerY = driftY * window.innerHeight + offsetY;
        const radius = blob.r + drift * 40;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        const sat = isDark ? 50 : 58;
        const light = isDark ? 50 : 62;
        const alpha = isDark ? 0.18 : 0.32;
        gradient.addColorStop(0, `hsla(${blob.hue}, ${sat}%, ${light}%, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = isDark ? 'rgba(224, 162, 116, 0.55)' : 'rgba(201, 143, 95, 0.5)';
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < -20) dot.x = window.innerWidth + 20;
        if (dot.x > window.innerWidth + 20) dot.x = -20;
        if (dot.y < -20) dot.y = window.innerHeight + 20;
        if (dot.y > window.innerHeight + 20) dot.y = -20;

        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const pull = mouse.active ? Math.max(0, 120 - dist) / 120 : 0;
        const size = dot.r + pull * 1.6;

        ctx.beginPath();
        ctx.globalAlpha = dot.alpha + pull * 0.25;
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (mouse.active) {
        ctx.globalAlpha = 0.15;
        const radius = 130;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
        const stop = isDark ? 'rgba(224, 162, 116, 0.32)' : 'rgba(201, 143, 95, 0.25)';
        gradient.addColorStop(0, stop);
        gradient.addColorStop(1, 'rgba(201, 143, 95, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };

    window.addEventListener('resize', () => { resize(); seedDots(); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', (event) => {
      if (!event.touches.length) return;
      onMove(event.touches[0]);
    });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('touchend', onLeave);

    resize();
    seedDots();
    requestAnimationFrame(tick);
  }
})();
