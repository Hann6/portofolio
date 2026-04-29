(() => {
  const body = document.body;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const timeEl = document.getElementById('jakarta-time');
  const uptimeEl = document.getElementById('uptime');
  const toast = document.getElementById('toast');
  const contactForm = document.getElementById('contact-form');
  const counters = Array.from(document.querySelectorAll('[data-counter]'));
  const copyButtons = Array.from(document.querySelectorAll('[data-copy]'));
  const deployCards = Array.from(document.querySelectorAll('.deploy-card'));
  const yearEl = document.getElementById('footer-year');
  const footerTyper = document.getElementById('footer-typer');

  const startTime = Date.now();

  /* -------------------- Footer year -------------------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------------------- Reveal -------------------- */
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

  /* -------------------- Counters -------------------- */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* -------------------- Clock + uptime -------------------- */
  const pad = (n) => String(n).padStart(2, '0');
  const updateClocks = () => {
    if (timeEl) {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
      });
      timeEl.textContent = fmt.format(new Date());
    }
    if (uptimeEl) {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      uptimeEl.textContent = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}:${pad(sec % 60)}`;
    }
  };
  updateClocks();
  setInterval(updateClocks, 1000);

  /* -------------------- Toast -------------------- */
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = `▮ ${message}`;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  };

  /* -------------------- Form -------------------- */
  const params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') {
    showToast('PACKET DELIVERED');
    params.delete('sent');
    const q = params.toString();
    const next = `${window.location.pathname}${q ? `?${q}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', next);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const labelEl = submitButton ? submitButton.querySelector('.button-label') : null;
      const original = labelEl ? labelEl.textContent : '';
      if (submitButton) {
        submitButton.disabled = true;
        if (labelEl) labelEl.textContent = 'TRANSMITTING...';
      }
      try {
        const r = await fetch(contactForm.action, {
          method: 'POST', body: new FormData(contactForm),
          headers: { Accept: 'application/json' },
        });
        if (r.ok) {
          contactForm.reset();
          showToast('PACKET DELIVERED');
        } else {
          showToast('TRANSMIT FAILED // FALLBACK TO EMAIL');
        }
      } catch (e) {
        showToast('NETWORK DOWN // RETRY');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          if (labelEl) labelEl.textContent = original;
        }
      }
    });
  }

  /* -------------------- Copy -------------------- */
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`COPIED :: ${text}`);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast(`COPIED :: ${text}`); }
        catch { showToast('COPY FAILED'); }
        finally { document.body.removeChild(ta); }
      }
    });
  });

  /* -------------------- Nav active + smooth scroll -------------------- */
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
    const triggerY = window.scrollY + 160;
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
    });
  });

  window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
  window.addEventListener('resize', updateActiveFromScroll);
  updateActiveFromScroll();

  /* -------------------- Deploy spotlight -------------------- */
  deployCards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', `${mx}%`);
      card.style.setProperty('--my', `${my}%`);
    });
  });

  /* -------------------- Footer typer -------------------- */
  if (footerTyper) {
    const lines = [
      ' ./ping --hello',
      ' ./deploy --target=production',
      ' ./debug --root-cause',
      ' ./ship --confidently',
    ];
    let li = 0, ci = 0, deleting = false;
    const tick = () => {
      const line = lines[li];
      if (!deleting) {
        ci += 1;
        footerTyper.textContent = line.slice(0, ci);
        if (ci >= line.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        ci -= 1;
        footerTyper.textContent = line.slice(0, ci);
        if (ci <= 0) { deleting = false; li = (li + 1) % lines.length; }
      }
      setTimeout(tick, deleting ? 30 : 60);
    };
    tick();
  }

  /* -------------------- Cyberpunk canvas: grid floor + matrix rain -------------------- */
  if (canvas && ctx) {
    let W = 0, H = 0;
    let DPR = window.devicePixelRatio || 1;
    const rainCols = [];
    const KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHJKLMNPQRSTUVWXYZ0123456789'.split('');

    const resize = () => {
      DPR = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const colW = 18;
      const cols = Math.ceil(W / colW);
      rainCols.length = 0;
      for (let i = 0; i < cols; i++) {
        rainCols.push({
          x: i * colW + colW / 2,
          y: Math.random() * -H,
          speed: 1 + Math.random() * 2.4,
          len: 6 + Math.floor(Math.random() * 14),
          chars: Array.from({ length: 24 }, () => KATA[Math.floor(Math.random() * KATA.length)]),
          tick: 0,
        });
      }
    };

    const drawGridFloor = (time) => {
      ctx.save();
      const horizon = H * 0.65;
      const vp = W / 2;
      ctx.strokeStyle = 'rgba(0, 246, 255, 0.18)';
      ctx.lineWidth = 1;

      // perspective horizontal lines
      const offset = (time * 0.04) % 40;
      for (let i = 0; i < 18; i++) {
        const t = (i * 40 + offset) / 720;
        const y = horizon + (H - horizon) * t * t;
        if (y > H) break;
        const alpha = Math.max(0, 0.45 - t * 0.45);
        ctx.strokeStyle = `rgba(0, 246, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // perspective vertical lines
      const cols = 24;
      for (let i = -cols; i <= cols; i++) {
        const xBottom = vp + (i / cols) * W * 1.6;
        ctx.strokeStyle = `rgba(255, 42, 157, ${0.10 + Math.abs(i) * 0.005})`;
        ctx.beginPath();
        ctx.moveTo(vp, horizon);
        ctx.lineTo(xBottom, H);
        ctx.stroke();
      }

      // horizon line
      ctx.strokeStyle = 'rgba(0, 246, 255, 0.55)';
      ctx.shadowColor = 'rgba(0, 246, 255, 0.6)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      ctx.lineTo(W, horizon);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // sun-ish gradient above horizon
      const gradY = horizon - 220;
      const g = ctx.createRadialGradient(vp, horizon - 60, 0, vp, horizon - 60, 240);
      g.addColorStop(0, 'rgba(255, 42, 157, 0.22)');
      g.addColorStop(1, 'rgba(255, 42, 157, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(vp - 280, gradY, 560, 280);

      ctx.restore();
    };

    const drawRain = () => {
      ctx.save();
      ctx.font = '14px "VT323", monospace';
      rainCols.forEach((c) => {
        c.tick += 1;
        if (c.tick % 4 === 0) {
          c.chars.unshift(KATA[Math.floor(Math.random() * KATA.length)]);
          c.chars.pop();
        }
        for (let i = 0; i < c.len; i++) {
          const ch = c.chars[i] || '?';
          const y = c.y - i * 14;
          if (y < -14 || y > H + 14) continue;
          if (i === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = 'rgba(0, 246, 255, 0.8)';
            ctx.shadowBlur = 8;
          } else {
            const alpha = 0.5 - (i / c.len) * 0.5;
            ctx.fillStyle = `rgba(0, 246, 255, ${alpha})`;
            ctx.shadowBlur = 0;
          }
          ctx.fillText(ch, c.x, y);
        }
        c.y += c.speed;
        if (c.y - c.len * 14 > H) {
          c.y = -Math.random() * 200;
          c.speed = 1 + Math.random() * 2.4;
          c.len = 6 + Math.floor(Math.random() * 14);
        }
      });
      ctx.restore();
    };

    const tick = (time) => {
      ctx.clearRect(0, 0, W, H);
      drawGridFloor(time || 0);
      drawRain();
      requestAnimationFrame(tick);
    };

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(tick);
  }
})();
