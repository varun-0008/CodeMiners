/* ============================================================
   CodeMiners Portal — portal-script.js
   Navigation · Ember Particles · Registration · Donations
   FAQs · Countdown · Toast Notifications
   ============================================================ */

// Disable Developer Tools / Inspect Shortcut Keys & Context Menu
document.addEventListener('keydown', function (e) {
  if (e.keyCode === 123) { e.preventDefault(); return false; }
  if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
  if (e.ctrlKey && e.keyCode === 85) { e.preventDefault(); return false; }
});
document.addEventListener('contextmenu', function (e) { e.preventDefault(); return false; });

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://omxgqhwogkihrdnlonoq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UGnbbIMZrz-jZvLN8pS7jw_1LGAp3HP';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Global fallback helpers if not defined in portal.html
const GLOBAL_SALT_FALLBACK = 'CM_GlobalSalt_2026_Hash';
window.encryptGlobal = window.encryptGlobal || function(plainText) {
  if (!plainText) return '';
  try {
    return CryptoJS.AES.encrypt(String(plainText), GLOBAL_SALT_FALLBACK).toString();
  } catch (err) {
    console.error("encryptGlobal error:", err);
    return plainText;
  }
};
window.decryptGlobal = window.decryptGlobal || function(cipherText) {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, GLOBAL_SALT_FALLBACK);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText;
  } catch (err) {
    return cipherText;
  }
};


// Local crypto helper functions/constants for user-specific data
var CRYPTO_SALT = 'CM_SecretSalt_2026_Key';
function getDerivationKey(uid) {
  return CryptoJS.SHA256(uid + CRYPTO_SALT).toString();
}

window.encryptData = window.encryptData || function(plainText, uid) {
  if (!plainText) return '';
  const key = getDerivationKey(uid);
  return CryptoJS.AES.encrypt(String(plainText), key).toString();
};

window.decryptData = window.decryptData || function(cipherText, uid) {
  if (!cipherText) return '';
  const key = getDerivationKey(uid);
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText;
  } catch (err) {
    return cipherText;
  }
};


// Global reference for the logged in user's profile database document
let currentUserDoc = null;



// ─────────────────────────────────────────────────────────────
// PAGE NAVIGATION
// ─────────────────────────────────────────────────────────────
const PAGES = ['home', 'about', 'registration', 'participants', 'teams', 'donations', 'contact', 'profile'];

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

  // Trigger Team Sync if visiting Teams page
  if (page === 'teams' && typeof syncTeamSection === 'function') {
    syncTeamSection();
  }
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

  // Animate counter values if present in the section
  section.querySelectorAll('.achieve-num').forEach(num => {
    const target = parseInt(num.getAttribute('data-target')) || 0;
    const hasPlus = num.textContent.includes('+') || num.getAttribute('data-target-plus') === 'true';
    const obj = { val: 0 };
    
    // Set initial text value
    num.textContent = '0' + (hasPlus ? '+' : '');
    
    gsap.to(obj, {
      val: target,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => {
        num.textContent = Math.floor(obj.val) + (hasPlus ? '+' : '');
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
// EMBER PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────
function initEmbers() {
  const container = document.getElementById('embers');
  if (!container) return;

  const EMBER_COUNT = window.innerWidth < 768 ? 8 : 40;

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
// REGISTRATION & EVENTS FLOW
// ─────────────────────────────────────────────────────────────
const DEFAULT_EVENT_IDS = {
  'Ideackathon': 'd4444444-4444-4444-4444-444444444444',
  'Appdevelopment workshop': 'e5555555-5555-5555-5555-555555555555',
  'CodeMiners Hackathon 2026': 'a1111111-1111-1111-1111-111111111111',
  'Pre-Hackthon': 'b2222222-2222-2222-2222-222222222222',
  'CodeMiners Orientation': 'c3333333-3333-3333-3333-333333333333'
};

async function getEventId(eventName) {
  if (!eventName) return DEFAULT_EVENT_IDS['Ideackathon'];
  if (DEFAULT_EVENT_IDS[eventName]) return DEFAULT_EVENT_IDS[eventName];
  try {
    const { data } = await supabaseClient
      .from('events')
      .select('id')
      .ilike('title', eventName.trim())
      .maybeSingle();
    return data ? data.id : (DEFAULT_EVENT_IDS[eventName] || null);
  } catch (e) {
    return DEFAULT_EVENT_IDS[eventName] || null;
  }
}

function getEventTableName(eventName) {
  return 'registrations';
}

let selectedEvent = 'Ideackathon';
let selectedEventId = DEFAULT_EVENT_IDS['Ideackathon'];
let regCount = 0;

function calculateEventFee(eventName, teamSize = 1) {
  const PLATFORM_FEE = 5;
  if (eventName === 'Ideackathon') {
    const size = Math.max(1, Math.min(5, parseInt(teamSize, 10) || 1));
    const perPerson = 50;
    const perPersonPlatform = 5;
    const subtotal = perPerson * size;
    const platformFee = perPersonPlatform * size;
    const total = subtotal + platformFee;
    return {
      eventName,
      isTeam: true,
      perPerson,
      perPersonPlatform,
      perPersonTotal: perPerson + perPersonPlatform,
      teamSize: size,
      subtotal,
      platformFee,
      total,
      description: `Ideackathon (${size} ${size === 1 ? 'member' : 'members'} · ₹50/head + ₹${PLATFORM_FEE} platform fee/head = ₹${total})`
    };
  } else if (eventName === 'Appdevelopment workshop') {
    return {
      eventName,
      isTeam: false,
      perPerson: 30,
      teamSize: 1,
      subtotal: 30,
      platformFee: PLATFORM_FEE,
      total: 30 + PLATFORM_FEE,
      description: `Appdevelopment workshop (Solo @ ₹30 + ₹${PLATFORM_FEE} platform fee)`
    };
  } else if (eventName === 'CodeMiners Hackathon 2026') {
    const size = Math.max(1, parseInt(teamSize, 10) || 1);
    const perPerson = size < 5 ? 70 : 50;
    const subtotal = perPerson * size;
    return {
      eventName,
      isTeam: true,
      perPerson,
      teamSize: size,
      subtotal,
      platformFee: 0,
      total: subtotal,
      description: `CodeMiners Hackathon (${size} member${size > 1 ? 's' : ''} @ ₹${perPerson}/head)`
    };
  }
  return {
    eventName,
    isTeam: false,
    perPerson: 0,
    teamSize: 1,
    subtotal: 0,
    platformFee: 0,
    total: 0,
    description: `${eventName} (Free Event)`
  };
}

function handleTeamSizeKeyDown(e) {
  // Allow navigation, deletion, tabs
  if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
    return true;
  }
  // Only allow digits 1 to 5
  if (['1', '2', '3', '4', '5'].includes(e.key)) {
    const input = e.target;
    // If text already exists and is not highlighted, replace it with the new key
    if (input.selectionStart === input.selectionEnd && input.value.length >= 1) {
      input.value = e.key;
      handleTeamSizeInput(input);
      e.preventDefault();
      return false;
    }
    return true;
  }
  // Block all other keys (including 0, 6-9, letters, minus, plus, period)
  e.preventDefault();
  return false;
}

function handleTeamSizeInput(input) {
  if (!input) return;
  let val = input.value;
  if (val === '') {
    updateIdeackathonFeePreview();
    return;
  }
  let num = parseInt(val, 10);
  if (isNaN(num) || num < 1) {
    input.value = 1;
  } else if (num > 5) {
    input.value = 5;
  }
  renderPendingInvites();
  if (typeof updateIdeackathonFeePreview === 'function') {
    updateIdeackathonFeePreview();
  }
}

function handleTeamSizeBlur(input) {
  if (!input) return;
  let num = parseInt(input.value, 10);
  if (isNaN(num) || num < 1) {
    input.value = 1;
  } else if (num > 5) {
    input.value = 5;
  }
  renderPendingInvites();
  if (typeof updateIdeackathonFeePreview === 'function') {
    updateIdeackathonFeePreview();
  }
}

function adjustTeamSize(delta) {
  const input = document.getElementById('r-team-size');
  if (!input) return;
  let current = parseInt(input.value, 10) || 1;
  let next = Math.max(1, Math.min(5, current + delta));
  input.value = next;
  handleTeamSizeInput(input);
}

function updateIdeackathonFeePreview() {
  const previewEl = document.getElementById('ideackathon-fee-calc');
  if (!previewEl) return;
  const sizeInput = document.getElementById('r-team-size');
  const size = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 1)) : 1;
  const feeInfo = calculateEventFee('Ideackathon', size);
  previewEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span><strong>Team of ${size} ${size === 1 ? 'Member' : 'Members'}</strong>: ${size} × (₹50 Registration Fee + ₹${feeInfo.perPersonPlatform || 5} Platform Fee)</span>
      <span style="font-weight:800; font-size:14px; color:var(--gold-primary);">Total: ₹${feeInfo.total}</span>
    </div>
  `;
}

function selectEventOption(eventName) {
  selectedEvent = eventName;
  selectedEventId = DEFAULT_EVENT_IDS[eventName] || null;

  const ideackathonCard = document.getElementById('opt-card-ideackathon');
  const appdevCard = document.getElementById('opt-card-appdev_workshop');
  const ideackathonBadge = document.getElementById('opt-badge-ideackathon');
  const appdevBadge = document.getElementById('opt-badge-appdev_workshop');
  const step1Btn = document.getElementById('reg-step-1-btn');
  const radio = document.querySelector(`input[name="event-select"][data-event-name="${eventName}"]`);

  if (radio) {
    radio.checked = true;
  }

  if (eventName === 'Appdevelopment workshop') {
    if (ideackathonCard) {
      ideackathonCard.style.borderColor = 'rgba(240,165,0,0.25)';
      ideackathonCard.style.background = 'rgba(240,165,0,0.02)';
      ideackathonCard.style.boxShadow = 'none';
      ideackathonCard.style.opacity = '0.7';
    }
    if (ideackathonBadge) ideackathonBadge.style.display = 'none';

    if (appdevCard) {
      appdevCard.style.borderColor = 'var(--blue-accent)';
      appdevCard.style.background = 'rgba(33,150,243,0.12)';
      appdevCard.style.boxShadow = '0 0 20px rgba(33,150,243,0.25)';
      appdevCard.style.opacity = '1';
    }
    if (appdevBadge) {
      appdevBadge.style.display = 'inline-flex';
      appdevBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> SELECTED';
    }

    if (step1Btn) {
      step1Btn.style.background = 'linear-gradient(135deg, #2196f3, #1565c0)';
      step1Btn.style.color = '#ffffff';
      step1Btn.style.borderColor = '#2196f3';
      step1Btn.innerHTML = '<i class="fa-solid fa-laptop-code"></i> CONTINUE TO WORKSHOP REGISTRATION (SOLO · ₹35) &rarr;';
    }
  } else {
    // Ideackathon / Default
    if (appdevCard) {
      appdevCard.style.borderColor = 'rgba(33,150,243,0.25)';
      appdevCard.style.background = 'rgba(33,150,243,0.02)';
      appdevCard.style.boxShadow = 'none';
      appdevCard.style.opacity = '0.7';
    }
    if (appdevBadge) appdevBadge.style.display = 'none';

    if (ideackathonCard) {
      ideackathonCard.style.borderColor = 'var(--gold-primary)';
      ideackathonCard.style.background = 'rgba(240,165,0,0.08)';
      ideackathonCard.style.boxShadow = '0 0 20px rgba(240,165,0,0.2)';
      ideackathonCard.style.opacity = '1';
    }
    if (ideackathonBadge) {
      ideackathonBadge.style.display = 'inline-flex';
      ideackathonBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> SELECTED';
    }

    if (step1Btn) {
      step1Btn.style.background = 'linear-gradient(135deg, #f0a500, #c59b27)';
      step1Btn.style.color = '#111111';
      step1Btn.style.borderColor = '#f0a500';
      step1Btn.innerHTML = '<i class="fa-solid fa-people-group"></i> GO TO TEAMS TO FORM SQUAD &amp; REGISTER &rarr;';
    }
  }
}

function renderEventSummaryBanner(eventName) {
  const bannerEl = document.getElementById('reg-event-summary-banner');
  if (!bannerEl) return;

  if (eventName === 'Appdevelopment workshop') {
    bannerEl.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(33, 150, 243, 0.12), rgba(21, 101, 192, 0.08)); border: 1.5px solid rgba(33, 150, 243, 0.35); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 15px rgba(33,150,243,0.1);">
        <div style="display:flex; align-items:center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(33, 150, 243, 0.2); border: 1px solid rgba(33, 150, 243, 0.4); display: flex; align-items: center; justify-content: center; color: var(--blue-accent); font-size: 22px; flex-shrink: 0;">
            <i class="fa-solid fa-laptop-code"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap: 8px; flex-wrap: wrap;">
              <span style="font-weight: 800; font-size: 16px; color: #fff;">Appdevelopment workshop</span>
              <span class="badge badge-blue" style="font-size: 10px; padding: 2px 8px;"><i class="fa-solid fa-user"></i> SOLO WORKSHOP</span>
              <span class="badge" style="font-size: 10px; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.18); display: inline-flex; align-items: center; gap: 4px;">
                <img src="cloud-community-logo.jpg" alt="CC" style="width: 12px; height: 12px; border-radius: 50%; object-fit: cover;"> &lt;CC&gt; Collab
              </span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 3px;">
              Hands-on Web &amp; Mobile App Engineering · <strong>Individual / Solo Registration</strong>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10.5px; color: #8ec5ff; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Solo Registration Pass</div>
          <div style="font-size: 18px; font-weight: 800; color: #fff;">₹35 <span style="font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.6);">(₹30 fee + ₹5 platform fee)</span></div>
        </div>
      </div>
      <div style="margin-top: 10px; background: rgba(33, 150, 243, 0.06); border: 1px solid rgba(33, 150, 243, 0.2); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #8ec5ff; display: flex; align-items: center; gap: 10px;">
        <i class="fa-solid fa-circle-user" style="font-size: 15px; flex-shrink: 0;"></i>
        <span><strong>Solo Event:</strong> No team formation or invites needed. Simply fill in your details below to secure your individual workshop seat.</span>
      </div>
    `;
  } else {
    // Ideackathon banner
    bannerEl.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(240, 165, 0, 0.12), rgba(255, 140, 0, 0.08)); border: 1.5px solid rgba(240, 165, 0, 0.35); border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 15px rgba(240,165,0,0.1);">
        <div style="display:flex; align-items:center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 10px; background: rgba(240, 165, 0, 0.2); border: 1px solid rgba(240, 165, 0, 0.4); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: 22px; flex-shrink: 0;">
            <i class="fa-solid fa-lightbulb"></i>
          </div>
          <div>
            <div style="display:flex; align-items:center; gap: 8px; flex-wrap: wrap;">
              <span style="font-weight: 800; font-size: 16px; color: #fff;">Ideackathon</span>
              <span class="badge badge-gold" style="font-size: 10px; padding: 2px 8px;"><i class="fa-solid fa-users"></i> TEAM EVENT (1–5 MEMBERS)</span>
              <span class="badge" style="font-size: 10px; padding: 2px 8px; background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.18); display: inline-flex; align-items: center; gap: 4px;">
                <img src="cloud-community-logo.jpg" alt="CC" style="width: 12px; height: 12px; border-radius: 50%; object-fit: cover;"> &lt;CC&gt; Collab
              </span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 3px;">
              Idea Pitching &amp; Innovation Challenge · <strong>Registered & Paid by Team Leader</strong>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10.5px; color: var(--gold-light); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Fee Structure</div>
          <div style="font-size: 18px; font-weight: 800; color: #fff;">₹50/head <span style="font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.6);">(+ ₹5 platform fee/head)</span></div>
        </div>
      </div>
    `;
  }
}

function showIdeackathonFormationPrompt() {
  switchTeamSectionEvent('Ideackathon');
  const ideackathonId = DEFAULT_EVENT_IDS['Ideackathon'];

  // Check user team status for Ideackathon strictly
  if (currentTeamData && currentTeamData.eventId === ideackathonId) {
    const isLeader = currentTeamData.leaderId === window.currentUser?.uid;
    const numMembers = currentTeamData.members?.length || 1;
    if (isLeader) {
      showToast(`Welcome to your Ideackathon squad "${currentTeamData.name}"! Confirm your squad (${numMembers} member${numMembers > 1 ? 's' : ''} · ₹${55 * numMembers}) and checkout below.`, 'info', 8000);
      const payCard = document.getElementById('team-payment-card');
      if (payCard) {
        setTimeout(() => payCard.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    } else {
      showToast(`You are a member of squad "${currentTeamData.name}" for Ideackathon. Your Team Leader will complete squad registration & payment.`, 'info', 7000);
    }
  } else {
    showToast('Ideackathon Squad Formation: You can register as a solo team of 1 (₹55) or assemble a squad of up to 5 members (₹55/head). Create your team below to checkout!', 'info', 9000);
    const nameInput = document.getElementById('new-team-name');
    if (nameInput) {
      setTimeout(() => {
        nameInput.scrollIntoView({ behavior: 'smooth' });
        nameInput.focus();
      }, 300);
    }
  }
}

function startRegistrationFor(eventName) {
  if (eventName === 'Ideackathon') {
    navigate('teams');
    currentTeamId = null;
    currentTeamData = null;
    switchTeamSectionEvent('Ideackathon');
    showIdeackathonFormationPrompt();
    return;
  }
  selectedEvent = eventName;
  selectedEventId = DEFAULT_EVENT_IDS[eventName] || null;
  navigate('registration');
  selectEventOption(eventName);
  setTimeout(() => {
    regNext(1);
  }, 100);
}

async function checkAndSyncIdeackathonRegistrationForm() {
  const noticeEl = document.getElementById('r-existing-team-notice');
  const roleWrap = document.getElementById('r-role-wrap');
  const leaderFields = document.getElementById('team-leader-fields');
  const teamNameEl = document.getElementById('r-team-name');
  const teamSizeEl = document.getElementById('r-team-size');
  const btn = document.getElementById('reg-step-2-btn');
  const user = window.currentUser;

  if (!noticeEl) return;
  noticeEl.style.display = 'none';
  noticeEl.innerHTML = '';

  if (!user) return;

  try {
    const eventId = await getEventId('Ideackathon');
    
    // Check if user is in any team strictly for Ideackathon
    let userTeam = null;
    if (currentTeamData && (currentTeamData.eventId === eventId && currentTeamData.eventName === 'Ideackathon')) {
      userTeam = currentTeamData;
    } else {
      const { data: memberships } = await supabaseClient
        .from('team_members')
        .select('team_id, role, teams(*)')
        .eq('user_id', user.uid);
      
      if (memberships && memberships.length > 0) {
        const ideackathonMem = memberships.find(m => m.teams && m.teams.event_id === eventId);
        if (ideackathonMem && ideackathonMem.teams) {
          const { data: tmData } = await supabaseClient
            .from('team_members')
            .select('id, role, user_id, profiles(id, full_name, email, username)')
            .eq('team_id', ideackathonMem.team_id);
          
          userTeam = {
            id: ideackathonMem.team_id,
            eventId: eventId,
            eventName: 'Ideackathon',
            name: ideackathonMem.teams.name,
            leaderId: ideackathonMem.teams.leader_id,
            leaderName: (tmData || []).find(m => m.role === 'leader')?.profiles?.full_name || 'Leader',
            members: (tmData || []).map(m => ({
              uid: m.user_id,
              name: m.profiles?.full_name || m.profiles?.username || 'Member',
              role: m.role
            }))
          };
          currentTeamData = userTeam;
          currentTeamId = userTeam.id;
        }
      }
    }

    if (userTeam) {
      // Check if team is registered in registrations strictly for Ideackathon
      let isRegistered = false;
      let regDetails = null;

      const { data: regByTeam } = await supabaseClient
        .from('registrations')
        .select('*')
        .eq('team_id', userTeam.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (regByTeam) {
        isRegistered = true;
        regDetails = regByTeam;
      } else if (userTeam.leaderId) {
        // Fallback: check if leader has registration for Ideackathon
        const { data: regByLeader } = await supabaseClient
          .from('registrations')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', userTeam.leaderId)
          .maybeSingle();
        if (regByLeader) {
          isRegistered = true;
          regDetails = regByLeader;
          // Auto-heal link
          await supabaseClient.from('registrations').update({ team_id: userTeam.id }).eq('id', regByLeader.id);
        }
      }

      if (isRegistered) {
        // Team is ALREADY registered!
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `
          <div style="background: rgba(76, 175, 80, 0.1); border: 1.5px solid rgba(76, 175, 80, 0.35); border-radius: 10px; padding: 16px 18px; margin-bottom: 12px; display: flex; align-items: center; gap: 14px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: #4CAF50; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 800; font-size: 15px; color: #4CAF50;">Team "${userTeam.name}" is Already Registered!</div>
              <div style="font-size: 12.5px; color: var(--text-light); margin-top: 2px;">
                Your squad has completed registration & payment for Ideackathon (Amount: ₹${regDetails.amount_paid} · ${regDetails.team_size || userTeam.members.length} Members).
              </div>
            </div>
            <button type="button" class="btn-gold" style="padding: 8px 14px; font-size: 12px; flex-shrink: 0;" onclick="navigate('teams')">
              <i class="fa-solid fa-people-group"></i> View Squad
            </button>
          </div>
        `;
        if (roleWrap) roleWrap.style.display = 'none';
        if (leaderFields) leaderFields.style.display = 'none';
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-check-double"></i> SQUAD ALREADY REGISTERED';
          btn.disabled = true;
          btn.style.opacity = '0.6';
          btn.style.cursor = 'not-allowed';
        }
        return;
      }

      // If team is NOT registered yet:
      const isLeader = userTeam.leaderId === user.uid;
      const squadSize = Math.max(1, Math.min(5, userTeam.members.length));

      if (isLeader) {
        // Current user is Leader: link their existing squad
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `
          <div style="background: rgba(240, 165, 0, 0.08); border: 1px solid rgba(240, 165, 0, 0.3); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 22px; color: var(--gold-primary); flex-shrink: 0;">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 13.5px; font-weight: 700; color: #fff;">
                Active Squad Linked: <span style="color: var(--gold-light);">${userTeam.name}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                Your squad currently has <strong>${squadSize} member${squadSize > 1 ? 's' : ''}</strong> from the Team Page. Pricing is calculated below.
              </div>
            </div>
            <span class="badge badge-gold" style="font-size: 10px; padding: 4px 8px;">TEAM LEADER</span>
          </div>
        `;

        if (roleWrap) roleWrap.style.display = 'none';
        if (leaderFields) leaderFields.style.display = 'block';

        if (teamNameEl) {
          teamNameEl.value = userTeam.name;
          teamNameEl.readOnly = true;
          teamNameEl.style.background = 'rgba(255,255,255,0.05)';
        }
        if (teamSizeEl) {
          teamSizeEl.value = squadSize;
        }

        const inviteSearchEl = document.getElementById('r-invite-search');
        if (inviteSearchEl) {
          const parent = inviteSearchEl.parentElement.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div style="font-size: 12px; color: var(--text-muted); padding: 8px 0;">
                <i class="fa-solid fa-users" style="color: var(--gold-primary); margin-right: 6px;"></i>
                Squad Members: <strong>${userTeam.members.map(m => m.name + (m.role === 'leader' ? ' (Leader)' : '')).join(', ')}</strong>.
                <div style="margin-top: 4px; font-size: 11px; color: #888;">To recruit or manage members, visit the <a href="javascript:void(0)" onclick="navigate('teams')" style="color:var(--gold-primary); text-decoration: underline;">Teams tab</a>.</div>
              </div>
            `;
          }
        }

        updateIdeackathonFeePreview();
        if (btn) {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.cursor = 'pointer';
        }
      } else {
        // Current user is a MEMBER of an unregistered squad
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `
          <div style="background: rgba(33, 150, 243, 0.08); border: 1px solid rgba(33, 150, 243, 0.3); border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 22px; color: var(--blue-accent); flex-shrink: 0;">
              <i class="fa-solid fa-circle-info"></i>
            </div>
            <div style="flex: 1;">
              <div style="font-size: 13.5px; font-weight: 700; color: #fff;">
                You are a Member of Squad: <span style="color: var(--blue-accent);">${userTeam.name}</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                For Ideackathon, your Team Leader (<strong>${userTeam.leaderName || 'Leader'}</strong>) completes the squad registration and payment.
              </div>
            </div>
            <button type="button" class="btn-ghost" style="padding: 6px 12px; font-size: 11px; flex-shrink: 0;" onclick="navigate('teams')">
              Open Teams
            </button>
          </div>
        `;
        if (roleWrap) roleWrap.style.display = 'none';
        if (leaderFields) leaderFields.style.display = 'none';
        if (btn) {
          btn.innerHTML = '<i class="fa-solid fa-hourglass-half"></i> WAITING FOR LEADER TO REGISTER';
          btn.disabled = true;
          btn.style.opacity = '0.6';
          btn.style.cursor = 'not-allowed';
        }
      }
    } else {
      // User has NO team yet
      if (teamNameEl) {
        teamNameEl.readOnly = false;
        teamNameEl.style.background = '';
      }
      if (roleWrap) roleWrap.style.display = 'block';
      if (leaderFields) leaderFields.style.display = 'block';
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> CONTINUE TO PAYMENT';
      }
    }
  } catch (err) {
    console.error("Error in checkAndSyncIdeackathonRegistrationForm:", err);
  }
}

