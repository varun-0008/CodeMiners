/* ============================================================
   CodeMiners Portal — portal-script.js
   Navigation · Ember Particles · Registration · Donations
   FAQs · Countdown · Toast Notifications
   ============================================================ */

'use strict';

// ─────────────────────────────────────────────────────────────
// PAGE NAVIGATION
// ─────────────────────────────────────────────────────────────
const PAGES = ['home', 'about', 'registration', 'participants', 'donations', 'contact', 'profile'];

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
    playSectionAnimation(page);
  }

  // Update nav links
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// ─────────────────────────────────────────────────────────────
// GSAP SECTION ANIMATIONS
// ─────────────────────────────────────────────────────────────
function playSectionAnimation(page) {
  if (typeof gsap === 'undefined') return;
  const section = document.getElementById('sec-' + page);
  if (!section) return;

  // Kill existing tweens to prevent overlapping animations if user clicks fast
  const targets = section.querySelectorAll('.hero, .home-about-text, .achieve-card, .event-card, .donate-cta, .section-heading, .glass-card, .mv-card, .team-card, .why-card, .contact-card');
  gsap.killTweensOf(targets);

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (page === 'home') {
    tl.fromTo(section.querySelectorAll('.hero img, .hero-eyebrow, .hero-title, .hero-desc'), 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }
    )
    .fromTo(section.querySelectorAll('.home-about-text, .achieve-card, .event-card, .donate-cta'), 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, 
      "-=0.3"
    );
  } else {
    tl.fromTo(section.querySelectorAll('.section-heading'), 
      { opacity: 0, y: -15 },
      { opacity: 1, y: 0, duration: 0.6 }
    )
    .fromTo(section.querySelectorAll('.glass-card, .mv-card, .team-card, .why-card, .achieve-card'), 
      { opacity: 0, y: 25, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06 }, 
      "-=0.3"
    );
  }
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
        ? `radial-gradient(circle, rgba(255,140,0,0.9) 0%, rgba(230,70,0,0.5) 50%, transparent 100%)`
        : `radial-gradient(circle, rgba(255,215,0,0.9) 0%, rgba(255,120,0,0.5) 50%, transparent 100%)`};
      box-shadow: 0 0 12px ${isAmber ? 'rgba(255,90,0,0.7)' : 'rgba(255,160,0,0.8)'};
      filter: blur(1px);
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
    
    if (selectedEvent === 'CodeMiners Hackathon 2026') {
      const now = new Date();
      const openTime = new Date('2026-06-30T00:00:00');
      const closeTime = new Date('2026-07-02T00:00:00');
      if (now < openTime || now >= closeTime) {
        showToast('Hackathon registration is only open from June 30th to July 1st.', 'error');
        return;
      }
    }

    setRegStep(2);
  } else if (step === 2) {
    const name    = document.getElementById('r-name');
    const email   = document.getElementById('r-email');
    const phone   = document.getElementById('r-phone');
    const college = document.getElementById('r-college');
    const year    = document.getElementById('r-year').value;
    const pin     = document.getElementById('r-pin').value;
    const hallticket = document.getElementById('r-hallticket').value;

    if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !college.value.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    
    if (year === 'first') {
      if (!hallticket.trim()) {
        showToast('Please enter your Hall Ticket Number.', 'error');
        return;
      }
    } else {
      if (!pin.trim()) {
        showToast('Please enter your PIN.', 'error');
        return;
      }
      if (!/^\d{5}-[a-zA-Z]{2,3}-\d{3}$/.test(pin.trim())) {
        showToast('PIN must be in format like 24054-cps-063', 'error');
        return;
      }
    }

    // Check if user is already registered for this event
    const btn = document.querySelector('#reg-panel-2 .btn-gold');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
    btn.disabled = true;

    db.collection('registrations')
      .where('email', '==', email.value)
      .where('eventName', '==', selectedEvent)
      .get()
      .then((snapshot) => {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
        
        if (!snapshot.empty) {
          showToast('You have already registered for this event!', 'error');
        } else {
          setRegStep(3);
        }
      })
      .catch((error) => {
        console.error("Error checking registration:", error);
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
        showToast('Permission denied. Ensure security rules allow reading your own data.', 'error');
      });
  } else if (step === 3) {
    // Process payment and save to Firebase Firestore
    const btn = document.querySelector('#reg-panel-3 .btn-gold');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    const payload = {
      eventName: selectedEvent,
      fullName: document.getElementById('r-name').value,
      email: document.getElementById('r-email').value,
      phone: document.getElementById('r-phone').value,
      college: document.getElementById('r-college').value,
      studyYear: document.getElementById('r-year').value,
      pin: document.getElementById('r-year').value === 'first' ? null : document.getElementById('r-pin').value,
      hallTicket: document.getElementById('r-year').value === 'first' ? document.getElementById('r-hallticket').value : null,
      registrationDate: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Prepare data for Google Sheets
    const sheetData = new FormData();
    sheetData.append('Event', payload.eventName);
    sheetData.append('Name', payload.fullName);
    sheetData.append('Email', payload.email);
    sheetData.append('Phone', payload.phone);
    sheetData.append('College', payload.college);
    sheetData.append('Year', payload.studyYear);
    sheetData.append('ID (PIN/Hall Ticket)', payload.pin || payload.hallTicket || '—');

    const scriptURL = 'https://script.google.com/macros/s/AKfycbxz-7gHowiQ7B-MLiSHOO3U6qclqm7Hr4oKaChr8a8Wqw31Y2Y9TBBDBIaExXKGwJNl/exec';

    Promise.all([
      db.collection('registrations').add(payload),
      fetch(scriptURL, { method: 'POST', body: sheetData })
    ])
      .then(() => {
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> PAY & CONFIRM';
        btn.disabled  = false;

        // Populate receipt
        regCount++;
        const receiptId = 'REG-CM-2026-' + String(regCount).padStart(4, '0');
        
        document.getElementById('receipt-id').textContent    = receiptId;
        document.getElementById('receipt-event').textContent = selectedEvent || '—';
        document.getElementById('receipt-name').textContent  = payload.fullName;
        document.getElementById('receipt-email').textContent = payload.email;

        setRegStep(4);
        showToast('Registration confirmed! Saved to Firestore & Sheets.', 'success');
      })
      .catch((error) => {
        console.error("Error saving registration: ", error);
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> PAY & CONFIRM';
        btn.disabled  = false;
        showToast('Error connecting to servers. Please try again.', 'error');
      });
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
  document.getElementById('r-year').value    = 'second';
  document.getElementById('r-pin').value     = '';
  document.getElementById('r-hallticket').value = '';
  toggleIdField();
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
// TOGGLE PIN/HALL TICKET BASED ON YEAR
// ─────────────────────────────────────────────────────────────
function toggleIdField() {
  const year = document.getElementById('r-year');
  const pinWrap = document.getElementById('pin-wrap');
  const hallTicketWrap = document.getElementById('hall-ticket-wrap');
  
  if (year && pinWrap && hallTicketWrap) {
    if (year.value === 'first') {
      pinWrap.style.display = 'none';
      hallTicketWrap.style.display = 'block';
    } else {
      pinWrap.style.display = 'block';
      hallTicketWrap.style.display = 'none';
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
let donationAmount = null;

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

  let finalAmount = donationAmount;
  const customVal = document.getElementById('custom-amount').value;
  if (customVal && Number(customVal) >= 10) {
    finalAmount = Number(customVal);
  }

  if (!finalAmount) {
    showToast('Please select or enter a donation amount.', 'error');
    return;
  }

  // Use fallback name if not provided
  const displayName = name || 'Anonymous Contributor';

  // Optional: validate email ONLY if it's provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
    showToast(`Thank you ${displayName}! ₹${finalAmount} donation received.`, 'success', 5000);
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
// LIQUID GLASS ANIMATION
// ─────────────────────────────────────────────────────────────
function animateLiquidGlass() {
  const turbulence = document.getElementById('turbulence');
  const displacement = document.getElementById('displacement');
  
  if (!turbulence || !displacement || typeof gsap === 'undefined') return;

  // Subtle continuous turbulence animation
  const tl = gsap.timeline({ repeat: -1, yoyo: true });

  tl.to(turbulence, {
    attr: { baseFrequency: '0.02' },
    duration: 4,
    ease: 'sine.inOut',
  })
  .to(turbulence, {
    attr: { baseFrequency: '0.012' },
    duration: 3,
    ease: 'sine.inOut',
  })
  .to(turbulence, {
    attr: { baseFrequency: '0.018' },
    duration: 3.5,
    ease: 'sine.inOut',
  });

  // Displacement scale breathing
  gsap.to(displacement, {
    attr: { scale: 12 },
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initEmbers();
  animateLiquidGlass();
  initNavScroll();
  initContactForm();
  initLiquidGlassPhysics();

  // Initial animation
  setTimeout(() => playSectionAnimation('home'), 100);

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

// ─────────────────────────────────────────────────────────────
// LIQUID GLASS PHYSICS (DESKTOP + MOBILE)
// ─────────────────────────────────────────────────────────────
function initLiquidGlassPhysics() {
  const cards = document.querySelectorAll('.glass-content-card, .glass-card:not(.cloud-nav), .achieve-card, .event-card, .donate-cta, .mv-card, .team-card');
  const effectContainer = document.getElementById('contact-effect-container');
  const canvas = document.getElementById('contact-bg-canvas');
  
  if (!cards.length) return;

  // Track layout to position background blobs exactly behind cards
  function syncBlobPositions() {
    if (!canvas || !effectContainer) return;
    const containerRect = effectContainer.getBoundingClientRect();
    
    cards.forEach(card => {
      const cardId = card.id;
      const blob = document.getElementById(`blob-${cardId}`);
      if (!blob) return;
      
      const cardRect = card.getBoundingClientRect();
      
      // Calculate coordinates relative to the container
      const top = cardRect.top - containerRect.top;
      const left = cardRect.left - containerRect.left;
      const width = cardRect.width;
      const height = cardRect.height;
      
      blob.style.top = `${top}px`;
      blob.style.left = `${left}px`;
      blob.style.width = `${width}px`;
      blob.style.height = `${height}px`;
      blob.style.borderRadius = window.getComputedStyle(card).borderRadius;
    });
  }

  // Initial sync and observers
  setTimeout(syncBlobPositions, 200); // short delay to ensure rendering complete
  window.addEventListener('resize', syncBlobPositions);
  
  const resizeObserver = new ResizeObserver(syncBlobPositions);
  cards.forEach(card => resizeObserver.observe(card));

  // Sync when page section changes
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(syncBlobPositions, 400); // wait for section transition animation
    });
  });

  cards.forEach(card => {
    const cardId = card.id;
    const blob = cardId ? document.getElementById(`blob-${cardId}`) : null;
    let shimmer = card.querySelector('.glass-shimmer');
    if (!shimmer) {
      shimmer = document.createElement('div');
      shimmer.className = 'glass-shimmer';
      card.appendChild(shimmer);
    }

    // MOUSE ENTER / TOUCH START
    function handleActiveStart(e) {
      if (blob) {
        blob.classList.add('hover');
      }
      card.style.borderColor = 'rgba(243, 156, 18, 0.4)';
      card.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(243, 156, 18, 0.25)';
    }

    // MOUSE LEAVE / TOUCH END
    function handleActiveEnd() {
      if (blob) {
        blob.classList.remove('hover');
        blob.classList.remove('active');
      }
      if (!card.classList.contains('no-tilt')) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0)';
      }
      card.style.borderColor = '';
      card.style.boxShadow = '';
      if (shimmer) {
        shimmer.style.opacity = '0.4';
      }
    }

    // INTERACTIVE TRACKING (MOUSEMOVE / TOUCHMOVE)
    function handleMove(e) {
      let clientX, clientY;
      
      if (e.touches && e.touches.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // Illumination coord variables
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D rotation angles
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Dynamic tilt cap scaling: smaller cards tilt up to 6 degrees, large form cards tilt subtly at 2.5 degrees max
      const maxTilt = rect.width > 500 ? 2.5 : 6;
      const tiltX = Math.max(-maxTilt, Math.min(maxTilt, ((yc - y) / yc) * maxTilt));
      const tiltY = Math.max(-maxTilt, Math.min(maxTilt, ((x - xc) / xc) * maxTilt));

      // Shimmer reflection translation
      if (shimmer) {
        const shimmerX = (x / rect.width) * 100;
        const shimmerY = (y / rect.height) * 100;
        card.style.setProperty('--shimmer-x', `${shimmerX}%`);
        card.style.setProperty('--shimmer-y', `${shimmerY}%`);
        shimmer.style.opacity = '0.85';
      }

      const isTouch = e.touches !== undefined;
      const scale = isTouch ? 0.96 : 1.04;
      const translateY = isTouch ? 0 : -5;
      
      if (!card.classList.contains('no-tilt')) {
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale}) translateY(${translateY}px)`;
      }
    }

    // Desktop Mouse Events
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseenter', handleActiveStart);
    card.addEventListener('mouseleave', handleActiveEnd);
    card.addEventListener('mousedown', () => {
      if (blob) blob.classList.add('active');
      if (!card.classList.contains('no-tilt')) {
        card.style.transform = 'perspective(1000px) scale(0.96) translateY(-2px)';
      }
    });
    card.addEventListener('mouseup', () => {
      if (blob) blob.classList.remove('active');
    });

    // Mobile Touch Events
    card.addEventListener('touchstart', (e) => {
      handleActiveStart(e);
      handleMove(e);
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      handleMove(e);
    }, { passive: true });

    card.addEventListener('touchend', handleActiveEnd);
  });
}

// ─────────────────────────────────────────────────────────────
// PARTICIPANTS SECTION LOGIC
// ─────────────────────────────────────────────────────────────
const ALL_EVENTS = [
  { id: 'orientation', title: 'CodeMiners Orientation', displayDate: 'June 28, 2026', completionDate: '2026-06-20' },
  { id: 'hackathon', title: 'CodeMiners Hackathon 2026', displayDate: 'July 4–5, 2026', completionDate: '2026-07-06' }
];

function loadCompletedEvents() {
  const container = document.getElementById('completed-events-list');
  if (!container) return;
  
  const today = new Date();
  const completed = ALL_EVENTS.filter(ev => new Date(ev.completionDate) <= today);
  
  if (completed.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 20px;">No completed events yet.</p>';
    return;
  }
  
  let html = '<div class="events-list-box">';
  completed.forEach(ev => {
    html += `
      <div class="event-item" onclick="viewParticipants('${ev.id}', '${ev.title}')" data-id="${ev.id}" style="cursor: pointer;">
        <div class="event-item-title">${ev.title}</div>
        <div class="event-item-date"><i class="fa-regular fa-calendar-check"></i> Completed: ${ev.displayDate}</div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

let fetchedMiners = [];

function viewParticipants(eventId, eventTitle) {
  let isAlreadyActive = false;
  document.querySelectorAll('#completed-events-list .event-item').forEach(el => {
    if (el.dataset.id === eventId) {
      if (el.classList.contains('active')) isAlreadyActive = true;
      el.classList.add('active');
    }
    else el.classList.remove('active');
  });

  const titleEl = document.getElementById('participants-list-title');
  
  if (isAlreadyActive) {
    // User clicked the active event again. Clear filter.
    document.querySelectorAll('#completed-events-list .event-item').forEach(el => el.classList.remove('active'));
    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-users"></i> Miners List`;
    }
    loadAllMiners();
    return;
  }

  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-users"></i> ${eventTitle} Participants`;
  }
  
  const container = document.getElementById('participants-list-content');
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; justify-content:center; padding: 40px; color: var(--gold-primary);">
      <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
    </div>
  `;
  
  try {
    db.collection('registrations')
      .where('eventName', '==', eventTitle)
      .get()
      .then((snapshot) => {
        fetchedMiners = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          fetchedMiners.push({
            id: doc.id,
            name: data.fullName || 'Participant',
            subtitle: data.college || '', 
            year: data.studyYear || '',
            role: 'Participant',
            about: '', 
            projects: [],
            pin: data.pin || '',
            participationType: data.participationType || 'Individual',
            teamName: data.teamName || ''
          });
        });
        
        renderMinersList('');
      })
      .catch((error) => {
        console.error("Error fetching event participants:", error);
        fetchedMiners = [];
        renderMinersList('');
      });
  } catch (e) {
    console.error("DB error:", e);
    fetchedMiners = [];
    renderMinersList('');
  }
}

function loadAllMiners() {
  const container = document.getElementById('participants-list-content');
  if (!container) return;

  const titleEl = document.getElementById('participants-list-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-users"></i> Miners List`;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:center; padding: 40px; color: var(--gold-primary);">
      <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i>
    </div>
  `;
  
  // Fetch from Firebase Firestore - users collection
  try {
    db.collection('users')
      .get()
      .then((snapshot) => {
        fetchedMiners = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          let projectsArray = [];
          if (Array.isArray(data.projects)) {
            projectsArray = data.projects;
          }
          fetchedMiners.push({
            id: doc.id,
            name: data.username || 'Anonymous',
            subtitle: data.fullName || '', 
            year: '',
            role: 'CodeMiner',
            about: data.about || '',
            projects: projectsArray,
            pin: data.pin || ''
          });
        });
        
        renderMinersList('');
      })
      .catch((error) => {
        console.error("Error fetching miners:", error);
        fetchedMiners = [];
        renderMinersList('');
      });
  } catch (e) {
    console.error("DB error:", e);
    fetchedMiners = [];
    renderMinersList('');
  }
}

function renderMinersList(searchQuery = '') {
  const container = document.getElementById('participants-list-content');
  if (!container) return;

  const filtered = fetchedMiners.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

  let html = `
    <div style="margin-bottom: 20px; position: relative;">
      <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 14px; color: var(--text-muted);"></i>
      <input type="text" id="miner-search" placeholder="Search by username or name..." 
             style="width: 100%; padding: 12px 16px 12px 44px; border-radius: 8px; border: 1.5px solid var(--rock-border); background: rgba(0,0,0,0.3); color: white; outline: none; font-family: inherit;" 
             value="${searchQuery}" onkeyup="renderMinersList(this.value)">
    </div>
    <div style="display: grid; grid-template-columns: 1fr; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px;" id="miners-grid">
  `;

  if (filtered.length === 0) {
    html += `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No miners found.</p>`;
  } else {
    filtered.forEach(m => {
      html += `
        <div class="event-item" style="display: flex; align-items: center; gap: 16px; padding: 12px;" onclick="viewMinerProfile('${m.id}')">
          <div style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(240,165,0,0.3); background: rgba(240,165,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: 20px;">
            <i class="fa-solid fa-user"></i>
          </div>
          <div>
            <div style="font-weight: 700; color: white; margin-bottom:2px;">${m.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${m.subtitle}</div>
          </div>
          <i class="fa-solid fa-chevron-right" style="margin-left: auto; color: var(--text-muted);"></i>
        </div>
      `;
    });
  }
  html += `</div>`;
  container.innerHTML = html;

  const searchInput = document.getElementById('miner-search');
  if (searchInput) {
    searchInput.focus();
  }
}

function viewMinerProfile(minerId) {
  const m = fetchedMiners.find(x => x.id === minerId);
  if (!m) return;
  const container = document.getElementById('participants-list-content');
  
  let projectsHtml = '';
  if (!m.participationType && m.projects && m.projects.length > 0) {
    projectsHtml = `
      <div style="background: rgba(0,0,0,0.2); border: 1.5px solid var(--rock-border); border-radius: 12px; padding: 20px; text-align: left; margin-top: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-code"></i> Personal Projects</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${m.projects.map(p => `
            <a href="${p.link}" target="_blank" style="color: var(--gold-primary); text-decoration: none; font-size: 14px; background: rgba(240,165,0,0.1); padding: 8px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-link" style="font-size: 12px;"></i> ${p.name || 'View Project'}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  } else if (m.participationType && m.teamProjectLink) {
    projectsHtml = `
      <div style="background: rgba(0,0,0,0.2); border: 1.5px solid var(--rock-border); border-radius: 12px; padding: 20px; text-align: left; margin-top: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-rocket"></i> Team Project</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="${m.teamProjectLink}" target="_blank" style="color: var(--gold-primary); text-decoration: none; font-size: 14px; background: rgba(240,165,0,0.1); padding: 8px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-link" style="font-size: 12px;"></i> View Project
            </a>
        </div>
      </div>
    `;
  }

  let aboutHtml = '';
  if (!m.participationType && m.about) {
    aboutHtml = `
      <div style="background: rgba(0,0,0,0.2); border: 1.5px solid var(--rock-border); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-address-card"></i> About Miner</h3>
        <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6; margin: 0;">
          ${m.about}
        </p>
      </div>
    `;
  }

  let membersHtml = '';
  if (m.participationType && m.teamMembers) {
    let mArray = [];
    if (Array.isArray(m.teamMembers)) mArray = m.teamMembers;
    else if (typeof m.teamMembers === 'string') mArray = m.teamMembers.split(',').map(s=>s.trim()).filter(Boolean);
    
    if (mArray.length > 0) {
      membersHtml = `
        <div style="background: rgba(0,0,0,0.2); border: 1.5px solid var(--rock-border); border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 16px;">
          <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-users"></i> Team Members</h3>
          <ul style="color: var(--text-muted); font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${mArray.map(member => `<li>${member}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <button class="btn-icon" style="margin-bottom: 16px; color: var(--gold-primary); background: transparent; border: none; cursor: pointer; display:flex; align-items:center; gap: 8px; font-weight:600; font-family:inherit; padding: 0;" onclick="renderMinersList('')">
      <i class="fa-solid fa-arrow-left"></i> Back to Miners
    </button>
    <div style="text-align: center; padding: 0;">
      <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--gold-primary); margin: 0 auto 12px auto; box-shadow: 0 4px 16px rgba(240,165,0,0.2); background: rgba(240,165,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: 40px;">
        <i class="fa-solid fa-user"></i>
      </div>
      <h2 style="margin: 0 0 4px 0; color: white; font-size: 22px;">${m.name}</h2>
      <div style="color: var(--gold-primary); font-weight: 600; font-size: 14px; margin-bottom: 16px;">${m.role}</div>
      
      ${m.subtitle || m.pin ? `
      <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: ${m.participationType ? '12px' : '24px'};">
        ${m.subtitle ? `<span class="badge badge-blue">${m.subtitle}</span>` : ''}
        ${m.pin ? `<span class="badge badge-gold"><i class="fa-solid fa-hashtag" style="font-size: 10px; opacity: 0.7; margin-right: 4px;"></i>${m.pin}</span>` : ''}
      </div>` : ''}
      
      ${m.participationType ? `
      <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 24px;">
        <span class="badge badge-blue"><i class="fa-solid ${m.participationType.toLowerCase() === 'team' ? 'fa-users' : 'fa-user'}" style="margin-right:4px;"></i>${m.participationType}</span>
        ${m.teamName ? `<span class="badge badge-gold"><i class="fa-solid fa-flag" style="margin-right:4px;"></i>${m.teamName}</span>` : ''}
      </div>` : ''}
      
      ${membersHtml}
      ${aboutHtml}
      ${projectsHtml}
    </div>
  `;
}

// Initialize on load
setTimeout(() => {
  loadCompletedEvents();
  loadAllMiners();
}, 500);
