(function () {
  const slideshow = document.getElementById('campusSlideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.slideshow-img');
  if (slides.length < 2) return;

  let index = 0;
  const intervalMs = 3000;

  setInterval(() => {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }, intervalMs);
})();
