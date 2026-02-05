(() => {
  const body = document.body;
  const revealItems = Array.from(document.querySelectorAll('.reveal'));
  const navLinks = Array.from(document.querySelectorAll('.nav a'));

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
})();
