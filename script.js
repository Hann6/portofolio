(() => {
  const body = document.body;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const mouse = { x: 0, y: 0, active: false };
  const dots = [];

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

  const clearActive = () => {
    navLinks.forEach((link) => link.classList.remove('is-active'));
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

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
