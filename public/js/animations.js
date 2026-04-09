/**
 * MeetMe Center — Animations
 * Scroll-triggered animations, counter, testimonial slider, course tabs
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════
  // INTERSECTION OBSERVER — Fade-in on scroll
  // ══════════════════════════════════════════

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function initScrollAnimations() {
    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(function(el) {
      observer.observe(el);
    });
  }

  // ══════════════════════════════════════════
  // COUNTER ANIMATION
  // ══════════════════════════════════════════

  function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    if (!target) return;

    const duration = 2000;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(easedProgress * target);

      // Preserve suffix spans
      const suffix = element.querySelector('.stat-suffix');
      const suffixHTML = suffix ? suffix.outerHTML : '';
      element.innerHTML = current.toLocaleString() + suffixHTML;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      counterObserver.observe(el);
    });
  }

  // ══════════════════════════════════════════
  // TESTIMONIAL SLIDER
  // ══════════════════════════════════════════

  function initTestimonialSlider() {
    const track     = document.getElementById('testimonials-track');
    const prevBtn   = document.getElementById('slider-prev');
    const nextBtn   = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    if (!track || !prevBtn || !nextBtn) return;

    const cards     = track.querySelectorAll('.card-testimonial');
    const totalCards = cards.length;
    let currentIndex = 0;
    let autoPlayInterval;

    function getVisibleCards() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function updateSlider() {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = Math.min(currentIndex, maxIndex);

      const cardWidth = cards[0] ? cards[0].offsetWidth : 300;
      const gap = 24; // matches var(--space-6)
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = 'translateX(-' + offset + 'px)';

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function goNext() {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateSlider();
    }

    function goPrev() {
      const visibleCards = getVisibleCards();
      const maxIndex = Math.max(0, totalCards - visibleCards);
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateSlider();
    }

    nextBtn.addEventListener('click', function() {
      goNext();
      resetAutoPlay();
    });

    prevBtn.addEventListener('click', function() {
      goPrev();
      resetAutoPlay();
    });

    // Dots click
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.slider-dot').forEach(function(dot, i) {
        dot.addEventListener('click', function() {
          currentIndex = i;
          updateSlider();
          resetAutoPlay();
        });
      });
    }

    // Auto-play
    function startAutoPlay() {
      autoPlayInterval = setInterval(goNext, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }

    // Responsive resize
    window.addEventListener('resize', function() {
      updateSlider();
    });

    updateSlider();
    startAutoPlay();
  }

  // ══════════════════════════════════════════
  // COURSE TABS FILTERING
  // ══════════════════════════════════════════

  function initCourseTabs() {
    const tabsContainer = document.getElementById('course-tabs');
    if (!tabsContainer) return;

    const tabBtns = tabsContainer.querySelectorAll('.tab-btn');
    const courseCards = document.querySelectorAll('.card-course');

    tabBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        // Update active tab
        tabBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-tab');

        // Filter cards
        courseCards.forEach(function(card) {
          const category = card.getAttribute('data-category');

          if (filter === 'all' || category === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(16px)';
            setTimeout(function() {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ══════════════════════════════════════════
  // ACCORDION / FAQ
  // ══════════════════════════════════════════

  function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(function(header) {
      header.addEventListener('click', function() {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Close all (optional: remove this for multi-open)
        item.parentElement.querySelectorAll('.accordion-item').forEach(function(accItem) {
          accItem.classList.remove('active');
          accItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isActive) {
          item.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ══════════════════════════════════════════
  // INITIALIZE ALL
  // ══════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initCounters();
    initTestimonialSlider();
    initCourseTabs();
    initAccordion();
  });

})();
