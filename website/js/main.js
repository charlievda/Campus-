(function () {
  gsap.registerPlugin(ScrollTrigger);
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
    var temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
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

  var placeNames = ['Lower Hall', 'The Atrium', 'The Passage', 'Silent Room', 'The Threshold', 'The Vault', 'Back Space'];
  function updatePlacesLabel() {
    var seq = sequencers['places-sequencer'];
    if (!seq) return;
    var label = document.querySelector('.c-places .place-name span');
    var order = document.querySelector('.c-places .sequesnce-nav .order span span:first-child');
    if (label) label.textContent = placeNames[seq.step] || 'Silent Room';
    if (order) order.textContent = seq.step + 1;
  }

  /* ---------- pinned scroll-scrubbed sections ---------- */
  function initPinnedSequences() {
    var placesStory = document.querySelector('.c-places .places-story');
    if (placesStory) {
      ScrollTrigger.create({
        trigger: placesStory,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
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
      var easing = el.getAttribute('data-string-easing');
      var offsetTop = el.getAttribute('data-string-offset-top') || '0%';
      var offsetBottom = el.getAttribute('data-string-offset-bottom') || '0%';
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom+=' + offsetTop.replace('%', '%'),
        end: 'bottom top+=' + offsetBottom.replace('%', '%'),
        scrub: true,
        onUpdate: function (self) {
          document.documentElement.style.setProperty(key, self.progress.toFixed(4));
          el.style.setProperty(key, self.progress.toFixed(4));
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
            gsap.set(el, { opacity: 0.15 + local * 0.85, y: (1 - local) * 40 });
          }
        });
      });
    }
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
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.getAttribute('data-target'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------- form validation ---------- */
  function validateField(field) {
    var errorBox = field.closest('.field, .agreement').querySelector('.string-errors');
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
          modal.style.display = '';
          form.reset();
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
    initPageTransition();
  });
})();