function regNext(step) {
  if (step === 1) {
    const checkedRadio = document.querySelector('input[name="event-select"]:checked');
    if (checkedRadio && checkedRadio.dataset.eventName) {
      selectedEvent = checkedRadio.dataset.eventName;
      selectedEventId = DEFAULT_EVENT_IDS[selectedEvent] || null;
    } else if (!selectedEvent) {
      selectedEvent = 'Ideackathon';
    }
    
    if (selectedEvent === 'Ideackathon') {
      startRegistrationFor('Ideackathon');
      return;
    }

    if (selectedEvent === 'CodeMiners Hackathon 2026') {
      showToast('Registration & Payment for Hackathon 2026 are managed from Team Management. Redirecting...', 'warning');
      navigate('teams');
      return;
    }

    renderEventSummaryBanner(selectedEvent);

    // Solo workshop event: completely isolate and hide ALL team controls & notices
    const noticeEl = document.getElementById('r-existing-team-notice');
    if (noticeEl) {
      noticeEl.style.display = 'none';
      noticeEl.innerHTML = '';
    }
    const roleWrap = document.getElementById('r-role-wrap');
    if (roleWrap) roleWrap.style.display = 'none';
    const leaderFields = document.getElementById('team-leader-fields');
    if (leaderFields) leaderFields.style.display = 'none';
    
    const roleEl = document.getElementById('r-role');
    if (roleEl) roleEl.value = 'solo';

    const teamNameEl = document.getElementById('r-team-name');
    if (teamNameEl) teamNameEl.value = '';
    pendingInvites = [];

    const btn = document.getElementById('reg-step-2-btn');
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> CONTINUE TO PAYMENT (₹35)';
      btn.style.background = 'linear-gradient(135deg, #2196f3, #1565c0)';
      btn.style.color = '#ffffff';
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
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
    const isSoloWorkshop = (selectedEvent === 'Appdevelopment workshop' || selectedEvent === 'CodeMiners Orientation');

    if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !college.value.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    
    const idVal = (pin || hallticket || '').trim();
    if (!idVal) {
      showToast('Please enter your College PIN.', 'error');
      return;
    }
    
    const role = isSoloWorkshop ? 'solo' : document.getElementById('r-role').value;
    if (!isSoloWorkshop && role === 'leader') {
      const teamName = document.getElementById('r-team-name').value.trim();
      const teamSize = document.getElementById('r-team-size').value;
      if (!teamName) {
        showToast('Please enter a Team Name.', 'error');
        return;
      }
      if (!teamSize || teamSize < 1 || teamSize > 5) {
        showToast('Team size must be between 1 and 5.', 'error');
        return;
      }
    }

    // Check if user is already registered for this event
    const btn = document.querySelector('#reg-panel-2 .btn-gold');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
    btn.disabled = true;

    (async () => {
      try {
        const user = window.currentUser;
        const eventId = await getEventId(selectedEvent);

        if (user) {
          const { data: regCheck, error: regError } = await supabaseClient
            .from('registrations')
            .select('id')
            .eq('event_id', eventId)
            .eq('user_id', user.uid)
            .maybeSingle();

          if (regError) {
            console.error("Error checking user registration:", regError);
          } else if (regCheck) {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
            if (isSoloWorkshop) {
              showToast('You are already registered for the Appdevelopment workshop! Check your registered events in Profile.', 'info', 6000);
            } else {
              showToast('You have already registered for this event!', 'error');
            }
            return;
          }

          if (!isSoloWorkshop && currentTeamId) {
            const { data: teamRegCheck } = await supabaseClient
              .from('registrations')
              .select('id')
              .eq('event_id', eventId)
              .eq('team_id', currentTeamId)
              .maybeSingle();
            if (teamRegCheck) {
              btn.innerHTML = originalBtnText;
              btn.disabled = false;
              showToast(`Your squad "${currentTeamData?.name || 'team'}" is already registered for this event!`, 'error');
              return;
            }
          }
        }

        if (isSoloWorkshop) {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          setRegStep(3);
          initRazorpayRegistrationPayment();
          return;
        }

        if (role === 'leader') {
          const teamName = document.getElementById('r-team-name').value.trim();
          const { data: teamData, error: teamError } = await supabaseClient
            .from('teams')
            .select('id, leader_id')
            .eq('event_id', eventId)
            .ilike('name', teamName);

          btn.innerHTML = originalBtnText;
          btn.disabled = false;

          if (teamError) {
            console.error("Error checking team name:", teamError);
            showToast('Error verifying team name.', 'error');
            return;
          }
          if (teamData && teamData.length > 0) {
            const matchingTeam = teamData[0];
            const isUserOwnSquad = (currentTeamData && currentTeamData.id === matchingTeam.id) || (user && matchingTeam.leader_id === user.uid);
            if (!isUserOwnSquad) {
              showToast(`Team name "${teamName}" is already taken for this event.`, 'error');
              return;
            }
          }
          
          if (selectedEvent === 'Ideackathon' || selectedEvent === 'CodeMiners Hackathon 2026') {
            setRegStep(3);
            initRazorpayRegistrationPayment();
          } else {
            processRegistration(btn);
          }
        } else {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          if (selectedEvent === 'Ideackathon') {
            showToast('For Ideackathon, the Team Leader registers and pays for the team. Please register as Team Leader or accept an invite in your Teams tab.', 'warning', 6000);
            return;
          }
          processRegistration(btn);
        }
      } catch (checkEx) {
        console.error("Error in registration checks:", checkEx);
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
      }
    })();
  } else if (step === 3) {
    const btn = document.querySelector('#reg-panel-3 .btn-gold');
    processRegistration(btn);
  }
}

