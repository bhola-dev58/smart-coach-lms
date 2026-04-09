/**
 * MeetMe Center — Forms
 * Client-side validation, submission handling
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════
  // VALIDATION RULES
  // ══════════════════════════════════════════

  const validators = {
    required: function(value) {
      return value.trim().length > 0;
    },
    email: function(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    phone: function(value) {
      return /^[+]?[\d\s\-()]{7,15}$/.test(value.trim());
    },
    minLength: function(value, len) {
      return value.trim().length >= len;
    }
  };

  const messages = {
    required: 'This field is required.',
    email: 'Please enter a valid email address.',
    phone: 'Please enter a valid phone number.',
    minLength: 'Must be at least {len} characters.'
  };

  // ══════════════════════════════════════════
  // SHOW / CLEAR ERROR
  // ══════════════════════════════════════════

  function showError(field, message) {
    clearError(field);
    field.classList.add('is-error');

    var errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  }

  function clearError(field) {
    field.classList.remove('is-error');
    field.classList.remove('is-success');

    var existing = field.parentNode.querySelector('.form-error');
    if (existing) existing.remove();
  }

  function showSuccess(field) {
    clearError(field);
    field.classList.add('is-success');
  }

  // ══════════════════════════════════════════
  // VALIDATE SINGLE FIELD
  // ══════════════════════════════════════════

  function validateField(field) {
    var value = field.value;
    var rules = field.getAttribute('data-validate');
    if (!rules) {
      if (field.hasAttribute('required')) {
        rules = 'required';
      } else {
        return true;
      }
    }

    var ruleList = rules.split('|');

    for (var i = 0; i < ruleList.length; i++) {
      var rule = ruleList[i].trim();
      var param = null;

      if (rule.indexOf(':') > -1) {
        var parts = rule.split(':');
        rule = parts[0];
        param = parts[1];
      }

      if (rule === 'required' && !validators.required(value)) {
        showError(field, messages.required);
        return false;
      }

      if (rule === 'email' && value.trim() && !validators.email(value)) {
        showError(field, messages.email);
        return false;
      }

      if (rule === 'phone' && value.trim() && !validators.phone(value)) {
        showError(field, messages.phone);
        return false;
      }

      if (rule === 'minLength' && !validators.minLength(value, parseInt(param))) {
        showError(field, messages.minLength.replace('{len}', param));
        return false;
      }
    }

    showSuccess(field);
    return true;
  }

  // ══════════════════════════════════════════
  // VALIDATE FORM
  // ══════════════════════════════════════════

  function validateForm(form) {
    var fields = form.querySelectorAll('input, select, textarea');
    var isValid = true;

    fields.forEach(function(field) {
      if (field.type === 'hidden' || field.type === 'submit' || field.type === 'button') return;
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ══════════════════════════════════════════
  // REAL-TIME VALIDATION
  // ══════════════════════════════════════════

  function initRealTimeValidation() {
    document.querySelectorAll('form[data-validate]').forEach(function(form) {
      var fields = form.querySelectorAll('input, select, textarea');

      fields.forEach(function(field) {
        if (field.type === 'hidden' || field.type === 'submit') return;

        field.addEventListener('blur', function() {
          validateField(field);
        });

        field.addEventListener('input', function() {
          if (field.classList.contains('is-error')) {
            validateField(field);
          }
        });
      });
    });
  }

  // ══════════════════════════════════════════
  // FORM SUBMISSION
  // ══════════════════════════════════════════

  function initFormSubmission() {
    // Contact Form
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm(contactForm)) return;

        var submitBtn = contactForm.querySelector('[type="submit"]');
        var originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Sending...';
        submitBtn.disabled = true;

        // Simulate submission (replace with actual AJAX)
        setTimeout(function() {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          contactForm.reset();
          showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        }, 1500);
      });
    }

    // Newsletter Form
    var newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = newsletterForm.querySelector('input[type="email"]');

        if (!emailInput.value.trim() || !validators.email(emailInput.value)) {
          showToast('Please enter a valid email address.', 'error');
          return;
        }

        showToast('Thank you for subscribing to our newsletter!', 'success');
        newsletterForm.reset();
      });
    }
  }

  // ══════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ══════════════════════════════════════════

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML =
      '<span>' + message + '</span>' +
      '<button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:inherit;cursor:pointer;font-size:18px;">&times;</button>';

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function() {
      toast.classList.add('show');
    });

    // Auto-remove
    setTimeout(function() {
      toast.classList.remove('show');
      setTimeout(function() {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, 5000);
  }

  // Make showToast globally available
  window.showToast = showToast;

  // ══════════════════════════════════════════
  // INITIALIZE
  // ══════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {
    initRealTimeValidation();
    initFormSubmission();
  });

})();
