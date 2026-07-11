// Campus+ — site interactions
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initAccordion();
  initScrollHero();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
});

/* ---------------- Nav ---------------- */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('is-open');
      document.body.style.overflow = '';
    }));
  }
}

/* ---------------- FAQ accordion ---------------- */
function initAccordion() {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.closest('.accordion').querySelectorAll('.accordion-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  // Open a panel directly if the URL hash targets it
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target && target.classList.contains('accordion-item')) {
      target.classList.add('is-open');
      const panel = target.querySelector('.accordion-panel');
      if (panel) panel.style.maxHeight = panel.scrollHeight + 'px';
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }
  }
}

/* ---------------- Scrollytelling video hero ----------------
   Structure expected in HTML:
   <section class="hero-scroll" style="--panels:3">
     <div class="hero-scroll__track">
       <div class="hero-scroll__stage">
         <div class="hero-scroll__media" data-panel="0">
           <video muted loop playsinline preload="metadata" src="..."></video>
           OR <div class="media-placeholder">...</div>
         </div>
         ... one per panel
         <div class="hero-scroll__scrim"></div>
         <div class="hero-scroll__intro">...(shown only before panel 0)</div>
         <div class="hero-scroll__panel" data-panel="0">...</div>
         ... one per panel
         <div class="hero-scroll__progress">...</div>
       </div>
     </div>
   </section>
------------------------------------------------------------- */
function initScrollHero() {
  const hero = document.querySelector('.hero-scroll');
  if (!hero) return;

  const track = hero.querySelector('.hero-scroll__track');
  const mediaEls = [...hero.querySelectorAll('.hero-scroll__media')];
  const panelEls = [...hero.querySelectorAll('.hero-scroll__panel')];
  const tabEls = [...hero.querySelectorAll('.hero-scroll__tab')];
  const progressEls = [...hero.querySelectorAll('.hero-scroll__progress span')];
  const panelCount = mediaEls.length || 1;

  let activeIndex = -1;

  const setActive = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;

    mediaEls.forEach((el, i) => {
      const isActive = i === index;
      el.classList.toggle('is-active', isActive);
      const video = el.querySelector('video');
      if (video) {
        if (isActive) {
          video.currentTime = 0;
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    });
    panelEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
    tabEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
    progressEls.forEach((el, i) => el.classList.toggle('is-active', i === index));
  };

  const introThreshold = 1 / (panelCount * 4); // fraction of track scrolled before panels take over

  const update = () => {
    const rect = track.getBoundingClientRect();
    const scrolled = -rect.top;
    const total = rect.height - window.innerHeight;
    const progress = Math.min(Math.max(scrolled / Math.max(total, 1), 0), 1);
    const index = Math.min(panelCount - 1, Math.floor(progress * panelCount));
    setActive(index);
    hero.classList.toggle('is-intro', progress < introThreshold);
  };

  hero.classList.add('is-intro');
  setActive(0);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