async function processRegistration(btnElement, paymentId = null) {
  const originalBtnText = btnElement.innerHTML;
  btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btnElement.disabled = true;

  const user = window.currentUser;
  const isSoloWorkshop = (selectedEvent === 'Appdevelopment workshop' || selectedEvent === 'CodeMiners Orientation');
  const role = isSoloWorkshop ? 'solo' : (selectedEvent === 'Pre-Hackthon' ? 'individual' : document.getElementById('r-role').value);
  const teamName = isSoloWorkshop ? '' : ((selectedEvent === 'Pre-Hackthon' || !document.getElementById('r-team-name')) ? '' : document.getElementById('r-team-name').value.trim());
  const fullName = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const studyYear = document.getElementById('r-year').value;
  const idType = 'pin';
  const idValue = (document.getElementById('r-pin')?.value || document.getElementById('r-hallticket')?.value || '').trim();

  // Prepare payload for Supabase
  let currentRegTeamSize = 1;
  if (selectedEvent === 'Ideackathon') {
    const sizeInput = document.getElementById('r-team-size');
    currentRegTeamSize = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 5)) : 5;
  } else if (selectedEvent === 'CodeMiners Hackathon 2026') {
    currentRegTeamSize = (currentTeamData && currentTeamData.members) ? currentTeamData.members.length : 1;
  } else if (isSoloWorkshop) {
    currentRegTeamSize = 1;
  }

  const feeInfo = calculateEventFee(selectedEvent, currentRegTeamSize);
  const amountPaid = feeInfo.total;
  const isPaidEvent = amountPaid > 0;
  const actualPaymentId = paymentId || (isPaidEvent ? 'pay_client_' + Date.now() : 'free_reg');
  const paymentStatus = isPaidEvent ? 'captured' : 'free';

  const encryptedId = encryptIdValue(idValue, user.uid);
  const encryptedPhone = encryptData(document.getElementById('r-phone').value.trim(), user.uid);
  const encryptedCollege = encryptGlobal(document.getElementById('r-college').value.trim());

  const eventId = await getEventId(selectedEvent);

  const supabasePayload = {
    event_id: eventId,
    user_id: user.uid,
    team_id: isSoloWorkshop ? null : ((selectedEvent === 'CodeMiners Hackathon 2026' || currentTeamId) ? currentTeamId : null),
    payment_status: paymentStatus,
    amount_paid: amountPaid,
    payment_id: actualPaymentId,
    event_name: selectedEvent,
    team_size: currentRegTeamSize,
    full_name: fullName,
    email: email,
    phone: encryptedPhone,
    college: encryptedCollege,
    year: studyYear,
    id_type: idType,
    id_value: encryptedId,
    registered_at: new Date().toISOString()
  };

  // Sync latest phone and college to user's profile
  try {
    await supabaseClient.from('profiles').update({
      phone: document.getElementById('r-phone').value.trim() || undefined,
      college: document.getElementById('r-college').value.trim() || undefined
    }).eq('id', user.uid);
  } catch (profErr) {
    console.warn("Could not sync phone/college to profile:", profErr);
  }

  // Prepare data for Google Sheets
  const sheetData = new FormData();
  sheetData.append('Event', selectedEvent + (isSoloWorkshop ? ' (Solo Workshop)' : ''));
  sheetData.append('Name', fullName);
  sheetData.append('Email', email);
  sheetData.append('Phone', document.getElementById('r-phone').value.trim());
  sheetData.append('College', document.getElementById('r-college').value.trim());
  sheetData.append('Year', studyYear);
  sheetData.append('ID (PIN/Hall Ticket)', idValue || '—');
  sheetData.append('Role', isSoloWorkshop ? 'Solo Participant' : role);
  sheetData.append('Team Name', isSoloWorkshop ? '—' : (teamName || '—'));
  sheetData.append('PaymentID', actualPaymentId);
  sheetData.append('Status', paymentStatus === 'captured' ? 'Paid' : 'Free');

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxz-7gHowiQ7B-MLiSHOO3U6qclqm7Hr4oKaChr8a8Wqw31Y2Y9TBBDBIaExXKGwJNl/exec';

  // Insert into Supabase registrations table first
  supabaseClient
    .from('registrations')
    .insert(supabasePayload)
    .then(async ({ error: supabaseError }) => {
      if (supabaseError) {
        console.error("Error saving registration to Supabase: ", supabaseError);
        btnElement.innerHTML = originalBtnText;
        btnElement.disabled = false;
        showToast('Error saving registration: ' + (supabaseError.message || 'Please try again.'), 'error');
        return;
      }

      let targetTeamId = currentTeamId;
      if (!isSoloWorkshop && role === 'leader' && user && selectedEvent !== 'CodeMiners Hackathon 2026') {
        const existingTeamMatches = currentTeamData && currentTeamData.name.toLowerCase() === teamName.toLowerCase() && currentTeamData.leaderId === user.uid;

        if (!targetTeamId || !existingTeamMatches) {
          const teamPayload = {
            event_id: eventId,
            name: teamName,
            leader_id: user.uid,
            tech_stack: 'Not specified yet',
            description: 'Created during registration.'
          };

          const { data: teamData, error: teamError } = await supabaseClient
            .from('teams')
            .insert(teamPayload)
            .select('id')
            .single();

          if (teamError) {
            console.error("Error creating team in Supabase: ", teamError);
            btnElement.innerHTML = originalBtnText;
            btnElement.disabled = false;
            showToast('Registration saved, but failed to create team: ' + (teamError.message || 'Error'), 'error');
            return;
          }

          targetTeamId = teamData.id;
          currentTeamId = teamData.id;
          currentTeamData = {
            id: teamData.id,
            eventId: eventId,
            eventName: selectedEvent,
            name: teamName,
            leaderId: user.uid,
            members: [{ uid: user.uid, name: fullName, role: 'leader' }]
          };
        }

        // Link registration to team
        await supabaseClient
          .from('registrations')
          .update({ team_id: targetTeamId })
          .eq('event_id', eventId)
          .eq('user_id', user.uid);

        // Add leader to team_members if not already
        const { data: existingMember } = await supabaseClient
          .from('team_members')
          .select('id')
          .eq('team_id', targetTeamId)
          .eq('user_id', user.uid)
          .maybeSingle();

        if (!existingMember) {
          await supabaseClient
            .from('team_members')
            .insert({ team_id: targetTeamId, user_id: user.uid, role: 'leader' });
        }

        // Send invitations to selected members
        for (const member of pendingInvites) {
          try {
            const receiverUid = member.uid || member.id;
            await supabaseClient.from('invitations').insert({
              team_id: targetTeamId,
              team_name: teamName || 'Team',
              sender_id: user.uid,
              sender_name: fullName || user.displayName || 'Team Leader',
              sender_email: email || user.email,
              receiver_email: member.email,
              receiver_uid: receiverUid,
              receiver_username: member.username || member.email,
              status: 'pending'
            });
          } catch (invErr) {
            console.error("Error inviting member:", member.email, invErr);
          }
        }
      }

      // Background submission to Google Sheets
      fetch(scriptURL, {
        method: 'POST',
        body: sheetData,
        mode: 'no-cors'
      }).then(() => {
        console.log("Synced to Google Sheets");
      }).catch(err => {
        console.warn("Could not sync to Google Sheets:", err);
      });

      btnElement.innerHTML = originalBtnText;
      btnElement.disabled = false;

      regCount++;
      const receiptId = 'REG-CM-2026-' + String(regCount).padStart(4, '0');
      
      const rId = document.getElementById('receipt-id');
      if (rId) rId.textContent = receiptId;
      const rEvent = document.getElementById('receipt-event');
      if (rEvent) rEvent.textContent = isSoloWorkshop ? `${selectedEvent} (Solo Workshop)` : (selectedEvent || '—');
      const rName = document.getElementById('receipt-name');
      if (rName) rName.textContent = fullName;
      const rEmail = document.getElementById('receipt-email');
      if (rEmail) rEmail.textContent = email;
      const rAmount = document.getElementById('receipt-amount');
      if (rAmount) rAmount.textContent = `₹${amountPaid}` + (feeInfo.platformFee > 0 ? ` (₹${feeInfo.subtotal} + ₹${feeInfo.platformFee} Platform Fee)` : '');
      const rPayId = document.getElementById('receipt-payment-id');
      if (rPayId) rPayId.textContent = actualPaymentId;

      setRegStep(4);
      showToast('Registration confirmed! Saved to Supabase.', 'success');
      
      if (role === 'leader') {
        showToast(`Team "${teamName}" created and invites sent!`, 'success');
        if (typeof syncTeamSection === 'function') syncTeamSection();
      }
    });
}

function regBack(step) {
  if (step === 3) {
    if (typeof clearRPTimers === 'function') clearRPTimers();
  }
  if (step === 2) {
    if (typeof selectEventOption === 'function' && selectedEvent) {
      selectEventOption(selectedEvent);
    }
  }
  setRegStep(step - 1);
}

function regReset() {
  if (typeof clearRPTimers === 'function') clearRPTimers();
  selectedEvent = 'Appdevelopment workshop';
  if (typeof selectEventOption === 'function') {
    selectEventOption('Appdevelopment workshop');
  }
  document.getElementById('r-name').value    = '';
  document.getElementById('r-email').value   = '';
  document.getElementById('r-phone').value   = '';
  document.getElementById('r-college').value = '';
  document.getElementById('r-year').value    = 'second';
  document.getElementById('r-pin').value     = '';
  document.getElementById('r-hallticket').value = '';
  
  const noticeEl = document.getElementById('r-existing-team-notice');
  if (noticeEl) {
    noticeEl.style.display = 'none';
    noticeEl.innerHTML = '';
  }
  const bannerEl = document.getElementById('reg-event-summary-banner');
  if (bannerEl) bannerEl.innerHTML = '';

  const roleWrap = document.getElementById('r-role-wrap');
  if (roleWrap) roleWrap.style.display = 'none';
  const leaderFields = document.getElementById('team-leader-fields');
  if (leaderFields) leaderFields.style.display = 'none';
  
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
  const pinWrap = document.getElementById('pin-wrap');
  const hallTicketWrap = document.getElementById('hall-ticket-wrap');
  
  // All years (first, second, third) now use College PIN
  if (pinWrap) pinWrap.style.display = 'block';
  if (hallTicketWrap) hallTicketWrap.style.display = 'none';
}

// ─────────────────────────────────────────────────────────────
// TOGGLE ROLE FIELDS (TEAM LEADER / MEMBER)
// ─────────────────────────────────────────────────────────────
function toggleRoleFields() {
  const role = document.getElementById('r-role');
  const leaderFields = document.getElementById('team-leader-fields');
  
  if (role && leaderFields) {
    const btn = document.getElementById('reg-step-2-btn');
    if (role.value === 'leader') {
      leaderFields.style.display = 'block';
      if (btn) btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> CONTINUE TO PAYMENT';
      if (typeof updateIdeackathonFeePreview === 'function') updateIdeackathonFeePreview();
    } else {
      leaderFields.style.display = 'none';
      if (btn) btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> CONTINUE TO PAYMENT';
      // clear pending invites if switched back to member
      pendingInvites = [];
      renderPendingInvites();
    }
  }
}

let pendingInvites = [];

let searchTimeout;

function handleInviteSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performInviteSearch();
  }, 300);
}

let eventRegistrationsCache = null;
let lastEventCached = null;
window._searchedProfilesMap = window._searchedProfilesMap || {};

