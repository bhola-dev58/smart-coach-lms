/**
 * MeetMe Center — Navigation
 * Sticky header, hamburger menu, active states
 */

(function() {
  'use strict';

  const header       = document.getElementById('site-header');
  const hamburger    = document.getElementById('hamburger-btn');
  const mobileNav    = document.getElementById('mobile-nav');
  const topBar       = document.getElementById('header-top-bar');
  const navLinks     = document.querySelectorAll('.primary-nav .nav-link');
  const mobileLinks  = document.querySelectorAll('.mobile-nav .nav-link');

  // ── Sticky Header ──
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Hide top bar on scroll down
    if (topBar) {
      if (scrollY > 120) {
        topBar.style.transform = 'translateY(-100%)';
        topBar.style.position = 'relative';
      } else {
        topBar.style.transform = 'translateY(0)';
      }
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ── Hamburger Menu ──
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      const isActive = hamburger.classList.toggle('active');
      mobileNav.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close mobile nav when a link is clicked
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Active Nav Highlighting ──
  const currentPath = window.location.pathname;

  function setActiveNav(links) {
    links.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href) {
        try {
          const linkPath = new URL(href, window.location.origin).pathname;
          if (linkPath === currentPath || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        } catch(e) {
          // ignore invalid URLs
        }
      }
    });
  }

  setActiveNav(navLinks);
  setActiveNav(mobileLinks);

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        if (mobileNav && mobileNav.classList.contains('active')) {
          hamburger.classList.remove('active');
          mobileNav.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ── Dropdown menus ──
  document.querySelectorAll('.dropdown').forEach(function(dropdown) {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
    }
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function() {
    document.querySelectorAll('.dropdown.active').forEach(function(d) {
      d.classList.remove('active');
    });
  });

})();
