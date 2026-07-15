(function () {
  gsap.registerPlugin(ScrollTrigger);
  // iOS Safari's address bar/toolbar resizes the viewport as you scroll,
  // which makes the native 1vh unit jump around - this site has many
  // 400vh/600vh scroll-driven sections that need a stable vh. Measure it
  // in JS instead and let ignoreMobileResize skip the toolbar-only resize
  // events (width unchanged) so ScrollTrigger doesn't thrash on every
  // address-bar show/hide.
  ScrollTrigger.config({ ignoreMobileResize: true });
  function setVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  var html = document.documentElement;
  var EASE = {
    cubic: 'cubic-bezier(0.35,0.35,0,1)',
    cubicIn: 'cubic-bezier(0.69,0,0,1)',
    fast: 'cubic-bezier(0.2,0.75,0.35,1)',
    smooth: 'cubic-bezier(0.5,0,0.3,1)'
  };

  /* ---------- text splitting ---------- */
  function wrapChars(el, mode) {
    var text = el.textContent;
    var frag = document.createDocumentFragment();
    var line = document.createElement('span');
    line.className = '-s-line';
    var chars = Array.from(text);
    chars.forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = '-s-char';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.setAttribute('data-split-content', ch === ' ' ? ' ' : ch);
      s.style.setProperty('--char-index', i);
      if (mode.indexOf('center') !== -1) {
        s.style.setProperty('--char-center', Math.abs(i - (chars.length - 1) / 2));
      }
      if (mode.indexOf('random') !== -1) {
        s.style.setProperty('--char-random', Math.floor(Math.random() * 10));
      }
      line.appendChild(s);
    });
    frag.appendChild(line);
    el.textContent = '';
    el.classList.add('-splitted');
    el.appendChild(frag);
  }

  function wrapWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    var frag = document.createDocumentFragment();
    var line = document.createElement('span');
    line.className = '-s-line';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = '-s-word';
      s.textContent = w;
      s.style.setProperty('--char-index', i);
      line.appendChild(s);
      line.appendChild(document.createTextNode(' '));
    });
    frag.appendChild(line);
    el.textContent = '';
    el.classList.add('-splitted');
    el.appendChild(frag);
  }

  function wrapLines(el) {
    var words = el.textContent.trim().split(/\s+/);
    var elWidth = el.getBoundingClientRect().width;
    var temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    // Constrain to the element's actual rendered width - without this an
    // absolutely-positioned temp span falls back to the viewport's width
    // as its containing block, so line breaks get measured against the
    // full page width instead of the (usually much narrower) column the
    // text really wraps in, and the real text overflows its container.
    temp.style.width = elWidth + 'px';
    temp.style.display = 'block';
    el.textContent = '';
    var wordSpans = words.map(function (w) {
      var s = document.createElement('span');
      s.style.display = 'inline-block';
      s.textContent = w + ' ';
      temp.appendChild(s);
      return s;
    });
    el.appendChild(temp);
    var lines = [];
    var currentTop = null;
    var currentLine = [];
    wordSpans.forEach(function (s) {
      var top = s.offsetTop;
      if (currentTop === null) currentTop = top;
      if (top !== currentTop) {
        lines.push(currentLine);
        currentLine = [];
        currentTop = top;
      }
      currentLine.push(s.textContent);
    });
    if (currentLine.length) lines.push(currentLine);
    el.removeChild(temp);
    var frag = document.createDocumentFragment();
    lines.forEach(function (words, li) {
      var lineEl = document.createElement('span');
      lineEl.className = '-s-line';
      lineEl.style.setProperty('--line-index', li);
      lineEl.textContent = words.join('');
      frag.appendChild(lineEl);
    });
    el.classList.add('-splitted');
    el.appendChild(frag);
  }

  function initSplit() {
    document.querySelectorAll('[data-string-split]').forEach(function (el) {
      var mode = el.getAttribute('data-string-split');
      if (mode.indexOf('char') !== -1) wrapChars(el, mode);
      else if (mode === 'line|word') wrapWords(el);
      else if (mode.indexOf('word') !== -1) wrapWords(el);
      else if (mode.indexOf('line') !== -1) wrapLines(el);
    });
  }

  /* ---------- viewport reveal ---------- */
  function initReveal() {
    var selfDisableSeen = new WeakSet();
    var targets = document.querySelectorAll('.-a-to-top, .-a-to-bottom, .-a-p, .-splitted');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var repeat = el.closest('[data-string-repeat]') && !el.hasAttribute('data-string-self-disable') && !el.closest('[data-string-self-disable]');
        if (entry.isIntersecting) {
          el.classList.add('-inview');
        } else if (repeat) {
          el.classList.remove('-inview');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- parallax ---------- */
  function initParallax() {
    document.querySelectorAll('[data-string~="parallax"]').forEach(function (el) {
      var factor = parseFloat(el.getAttribute('data-string-parallax')) || 0.1;
      gsap.to(el, {
        yPercent: factor * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  /* ---------- cursor-follow hero path + spotlight ---------- */
  function initCursorEffects() {
    var welcome = document.querySelector('.c-welcome');
    var path = document.querySelector('.welcome-path');
    var stone = document.querySelector('.c-welcome .stone');
    if (!welcome) return;
    welcome.addEventListener('mousemove', function (e) {
      var r = welcome.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      if (path) {
        gsap.to(path, { duration: 0.6, skewX: x * 6, skewY: y * 3, ease: 'power2.out' });
      }
      if (stone) {
        var angle = Math.atan2(y, x) * (180 / Math.PI);
        var distance = Math.sqrt(x * x + y * y) * 1000;
        stone.style.setProperty('--spotlight-angle', angle.toFixed(2));
        stone.style.setProperty('--spotlight-distance', distance.toFixed(2));
      }
    });
  }

  /* ---------- sequence controller ---------- */
  var sequencers = {};
  function getSequencer(id) {
    if (!sequencers[id]) {
      sequencers[id] = {
        id: id,
        step: 0,
        max: document.querySelectorAll('[data-string-sequence-trigger^="' + id + '["], [data-string-sequence^="' + id + '["]').length ? null : 0,
        listeners: []
      };
    }
    return sequencers[id];
  }

  function collectSequenceSteps(id) {
    var steps = new Set();
    document.querySelectorAll('[data-string-sequence-trigger], [data-string-sequence]').forEach(function (el) {
      ['data-string-sequence-trigger', 'data-string-sequence'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v && v.indexOf(id + '[') === 0) {
          var inner = v.slice(id.length + 1, -1);
          var n = parseInt(inner, 10);
          if (!isNaN(n)) steps.add(n);
        }
      });
    });
    return steps.size ? Math.max.apply(null, Array.from(steps)) + 1 : 1;
  }

  function setSequenceStep(id, step) {
    var seq = getSequencer(id);
    var count = collectSequenceSteps(id);
    if (step === 'next') step = (seq.step + 1) % count;
    else if (step === 'prev') step = (seq.step - 1 + count) % count;
    seq.step = step;
    document.querySelectorAll('[data-string-sequence="' + id + '[' + step + ']"]').forEach(function (el) {
      el.classList.add('-active');
    });
    document.querySelectorAll('[data-string-sequence^="' + id + '["]').forEach(function (el) {
      var v = el.getAttribute('data-string-sequence');
      if (v !== id + '[' + step + ']') el.classList.remove('-active');
    });
    document.querySelectorAll('[data-string-sequence-trigger="' + id + '[' + step + ']"]').forEach(function (el) {
      el.classList.add('-active');
    });
    document.querySelectorAll('[data-string-sequence-trigger^="' + id + '["]').forEach(function (el) {
      var v = el.getAttribute('data-string-sequence-trigger');
      if (v && v !== id + '[' + step + ']' && v.indexOf('prev') === -1 && v.indexOf('next') === -1) {
        el.classList.remove('-active');
      }
    });
    document.querySelectorAll('.sequence-controller, .sequence-canvas, [data-string-active-step^="' + id + '["]').forEach(function (el) {
      var attr = el.getAttribute('data-string-active-step');
      if (attr) el.setAttribute('data-string-active-step', id + '[' + step + ']');
    });
  }

  function initSequences() {
    var ids = new Set();
    document.querySelectorAll('[data-string-sequence-trigger], [data-string-sequence], [data-string-active-step]').forEach(function (el) {
      ['data-string-sequence-trigger', 'data-string-sequence', 'data-string-active-step'].forEach(function (attr) {
        var v = el.getAttribute(attr);
        if (v) {
          var m = v.match(/^([\w-]+)\[/);
          if (m) ids.add(m[1]);
        }
      });
    });
    ids.forEach(function (id) {
      var startEl = document.querySelector('[data-string-active-step^="' + id + '["]');
      var start = 0;
      if (startEl) {
        var m = startEl.getAttribute('data-string-active-step').match(/\[(\d+)\]/);
        if (m) start = parseInt(m[1], 10);
      }
      setSequenceStep(id, start);
    });
    document.querySelectorAll('[data-string-sequence-trigger]').forEach(function (el) {
      var v = el.getAttribute('data-string-sequence-trigger');
      var m = v.match(/^([\w-]+)\[(.+)\]$/);
      if (!m) return;
      var id = m[1], token = m[2];
      if (token.indexOf('prev') !== -1 || token.indexOf('next') !== -1) {
        el.addEventListener('click', function () {
          setSequenceStep(id, token.indexOf('prev') !== -1 ? 'prev' : 'next');
          updatePlacesLabel();
        });
      } else if (el.tagName === 'SPAN' || el.tagName === 'BUTTON') {
        el.addEventListener('click', function () {
          setSequenceStep(id, parseInt(token, 10));
          updatePlacesLabel();
        });
      }
    });
  }

  var placeNames = ['Marketplace', 'Gigs', 'Messages', 'Wallet'];
  function updatePlacesLabel() {
    var seq = sequencers['places-sequencer'];
    if (!seq) return;
    var label = document.querySelector('.c-places .place-name span');
    var order = document.querySelector('.c-places .sequesnce-nav .order span span:first-child');
    if (label) label.textContent = placeNames[seq.step] || 'Marketplace';
    if (order) order.textContent = seq.step + 1;
  }

  /* ---------- pinned scroll-scrubbed sections ---------- */
  function initPinnedSequences() {
    // Places: the sticky positioning is CSS-native (position:sticky on
    // .sticky-container, which sits in a 400vh-tall parent) - no GSAP
    // pin/spacer needed. We only need to scrub scroll progress across
    // that tall parent to pick the active step.
    var placesStickyParent = document.querySelector('.c-places .places-story .-w');
    if (placesStickyParent) {
      ScrollTrigger.create({
        trigger: placesStickyParent,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: function (self) {
          var count = collectSequenceSteps('places-sequencer');
          var step = Math.min(count - 1, Math.floor(self.progress * count));
          if (sequencers['places-sequencer'] && sequencers['places-sequencer'].step !== step) {
            setSequenceStep('places-sequencer', step);
            updatePlacesLabel();
          }
        }
      });
    }

    document.querySelectorAll('[data-string="progress"]').forEach(function (el) {
      var key = el.getAttribute('data-string-key') || '--progress';
      var offsetTop = el.getAttribute('data-string-offset-top') || '0%';
      var offsetBottom = el.getAttribute('data-string-offset-bottom') || '0%';
      // Sections already visible at page load (the hero) should start
      // their progress at 0 at rest, not partway through, since there's
      // nothing to "enter" - use top/top framing for those.
      var atTopOfPage = el.getBoundingClientRect().top + window.scrollY < 10;
      var start = atTopOfPage ? 'top top' : 'top bottom+=' + offsetTop;
      var end = atTopOfPage ? 'bottom top' : 'bottom top+=' + offsetBottom;
      // The Objects section title (sticky-container-1) spreads its two
      // words apart as this progress goes 0->1. The object cards should
      // stay in their spread-out, fading-in layout for that whole time,
      // then converge into the centered stacked cycle only once the
      // words have essentially finished spreading.
      var isObjectsTitle = el.classList.contains('sticky-container-1');
      var objectsSequence = isObjectsTitle ? document.querySelector('.c-objects .sequence') : null;
      ScrollTrigger.create({
        trigger: el,
        start: start,
        end: end,
        scrub: true,
        onUpdate: function (self) {
          document.documentElement.style.setProperty(key, self.progress.toFixed(4));
          el.style.setProperty(key, self.progress.toFixed(4));
          if (objectsSequence) {
            objectsSequence.classList.toggle('-sequence-cards', self.progress > 0.85);
          }
        }
      });
    });

    var stickyContainer1 = document.querySelector('.sticky-container-1');
    if (stickyContainer1) {
      document.querySelectorAll('[data-string-part-of^="sticky-container-1["]').forEach(function (el) {
        var m = el.getAttribute('data-string-part-of').match(/\[([\d.]+)-([\d.]+)\]/);
        if (!m) return;
        var start = parseFloat(m[1]), end = parseFloat(m[2]);
        ScrollTrigger.create({
          trigger: stickyContainer1,
          start: 'top center',
          end: 'bottom center',
          scrub: true,
          onUpdate: function (self) {
            var local = gsap.utils.clamp(0, 1, (self.progress - start) / (end - start));
            el.style.setProperty('--local-progress', local.toFixed(4));
          }
        });
      });
    }

    initObjectsCardCycle();
  }

  var objectNames = ['Clothes & Rentals', 'Furniture', 'Textbooks & Books', 'Electronics', 'Accessories', 'Household Items'];
  function initObjectsCardCycle() {
    var container2 = document.querySelector('.sticky-container-2');
    var sequence = document.querySelector('.c-objects .sequence');
    var wrappers = document.querySelectorAll('.c-objects .object-wrapper');
    if (!container2 || !sequence || !wrappers.length) return;

    var baseOrders = Array.prototype.map.call(wrappers, function (el) {
      return parseInt(el.style.getPropertyValue('--order'), 10) || 0;
    });
    var count = wrappers.length;
    var label = document.querySelector('.c-objects .place-name');
    var orderNum = document.querySelector('.c-objects .sequesnce-nav .order span span:first-child');

    function setActive(index) {
      wrappers.forEach(function (el, i) {
        var seqOrder = baseOrders[i] - index;
        el.style.setProperty('--sequence-order', seqOrder);
        el.classList.toggle('-active', seqOrder === 0);
        el.classList.toggle('-under', seqOrder === 1);
      });
      if (label) label.textContent = objectNames[index] || objectNames[0];
      if (orderNum) orderNum.textContent = index + 1;
    }

    setActive(0);

    ScrollTrigger.create({
      trigger: container2,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var index = Math.min(count - 1, Math.floor(self.progress * count));
        setActive(index);
      }
    });
  }

  /* ---------- updates carousel ---------- */
  var updatesContent = [
    { status: 'Marketplace', title: 'Buy & Sell', caption: 'List anything from textbooks to furniture, and buy directly from verified students at your school.' },
    { status: 'Marketplace', title: 'Rent From Peers', caption: 'Skip the one-time purchase - rent formalwear, gear, and more straight from other students, then return it when you’re done.' },
    { status: 'Community', title: 'Founder & Ambassador Program', caption: 'Referral-driven programs reward the students helping Campus Plus+ grow at their own school.' },
    { status: 'Discovery', title: 'The Map', caption: 'Scan the map to see items and gigs available on your campus, visually, in real time.' },
    { status: 'Growth', title: '1 Campus to 200+', caption: 'Campus Plus+ has spread from a single campus to over 200 nationwide in just a few months.' }
  ];

  function initUpdatesCarousel() {
    var track = document.getElementById('updates-track');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll('.update-slide'));
    var count = slides.length;
    var statusEl = document.getElementById('update-status');
    var titleEl = document.getElementById('update-title');
    var captionEl = document.getElementById('update-caption');
    var dots = Array.prototype.slice.call(document.querySelectorAll('.updates-carousel .sequence-nav .num'));
    var current = 0;

    function render() {
      slides.forEach(function (slide, i) {
        var dist = i - current;
        if (dist > count / 2) dist -= count;
        if (dist < -count / 2) dist += count;
        slide.style.setProperty('--dist', dist);
        slide.style.setProperty('--absdist', Math.abs(dist));
      });
      dots.forEach(function (dot, i) { dot.classList.toggle('-active', i === current); });
      var data = updatesContent[current] || updatesContent[0];
      if (statusEl) statusEl.textContent = data.status;
      if (titleEl) titleEl.textContent = data.title;
      if (captionEl) captionEl.textContent = data.caption;
    }

    function goTo(index) {
      current = ((index % count) + count) % count;
      render();
    }

    var prevBtn = document.getElementById('updates-prev');
    var nextBtn = document.getElementById('updates-next');
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
    slides.forEach(function (slide, i) {
      slide.addEventListener('click', function () { goTo(i); });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    render();
  }

  /* ---------- header state ---------- */
  function initHeader() {
    var header = document.querySelector('header[data-v-81ce8483]');
    if (!header) return;
    var sections = document.querySelectorAll('[data-header-color]');
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function () {
        header.classList.toggle('-scrolled', window.scrollY > window.innerHeight * 0.6);
      }
    });
    sections.forEach(function (section) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80px',
        end: 'bottom 80px',
        onToggle: function (self) {
          if (self.isActive) {
            header.classList.toggle('-dark', section.getAttribute('data-header-color') === 'dark');
          }
        }
      });
    });
  }

  /* ---------- overlays: menu / form / modal ---------- */
  function openOverlay(el, enterClass, prefix) {
    el.style.setProperty('--top-position', window.scrollY);
    el.style.display = '';
    el.classList.add(prefix + '-enter-active');
    el.classList.add(prefix + '-enter-from');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.remove(prefix + '-enter-from');
      });
    });
    setTimeout(function () {
      el.classList.remove(prefix + '-enter-active');
    }, 2200);
  }
  function closeOverlay(el, prefix) {
    el.classList.add(prefix + '-leave-active');
    el.classList.add(prefix + '-leave-to');
    setTimeout(function () {
      el.style.display = 'none';
      el.classList.remove(prefix + '-leave-active', prefix + '-leave-to');
    }, 1600);
  }

  function initOverlays() {
    var menu = document.getElementById('site-menu');
    var form = document.getElementById('request-form');
    var modal = document.getElementById('submission-modal');

    document.querySelectorAll('.js-open-menu').forEach(function (btn) {
      btn.addEventListener('click', function () { openOverlay(menu, null, '-t-menu'); });
    });
    document.querySelectorAll('.js-close-menu').forEach(function (btn) {
      btn.addEventListener('click', function () { closeOverlay(menu, '-t-menu'); });
    });
    document.querySelectorAll('.js-open-form').forEach(function (btn) {
      btn.addEventListener('click', function () { openOverlay(form, null, '-t-form'); });
    });
    document.querySelectorAll('.js-close-form').forEach(function (btn) {
      btn.addEventListener('click', function () { closeOverlay(form, '-t-form'); });
    });
    document.querySelectorAll('.js-close-modal').forEach(function (btn) {
      btn.addEventListener('click', function () { closeOverlay(modal, '-t-submission'); });
    });
    document.querySelectorAll('.js-scroll-to').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var target = document.querySelector(btn.getAttribute('data-target'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- form validation ---------- */
  function validateField(field) {
    var container = field.closest('.field, .agreement');
    var errorBox = container ? container.querySelector('.string-errors') : null;
    var value = field.type === 'checkbox' ? field.checked : field.value.trim();
    var errors = [];
    if (field.hasAttribute('data-required') && !value) errors.push('This field is required');
    if (field.hasAttribute('data-min') && value.length < parseInt(field.getAttribute('data-min'), 10)) {
      errors.push('Minimum ' + field.getAttribute('data-min') + ' characters');
    }
    if (field.hasAttribute('data-email') && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push('Enter a valid email');
    }
    if (errorBox) errorBox.textContent = errors[0] || '';
    return errors.length === 0;
  }

  function initForms() {
    document.querySelectorAll('form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fields = form.querySelectorAll('[data-required], [data-email], [data-min]');
        var valid = true;
        fields.forEach(function (f) { if (!validateField(f)) valid = false; });
        if (valid) {
          var modal = document.getElementById('submission-modal');
          if (modal) {
            modal.style.display = '';
            form.reset();
          }
        }
      });
      form.querySelectorAll('input, textarea').forEach(function (field) {
        field.addEventListener('blur', function () { validateField(field); });
      });
    });
  }

  /* ---------- lazy image fade-in ---------- */
  function initLazyImages() {
    document.querySelectorAll('img.lazyLoad').forEach(function (img) {
      if (img.complete) {
        img.classList.add('-loaded');
      } else {
        img.addEventListener('load', function () { img.classList.add('-loaded'); });
      }
    });
  }

  /* ---------- page load transition ---------- */
  function initPageTransition() {
    var overlay = document.getElementById('page-transition');
    window.addEventListener('load', function () {
      requestAnimationFrame(function () {
        html.classList.add('-loaded');
        requestAnimationFrame(function () {
          html.classList.add('-ready');
          overlay.classList.add('-t-transition-leave-active');
          requestAnimationFrame(function () {
            overlay.classList.add('-t-transition-leave-to');
          });
          setTimeout(function () {
            overlay.style.display = 'none';
          }, 2000);
        });
      });
    });
    setTimeout(function () {
      if (!html.classList.contains('-loaded')) window.dispatchEvent(new Event('load'));
    }, 1500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSplit();
    initReveal();
    initParallax();
    initCursorEffects();
    initSequences();
    updatePlacesLabel();
    initPinnedSequences();
    initHeader();
    initOverlays();
    initForms();
    initLazyImages();
    initUpdatesCarousel();
    initPageTransition();
  });
})();
