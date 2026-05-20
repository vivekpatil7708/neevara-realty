(function () {
  'use strict';

  /* ===== CUSTOM CURSOR ===== */
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  if (dot && ring) {
    var mouseX = 0, mouseY = 0;
    var ringX = 0, ringY = 0;
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });
    function lagCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(lagCursor);
    }
    lagCursor();
    document.querySelectorAll('a, button, .floorplan-image-wrapper, .gallery-item, .project-card, .amenity-card, .pillar, .spec-card, input, textarea').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
    });
  }

  /* ===== NAV SCROLL ===== */
  var nav = document.getElementById('siteNav');
  if (nav) {
    function onScroll() {
      if (window.scrollY > 60) { nav.classList.add('scrolled'); }
      else { nav.classList.remove('scrolled'); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ===== MOBILE NAV TOGGLE ===== */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
      });
    });
  }

  /* ===== SCROLL REVEAL ===== */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ===== ANIMATED COUNTERS ===== */
  var counterEls = document.querySelectorAll('.counter-num, .hero-stat-num');
  if (counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count') || el.getAttribute('data-target')) || 0;
          if (target === 0) return;
          var current = 0;
          var increment = Math.ceil(target / 60);
          function tick() {
            current += increment;
            if (current > target) current = target;
            el.textContent = current;
            if (current < target) requestAnimationFrame(tick);
          }
          tick();
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ===== HERO CAROUSEL (Project page) ===== */
  var slider = document.getElementById('heroSlider');
  var dots = document.querySelectorAll('.hero-dot');
  if (slider && dots.length) {
    var slides = slider.querySelectorAll('.project-hero-slide');
    var current = 0;
    var interval;
    function goToSlide(idx) {
      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === idx);
        var vid = s.querySelector('video');
        if (vid) {
          if (i === idx) { vid.currentTime = 0; vid.play(); }
          else { vid.pause(); }
        }
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === idx);
      });
      current = idx;
    }
    function nextSlide() {
      goToSlide((current + 1) % slides.length);
    }
    function startCarousel() {
      interval = setInterval(nextSlide, 5000);
    }
    function stopCarousel() {
      clearInterval(interval);
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopCarousel();
        goToSlide(parseInt(dot.getAttribute('data-slide')));
        startCarousel();
      });
    });
    if (slides.length > 1) startCarousel();
  }

  /* ===== FLOOR PLAN TABS ===== */
  var tabs = document.querySelectorAll('.floorplan-tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var idx = parseInt(tab.getAttribute('data-tab'));
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        document.querySelectorAll('.floorplan-panel').forEach(function (p) {
          p.classList.remove('active');
        });
        var panel = document.querySelector('.floorplan-panel[data-panel="' + idx + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  /* ===== LIGHTBOX ===== */
  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close">&times;</button><div class="lightbox-content"></div>';
  document.body.appendChild(lightbox);
  var lightboxContent = lightbox.querySelector('.lightbox-content');
  var lightboxClose = lightbox.querySelector('.lightbox-close');
  var lightboxImg;

  function openLightbox(src) {
    lightboxImg = document.createElement('img');
    lightboxImg.src = src;
    lightboxImg.alt = 'Floor Plan';
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(lightboxImg);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  document.querySelectorAll('.floorplan-image-wrapper').forEach(function (wrapper) {
    wrapper.addEventListener('click', function () {
      var el = wrapper.querySelector('.floorplan-image');
      if (el) {
        var match = el.style.backgroundImage && el.style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
        if (match) openLightbox(match[1]);
      }
    });
  });

  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var el = item.querySelector('.gallery-image');
      if (el) {
        var match = el.style.backgroundImage && el.style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
        if (match) openLightbox(match[1]);
      }
    });
  });

  /* ===== FORM HANDLING ===== */
  function handleFormSubmit(form, msgEl) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var body = {};
      data.forEach(function (v, k) { body[k] = v; });
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      msgEl.className = 'form-msg';
      msgEl.textContent = '';
      fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        msgEl.textContent = res.message;
        msgEl.className = res.success ? 'form-msg success' : 'form-msg error';
        if (res.success) form.reset();
      })
      .catch(function () {
        msgEl.textContent = 'Something went wrong. Please try again.';
        msgEl.className = 'form-msg error';
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = body.project ? 'Enquire Now' : 'Book a Site Visit';
      });
    });
  }

  var ctaForm = document.getElementById('ctaForm');
  var ctaMsg = document.getElementById('ctaFormMsg');
  if (ctaForm && ctaMsg) handleFormSubmit(ctaForm, ctaMsg);

  var enquiryForm = document.getElementById('projectEnquiryForm');
  var enquiryMsg = document.getElementById('enquiryMsg');
  if (enquiryForm && enquiryMsg) handleFormSubmit(enquiryForm, enquiryMsg);

  var projectForm = document.getElementById('projectContactForm');
  var projectMsg = document.getElementById('projectFormMsg');
  if (projectForm && projectMsg) handleFormSubmit(projectForm, projectMsg);

})();
