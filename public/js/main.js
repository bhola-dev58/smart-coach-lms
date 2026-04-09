/**
 * MeetMe Center — Main JS
 * Core initialization, back-to-top, utilities
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════
  // BACK TO TOP BUTTON
  // ══════════════════════════════════════════

  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ══════════════════════════════════════════
  // LAZY LOAD IMAGES (Fallback for older browsers)
  // ══════════════════════════════════════════

  function initLazyLoad() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading is supported
      return;
    }

    // Fallback: IntersectionObserver-based lazy loading
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');

    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });

    lazyImages.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  // ══════════════════════════════════════════
  // PRELOADER (optional)
  // ══════════════════════════════════════════

  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.addEventListener('load', function() {
      preloader.style.opacity = '0';
      setTimeout(function() {
        preloader.style.display = 'none';
      }, 400);
    });
  }

  // ══════════════════════════════════════════
  // KEYBOARD ACCESSIBILITY
  // ══════════════════════════════════════════

  function initKeyboard() {
    // Add keyboard support for custom buttons/elements
    document.querySelectorAll('[role="button"]').forEach(function(el) {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          el.click();
        }
      });
    });

    // ESC to close modals/mobile nav
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        // Close mobile nav
        var mobileNav = document.getElementById('mobile-nav');
        var hamburger = document.getElementById('hamburger-btn');
        if (mobileNav && mobileNav.classList.contains('active')) {
          mobileNav.classList.remove('active');
          hamburger.classList.remove('active');
          document.body.style.overflow = '';
        }

        // Close modals
        document.querySelectorAll('.modal-overlay.active').forEach(function(modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        });
      }
    });
  }

  // ══════════════════════════════════════════
  // SCROLL PROGRESS INDICATOR (optional)
  // ══════════════════════════════════════════

  function initScrollProgress() {
    var progress = document.getElementById('scroll-progress');
    if (!progress) return;

    window.addEventListener('scroll', function() {
      var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrolled = (window.scrollY / scrollHeight) * 100;
      progress.style.width = scrolled + '%';
    }, { passive: true });
  }

  // ══════════════════════════════════════════
  // INITIALIZE EVERYTHING
  // ══════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {
    initBackToTop();
    initLazyLoad();
    initPreloader();
    initKeyboard();
    initScrollProgress();

    // Log theme version
    if (typeof meetmeData !== 'undefined') {
      console.log('%cMeetMe Center v1.0.0', 'color: #C8102E; font-weight: bold; font-size: 14px;');
    }
  });

})();