async function performInviteSearch() {
  const inputEl = document.getElementById('r-invite-search');
  const identifier = inputEl ? inputEl.value.trim().toLowerCase() : '';
  const resultContainer = document.getElementById('r-search-result-container');
  const user = window.currentUser;
  
  if (!user) {
    showToast("Please log in first to invite members.", "error");
    return;
  }
  
  if (!identifier) {
    if (resultContainer) {
      resultContainer.style.display = 'none';
      resultContainer.innerHTML = '';
    }
    return;
  }
  
  const maxSize = parseInt(document.getElementById('r-team-size')?.value, 10) || 5;
  if (pendingInvites.length >= (maxSize - 1)) {
    if (resultContainer) {
      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `<div style="color:var(--text-danger); font-size: 13px;">Team is full! You can only invite ${maxSize - 1} members.</div>`;
    }
    return;
  }

  if (resultContainer) {
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = '<div style="font-size: 13px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Searching registered members...</div>';
  }

  try {
    // 1. Search directly in profiles by username, full_name, or email
    const { data: profiles, error: searchError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, username, email')
      .or(`username.ilike.%${identifier}%,full_name.ilike.%${identifier}%,email.ilike.%${identifier}%`)
      .limit(8);
      
    if (searchError) throw searchError;

    if (!profiles || profiles.length === 0) {
      if (resultContainer) {
        resultContainer.innerHTML = `<div style="color:var(--text-danger); font-size: 13px;">No registered members found matching "${identifier}".</div>`;
      }
      return;
    }

    // 2. Check if any found profiles are already in a team for this event
    const targetEventId = await getEventId(selectedEvent || 'Ideackathon');
    const userIds = profiles.map(p => p.id);
    const existingTeamUserIds = new Set();

    if (userIds.length > 0) {
      const { data: memberRows, error: memberError } = await supabaseClient
        .from('team_members')
        .select('user_id, team_id, teams(id, name, event_id)')
        .in('user_id', userIds);

      if (!memberError && memberRows) {
        memberRows.forEach(m => {
          if (m.teams && m.teams.event_id === targetEventId) {
            existingTeamUserIds.add(m.user_id);
          }
        });
      }
    }

    // Cache profiles in global map
    window._searchedProfilesMap = window._searchedProfilesMap || {};
    profiles.forEach(p => {
      window._searchedProfilesMap[p.id] = {
        uid: p.id,
        id: p.id,
        username: p.full_name || p.username || p.email,
        email: p.email || ''
      };
    });

    // 3. Render HTML
    let html = '';
    profiles.forEach(prof => {
      const receiverUid = prof.id;
      const receiverEmail = prof.email || '';
      const receiverUsername = prof.full_name || prof.username || receiverEmail;

      let actionHtml = '';
      if (receiverUid === user.uid) {
        actionHtml = `<div style="color:var(--text-danger); font-size: 11px; font-weight: 700;">You</div>`;
      } else if (existingTeamUserIds.has(receiverUid)) {
        actionHtml = `<div style="color:var(--text-danger); font-size: 11px; font-weight: 700;">Already in a team</div>`;
      } else if (pendingInvites.some(inv => (inv.uid === receiverUid || inv.id === receiverUid))) {
        actionHtml = `<div style="color:var(--color-amber); font-size: 11px; font-weight: 700;"><i class="fa-solid fa-check"></i> Added</div>`;
      } else {
        actionHtml = `
          <button type="button" class="btn-ghost" style="padding: 4px 12px; font-size: 12px; border: 1px solid var(--gold-primary); color: var(--gold-primary); cursor: pointer;" onclick="addInviteToList('${receiverUid}')">
            <i class="fa-solid fa-paper-plane"></i> Invite
          </button>
        `;
      }

      html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div>
            <div style="font-weight: bold; color: var(--text-light); font-size: 14px;">${receiverUsername}</div>
            <div style="color: var(--text-muted); font-size: 12px;">${receiverEmail}</div>
          </div>
          ${actionHtml}
        </div>
      `;
    });

    if (resultContainer) {
      resultContainer.innerHTML = html;
    }
  } catch (error) {
    console.error("Error searching user:", error);
    if (resultContainer) {
      resultContainer.innerHTML = '<div style="color:var(--text-danger); font-size: 13px;">Error searching for user: ' + (error.message || error) + '</div>';
    }
  }
}

function addInviteToList(uid, username, email) {
  const sizeInput = document.getElementById('r-team-size');
  const maxSize = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 5)) : 5;

  if (pendingInvites.length >= (maxSize - 1)) {
    showToast(`You can only invite ${maxSize - 1} members for a team of ${maxSize}.`, "error");
    return;
  }

  const cached = window._searchedProfilesMap?.[uid] || { uid, id: uid, username: username || uid, email: email || '' };
  const targetUid = cached.uid || uid;
  const targetUsername = cached.username || username || 'Member';
  const targetEmail = cached.email || email || '';

  if (pendingInvites.some(inv => (inv.uid === targetUid || inv.id === targetUid))) {
    showToast("This member is already in your invitation list.", "warning");
    return;
  }

  pendingInvites.push({
    uid: targetUid,
    id: targetUid,
    username: targetUsername,
    email: targetEmail
  });

  const searchInput = document.getElementById('r-invite-search');
  if (searchInput) searchInput.value = '';
  const resultContainer = document.getElementById('r-search-result-container');
  if (resultContainer) {
    resultContainer.style.display = 'none';
    resultContainer.innerHTML = '';
  }
  renderPendingInvites();
}

function removeInvite(uid) {
  pendingInvites = pendingInvites.filter(inv => inv.uid !== uid && inv.id !== uid);
  renderPendingInvites();
}

function renderPendingInvites() {
  const sizeInput = document.getElementById('r-team-size');
  const maxSize = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 5)) : 5;
  const countEl = document.getElementById('r-invite-count');
  const maxEl = document.getElementById('r-invite-max');
  if (countEl) countEl.textContent = pendingInvites.length;
  if (maxEl) maxEl.textContent = Math.max(0, maxSize - 1);

  const container = document.getElementById('r-selected-invites-list');
  if (!container) return;

  if (pendingInvites.length === 0) {
    container.innerHTML = '<div style="font-size:12px; color:var(--text-muted); font-style:italic;">No members selected yet.</div>';
    return;
  }
  
  let html = '';
  pendingInvites.forEach(inv => {
    html += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.03); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
        <div>
          <div style="font-size: 13px; color: var(--text-light);">${inv.username}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${inv.email}</div>
        </div>
        <button type="button" style="background:none; border:none; color: var(--text-danger); cursor: pointer;" onclick="removeInvite('${inv.uid}')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
  });
  container.innerHTML = html;
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

let currentPaymentDetails = {
  amount: 0,
  name: '',
  email: ''
};
let paymentVerificationTimers = [];

function handleDonation() {
  const name  = document.getElementById('donor-name').value.trim();
  const email = document.getElementById('donor-email').value.trim();

  let finalAmount = donationAmount;
  const customVal = document.getElementById('custom-amount').value;
  if (customVal && Number(customVal) >= 1) {
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

  currentPaymentDetails = {
    amount: finalAmount,
    name: displayName,
    email: email
  };

  payDonationWithRazorpaySDK(finalAmount, displayName, email);
}

function openPaymentModal(amount, name) {
  // Update amount display
  document.getElementById('paymentAmountDisplay').textContent = `₹${amount}`;

  // Reset verification status
  const statusDot = document.getElementById('paymentStatusDot');
  const statusText = document.getElementById('paymentStatusText');
  statusDot.className = 'status-dot pulsing';
  statusText.textContent = 'Awaiting payment verification...';
  statusText.style.color = '';

  // Clear existing timers
  paymentVerificationTimers.forEach(clearTimeout);
  paymentVerificationTimers = [];

  // Build UPI URI parameters:
  const payeeUPI = "8106116521-1@okbizaxis";
  const payeeName = "Mallikarjuna tea point";
  const merchantCode = "BCR2DN5TRDR2F4QL";
  const transactionRef = "CICAgNi99uX9Pg";
  const transactionNote = encodeURIComponent(`Donation by ${name}`);
  
  // Construct standard UPI deep link string
  const upiLink = `upi://pay?pa=${payeeUPI}&pn=${encodeURIComponent(payeeName)}&mc=${merchantCode}&tr=${transactionRef}&tn=${transactionNote}&am=${amount}&cu=INR`;
  
  // Detect mobile
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  
  if (isMobile) {
    document.getElementById('desktopPaymentArea').style.display = 'none';
    document.getElementById('mobilePaymentArea').style.display = 'block';
    
    const gpayBtn = document.getElementById('mobileGPayBtn');
    gpayBtn.style.display = 'flex';
    gpayBtn.href = upiLink;
  } else {
    document.getElementById('desktopPaymentArea').style.display = 'block';
    document.getElementById('mobilePaymentArea').style.display = 'none';
    document.getElementById('mobileGPayBtn').style.display = 'none';
    
    // Generate QR Code dynamically
    const qrImage = document.getElementById('paymentQRCode');
    qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  }
  
  // Show overlay
  const modal = document.getElementById('paymentModal');
  modal.classList.add('active');

  // Start automatic verification simulation
  // Step 1: Update status to "Verifying with bank..." after 3.5 seconds
  paymentVerificationTimers.push(setTimeout(() => {
    statusText.textContent = 'Verifying transaction with bank...';
  }, 3500));

  // Step 2: Update status to "Success" after 7 seconds
  paymentVerificationTimers.push(setTimeout(() => {
    statusDot.className = 'status-dot success';
    statusText.textContent = 'Payment verified successfully!';
    statusText.style.color = '#00e676';
    showToast('Payment verified!', 'success');
  }, 7000));

  // Step 3: Complete donation and close modal after 8.8 seconds
  paymentVerificationTimers.push(setTimeout(() => {
    confirmPayment();
  }, 8800));
}

function closePaymentModal() {
  document.getElementById('paymentModal').classList.remove('active');
  // Cancel verification checks
  paymentVerificationTimers.forEach(clearTimeout);
  paymentVerificationTimers = [];
}

function copyUPI() {
  const upiText = document.getElementById('upiIdText').textContent;
  navigator.clipboard.writeText(upiText).then(() => {
    showToast('UPI ID copied to clipboard!', 'success');
    const copyBtn = document.querySelector('.btn-copy-upi');
    if (copyBtn) {
      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      copyBtn.style.borderColor = '#00e676';
      copyBtn.style.color = '#00e676';
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy UPI: ', err);
    showToast('Failed to copy UPI ID.', 'error');
  });
}

function confirmPayment() {
  closePaymentModal();
  
  // Simulate processing animation on main button first
  const btn = document.querySelector('#donation-form-card .btn-gold');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Confirming Payment...';
  btn.disabled  = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-hand-holding-heart"></i> DONATE NOW';
    btn.disabled  = false;

    document.getElementById('donation-main-grid').style.display  = 'none';
    document.getElementById('donation-thankyou').style.display   = 'flex';
    showToast(`Thank you ${currentPaymentDetails.name}! ₹${currentPaymentDetails.amount} donation confirmed.`, 'success', 5000);
  }, 1000);
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
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    const isScrolled = window.scrollY > 30;
    nav.classList.toggle('scrolled', isScrolled);
    if (toggleBtn) {
      toggleBtn.classList.toggle('scrolled', isScrolled);
    }
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
      donationAmount = null;
    });
  }

  // Dynamically set events hosted count target based on ALL_EVENTS completion status
  try {
    const today = new Date();
    const completedCount = ALL_EVENTS.filter(ev => new Date(ev.completionDate) <= today).length;
    document.querySelectorAll('.events-hosted-count').forEach(el => {
      el.setAttribute('data-target', completedCount);
      // If we want a '+' sign for events hosted in the UI
      el.setAttribute('data-target-plus', 'true');
      el.textContent = completedCount + '+';
    });
  } catch (err) {
    console.error("Error setting events hosted count:", err);
  }
});

// ─────────────────────────────────────────────────────────────
// LIQUID GLASS PHYSICS (DESKTOP + MOBILE)
// ─────────────────────────────────────────────────────────────
function initLiquidGlassPhysics() {
  if (window.innerWidth < 768) return; // Disable interactive 3D physics on mobile to prevent lag during scroll
  
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
  { id: 'ideackathon', title: 'Ideackathon', displayDate: 'Sept 13, 2026', completionDate: '2026-09-13' },
  { id: 'appdev-workshop', title: 'Appdevelopment workshop', displayDate: 'Sept 13, 2026', completionDate: '2026-09-13' },
  { id: 'orientation', title: 'CodeMiners Orientation', displayDate: 'June 28, 2026', completionDate: '2026-06-28' },
  { id: 'pre-hackathon', title: 'Pre-Hackthon', displayDate: 'July 1, 2026', completionDate: '2026-07-01' },
  { id: 'hackathon', title: 'CodeMiners Hackathon 2026', displayDate: 'July 6, 2026', completionDate: '2026-07-06' }
];

async function loadCompletedEvents() {
  const container = document.getElementById('completed-events-list');
  if (!container) return;
  
  const today = new Date();
  let eventsList = ALL_EVENTS;

  try {
    const { data: dbEvents, error } = await supabaseClient
      .from('events')
      .select('*')
      .order('completion_date', { ascending: true });
    if (!error && dbEvents && dbEvents.length > 0) {
      eventsList = dbEvents.map(e => ({
        id: e.id,
        title: e.title,
        displayDate: e.display_date || e.completion_date || 'TBD',
        completionDate: e.completion_date || '2099-01-01'
      }));
    }
  } catch (e) {
    console.warn("Using static events list fallback:", e);
  }

  const completed = eventsList.filter(ev => new Date(ev.completionDate) <= today);
  
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

async function viewParticipants(eventId, eventTitle) {
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
    const eventId = await getEventId(eventTitle);

    const { data, error } = await supabaseClient
      .from('registrations')
      .select('*, teams(*)')
      .eq('event_id', eventId);

    if (error) throw error;

    // Fetch full squad members from team_members for all registered teams
    const teamIds = (data || []).map(item => item.team_id).filter(Boolean);
    const teamMembersMap = {};

    if (teamIds.length > 0) {
      try {
        const { data: membersData } = await supabaseClient
          .from('team_members')
          .select('team_id, role, user_id, profiles(id, full_name, username, email, college)')
          .in('team_id', teamIds);

        if (membersData) {
          membersData.forEach(tm => {
            if (!teamMembersMap[tm.team_id]) teamMembersMap[tm.team_id] = [];
            const profile = tm.profiles || {};
            const mName = profile.full_name || profile.username || 'Member';
            const mCollege = profile.college ? decryptGlobal(profile.college) : '';
            teamMembersMap[tm.team_id].push({
              name: mName,
              role: tm.role,
              college: mCollege,
              isLeader: tm.role === 'leader'
            });
          });
        }
      } catch (e) {
        console.warn("Could not fetch team_members for participants:", e);
      }
    }

    // Fetch associated profile records (for about/projects/pin) without foreign key dependency
    const userIds = (data || []).map(item => item.user_id).filter(Boolean);
    const profilesMap = {};
    if (userIds.length > 0) {
      try {
        const { data: profilesData } = await supabaseClient
          .from('profiles')
          .select('id, full_name, username, email, college, pin, about, projects')
          .in('id', userIds);
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      } catch (pe) {
        console.warn("Could not fetch supplementary profiles:", pe);
      }
    }
    
    fetchedMiners = [];
    if (data) {
      const user = window.currentUser;
      data.forEach(item => {
        const profile = profilesMap[item.user_id] || {};
        const team = item.teams || {};
        const pEmail = profile.email || item.email || '';
        const isOwner = user && (pEmail === user.email);
        const pName = profile.full_name || item.full_name || 'Participant';
        const pCollege = profile.college || item.college || '';
        const decryptedCollege = decryptGlobal(pCollege);
        const decryptedPin = isOwner ? decryptIdValue(profile.pin || item.id_value, user.uid) : 'Encrypted';
        
        let aboutVal = '';
        let projectsArr = [];

        if (profile) {
          try {
            if (profile.about) aboutVal = decryptData(profile.about, profile.id);
          } catch(e){}
          
          try {
            if (profile.projects) {
              if (Array.isArray(profile.projects)) {
                projectsArr = profile.projects;
              } else if (typeof profile.projects === 'string') {
                const decProj = decryptData(profile.projects, profile.id);
                if (decProj) projectsArr = JSON.parse(decProj);
              }
            }
          } catch(e){}
        }

        const isSoloEvent = (eventTitle === 'Appdevelopment workshop' || eventTitle === 'Pre-Hackthon');
        const teamName = isSoloEvent ? null : (team.name || item.team_name);
        if (teamName) {
          const membersFromDb = item.team_id && teamMembersMap[item.team_id];
          let formattedMemberList = [];
          let squadCollege = decryptedCollege;

          if (membersFromDb && membersFromDb.length > 0) {
            formattedMemberList = membersFromDb.map(m => m.isLeader ? `${m.name} (Leader)` : m.name);
            const leaderMember = membersFromDb.find(m => m.isLeader);
            if (leaderMember && leaderMember.college) squadCollege = leaderMember.college;
          } else {
            formattedMemberList = [pName + ' (Leader)'];
          }

          let existingTeam = fetchedMiners.find(m => m.name === teamName && m.participationType === 'Team');
          if (existingTeam) {
            formattedMemberList.forEach(mem => {
              if (!existingTeam.teamMembers.includes(mem)) {
                existingTeam.teamMembers.push(mem);
              }
            });
            existingTeam.teamSize = existingTeam.teamMembers.length;
            existingTeam.subtitle = `${existingTeam.teamSize} Members · ${squadCollege || 'Squad'}`;
          } else {
            fetchedMiners.push({
              id: teamName,
              name: teamName,
              subtitle: `${formattedMemberList.length} Member${formattedMemberList.length > 1 ? 's' : ''} · ${squadCollege || 'Squad'}`,
              participationType: 'Team',
              teamSize: formattedMemberList.length,
              teamMembers: formattedMemberList,
              teamProjectLink: item.project_link || team.tech_stack || '',
              projectName: item.project_name || team.name || ''
            });
          }
        } else {
          fetchedMiners.push({
            id: item.id,
            name: pName,
            subtitle: decryptedCollege || '', 
            year: item.year || '',
            role: 'Participant',
            about: aboutVal || '', 
            projects: projectsArr.length > 0 ? projectsArr : (item.project_link ? [{name: item.project_name || 'Project', link: item.project_link}] : []),
            pin: decryptedPin || '',
            participationType: '',
            teamName: ''
          });
        }
      });
    }
    
    renderMinersList('');
  } catch (e) {
    console.warn("Notice: DB error fetching participants:", e);
    fetchedMiners = [];
    renderMinersList('', true);
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
  
  // Timeout guard for 8 seconds
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Database request timed out")), 8000)
  );
  const fetchPromise = supabaseClient.from('profiles').select('*');

  Promise.race([fetchPromise, timeoutPromise])
    .then(({ data, error }) => {
      if (error) throw error;
      
      fetchedMiners = [];
      if (data) {
        data.forEach(item => {
          let projectsArr = [];
          try {
            if (item.projects) {
              if (Array.isArray(item.projects)) {
                projectsArr = item.projects;
              } else if (typeof item.projects === 'string') {
                const decProj = decryptData(item.projects, item.id);
                if (decProj) projectsArr = JSON.parse(decProj);
              }
            }
          } catch (e) {
            console.warn("Failed to parse projects", e);
          }

          let decAbout = item.about;
          let decPin = item.pin;
          try {
            if (item.about) decAbout = decryptData(item.about, item.id);
            if (item.pin) decPin = decryptData(item.pin, item.id);
          } catch (e) {}

          fetchedMiners.push({
            id: item.id,
            name: item.full_name || 'Anonymous',
            subtitle: item.username || '', 
            year: '',
            role: 'CodeMiner',
            about: decAbout || '',
            projects: projectsArr,
            pin: decPin || ''
          });
        });
      }
      
      renderMinersList('', false);
    })
    .catch((error) => {
      console.warn("Miners fetch notice (database unreachable or sleeping):", error);
      fetchedMiners = [];
      renderMinersList('', true);
    });
}

