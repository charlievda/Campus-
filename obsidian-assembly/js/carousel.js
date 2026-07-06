function initCarousel(root) {
  const slides = root.querySelectorAll('.carousel-slide');
  const prev = root.querySelector('.carousel-prev');
  const next = root.querySelector('.carousel-next');
  const current = root.querySelector('.carousel-current');
  let index = 0;

  function render() {
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    if (current) current.textContent = index + 1;
  }

  prev.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    render();
  });

  next.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    render();
  });

  render();
}

document.querySelectorAll('.carousel').forEach(initCarousel);
