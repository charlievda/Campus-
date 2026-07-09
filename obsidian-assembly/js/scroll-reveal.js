(function () {
  const fadeSelectors = [
    '.display-heading', '.sub-heading', '.eyebrow-heading', '.eyebrow',
    '.objects-sub', '.body-copy', '.see-nearby', '.hero-coord', '.hero-private',
    '.hero-commitment', '.footer-intro', '.footer-repeat', '.footer-legal',
    '.footer-copyright', '.footer-credit', '.btn', '.update-kind',
    '.update-title', '.footer-links a', '.update-card'
  ];
  const cascadeSelectors = ['.teaser-stack', '.origin-thumbs'];
  const scaleSelectors = ['.connection-bg', '.founder-photo', '.founder-photo-wide', '.formed-by-portrait'];

  const fadeEls = document.querySelectorAll(fadeSelectors.join(','));
  const cascadeEls = document.querySelectorAll(cascadeSelectors.join(','));
  const scaleEls = document.querySelectorAll(scaleSelectors.join(','));

  fadeEls.forEach((el) => el.classList.add('reveal'));
  cascadeEls.forEach((el) => el.classList.add('cascade'));
  scaleEls.forEach((el) => el.classList.add('reveal-scale'));

  const allEls = [...fadeEls, ...cascadeEls, ...scaleEls];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    allEls.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  );

  allEls.forEach((el) => observer.observe(el));
})();