function renderMinersList(searchQuery = '', isError = false) {
  window.lastMinersSearchQuery = searchQuery;
  const container = document.getElementById('participants-list-content');
  if (!container) return;

  if (isError) {
    container.innerHTML = `
      <div style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(240,165,0,0.1); border: 1px solid rgba(240,165,0,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: var(--gold-primary); font-size: 22px;">
          <i class="fa-solid fa-cloud-bolt"></i>
        </div>
        <div style="font-weight: 700; color: var(--text-light); margin-bottom: 6px; font-size: 15px;">Database Reconnecting</div>
        <p style="font-size: 12.5px; max-width: 380px; margin: 0 auto 16px; line-height: 1.5; color: var(--text-muted);">
          The cloud database timed out or is currently waking up. If you manage this project, please restore it in your Supabase dashboard.
        </p>
        <button class="btn btn-primary" style="padding: 8px 22px; font-size: 13px;" onclick="loadAllMiners()">
          <i class="fa-solid fa-rotate-right" style="margin-right: 6px;"></i> Retry Connection
        </button>
      </div>
    `;
    return;
  }

  const filtered = fetchedMiners.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

  const searchInput = document.getElementById('miner-search');
  const minersGrid = document.getElementById('miners-grid');

  let gridHtml = '';
  if (filtered.length === 0) {
    gridHtml += `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No miners found.</p>`;
  } else {
    filtered.forEach(m => {
      const isTeam = m.participationType === 'Team';
      gridHtml += `
        <div class="event-item" style="display: flex; align-items: center; gap: 16px; padding: 12px; cursor: pointer;" onclick="viewMinerProfile('${m.id}')">
          <div style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid rgba(240,165,0,0.3); background: rgba(240,165,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: ${isTeam ? '18px' : '20px'}; flex-shrink: 0;">
            <i class="fa-solid ${isTeam ? 'fa-people-group' : 'fa-user'}"></i>
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; color: var(--text-light); margin-bottom:2px; display: flex; align-items: center; gap: 8px;">
              ${m.name}
              ${isTeam ? `<span class="badge badge-gold" style="font-size: 10px; padding: 2px 7px;">TEAM (${m.teamSize || m.teamMembers?.length || 1})</span>` : ''}
            </div>
            <div style="font-size: 12px; color: var(--text-muted);">${m.subtitle}</div>
          </div>
          <i class="fa-solid fa-chevron-right" style="margin-left: auto; color: var(--text-muted);"></i>
        </div>
      `;
    });
  }

  if (searchInput && minersGrid) {
    minersGrid.innerHTML = gridHtml;
  } else {
    let html = `
      <div style="margin-bottom: 20px; position: relative;">
        <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 14px; color: var(--text-muted);"></i>
        <input type="text" id="miner-search" placeholder="Search by username or name..." 
               style="width: 100%; padding: 12px 16px 12px 44px; border-radius: 8px; border: 1.5px solid #111111; background: #ffffff; color: #111111; outline: none; font-family: inherit; box-shadow: none !important;" 
               value="${searchQuery}" oninput="renderMinersList(this.value)">
      </div>
      <div style="display: grid; grid-template-columns: 1fr; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px; will-change: transform, scroll-position; transform: translate3d(0,0,0); backface-visibility: hidden; -webkit-overflow-scrolling: touch;" id="miners-grid">
        ${gridHtml}
      </div>
    `;
    container.innerHTML = html;
  }

  // Restore scroll positions if they were saved
  if (window.lastMinersScrollState) {
    const state = window.lastMinersScrollState;
    window.lastMinersScrollState = null; // Clear state
    setTimeout(() => {
      const gEl = document.getElementById('miners-grid');
      if (gEl && state.grid) {
        gEl.scrollTop = state.grid;
      }
      const pBox = container.closest('.participants-box');
      if (pBox && state.parent) {
        pBox.scrollTop = state.parent;
      }
      if (state.main !== undefined) {
        window.scrollTo(0, state.main);
      }
    }, 0);
  }
}

function viewMinerProfile(minerId) {
  const m = fetchedMiners.find(x => x.id === minerId);
  if (!m) return;
  const container = document.getElementById('participants-list-content');
  if (!container) return;

  // Capture scroll positions before replacing container content
  const parentBox = container.closest('.participants-box');
  const parentScrollTop = parentBox ? parentBox.scrollTop : 0;
  const gridEl = document.getElementById('miners-grid');
  const gridScrollTop = gridEl ? gridEl.scrollTop : 0;
  const mainScrollTop = window.scrollY || document.documentElement.scrollTop;
  
  window.lastMinersScrollState = {
    parent: parentScrollTop,
    grid: gridScrollTop,
    main: mainScrollTop
  };
  
  let projectsHtml = '';
  if (!m.participationType && m.projects && m.projects.length > 0) {
    projectsHtml = `
      <div class="miner-profile-card" style="margin-top: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-code"></i> Personal Projects</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${m.projects.map(p => `
            <a href="${p.link}" target="_blank" style="color: var(--gold-primary); text-decoration: none; font-size: 14px; background: rgba(240,165,0,0.1); padding: 8px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-link" style="font-size: 12px;"></i> ${p.name || 'View Project'}
            </a>
          `).join('')}
        </div>
      </div>
    `;
  } else if (m.participationType === 'Team') {
    const safeId = btoa(unescape(encodeURIComponent(m.id))).replace(/=/g, '');
    const loggedInName = (window.currentUserDoc && window.currentUserDoc.full_name) || (window.currentUser && window.currentUser.displayName) || '';
    const isMember = m.teamMembers && m.teamMembers.some(member => member.toLowerCase().trim() === loggedInName.toLowerCase().trim());
    projectsHtml = `
      <div class="miner-profile-card" style="margin-top: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-rocket"></i> Team Project Link</h3>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${m.teamProjectLink ? `
            <a href="${m.teamProjectLink}" target="_blank" style="color: var(--gold-primary); text-decoration: none; font-size: 14px; background: rgba(240,165,0,0.1); padding: 8px 12px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <i class="fa-solid fa-link" style="font-size: 12px;"></i> ${m.teamProjectLink}
            </a>
          ` : `<p style="color: var(--text-muted); font-size: 13px; margin: 0 0 8px 0;">No project link added yet.</p>`}
          
          ${isMember ? `
            <div style="display: flex; gap: 8px; align-items: center;">
              <input type="text" id="team-proj-link-${safeId}" placeholder="Enter project URL..." value="${m.teamProjectLink}" class="field-input" style="flex: 1; padding: 10px; font-size: 13px; border-radius: 6px; box-shadow: none !important;">
              <button class="btn-gold" style="padding: 10px 16px; font-size: 13px; border-radius: 6px;" onclick="updateTeamProjectLink(this, '${m.id}', '${safeId}')">Save</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  let aboutHtml = '';
  if (!m.participationType && m.about) {
    aboutHtml = `
      <div class="miner-profile-card" style="margin-bottom: 16px;">
        <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-address-card"></i> About Miner</h3>
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
        <div class="miner-profile-card" style="margin-bottom: 16px;">
          <h3 style="margin-top:0; font-size: 15px; color: var(--text-light); border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 8px; margin-bottom: 12px;"><i class="fa-solid fa-users"></i> Team Members</h3>
          <ul style="color: var(--text-muted); font-size: 13px; line-height: 1.6; margin: 0; padding-left: 20px;">
            ${mArray.map(member => `<li>${member}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <button class="btn-icon" style="margin-bottom: 16px; color: var(--gold-primary); background: transparent; border: none; cursor: pointer; display:flex; align-items:center; gap: 8px; font-weight:600; font-family:inherit; padding: 0;" onclick="renderMinersList(window.lastMinersSearchQuery || '')">
      <i class="fa-solid fa-arrow-left"></i> Back to Miners
    </button>
    <div style="text-align: center; padding: 0;">
      <div style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--gold-primary); margin: 0 auto 12px auto; box-shadow: 0 4px 16px rgba(240,165,0,0.2); background: rgba(240,165,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: 40px;">
        <i class="fa-solid fa-user"></i>
      </div>
      <h2 style="margin: 0 0 4px 0; color: var(--text-light); font-size: 22px;">${m.name}</h2>
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

async function updateTeamProjectLink(btn, teamName, safeId) {
  const inputEl = document.getElementById(`team-proj-link-${safeId}`);
  if (!inputEl) return;
  const url = inputEl.value.trim();
  
  if (!url) {
    showToast("Please enter a valid URL.", "error");
    return;
  }
  
  // Security check: must be a member of the team to update team project link
  const m = fetchedMiners.find(x => x.id === teamName);
  if (!m) return;
  const loggedInName = (window.currentUserDoc && window.currentUserDoc.full_name) || (window.currentUser && window.currentUser.displayName) || '';
  const isMember = m.teamMembers && m.teamMembers.some(member => member.toLowerCase().trim() === loggedInName.toLowerCase().trim());
  if (!isMember) {
    showToast("Permission denied. You are not a member of this team.", "error");
    return;
  }
  
  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
  btn.disabled = true;

  try {
    const { error } = await supabaseClient
      .from('registrations')
      .update({ project_link: url })
      .eq('team_name', teamName);
      
    if (error) throw error;
    
    showToast("Team project link updated!", "success");
    const m = fetchedMiners.find(x => x.id === teamName);
    if (m) {
      m.teamProjectLink = url;
    }
    viewMinerProfile(teamName);
  } catch (err) {
    console.error("Error updating team project link:", err);
    showToast("Failed to update link.", "error");
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
  }
}

let activeTeamSectionEvent = 'Ideackathon';

function switchTeamSectionEvent(eventName) {
  activeTeamSectionEvent = eventName || 'Ideackathon';
  syncTeamSection(activeTeamSectionEvent);
}

async function syncTeamSection(preferredEventName) {
  const user = window.currentUser;
  if (!user) return;

  const targetEventName = preferredEventName || activeTeamSectionEvent || 'Ideackathon';
  activeTeamSectionEvent = targetEventName;
  currentTeamId = null;
  currentTeamData = null;

  const switcherEl = document.getElementById('team-active-event-select');
  if (switcherEl && switcherEl.value !== targetEventName) {
    switcherEl.value = targetEventName;
  }
  const createSelectEl = document.getElementById('new-team-event');
  if (createSelectEl && createSelectEl.value !== targetEventName) {
    createSelectEl.value = targetEventName;
  }

  const loadingView = document.getElementById('team-loading-view');
  const noTeamView = document.getElementById('team-no-team-view');
  const dashboardView = document.getElementById('team-dashboard-view');

  if (loadingView) loadingView.style.display = 'block';
  if (noTeamView) noTeamView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'none';

  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.uid)
      .maybeSingle();

    if (profileError) throw profileError;
    currentUserDoc = profile;

    const targetEventId = await getEventId(targetEventName);

    // Query team_members strictly for user's team membership in THIS event
    const { data: userMemberships, error: memberError } = await supabaseClient
      .from('team_members')
      .select('team_id, role, teams(*)')
      .eq('user_id', user.uid);

    if (memberError) throw memberError;

    // Strictly find the team belonging to targetEventId - NO fallback to other events!
    const membership = (userMemberships || []).find(m => m.teams && m.teams.event_id === targetEventId);

    if (!membership || !membership.teams) {
      currentTeamId = null;
      currentTeamData = null;
      renderNoTeamView(user, targetEventName);
      return;
    }

    const teamRecord = membership.teams;
    currentTeamId = teamRecord.id;

    // Fetch all members of this team from team_members joined with profiles
    const { data: teamMembers, error: tmError } = await supabaseClient
      .from('team_members')
      .select('id, role, user_id, profiles(id, full_name, email, username)')
      .eq('team_id', currentTeamId);

    if (tmError) throw tmError;

    const formattedMembers = (teamMembers || []).map(tm => ({
      uid: tm.user_id,
      name: tm.profiles?.full_name || tm.profiles?.username || 'Member',
      email: tm.profiles?.email || '',
      role: tm.role
    }));

    const formattedTeamData = {
      id: teamRecord.id,
      eventId: teamRecord.event_id,
      eventName: targetEventName,
      name: teamRecord.name,
      leaderId: teamRecord.leader_id,
      leaderName: formattedMembers.find(m => m.role === 'leader')?.name || 'Leader',
      techStack: teamRecord.tech_stack || 'Not specified',
      description: teamRecord.description || 'No description provided.',
      members: formattedMembers
    };

    currentTeamData = formattedTeamData;

    renderTeamDashboard(user, currentTeamId, formattedTeamData);
    if (loadingView) loadingView.style.display = 'none';
    if (dashboardView) {
      dashboardView.style.display = 'grid';
      if (window.innerWidth < 800) {
        dashboardView.style.display = 'block';
      }
    }
  } catch (error) {
    console.error("Error syncing team section:", error);
    showToast("Failed to load team data.", "error");
    renderNoTeamView(user, targetEventName);
  } finally {
    const lv = document.getElementById('team-loading-view');
    if (lv) lv.style.display = 'none';
  }
}

function filterPastEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Filter registration selections
  const container = document.getElementById('event-select-container');
  if (container) {
    const options = container.querySelectorAll('.event-select-opt');
    let visibleCount = 0;

    options.forEach(opt => {
      const endDateStr = opt.getAttribute('data-end-date');
      if (endDateStr) {
        const parts = endDateStr.split('-');
        const endDate = new Date(parts[0], parts[1] - 1, parts[2]);
        endDate.setHours(23, 59, 59, 999);

        if (today > endDate) {
          // Keep expired options visible but disable them and show "Closed" badge
          opt.style.display = 'flex';
          opt.style.opacity = '0.5';
          opt.style.pointerEvents = 'none';
          
          const radio = opt.querySelector('input[type="radio"]');
          if (radio) {
            radio.disabled = true;
            radio.checked = false;
          }
          
          const badge = opt.querySelector('.badge');
          if (badge) {
            badge.className = 'badge';
            badge.style.background = 'rgba(244,67,54,0.15)';
            badge.style.color = '#f44336';
            badge.style.borderColor = 'rgba(244,67,54,0.3)';
            badge.innerHTML = '<i class="fa-solid fa-lock" style="font-size:10px; margin-right:4px;"></i> Closed';
          }
          visibleCount++;
        } else {
          opt.style.display = 'flex';
          visibleCount++;
        }
      }
    });

    if (visibleCount === 0) {
      let fallback = document.getElementById('no-events-fallback');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'no-events-fallback';
        fallback.style.cssText = 'text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px;';
        fallback.innerHTML = '<i class="fa-solid fa-calendar-xmark" style="font-size: 24px; margin-bottom: 12px; color: var(--text-muted); display: block;"></i> No active events are available for registration at this time.';
        container.parentNode.insertBefore(fallback, container.nextSibling);
      }
      const nextBtn = document.querySelector('#reg-panel-1 .btn-gold');
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
      }
    }
  }

  // 2. Filter upcoming event cards in dashboard
  const previewGrid = document.querySelector('.events-preview-grid');
  if (previewGrid) {
    const cards = previewGrid.querySelectorAll('.event-card');
    let visibleCards = 0;
    
    cards.forEach(card => {
      const endDateStr = card.getAttribute('data-end-date');
      if (endDateStr) {
        const parts = endDateStr.split('-');
        const endDate = new Date(parts[0], parts[1] - 1, parts[2]);
        endDate.setHours(23, 59, 59, 999);

        if (today > endDate) {
          card.style.display = 'none';
        } else {
          card.style.display = 'flex';
          visibleCards++;
        }
      }
    });

    if (visibleCards === 0) {
      let fallback = document.getElementById('no-upcoming-fallback');
      if (!fallback) {
        fallback = document.createElement('div');
        fallback.id = 'no-upcoming-fallback';
        fallback.style.cssText = 'text-align: center; padding: 40px; color: var(--text-muted); grid-column: 1 / -1;';
        fallback.innerHTML = '<i class="fa-solid fa-calendar-xmark" style="font-size: 32px; margin-bottom: 16px; color: var(--text-muted); display: block;"></i> No upcoming events scheduled.';
        previewGrid.appendChild(fallback);
      }
    }
  }
}

