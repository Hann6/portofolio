(() => {
  const body = document.body;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const timeValue = document.getElementById('jakarta-time');
  const timeDate = document.getElementById('jakarta-date');
  const toast = document.getElementById('toast');
  const mouse = { x: 0, y: 0, active: false };
  const dots = [];
  const blobs = [
    { x: 0.15, y: 0.2, r: 260, hue: 24, speed: 0.0007 },
    { x: 0.45, y: 0.3, r: 220, hue: 18, speed: 0.001 },
    { x: 0.75, y: 0.25, r: 240, hue: 30, speed: 0.0009 },
    { x: 0.2, y: 0.7, r: 280, hue: 22, speed: 0.0008 },
    { x: 0.6, y: 0.7, r: 260, hue: 28, speed: 0.0011 },
  ];

  const onIntersect = (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(onIntersect, {
      threshold: 0.15,
    });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  window.addEventListener('load', () => {
    body.classList.remove('preload');
    requestAnimationFrame(() => {
      revealItems.forEach((item, index) => {
        if (item.classList.contains('is-visible')) return;
        item.style.transitionDelay = `${index * 60}ms`;
        item.classList.add('is-visible');
      });
    });
  });

  const updateJakartaTime = () => {
    if (!timeValue || !timeDate) return;
    const now = new Date();
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
    });
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    timeValue.textContent = timeFormatter.format(now);
    timeDate.textContent = dateFormatter.format(now);
  };

  updateJakartaTime();
  setInterval(updateJakartaTime, 1000);

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4000);
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    showToast('Your message has been sent.');
    params.delete('sent');
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', nextUrl);
  }

  const clearActive = () => {
    navLinks.forEach((link) => link.classList.remove('is-active'));
  };

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
      if (section.offsetTop <= triggerY) {
        current = link;
      }
    });

    clearActive();
    current.classList.add('is-active');
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
    });
  });

  window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
  window.addEventListener('resize', updateActiveFromScroll);
  updateActiveFromScroll();

  if (canvas && ctx) {
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const seedDots = () => {
      dots.length = 0;
      const count = Math.min(120, Math.floor(window.innerWidth / 8));
      for (let i = 0; i < count; i += 1) {
        dots.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: 1 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: 0.12 + Math.random() * 0.18,
        });
      }
    };

    const tick = (time = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Soft gradient blobs
      blobs.forEach((blob, index) => {
        const drift = Math.sin(time * blob.speed + index) * 0.5 + 0.5;
        const driftX = (Math.cos(time * blob.speed * 1.4 + index) * 0.06) + blob.x;
        const driftY = (Math.sin(time * blob.speed * 1.1 + index) * 0.06) + blob.y;
        const offsetX = mouse.active ? (mouse.x / window.innerWidth - 0.5) * 60 : 0;
        const offsetY = mouse.active ? (mouse.y / window.innerHeight - 0.5) * 60 : 0;
        const centerX = driftX * window.innerWidth + offsetX;
        const centerY = driftY * window.innerHeight + offsetY;
        const radius = blob.r + drift * 40;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `hsla(${blob.hue}, 58%, 62%, 0.32)`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = 'rgba(201, 143, 95, 0.5)';
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
        const radius = 120;
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, radius);
        gradient.addColorStop(0, 'rgba(201, 143, 95, 0.25)');
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

    const onLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', () => {
      resize();
      seedDots();
    });

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
