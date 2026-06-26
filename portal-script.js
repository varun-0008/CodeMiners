/* ============================================================
   CodeMiners Portal — portal-script.js
   Navigation · Ember Particles · Registration · Donations
   FAQs · Countdown · Toast Notifications
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// PAGE NAVIGATION
// ─────────────────────────────────────────────────────────────
const PAGES = ['home', 'about', 'registration', 'donations', 'contact', 'profile'];

function navigate(page) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show target section
  const target = document.getElementById('sec-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// ─────────────────────────────────────────────────────────────
// EMBER PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────
function initEmbers() {
  const container = document.getElementById('embers');
  if (!container) return;

  const EMBER_COUNT = window.innerWidth < 768 ? 20 : 40;

  for (let i = 0; i < EMBER_COUNT; i++) {
    const ember = document.createElement('div');
    ember.classList.add('ember');

    const size   = Math.random() * 5 + 2;
    const startX = Math.random() * 100;
    const delay  = Math.random() * 8;
    const dur    = Math.random() * 6 + 6;
    const drift  = (Math.random() - 0.5) * 120;
    const isAmber = Math.random() > 0.35;

    ember.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}%;
      bottom: -10px;
      animation-delay: ${delay}s;
      animation-duration: ${dur}s;
      background: ${isAmber
        ? `radial-gradient(circle, rgba(243,156,18,0.9), rgba(230,126,34,0.4))`
        : `radial-gradient(circle, rgba(255,255,255,0.7), rgba(255,255,255,0))`};
      --drift: ${drift}px;
    `;

    container.appendChild(ember);
  }
}

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success'
    ? '<i class="fa-solid fa-circle-check"></i>'
    : type === 'error'
    ? '<i class="fa-solid fa-circle-xmark"></i>'
    : '<i class="fa-solid fa-circle-info"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger entrance
  requestAnimationFrame(() => toast.classList.add('visible'));

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// ─────────────────────────────────────────────────────────────
// FAQ ACCORDION
// ─────────────────────────────────────────────────────────────
function toggleFaq(el) {
  const item    = el.closest('.faq-item');
  const answer  = item.querySelector('.faq-a');
  const chevron = item.querySelector('.faq-chevron');
  const isOpen  = item.classList.contains('open');

  // Close all others
  document.querySelectorAll('.faq-item.open').forEach(other => {
    if (other !== item) {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight   = '0';
      other.querySelector('.faq-a').style.paddingTop  = '0';
      other.querySelector('.faq-a').style.paddingBottom = '0';
      other.querySelector('.faq-chevron').style.transform = 'rotate(0deg)';
    }
  });

  if (isOpen) {
    item.classList.remove('open');
    answer.style.maxHeight    = '0';
    answer.style.paddingTop   = '0';
    answer.style.paddingBottom = '0';
    chevron.style.transform   = 'rotate(0deg)';
  } else {
    item.classList.add('open');
    answer.style.maxHeight    = answer.scrollHeight + 'px';
    answer.style.paddingTop   = '14px';
    answer.style.paddingBottom = '18px';
    chevron.style.transform   = 'rotate(180deg)';
  }
}

// ─────────────────────────────────────────────────────────────
// EVENTS TAB SWITCHER
// ─────────────────────────────────────────────────────────────
function switchEventsTab(tab, btn) {
  // Deactivate all tab buttons and panels
  document.querySelectorAll('.events-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.events-tab-panel').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  const panel = document.getElementById('etab-' + tab);
  if (panel) panel.classList.add('active');
}

// ─────────────────────────────────────────────────────────────
// REGISTRATION FLOW
// ─────────────────────────────────────────────────────────────
let selectedEvent = null;
let regCount = 0;

function regNext(step) {
  if (step === 1) {
    if (!selectedEvent) {
      showToast('Please select an event to continue.', 'error');
      return;
    }
    setRegStep(2);
  } else if (step === 2) {
    const name    = document.getElementById('r-name');
    const email   = document.getElementById('r-email');
    const phone   = document.getElementById('r-phone');
    const college = document.getElementById('r-college');

    if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !college.value.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setRegStep(3);
  } else if (step === 3) {
    // Simulate payment processing
    const btn = document.querySelector('#reg-panel-3 .btn-gold');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-lock"></i> PAY & CONFIRM';
      btn.disabled  = false;

      // Populate receipt
      regCount++;
      const receiptId = 'REG-CM-2025-' + String(regCount).padStart(4, '0');
      document.getElementById('receipt-id').textContent    = receiptId;
      document.getElementById('receipt-event').textContent = selectedEvent || '—';
      document.getElementById('receipt-name').textContent  = document.getElementById('r-name').value;
      document.getElementById('receipt-email').textContent = document.getElementById('r-email').value;

      setRegStep(4);
      showToast('Registration confirmed! Check your email for details.', 'success');
    }, 1800);
  }
}

function regBack(step) {
  setRegStep(step - 1);
}

function regReset() {
  selectedEvent = null;
  document.querySelectorAll('input[name="event-select"]').forEach(r => r.checked = false);
  document.getElementById('r-name').value    = '';
  document.getElementById('r-email').value   = '';
  document.getElementById('r-phone').value   = '';
  document.getElementById('r-college').value = '';
  setRegStep(1);
}

function setRegStep(step) {
  for (let i = 1; i <= 4; i++) {
    const panel   = document.getElementById('reg-panel-' + i);
    const stepEl  = document.getElementById('rstep-' + i);
    if (panel) panel.style.display  = i === step ? 'block' : 'none';
    if (stepEl) {
      stepEl.classList.toggle('active',    i === step);
      stepEl.classList.toggle('completed', i < step);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// PAYMENT METHOD SWITCHER
// ─────────────────────────────────────────────────────────────
function selectPayMethod(method) {
  ['upi', 'card', 'net'].forEach(m => {
    const btn   = document.getElementById('pay-' + m);
    const panel = document.getElementById('pay-' + m + '-panel');
    if (btn)   btn.classList.toggle('active', m === method);
    if (panel) panel.style.display = m === method ? 'block' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// DONATION FLOW
// ─────────────────────────────────────────────────────────────
let donationAmount = 500;

function selectAmount(btn, amount) {
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  donationAmount = amount;
  const customInput = document.getElementById('custom-amount');
  if (customInput) customInput.value = '';
}

function handleDonation() {
  const name  = document.getElementById('donor-name').value.trim();
  const email = document.getElementById('donor-email').value.trim();

  const customVal = document.getElementById('custom-amount').value;
  if (customVal && Number(customVal) >= 10) {
    donationAmount = Number(customVal);
  }

  if (!name) {
    showToast('Please enter your name.', 'error'); return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Please enter a valid email address.', 'error'); return;
  }

  // Simulate processing
  const btn = document.querySelector('#donation-form-card .btn-gold');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btn.disabled  = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-hand-holding-heart"></i> DONATE NOW';
    btn.disabled  = false;

    document.getElementById('donation-main-grid').style.display  = 'none';
    document.getElementById('donation-thankyou').style.display   = 'flex';
    showToast(`Thank you ${name}! ₹${donationAmount} donation received.`, 'success', 5000);
  }, 1600);
}

// ─────────────────────────────────────────────────────────────
// COUNTDOWN TIMER
// ─────────────────────────────────────────────────────────────
function renderCountdown(targetDate, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  function update() {
    const now  = new Date();
    const diff = new Date(targetDate) - now;

    if (diff <= 0) {
      container.innerHTML = '<span class="countdown-item"><span class="countdown-num">0</span><span class="countdown-label">ENDED</span></span>';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    container.innerHTML = `
      <div class="countdown-item"><span class="countdown-num">${String(days).padStart(2,'0')}</span><span class="countdown-label">DAYS</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-num">${String(hours).padStart(2,'0')}</span><span class="countdown-label">HRS</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-num">${String(minutes).padStart(2,'0')}</span><span class="countdown-label">MIN</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-num">${String(seconds).padStart(2,'0')}</span><span class="countdown-label">SEC</span></div>
    `;
  }

  update();
  setInterval(update, 1000);
}

// ─────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────
function initContactForm() {
  const contactSection = document.getElementById('sec-contact');
  if (!contactSection) return;

  const btn = contactSection.querySelector('.btn-gold');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const inputs   = contactSection.querySelectorAll('.field-input');
    const allFilled = [...inputs].every(i => i.value.trim() !== '');

    if (!allFilled) {
      showToast('Please fill in all fields before sending.', 'error');
      return;
    }

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
    btn.disabled  = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND MESSAGE';
      btn.disabled  = false;
      inputs.forEach(i => i.value = '');
      showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    }, 1400);
  });
}

// ─────────────────────────────────────────────────────────────
// NAV SCROLL EFFECT
// ─────────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('cloud-nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEmbers();
  initNavScroll();
  initContactForm();

  // Countdowns
  renderCountdown('2025-07-15T09:00:00', 'countdown-hackforge');

  // Initial FAQ state (all closed)
  document.querySelectorAll('.faq-a').forEach(a => {
    a.style.maxHeight     = '0';
    a.style.overflow      = 'hidden';
    a.style.paddingTop    = '0';
    a.style.paddingBottom = '0';
    a.style.transition    = 'max-height 0.35s ease, padding 0.35s ease';
  });

  // Card number formatting
  const cardInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      e.target.value = val.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  // Custom amount clears preset selection
  const customAmount = document.getElementById('custom-amount');
  if (customAmount) {
    customAmount.addEventListener('input', () => {
      document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('selected'));
    });
  }
});