// Initialize on load
setTimeout(() => {
  loadCompletedEvents();
  loadAllMiners();
  filterPastEvents();
}, 500);

// ─────────────────────────────────────────────────────────────
// HACKATHON TEAM MANAGEMENT WORKFLOW
// ─────────────────────────────────────────────────────────────
let currentTeamId = null;
let currentTeamData = null;




function renderNoTeamView(user, targetEventName) {
  const eventName = targetEventName || activeTeamSectionEvent || 'Ideackathon';
  const loadingView = document.getElementById('team-loading-view');
  const noTeamView = document.getElementById('team-no-team-view');
  if (loadingView) loadingView.style.display = 'none';
  if (noTeamView) {
    noTeamView.style.display = 'grid';
    if (window.innerWidth < 800) {
      noTeamView.style.display = 'block';
    }
  }
  
  // Reset input values
  const nameInput = document.getElementById('new-team-name');
  const techInput = document.getElementById('new-team-tech');
  const descInput = document.getElementById('new-team-desc');
  if (nameInput) nameInput.value = '';
  if (techInput) techInput.value = '';
  if (descInput) descInput.value = '';

  const eventSelect = document.getElementById('new-team-event');
  if (eventSelect) eventSelect.value = eventName;
  const switcherEl = document.getElementById('team-active-event-select');
  if (switcherEl) switcherEl.value = eventName;

  // Update instruction banner dynamically for event
  const isIdeackathon = (eventName === 'Ideackathon');
  const infoBanner = document.getElementById('team-info-banner-content');
  if (infoBanner) {
    if (isIdeackathon) {
      infoBanner.innerHTML = `
        <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #111111; display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
          Ideackathon Team Registration &amp; Payment
          <span style="font-size: 11px; font-weight: 700; color: #111; background: #eee; border: 1px solid #ccc; border-radius: 12px; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
            <img src="cloud-community-logo.jpg" alt="CC" style="width: 13px; height: 13px; border-radius: 50%; object-fit: cover;"> &lt;CC&gt; Collab
          </span>
        </h3>
        <p style="margin: 0; font-size: 13.5px; color: #444; line-height: 1.5;">
          <strong>Ideackathon</strong> is an innovation pitching and prototyping challenge for teams of 1 to 5 members, hosted in official collaboration with <strong>Cloud Community &lt;CC&gt;</strong>:
        </p>
        <ol style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #555; line-height: 1.5;">
          <li><strong>Create a New Team</strong> below (which designates you as the Team Leader), OR</li>
          <li><strong>Accept a pending team invitation</strong> sent by another Team Leader.</li>
        </ol>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; font-style: italic;">
          Once your squad is assembled, the Team Leader confirms details and pays the registration fee: <strong>₹50/head + ₹5 platform fee per member</strong> (Total ₹55 per member).
        </p>
        <div style="margin-top: 14px; padding: 12px 14px; background: rgba(240, 165, 0, 0.08); border-left: 3px solid #f0a500; border-radius: 6px; font-size: 13px; color: #333; line-height: 1.45;">
          <i class="fa-solid fa-user-astronaut" style="color:#f0a500; margin-right: 6px;"></i>
          <strong>Participating Solo?</strong> Simply create your team below with your project/solo name (e.g. <em>"Solo - [Your Name]"</em>). You do not need to invite teammates—you can proceed directly to checkout as a 1-member squad for ₹55!
        </div>
      `;
    } else {
      infoBanner.innerHTML = `
        <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #111111;">
          ${eventName} Team Workspace
        </h3>
        <p style="margin: 0; font-size: 13.5px; color: #444; line-height: 1.5;">
          Manage your team, recruit teammates, and view registered members for <strong>${eventName}</strong>.
        </p>
      `;
    }
  }

  loadIncomingInvitations(user);
}

async function loadIncomingInvitations(user) {
  const container = document.getElementById('pending-invites-list');
  if (!container) return;
  container.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Checking invitations...</p>';

  try {
    const targetEventName = activeTeamSectionEvent || 'Ideackathon';
    const targetEventId = await getEventId(targetEventName);

    const { data: invitesSnapshot, error } = await supabaseClient
      .from('invitations')
      .select('*, teams(id, event_id, name)')
      .ilike('receiver_email', user.email)
      .eq('status', 'pending');

    if (error) throw error;

    // Isolate by target event ID so invitations from previous hackathons don't bleed into active event
    const eventInvites = (invitesSnapshot || []).filter(invite => invite.teams && invite.teams.event_id === targetEventId);

    if (!eventInvites || eventInvites.length === 0) {
      container.innerHTML = `<p style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;">No pending invitations for ${targetEventName}.</p>`;
      return;
    }
    let invitesHtml = '';
    eventInvites.forEach(invite => {
      invitesHtml += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div>
            <div style="font-weight: 700; color: var(--color-amber); font-size: 14px;">${invite.team_name || invite.teams?.name || 'Squad Invite'}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Invited by: ${invite.sender_name} · <span style="color:var(--gold-primary);">${targetEventName}</span></div>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button class="btn-gold" style="padding: 6px 12px; font-size: 12px; flex: 1; justify-content: center;" onclick="acceptInvitation('${invite.id}', '${invite.team_id}')"><i class="fa-solid fa-check"></i> Accept</button>
            <button class="btn-ghost" style="padding: 6px 12px; font-size: 12px; border: 1px solid rgba(255,255,255,0.1); flex: 1; justify-content: center; color: var(--text-muted);" onclick="rejectInvitation('${invite.id}')"><i class="fa-solid fa-xmark"></i> Decline</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = invitesHtml;
  } catch (error) {
    console.error("Error loading incoming invitations:", error);
    container.innerHTML = `<p style="color:var(--text-danger); text-align:center; padding: 20px;">Failed to load invitations: ${error.message || error}</p>`;
  }
}

async function createTeam() {
  const user = window.currentUser;
  if (!user) return;

  const teamName = document.getElementById('new-team-name').value.trim();
  const techStack = document.getElementById('new-team-tech').value.trim();
  const description = document.getElementById('new-team-desc').value.trim();
  const btn = document.getElementById('create-team-btn');

  if (!teamName) {
    showToast("Please enter a team name.", "error"); return;
  }
  if (!techStack) {
    showToast("Please specify your tech stack.", "error"); return;
  }

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
  btn.disabled = true;

  try {
    const teamEventTitle = document.getElementById('new-team-event') ? document.getElementById('new-team-event').value : 'Ideackathon';
    const targetEventId = await getEventId(teamEventTitle);

    // Check if user is ALREADY in a team for this targetEventId
    const { data: userExistingMemberships, error: userMemberCheckErr } = await supabaseClient
      .from('team_members')
      .select('team_id, teams(id, event_id, name)')
      .eq('user_id', user.uid);

    if (userMemberCheckErr) throw userMemberCheckErr;
    const existingTeamInEvent = (userExistingMemberships || []).find(m => m.teams && m.teams.event_id === targetEventId);
    if (existingTeamInEvent && existingTeamInEvent.teams) {
      showToast(`You are already in a squad ("${existingTeamInEvent.teams.name}") for ${teamEventTitle}. You cannot create another team.`, 'error');
      btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> CREATE TEAM';
      btn.disabled = false;
      return;
    }

    // Check uniqueness of team name in Supabase for this event
    const { data: teamCheck, error: checkError } = await supabaseClient
      .from('teams')
      .select('id')
      .eq('event_id', targetEventId)
      .ilike('name', teamName);

    if (checkError) throw checkError;
    if (teamCheck && teamCheck.length > 0) {
      showToast(`A team with the name "${teamName}" already exists for ${teamEventTitle}.`, "error");
      btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> CREATE TEAM';
      btn.disabled = false;
      return;
    }

    const teamPayload = {
      event_id: targetEventId,
      name: teamName,
      leader_id: user.uid,
      tech_stack: techStack,
      description: description || 'No description provided.'
    };

    const { data: teamData, error: insertError } = await supabaseClient
      .from('teams')
      .insert(teamPayload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    // Insert creator into team_members as leader
    const { error: memberError } = await supabaseClient
      .from('team_members')
      .insert({
        team_id: teamData.id,
        user_id: user.uid,
        role: 'leader'
      });

    if (memberError) throw memberError;

    showToast(`Team "${teamName}" created for ${teamEventTitle}!`, "success");
    syncTeamSection();
  } catch (error) {
    console.error("Error creating team:", error);
    showToast("Failed to create team. Try again.", "error");
    btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> CREATE TEAM';
    btn.disabled = false;
  }
}

async function renderTeamDashboard(user, teamId, teamData) {
  document.getElementById('dash-team-name').textContent = teamData.name;
  document.getElementById('dash-team-desc').textContent = teamData.description || 'No description provided.';
  document.getElementById('dash-team-tech').textContent = teamData.techStack;
  
  const eventBadge = document.getElementById('team-event-badge');
  if (eventBadge) eventBadge.textContent = teamData.eventName || 'Ideackathon';

  const payCardTitle = document.getElementById('team-pay-card-title');
  if (payCardTitle) payCardTitle.innerHTML = `<i class="fa-solid fa-credit-card"></i> ${teamData.eventName || 'Ideackathon'} Registration &amp; Payment`;

  const numMembers = teamData.members.length;
  document.getElementById('team-size-badge').textContent = `${numMembers} / 5 members`;

  const membersList = document.getElementById('team-members-list');
  let membersHtml = '';
  teamData.members.forEach(member => {
    const isLeader = member.role === 'leader';
    membersHtml += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.85); border: 1.5px solid #111111; border-radius: 8px;">
        <div style="display:flex; align-items:center; gap: 12px; overflow: hidden;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isLeader ? 'rgba(197,155,39,0.12)' : 'rgba(0,0,0,0.05)'}; border: 1.5px solid ${isLeader ? 'var(--gold-primary)' : '#aaaaaa'}; display:flex; align-items:center; justify-content:center; color: ${isLeader ? 'var(--gold-primary)' : '#555555'}; flex-shrink:0;">
            <i class="fa-solid ${isLeader ? 'fa-crown' : 'fa-user'}"></i>
          </div>
          <div style="overflow: hidden;">
            <div style="font-weight: 700; font-size: 13.5px; color: #111111; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${member.name} ${member.uid === user.uid ? '<span style="font-size:10px; color:var(--gold-primary); font-weight:normal;">(You)</span>' : ''}</div>
            <div style="font-size: 11px; color: #555555; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${member.email}</div>
          </div>
        </div>
        <span class="badge ${isLeader ? 'badge-gold' : 'badge-blue'}">${isLeader ? 'Leader' : 'Member'}</span>
      </div>
    `;
  });
  membersList.innerHTML = membersHtml;

  const currentUid = user.uid || '';
  const isUserLeader = teamData.leaderId === currentUid;
  console.log('[Team] leaderId:', teamData.leaderId, 'currentUid:', currentUid, 'isLeader:', isUserLeader);
  const actionsContainer = document.getElementById('team-management-actions');
  
  if (isUserLeader) {
    actionsContainer.innerHTML = `
      <button class="btn-ghost" style="flex: 1; padding: 14px 0; justify-content: center; border-color: rgba(244,67,54,0.3); color: #f44336;" onclick="disbandTeam()"><i class="fa-solid fa-trash-can"></i> DISBAND TEAM</button>
    `;
    document.getElementById('leader-invite-card').style.display = 'block';
    loadSentInvitations(teamId);
  } else {
    actionsContainer.innerHTML = `
      <button class="btn-ghost" style="flex: 1; padding: 14px 0; justify-content: center; border-color: rgba(255,255,255,0.1); color: var(--text-muted);" onclick="leaveTeam()"><i class="fa-solid fa-right-from-bracket"></i> LEAVE TEAM</button>
    `;
    document.getElementById('leader-invite-card').style.display = 'none';
  }

  // Team Registration & Payment Section
  const paymentCard = document.getElementById('team-payment-card');
  const paymentCardBody = document.getElementById('team-payment-card-body');
  if (paymentCard && paymentCardBody) {
    paymentCard.style.display = 'block';
    paymentCardBody.innerHTML = '<div style="text-align:center; padding:20px; color:rgba(255,255,255,0.4);"><i class="fa-solid fa-spinner fa-spin"></i> Checking registration status...</div>';

    try {
      let reg = null;
      let regError = null;

      if (teamId) {
        const targetEvId = teamData?.eventId || (await getEventId(teamData?.eventName || 'Ideackathon'));
        let { data, error } = await supabaseClient
          .from('registrations')
          .select('*')
          .eq('team_id', teamId)
          .eq('event_id', targetEvId)
          .maybeSingle();

        if (!data && teamData && teamData.leaderId) {
          const { data: leaderReg } = await supabaseClient
            .from('registrations')
            .select('*')
            .eq('event_id', targetEvId)
            .eq('user_id', teamData.leaderId)
            .maybeSingle();
          if (leaderReg) {
            data = leaderReg;
            // Auto-heal link in registrations
            await supabaseClient.from('registrations').update({ team_id: teamId }).eq('id', leaderReg.id);
          }
        }
        reg = data;
        regError = error;
      }

      if (regError) throw regError;

      if (reg) {
        // Team is registered - hide disband/leave buttons and recruitment card
        if (actionsContainer) actionsContainer.innerHTML = '';
        const inviteCard = document.getElementById('leader-invite-card');
        if (inviteCard) inviteCard.style.display = 'none';

        paymentCardBody.innerHTML = `
          <div style="text-align: center; padding: 12px 0;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(76, 175, 80, 0.1); border: 2px solid rgba(76, 175, 80, 0.3); color: #4CAF50; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 style="color: #111111; font-size: 18px; font-weight: 700; margin-bottom: 6px;">Team Registered Successfully!</h3>
            <p style="color: #444444; font-size: 13.5px; margin-bottom: 20px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
              Your team <strong>"${teamData.name}"</strong> has successfully registered for ${teamData.eventName || 'Ideackathon'}.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 400px; margin: 0 auto; text-align: left; background: rgba(0,0,0,0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
              <div>
                <span style="display: block; font-size: 10px; color: rgba(0,0,0,0.5); text-transform: uppercase;">Amount Paid</span>
                <span style="font-weight: 700; color: var(--gold-primary);">₹${reg.amount_paid}</span>
              </div>
              <div>
                <span style="display: block; font-size: 10px; color: rgba(0,0,0,0.5); text-transform: uppercase;">Team Size</span>
                <span style="font-weight: 700; color: #111111;">${reg.team_size || numMembers} Members</span>
              </div>
              <div style="grid-column: 1 / -1; margin-top: 8px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 8px;">
                <span style="display: block; font-size: 10px; color: rgba(0,0,0,0.5); text-transform: uppercase;">Payment Transaction ID</span>
                <span style="font-family: monospace; font-size: 11px; color: #111111; word-break: break-all;">${reg.payment_id}</span>
              </div>
            </div>
          </div>
        `;
      } else {
        // Team is NOT registered
        const isHackathon2026 = (teamData.eventName === 'CodeMiners Hackathon 2026');
        const now = new Date();
        const closeTime = new Date('2026-07-04T00:00:00');

        if (isHackathon2026 && now >= closeTime) {
          paymentCardBody.innerHTML = `
            <div style="text-align: center; padding: 12px 0;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(244, 67, 54, 0.1); border: 2px solid rgba(244, 67, 54, 0.3); color: #f44336; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px auto;">
                <i class="fa-solid fa-lock"></i>
              </div>
              <h3 style="color: #111111; font-size: 18px; font-weight: 700; margin-bottom: 6px;">Registrations Closed</h3>
              <p style="color: #444444; font-size: 13.5px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                Registrations for CodeMiners Hackathon 2026 are now closed. Your team is not registered.
              </p>
            </div>
          `;
        } else if (isUserLeader) {
          const feeInfo = calculateEventFee(teamData.eventName || 'Ideackathon', numMembers);
          
          const user = window.currentUser;
          const phoneVal = currentUserDoc?.phone ? decryptData(currentUserDoc.phone, user.uid) : '';
          const collegeVal = currentUserDoc?.college ? decryptGlobal(currentUserDoc.college) : '';
          const yearVal = currentUserDoc?.year || 'second';
          const pinVal = currentUserDoc?.pin ? decryptData(currentUserDoc.pin, user.uid) : '';

          paymentCardBody.innerHTML = `
            <p style="color: #444444; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
              Confirm your squad details below and complete the team registration payment for <strong>${teamData.eventName || 'Ideackathon'}</strong>. 
              <br><strong>Fee Structure:</strong> ₹50/head + ₹5 platform fee per member (Total ₹55 per member).
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div>
                <label class="input-label" style="color: #111111 !important;">CONTACT PHONE</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-phone input-ico"></i>
                  <input type="text" class="field-input" id="team-pay-phone" placeholder="Enter contact phone number" value="${phoneVal}">
                </div>
              </div>
              <div>
                <label class="input-label" style="color: #111111 !important;">COLLEGE NAME</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-school input-ico"></i>
                  <input type="text" class="field-input" id="team-pay-college" placeholder="Enter your college" value="${collegeVal}">
                </div>
              </div>
              <div>
                <label class="input-label" style="color: #111111 !important;">YEAR OF STUDY</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-graduation-cap input-ico"></i>
                  <select class="field-input select-field" id="team-pay-year" onchange="toggleTeamPayIdFields()" style="background:var(--dark-stone);">
                    <option value="first" ${yearVal === 'first' ? 'selected' : ''}>First Year</option>
                    <option value="second" ${yearVal === 'second' ? 'selected' : ''}>Second Year</option>
                    <option value="third" ${yearVal === 'third' ? 'selected' : ''}>Third Year</option>
                    <option value="fourth" ${yearVal === 'fourth' ? 'selected' : ''}>Fourth Year</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="input-label" id="team-pay-id-label" style="color: #111111 !important;">COLLEGE PIN</label>
                <div class="input-wrap">
                  <i class="fa-solid fa-id-card input-ico"></i>
                  <input type="text" class="field-input" id="team-pay-id-value" placeholder="Enter College PIN" value="${pinVal}">
                </div>
              </div>
            </div>
            <div style="background: rgba(240, 165, 0, 0.05); border: 1px dashed var(--gold-primary); padding: 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; color: #111111; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                  ${teamData.eventName || 'Ideackathon'}
                  <span style="font-size: 10px; background: #eee; border: 1px solid #ccc; padding: 1px 6px; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: #111;">
                    <img src="cloud-community-logo.jpg" style="width: 12px; height: 12px; border-radius: 50%; object-fit: cover;"> &lt;CC&gt; Collab
                  </span>
                </div>
                <div style="font-size: 12px; color: #444444;">${numMembers} member${numMembers > 1 ? 's' : ''} @ ₹${feeInfo.perPerson}/head + ₹${feeInfo.perPersonPlatform || 5} Platform Fee/head (Subtotal: ₹${feeInfo.subtotal} + Fee: ₹${feeInfo.platformFee})</div>
              </div>
              <div style="font-size: 24px; color: var(--gold-primary); font-weight: 800;">₹${feeInfo.total}</div>
            </div>
            <button class="btn-gold" style="width: 100%; padding: 14px 0; font-size: 14px;" id="team-pay-submit-btn" onclick="payTeamRegistration()"><i class="fa-solid fa-credit-card"></i> CONFIRM & PAY TEAM (₹${feeInfo.total})</button>
          `;
        } else {
          paymentCardBody.innerHTML = `
            <div style="text-align: center; padding: 12px 0;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 152, 0, 0.1); border: 2px solid rgba(255, 152, 0, 0.3); color: #FF9800; display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 12px auto;">
                <i class="fa-solid fa-clock-rotate-left"></i>
              </div>
              <h4 style="color: #111111; font-size: 15px; font-weight: 600; margin-bottom: 4px;">Awaiting Team Registration</h4>
              <p style="color: #444444; font-size: 13px; line-height: 1.5; max-width: 400px; margin: 0 auto;">
                Your team is not registered for ${teamData.eventName || 'Ideackathon'} yet. Waiting for your Team Leader (${teamData.leaderName || 'Leader'}) to complete the registration and payment.
              </p>
            </div>
          `;
        }
      }
    } catch (err) {
      console.error("Error loading team registration status:", err);
      paymentCardBody.innerHTML = '<div style="color:#f44336; padding:10px;">Failed to verify registration status.</div>';
    }
  }
}

function toggleTeamPayIdFields() {
  const label = document.getElementById('team-pay-id-label');
  const input = document.getElementById('team-pay-id-value');
  if (label) label.textContent = 'COLLEGE PIN';
  if (input) input.placeholder = 'Enter College PIN';
}

function payTeamRegistration() {
  const user = window.currentUser;
  if (!user || !currentTeamData || currentTeamData.leaderId !== user.uid) {
    showToast('Only the Team Leader can make the registration payment for the squad.', 'error');
    return;
  }

  const teamEventTitle = (currentTeamData && currentTeamData.eventName) || 'Ideackathon';
  
  if (teamEventTitle === 'CodeMiners Hackathon 2026') {
    const now = new Date();
    const closeTime = new Date('2026-07-04T00:00:00');
    if (now >= closeTime) {
      showToast('Registrations for CodeMiners Hackathon 2026 are closed.', 'error');
      return;
    }
  }

  const phone = document.getElementById('team-pay-phone').value.trim();
  const college = document.getElementById('team-pay-college').value.trim();
  const studyYear = document.getElementById('team-pay-year').value;
  const idValue = document.getElementById('team-pay-id-value').value.trim();

  if (!phone || !college || !idValue) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  const teamSize = currentTeamData ? currentTeamData.members.length : 1;
  const feeInfo = calculateEventFee(teamEventTitle, teamSize);
  const amount = feeInfo.total;

  const btnElement = document.getElementById('team-pay-submit-btn');
  const originalBtnHtml = btnElement.innerHTML;
  btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btnElement.disabled = true;

  const options = {
    key: 'rzp_live_T77jqjiWmPUazt',
    amount: amount * 100, // in paise
    currency: "INR",
    name: "CodeMiners",
    description: `${teamEventTitle} Team Registration Fee`,
    image: "logo.png",
    handler: function (response) {
      showToast("Payment Successful!", "success");
      btnElement.innerHTML = originalBtnHtml;
      btnElement.disabled = false;
      
      processTeamRegistration(response.razorpay_payment_id, phone, college, studyYear, idValue, feeInfo);
    },
    prefill: {
      name: window.currentUser.displayName || '',
      email: window.currentUser.email || '',
      contact: phone
    },
    notes: {
      eventName: teamEventTitle,
      teamId: currentTeamId,
      teamName: currentTeamData ? currentTeamData.name : '',
      teamSize: teamSize,
      subtotal: feeInfo.subtotal,
      platformFee: feeInfo.platformFee,
      totalAmount: feeInfo.total
    },
    theme: {
      color: "#F0A500"
    }
  };

  const rzp = new Razorpay(options);
  rzp.on('payment.failed', function (response) {
    showToast("Payment Failed. Try again.", "error");
    btnElement.innerHTML = originalBtnHtml;
    btnElement.disabled = false;
  });
  rzp.open();
}

async function processTeamRegistration(paymentId, phone, college, studyYear, idValue, feeInfo = null) {
  const user = window.currentUser;
  if (!user || !currentTeamData || currentTeamData.leaderId !== user.uid) {
    showToast('Only the Team Leader can make the registration payment for the squad.', 'error');
    return;
  }
  const teamSize = currentTeamData.members.length;
  const teamEventTitle = currentTeamData.eventName || 'Ideackathon';
  const targetEventId = currentTeamData.eventId || (await getEventId(teamEventTitle));
  const amountPaid = feeInfo ? feeInfo.total : (teamSize < 5 ? 70 * teamSize : 50 * teamSize);

  const idType = 'pin';
  const encryptedId = encryptIdValue(idValue, user.uid);
  const encryptedPhone = encryptData(phone, user.uid);
  const encryptedCollege = encryptGlobal(college);

  const supabasePayload = {
    event_id: targetEventId,
    user_id: user.uid,
    team_id: currentTeamId || null,
    payment_status: 'captured',
    amount_paid: amountPaid,
    payment_id: paymentId,
    // Backward compatibility fields
    event_name: teamEventTitle,
    team_size: teamSize,
    full_name: user.displayName || 'Leader',
    email: user.email,
    phone: encryptedPhone,
    college: encryptedCollege,
    year: studyYear,
    id_type: idType,
    id_value: encryptedId,
    registered_at: new Date().toISOString()
  };

  try {
    const { error: insertError } = await supabaseClient
      .from('registrations')
      .insert(supabasePayload);

    if (insertError) throw insertError;

    // Send to Google Sheets
    const sheetData = new FormData();
    sheetData.append('Event', teamEventTitle);
    sheetData.append('Name', user.displayName || 'Leader');
    sheetData.append('Email', user.email);
    sheetData.append('Phone', phone);
    sheetData.append('College', college);
    sheetData.append('Year', studyYear);
    sheetData.append('ID (PIN/Hall Ticket)', idValue || '—');
    sheetData.append('Role', 'leader');
    sheetData.append('Team Name', currentTeamData.name || '—');
    sheetData.append('PaymentID', paymentId);
    sheetData.append('Status', 'Paid');

    const scriptURL = 'https://script.google.com/macros/s/AKfycbxz-7gHowiQ7B-MLiSHOO3U6qclqm7Hr4oKaChr8a8Wqw31Y2Y9TBBDBIaExXKGwJNl/exec';
    fetch(scriptURL, { method: 'POST', body: sheetData }).catch(e => console.warn('Sheet error:', e));

    showToast("Registration completed successfully!", "success");
    syncTeamSection(); // Refresh team dashboard to show registered status card!
  } catch (error) {
    console.error("Error processing registration:", error);
    showToast("Registration saved in payment, but failed to log: " + (error.message || error), "error");
  }
}

async function sendInvitation() {
  const user = window.currentUser;
  if (!user || !currentTeamId || !currentTeamData) return;

  if (currentTeamData.members.length >= 5) {
    showToast("Your team is already full (maximum 5 members).", "error"); return;
  }

  const identifier = document.getElementById('invite-identifier').value.trim();
  const btn = document.getElementById('send-invite-btn');

  if (!identifier) {
    showToast("Please enter an email or username.", "error"); return;
  }

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  try {
    let receiverEmail = "";
    let receiverUid = "";
    let receiverUsername = "";

    const isEmail = identifier.includes('@');
    let profilesResult;

    if (isEmail) {
      profilesResult = await supabaseClient
        .from('profiles')
        .select('*')
        .ilike('email', identifier)
        .maybeSingle();
    } else {
      profilesResult = await supabaseClient
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${identifier}%,full_name.ilike.%${identifier}%,email.ilike.%${identifier}%`)
        .limit(1)
        .maybeSingle();
    }

    if (profilesResult.error) throw profilesResult.error;
    const targetData = profilesResult.data;

    if (!targetData) {
      showToast(`User "${identifier}" not found in our records.`, "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    receiverEmail = targetData.email;
    receiverUid = targetData.id;
    receiverUsername = targetData.full_name || targetData.username || receiverEmail;

    const targetEventId = currentTeamData.eventId || (await getEventId(currentTeamData.eventName || 'Ideackathon'));
    const { data: existingMemberships } = await supabaseClient
      .from('team_members')
      .select('team_id, teams(id, event_id)')
      .eq('user_id', receiverUid);

    const inSameEventTeam = existingMemberships?.some(m => m.team_id === currentTeamId || (m.teams && m.teams.event_id === targetEventId));
    if (inSameEventTeam) {
      showToast(`"${receiverUsername}" is already in a team for this event.`, "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    if (receiverUid === user.uid) {
      showToast("You cannot invite yourself.", "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    const { data: inviteCheck, error: checkError } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('team_id', currentTeamId)
      .ilike('receiver_email', receiverEmail)
      .eq('status', 'pending');

    if (checkError) throw checkError;

    if (inviteCheck && inviteCheck.length > 0) {
      showToast(`An invitation is already pending for "${receiverUsername}".`, "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    const invitePayload = {
      team_id: currentTeamId,
      team_name: currentTeamData.name,
      sender_id: user.uid,
      sender_name: currentTeamData.leaderName || user.displayName || 'Team Leader',
      sender_email: user.email,
      receiver_email: receiverEmail,
      receiver_uid: receiverUid,
      receiver_username: receiverUsername,
      status: 'pending'
    };

    const { error: inviteError } = await supabaseClient
      .from('invitations')
      .insert(invitePayload);

    if (inviteError) throw inviteError;

    showToast(`Invitation sent to ${receiverUsername}!`, "success");
    document.getElementById('invite-identifier').value = '';
    loadSentInvitations(currentTeamId);
  } catch (error) {
    console.error("Error sending invitation:", error);
    showToast("Failed to send invitation: " + (error.message || error), "error");
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
    btn.disabled = false;
  }
}

async function loadSentInvitations(teamId) {
  const container = document.getElementById('sent-invites-list');
  if (!container) return;

  try {
    const { data: invitesSnapshot, error } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending');

    if (error) throw error;

    if (!invitesSnapshot || invitesSnapshot.length === 0) {
      container.innerHTML = '<p style="color:rgba(255,255,255,0.3); font-size:12px;">No active sent invites.</p>';
      return;
    }

    let invitesHtml = '';
    invitesSnapshot.forEach(invite => {
      invitesHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 6px; font-size: 12px;">
          <div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 65%;">
            <div style="font-weight:700; color:var(--text-light); text-overflow:ellipsis; overflow:hidden;">${invite.receiver_username}</div>
            <div style="font-size:10px; color:var(--text-muted); text-overflow:ellipsis; overflow:hidden;">${invite.receiver_email}</div>
          </div>
          <button class="btn-ghost" style="padding: 4px 8px; font-size:11px; border-color: rgba(244,67,54,0.2); color:#f44336;" onclick="revokeInvitation('${invite.id}')">Revoke</button>
        </div>
      `;
    });
    container.innerHTML = invitesHtml;
  } catch (error) {
    console.error("Error loading sent invites:", error);
    container.innerHTML = `<p style="color:var(--text-danger); font-size:12px;">Failed to load: ${error.message || error}</p>`;
  }
}

async function revokeInvitation(inviteId) {
  try {
    const { error } = await supabaseClient
      .from('invitations')
      .update({ status: 'revoked' })
      .eq('id', inviteId);

    if (error) throw error;

    showToast("Invitation revoked.", "success");
    loadSentInvitations(currentTeamId);
  } catch (error) {
    console.error("Error revoking invite:", error);
    showToast("Failed to revoke invite.", "error");
  }
}

async function acceptInvitation(inviteId, teamId) {
  const user = window.currentUser;
  if (!user) return;

  try {
    const { data: teamData, error: teamError } = await supabaseClient
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .maybeSingle();

    if (teamError) throw teamError;

    if (!teamData) {
      showToast("This team no longer exists.", "error");
      await supabaseClient.from('invitations').delete().eq('id', inviteId);
      syncTeamSection();
      return;
    }

    const { count, error: countError } = await supabaseClient
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId);

    // Check if user is ALREADY in a team for teamData.event_id
    const { data: userExistingMemberships, error: userMemberCheckErr } = await supabaseClient
      .from('team_members')
      .select('team_id, teams(id, event_id, name)')
      .eq('user_id', user.uid);

    if (userMemberCheckErr) throw userMemberCheckErr;
    const existingInThisEvent = (userExistingMemberships || []).find(m => m.teams && m.teams.event_id === teamData.event_id);
    if (existingInThisEvent && existingInThisEvent.teams) {
      showToast(`You are already a member of squad "${existingInThisEvent.teams.name}" for this event. Leave that squad before joining another.`, 'error');
      return;
    }

    if (count && count >= 5) {
      showToast("This team is already full.", "error");
      return;
    }

    // Insert user into team_members
    const { error: joinError } = await supabaseClient
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: user.uid,
        role: 'member'
      });

    if (joinError) throw joinError;

    // Update invitation status
    await supabaseClient
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    // Reject other pending invitations strictly for THIS event
    try {
      const { data: pendingOtherInvites } = await supabaseClient
        .from('invitations')
        .select('id, teams(event_id)')
        .ilike('receiver_email', user.email)
        .eq('status', 'pending');
      
      const inviteIdsToReject = (pendingOtherInvites || [])
        .filter(inv => inv.teams && inv.teams.event_id === teamData.event_id)
        .map(inv => inv.id);

      if (inviteIdsToReject.length > 0) {
        await supabaseClient
          .from('invitations')
          .update({ status: 'rejected' })
          .in('id', inviteIdsToReject);
      }
    } catch (invErr) {
      console.warn("Could not reject other event invitations:", invErr);
    }

    showToast(`You have joined "${teamData.name}"!`, "success");
    syncTeamSection();
  } catch (error) {
    console.error("Error accepting invitation:", error);
    showToast("Failed to join team: " + (error.message || error), "error");
  }
}

async function rejectInvitation(inviteId) {
  const user = window.currentUser;
  if (!user) return;
  try {
    const { error } = await supabaseClient
      .from('invitations')
      .update({ status: 'rejected' })
      .eq('id', inviteId);

    if (error) throw error;

    showToast("Invitation declined.", "success");
    syncTeamSection();
  } catch (error) {
    console.error("Error declining invitation:", error);
    showToast("Failed to decline invitation.", "error");
  }
}

async function leaveTeam() {
  const user = window.currentUser;
  if (!user || !currentTeamId || !currentTeamData) return;

  if (confirm("Are you sure you want to leave the team?")) {
    try {
      const { error: updateError } = await supabaseClient
        .from('team_members')
        .delete()
        .eq('team_id', currentTeamId)
        .eq('user_id', user.uid);

      if (updateError) throw updateError;

      showToast("You have left the team.", "success");
      syncTeamSection();
    } catch (error) {
      console.error("Error leaving team:", error);
      showToast("Failed to leave team.", "error");
    }
  }
}

async function disbandTeam() {
  const user = window.currentUser;
  if (!user || !currentTeamId || !currentTeamData) return;

  if (confirm("WARNING: Are you sure you want to disband the team? All members will be removed and invitations revoked!")) {
    try {
      // Cascades to team_members and invitations
      const { error: deleteError } = await supabaseClient
        .from('teams')
        .delete()
        .eq('id', currentTeamId);

      if (deleteError) throw deleteError;

      showToast(`Team "${currentTeamData.name}" has been disbanded.`, "success");
      syncTeamSection();
    } catch (error) {
      console.error("Error disbanding team:", error);
      showToast("Failed to disband team.", "error");
    }
  }
}


// ─────────────────────────────────────────────────────────────
// RAZORPAY SDK REGISTRATION PAYMENT PORTAL (EVENTS & WORKSHOPS)
// ─────────────────────────────────────────────────────────────
function initRazorpayRegistrationPayment() {
  let teamSize = 1;
  const isSoloWorkshop = (selectedEvent === 'Appdevelopment workshop' || selectedEvent === 'CodeMiners Orientation');

  if (selectedEvent === 'Ideackathon') {
    const sizeInput = document.getElementById('r-team-size');
    teamSize = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 5)) : 5;
  } else if (selectedEvent === 'CodeMiners Hackathon 2026') {
    teamSize = (currentTeamData && currentTeamData.members) ? currentTeamData.members.length : 1;
  }

  const feeInfo = calculateEventFee(selectedEvent, teamSize);

  const amountEl = document.getElementById('rp-amount');
  const detailsEl = document.getElementById('rp-team-details');

  if (amountEl) {
    amountEl.textContent = `₹${feeInfo.total}`;
  }
  if (detailsEl) {
    if (isSoloWorkshop) {
      detailsEl.innerHTML = `<strong>${feeInfo.eventName}</strong> &nbsp;<span class="badge badge-blue" style="font-size:10px;padding:2px 8px;"><i class="fa-solid fa-user"></i> Solo Pass</span><br><span style="font-size:11px;color:rgba(255,255,255,0.6);">Base Ticket: ₹${feeInfo.subtotal} &nbsp;+&nbsp; Platform Fee: ₹${feeInfo.platformFee}</span>`;
    } else if (feeInfo.platformFee > 0) {
      detailsEl.innerHTML = `${feeInfo.description}<br><span style="font-size:11px;color:rgba(255,255,255,0.6);">Base: ₹${feeInfo.subtotal} &nbsp;+&nbsp; Platform Fee: ₹${feeInfo.platformFee}</span>`;
    } else {
      detailsEl.textContent = feeInfo.description;
    }
  }
}

function payWithRazorpaySDK(btnElement) {
  const fullName = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const isSoloWorkshop = (selectedEvent === 'Appdevelopment workshop' || selectedEvent === 'CodeMiners Orientation');

  let teamSize = 1;
  if (selectedEvent === 'Ideackathon') {
    const sizeInput = document.getElementById('r-team-size');
    teamSize = sizeInput ? Math.max(1, Math.min(5, parseInt(sizeInput.value, 10) || 5)) : 5;
  } else if (selectedEvent === 'CodeMiners Hackathon 2026') {
    teamSize = (currentTeamData && currentTeamData.members) ? currentTeamData.members.length : 1;
  }

  const feeInfo = calculateEventFee(selectedEvent, teamSize);
  const amount = feeInfo.total;

  const originalBtnHtml = btnElement.innerHTML;
  btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btnElement.disabled = true;

  const options = {
    key: 'rzp_live_T77jqjiWmPUazt',
    amount: amount * 100, // in paise
    currency: "INR",
    name: "CodeMiners",
    description: isSoloWorkshop ? `${selectedEvent} (Solo Workshop Ticket)` : `${selectedEvent} Registration Fee`,
    image: "logo.png",
    handler: function (response) {
      showToast("Payment Successful!", "success");
      btnElement.innerHTML = originalBtnHtml;
      btnElement.disabled = false;
      
      processRegistration(btnElement, response.razorpay_payment_id);
    },
    prefill: {
      name: fullName,
      email: email,
      contact: phone
    },
    notes: {
      name: fullName,
      email: email,
      phone: phone,
      college: document.getElementById('r-college')?.value.trim() || '',
      year: document.getElementById('r-year')?.value || '',
      pin: (document.getElementById('r-pin')?.value || document.getElementById('r-hallticket')?.value || '').trim(),
      hallticket: (document.getElementById('r-pin')?.value || document.getElementById('r-hallticket')?.value || '').trim(),
      role: isSoloWorkshop ? 'solo' : (document.getElementById('r-role') ? document.getElementById('r-role').value : 'individual'),
      eventName: selectedEvent,
      teamName: isSoloWorkshop ? '' : (document.getElementById('r-team-name') ? document.getElementById('r-team-name').value.trim() : ''),
      teamSize: isSoloWorkshop ? 1 : teamSize,
      subtotal: feeInfo.subtotal,
      platformFee: feeInfo.platformFee,
      totalAmount: feeInfo.total
    },
    theme: {
      color: isSoloWorkshop ? "#2196f3" : "#3395ff"
    },
    modal: {
      ondismiss: function () {
        btnElement.innerHTML = originalBtnHtml;
        btnElement.disabled = false;
        showToast("Payment cancelled.", "info");
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Razorpay SDK Error: ", err);
    btnElement.innerHTML = originalBtnHtml;
    btnElement.disabled = false;
    showToast("Failed to load payment gateway. Try again.", "error");
  }
}

function payDonationWithRazorpaySDK(amount, name, email) {
  const btn = document.querySelector('#donation-form-card .btn-gold');
  if (!btn) return;
  const originalBtnHtml = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btn.disabled = true;

  const options = {
    key: 'rzp_live_T77jqjiWmPUazt',
    amount: amount * 100, // in paise
    currency: "INR",
    name: "CodeMiners",
    description: "Donation to CodeMiners Guild",
    image: "logo.png",
    handler: function (response) {
      showToast("Donation Successful! Thank you!", "success");
      btn.innerHTML = originalBtnHtml;
      btn.disabled = false;
      
      // Update UI to show thank you card
      document.getElementById('donation-main-grid').style.display  = 'none';
      document.getElementById('donation-thankyou').style.display   = 'flex';
      showToast(`Thank you ${name}! ₹${amount} donation confirmed.`, 'success', 5000);
    },
    prefill: {
      name: name,
      email: email
    },
    theme: {
      color: "#3395ff"
    },
    modal: {
      ondismiss: function () {
        btn.innerHTML = originalBtnHtml;
        btn.disabled = false;
        showToast("Donation payment cancelled.", "info");
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Razorpay SDK Error: ", err);
    btn.innerHTML = originalBtnHtml;
    btn.disabled = false;
    showToast("Failed to load payment gateway. Try again.", "error");
  }
}
