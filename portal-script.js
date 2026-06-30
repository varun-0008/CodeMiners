/* ============================================================
   CodeMiners Portal — portal-script.js
   Navigation · Ember Particles · Registration · Donations
   FAQs · Countdown · Toast Notifications
   ============================================================ */

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://omxgqhwogkihrdnlonoq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UGnbbIMZrz-jZvLN8pS7jw_1LGAp3HP';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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
      const openTime = new Date('2026-06-29T00:00:00');
      const closeTime = new Date('2026-07-06T00:00:00');
      if (now < openTime || now >= closeTime) {
        showToast('Hackathon registration is only open from June 29th to July 5th.', 'error');
        return;
      }

      // Check if user is in an established team
      if (!currentTeamId || !currentTeamData) {
        showToast('You must create or join a team first in the Team Management section below to register for the Hackathon.', 'error');
        return;
      }

      // Auto-fill team details and set role to leader
      setTimeout(() => {
        const roleEl = document.getElementById('r-role');
        const teamNameEl = document.getElementById('r-team-name');
        const teamSizeEl = document.getElementById('r-team-size');
        
        if (roleEl) {
          roleEl.value = 'leader';
          roleEl.disabled = true;
          toggleRoleFields();
        }
        if (teamNameEl) {
          teamNameEl.value = currentTeamData.name;
          teamNameEl.readOnly = true;
        }
        if (teamSizeEl) {
          teamSizeEl.value = currentTeamData.members.length;
          teamSizeEl.readOnly = true;
        }
        
        // Hide invitation elements since team is already established
        const inviteSearchEl = document.getElementById('r-invite-search');
        if (inviteSearchEl) {
          const parent = inviteSearchEl.parentElement.parentElement;
          if (parent) parent.style.display = 'none';
        }
      }, 50);
    } else {
      // Re-enable input controls for other events
      const roleEl = document.getElementById('r-role');
      if (roleEl) {
        roleEl.disabled = false;
      }
      const teamNameEl = document.getElementById('r-team-name');
      if (teamNameEl) {
        teamNameEl.readOnly = false;
      }
      const teamSizeEl = document.getElementById('r-team-size');
      if (teamSizeEl) {
        teamSizeEl.readOnly = false;
      }
      const inviteSearchEl = document.getElementById('r-invite-search');
      if (inviteSearchEl) {
        const parent = inviteSearchEl.parentElement.parentElement;
        if (parent) parent.style.display = 'block';
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
    }
    
    const role = document.getElementById('r-role').value;
    if (role === 'leader') {
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

    // Check if user is already registered with this PIN globally
    const btn = document.querySelector('#reg-panel-2 .btn-gold');
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
    btn.disabled = true;

    const idValue = year === 'first' ? hallticket.trim() : pin.trim();

    supabaseClient
      .from('registrations')
      .select('*')
      .eq('id_value', idValue)
      .then(({ data: idData, error: idError }) => {
        if (idError) {
          console.error("Error checking registration:", idError);
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          showToast('Error verifying registration. Try again.', 'error');
          return;
        }
        
        if (idData && idData.length > 0) {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          const idType = year === 'first' ? 'Hall Ticket' : 'PIN';
          showToast(`This ${idType} has already been registered! (PINs can only be used once)`, 'error');
          return;
        }
        
        if (role === 'leader') {
          const teamName = document.getElementById('r-team-name').value.trim();
          supabaseClient
            .from('registrations')
            .select('*')
            .eq('event_name', selectedEvent)
            .eq('team_name', teamName)
            .then(({ data: teamData, error: teamError }) => {
              btn.innerHTML = originalBtnText;
              btn.disabled = false;
              if (teamError) {
                console.error("Error checking team name:", teamError);
                showToast('Error verifying team name.', 'error');
                return;
              }
              if (teamData && teamData.length > 0) {
                showToast(`Team name "${teamName}" is already taken for this event.`, 'error');
              } else {
                if (selectedEvent === 'CodeMiners Hackathon 2026') {
                  setRegStep(3);
                  initRazorpayRegistrationPayment();
                } else {
                  processRegistration(btn);
                }
              }
            });
        } else {
          btn.innerHTML = originalBtnText;
          btn.disabled = false;
          processRegistration(btn);
        }
      })
      .catch((error) => {
        console.error("Error checking registration:", error);
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
        showToast('Permission denied. Ensure security rules allow reading your own data.', 'error');
      });
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
  const role = document.getElementById('r-role').value;
  const teamName = document.getElementById('r-team-name') ? document.getElementById('r-team-name').value.trim() : '';
  const fullName = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const studyYear = document.getElementById('r-year').value;
  const idType = studyYear === 'first' ? 'hallticket' : 'pin';
  const idValue = studyYear === 'first' ? document.getElementById('r-hallticket').value.trim() : document.getElementById('r-pin').value.trim();

  // Prepare payload for Supabase
  const realTeamSize = (selectedEvent === 'CodeMiners Hackathon 2026' && currentTeamData) ? currentTeamData.members.length : 1;
  const rate = realTeamSize < 5 ? 70 : 50;
  const amountPaid = selectedEvent === 'CodeMiners Hackathon 2026' ? (rate * realTeamSize) : 0;
  const actualPaymentId = paymentId || (selectedEvent === 'CodeMiners Hackathon 2026' ? 'pay_client_' + Date.now() : 'free_reg');
  const paymentStatus = selectedEvent === 'CodeMiners Hackathon 2026' ? 'captured' : 'free';

  const supabasePayload = {
    full_name: fullName,
    email: email,
    phone: document.getElementById('r-phone').value.trim(),
    college: document.getElementById('r-college').value.trim(),
    year: studyYear,
    id_type: idType,
    id_value: idValue,
    role: role,
    event_name: selectedEvent,
    team_name: role === 'leader' ? teamName : null,
    team_size: role === 'leader' ? realTeamSize : 1,
    payment_id: actualPaymentId,
    payment_status: paymentStatus,
    amount_paid: amountPaid,
    created_at: new Date().toISOString()
  };

  // Prepare data for Google Sheets
  const sheetData = new FormData();
  sheetData.append('Event', selectedEvent);
  sheetData.append('Name', fullName);
  sheetData.append('Email', email);
  sheetData.append('Phone', document.getElementById('r-phone').value.trim());
  sheetData.append('College', document.getElementById('r-college').value.trim());
  sheetData.append('Year', studyYear);
  sheetData.append('ID (PIN/Hall Ticket)', idValue || '—');
  sheetData.append('Role', role);
  sheetData.append('Team Name', teamName || '—');
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
        showToast('Error saving registration. Please try again.', 'error');
        return;
      }

      let insertedTeamId = null;
      if (role === 'leader' && user && selectedEvent !== 'CodeMiners Hackathon 2026') {
        const username = user.user_metadata?.full_name || user.user_metadata?.username || fullName;
        const teamPayload = {
          name: teamName,
          leader_id: user.id || user.uid,
          leader_name: username,
          tech_stack: 'Not specified yet',
          description: 'Created during registration.',
          members: [{ uid: user.id || user.uid, name: username, email: user.email, role: 'leader' }]
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
          showToast('Registration saved, but failed to create team. Try setting up team from profile.', 'error');
          return;
        }

        insertedTeamId = teamData.id;

        const batch = db.batch();
        await supabaseClient
          .from('profiles')
          .update({ team_id: insertedTeamId })
          .eq('id', user.id || user.uid);

        if (pendingInvites.length > 0) {
          const invitePayloads = pendingInvites.map(inv => ({
            team_id: insertedTeamId,
            team_name: teamName,
            sender_id: user.id || user.uid,
            sender_name: username,
            sender_email: user.email,
            receiver_email: inv.email,
            receiver_uid: inv.uid,
            receiver_username: inv.username,
            status: 'pending'
          }));

          const { error: inviteError } = await supabaseClient
            .from('invitations')
            .insert(invitePayloads);

          if (inviteError) {
            console.warn("Failed to create invites in Supabase: ", inviteError);
          }

          pendingInvites.forEach(inv => {
            const mailRef = db.collection('mail').doc();
            batch.set(mailRef, {
              to: inv.email,
              message: {
                subject: `You've been invited to join team "${teamName}"!`,
                text: `Hi ${inv.username}! You got an invitation to join the team "${teamName}" by ${username}. Log in to your CodeMiners portal and visit the Teams page to accept or decline.`,
                html: `<p>Hi <strong>${inv.username}</strong>!</p><p>You got an invitation to join the team <strong>${teamName}</strong> by <strong>${username}</strong>.</p><p>Log in to your <a href="http://localhost:3000/">CodeMiners Portal</a> and visit the <strong>Teams</strong> section to accept or decline the request.</p>`
              }
            });
          });
        }

        const leaderMailRef = db.collection('mail').doc();
        batch.set(leaderMailRef, {
          to: user.email,
          message: {
            subject: `Team "${teamName}" Created Successfully!`,
            text: `Congratulations! Your hackathon team "${teamName}" has been successfully created.`,
            html: `<p>Congratulations!</p><p>Your hackathon team <strong>${teamName}</strong> has been successfully created.</p>`
          }
        });

        try {
          await batch.commit();
        } catch (e) {
          console.warn("Firestore team sync error:", e);
        }
      }

      fetch(scriptURL, { method: 'POST', body: sheetData })
        .catch(e => console.warn('Sheet error:', e));

      btnElement.innerHTML = originalBtnText;
      btnElement.disabled  = false;

      regCount++;
      const receiptId = 'REG-CM-2026-' + String(regCount).padStart(4, '0');
      
      document.getElementById('receipt-id').textContent    = receiptId;
      document.getElementById('receipt-event').textContent = selectedEvent || '—';
      document.getElementById('receipt-name').textContent  = fullName;
      document.getElementById('receipt-email').textContent = email;

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
    clearRPTimers();
  }
  setRegStep(step - 1);
}

function regReset() {
  clearRPTimers();
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
    } else {
      leaderFields.style.display = 'none';
      if (btn) btn.innerHTML = '<i class="fa-solid fa-check"></i> SUBMIT';
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

async function performInviteSearch() {
  const identifier = document.getElementById('r-invite-search').value.trim().toLowerCase();
  const resultContainer = document.getElementById('r-search-result-container');
  const user = window.currentUser;
  
  if (!user) {
    showToast("Please log in first to invite members.", "error");
    return;
  }
  
  if (!identifier) {
    resultContainer.style.display = 'none';
    resultContainer.innerHTML = '';
    return;
  }
  
  const maxSize = parseInt(document.getElementById('r-team-size').value) || 5;
  if (pendingInvites.length >= (maxSize - 1)) {
    resultContainer.style.display = 'block';
    resultContainer.innerHTML = `<div style="color:var(--text-danger); font-size: 13px;">Team is full! You can only invite ${maxSize - 1} members.</div>`;
    return;
  }

  resultContainer.style.display = 'block';
  resultContainer.innerHTML = '<div style="font-size: 13px; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Searching event registrations...</div>';

  try {
    // 1. Fetch/Cache event registrations
    if (!eventRegistrationsCache || lastEventCached !== selectedEvent) {
      const { data: regsData, error: regsError } = await supabaseClient
        .from('registrations')
        .select('email, full_name, role, team_name')
        .eq('event_name', selectedEvent);
      
      if (regsError) throw regsError;
      
      eventRegistrationsCache = [];
      if (regsData) {
        regsData.forEach(item => {
          eventRegistrationsCache.push({
            email: item.email,
            fullName: item.full_name || '',
            role: item.role,
            teamName: item.team_name
          });
        });
      }
      lastEventCached = selectedEvent;
    }
    
    // 2. Filter locally by prefix
    const matches = eventRegistrationsCache.filter(reg => 
      (reg.email && reg.email.toLowerCase().startsWith(identifier)) ||
      (reg.fullName && reg.fullName.toLowerCase().startsWith(identifier))
    ).slice(0, 5);
    
    if (matches.length === 0) {
      resultContainer.innerHTML = `<div style="color:var(--text-danger); font-size: 13px;">No users found registered for this event matching "${identifier}".</div>`;
      return;
    }
    
    // 3. Fetch their UIDs from Supabase profiles table
    const emailsToFetch = matches.map(m => m.email);
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .in('email', emailsToFetch);
    
    if (profilesError) throw profilesError;

    const usersMap = {};
    if (profiles) {
      profiles.forEach(p => {
        usersMap[p.email] = { uid: p.id, username: p.username || p.full_name, ...p };
      });
    }
    
    // 4. Render HTML
    let html = '';
    matches.forEach(match => {
      const userData = usersMap[match.email];
      if (!userData) return;
      
      const receiverUid = userData.uid;
      const receiverEmail = match.email;
      const receiverUsername = userData.username || match.fullName || receiverEmail;
      
      let actionHtml = '';
      if (receiverUid === (user.id || user.uid)) {
        actionHtml = `<div style="color:var(--text-danger); font-size: 11px;">You</div>`;
      } else if (match.role === 'leader' || match.teamName) {
        actionHtml = `<div style="color:var(--text-danger); font-size: 11px;">Already in a team</div>`;
      } else if (pendingInvites.some(inv => inv.uid === receiverUid)) {
        actionHtml = `<div style="color:var(--color-amber); font-size: 11px;">Added</div>`;
      } else {
        actionHtml = `
          <button type="button" class="btn-ghost" style="padding: 4px 12px; font-size: 12px; border: 1px solid var(--gold-primary); color: var(--gold-primary);" onclick="addInviteToList('${receiverUid}', '${receiverUsername}', '${receiverEmail}')">
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
    
    if (!html) {
       resultContainer.innerHTML = `<div style="color:var(--text-danger); font-size: 13px;">No valid invitees found.</div>`;
    } else {
       resultContainer.innerHTML = html;
    }

  } catch (error) {
    console.error("Error searching user:", error);
    resultContainer.innerHTML = '<div style="color:var(--text-danger); font-size: 13px;">Error searching for user.</div>';
  }
}

function addInviteToList(uid, username, email) {
  const maxSize = parseInt(document.getElementById('r-team-size').value) || 5;
  if (pendingInvites.length >= (maxSize - 1)) {
    showToast(`You can only invite ${maxSize - 1} members.`, "error");
    return;
  }
  
  pendingInvites.push({ uid, username, email });
  document.getElementById('r-invite-search').value = '';
  document.getElementById('r-search-result-container').style.display = 'none';
  renderPendingInvites();
}

function removeInvite(uid) {
  pendingInvites = pendingInvites.filter(inv => inv.uid !== uid);
  renderPendingInvites();
}

function renderPendingInvites() {
  const maxSize = parseInt(document.getElementById('r-team-size').value) || 4;
  document.getElementById('r-invite-count').textContent = pendingInvites.length;
  document.getElementById('r-invite-max').textContent = Math.max(0, maxSize - 1);
  
  const container = document.getElementById('r-selected-invites-list');
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
      donationAmount = null;
    });
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
  { id: 'orientation', title: 'CodeMiners Orientation', displayDate: 'June 28, 2026', completionDate: '2026-06-28' },
  { id: 'pre-hackathon', title: 'Pre-Hackthon', displayDate: 'July 1, 2026', completionDate: '2026-07-01' },
  { id: 'hackathon', title: 'CodeMiners Hackathon 2026', displayDate: 'July 6, 2026', completionDate: '2026-07-06' }
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
    supabaseClient
      .from('registrations')
      .select('*')
      .eq('event_name', eventTitle)
      .then(({ data, error }) => {
        if (error) throw error;
        
        fetchedMiners = [];
        if (data) {
          data.forEach(item => {
            fetchedMiners.push({
              id: item.id,
              name: item.full_name || 'Participant',
              subtitle: item.college || '', 
              year: item.year || '',
              role: 'Participant',
              about: '', 
              projects: [],
              pin: item.id_value || '',
              participationType: 'Individual',
              teamName: item.team_name || ''
            });
          });
        }
        
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
  
  // Fetch from Supabase - profiles table
  try {
    supabaseClient
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (error) throw error;
        
        fetchedMiners = [];
        if (data) {
          data.forEach(item => {
            fetchedMiners.push({
              id: item.id,
              name: item.full_name || 'Anonymous',
              subtitle: item.username || '', 
              year: '',
              role: 'CodeMiner',
              about: item.about || '',
              projects: Array.isArray(item.projects) ? item.projects : [],
              pin: item.pin || ''
            });
          });
        }
        
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

async function syncTeamSection() {
  const user = window.currentUser;
  if (!user) return;

  const loadingView = document.getElementById('team-loading-view');
  const noTeamView = document.getElementById('team-no-team-view');
  const dashboardView = document.getElementById('team-dashboard-view');

  if (loadingView) loadingView.style.display = 'block';
  if (noTeamView) noTeamView.style.display = 'none';
  if (dashboardView) dashboardView.style.display = 'none';

  try {
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('team_id')
      .eq('id', user.id || user.uid)
      .maybeSingle();

    if (profileError) throw profileError;
    const userData = profile ? { teamId: profile.team_id } : {};
    
    if (userData.teamId) {
      const { data: teamData, error: teamError } = await supabaseClient
        .from('teams')
        .select('*')
        .eq('id', userData.teamId)
        .maybeSingle();

      if (teamError) throw teamError;

      if (teamData) {
        currentTeamId = userData.teamId;
        currentTeamData = teamData;
        
        // Map postgres snake_case keys back to the component-level expected camelCase keys
        const formattedTeamData = {
          name: teamData.name,
          leaderId: teamData.leader_id,
          leaderName: teamData.leader_name,
          techStack: teamData.tech_stack,
          description: teamData.description,
          members: teamData.members
        };

        renderTeamDashboard(user, userData.teamId, formattedTeamData);
        if (loadingView) loadingView.style.display = 'none';
        if (dashboardView) {
          dashboardView.style.display = 'grid';
          if (window.innerWidth < 800) {
            dashboardView.style.display = 'block';
          }
        }
      } else {
        // Team doc doesn't exist anymore, clean up user profile reference
        await supabaseClient
          .from('profiles')
          .update({ team_id: null })
          .eq('id', user.id || user.uid);
        currentTeamId = null;
        currentTeamData = null;
        renderNoTeamView(user);
      }
    } else {
      currentTeamId = null;
      currentTeamData = null;
      renderNoTeamView(user);
    }
  } catch (error) {
    console.error("Error syncing team section:", error);
    showToast("Failed to load team data.", "error");
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
        endDate.setHours(0, 0, 0, 0);

        if (today > endDate) {
          opt.style.display = 'none';
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
        endDate.setHours(0, 0, 0, 0);

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




function renderNoTeamView(user) {
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

  loadIncomingInvitations(user);
}

async function loadIncomingInvitations(user) {
  const container = document.getElementById('pending-invites-list');
  if (!container) return;
  container.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Checking invitations...</p>';

  try {
    const { data: invitesSnapshot, error } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('receiver_email', user.email)
      .eq('status', 'pending');

    if (error) throw error;

    if (!invitesSnapshot || invitesSnapshot.length === 0) {
      container.innerHTML = '<p style="color:rgba(255,255,255,0.4); text-align:center; padding: 20px;">No pending invitations found.</p>';
      return;
    }

    let invitesHtml = '';
    invitesSnapshot.forEach(invite => {
      invitesHtml += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 16px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 10px;">
          <div>
            <div style="font-weight: 700; color: var(--color-amber); font-size: 14px;">${invite.team_name}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Invited by: ${invite.sender_name}</div>
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
    // Check uniqueness of team name in Supabase
    const { data: teamCheck, error: checkError } = await supabaseClient
      .from('teams')
      .select('id')
      .eq('name', teamName);

    if (checkError) throw checkError;
    if (teamCheck && teamCheck.length > 0) {
      showToast("A team with this name already exists.", "error");
      btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> CREATE TEAM';
      btn.disabled = false;
      return;
    }

    // Retrieve username from user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id || user.uid)
      .maybeSingle();

    if (profileError) throw profileError;
    const userData = profile || {};
    const username = userData.full_name || userData.username || user.user_metadata?.full_name || user.email;

    const teamPayload = {
      name: teamName,
      leader_id: user.id || user.uid,
      leader_name: username,
      tech_stack: techStack,
      description: description || 'No description provided.',
      members: [
        {
          uid: user.id || user.uid,
          name: username,
          email: user.email,
          role: 'leader'
        }
      ]
    };

    const { data: teamData, error: insertError } = await supabaseClient
      .from('teams')
      .insert(teamPayload)
      .select('id')
      .single();

    if (insertError) throw insertError;

    await supabaseClient
      .from('profiles')
      .update({ team_id: teamData.id })
      .eq('id', user.id || user.uid);

    const batch = db.batch();
    
    // Add document to 'mail' collection to send notification email (Trigger Email schema)
    const mailRef = db.collection('mail').doc();
    batch.set(mailRef, {
      to: user.email,
      message: {
        subject: `Team "${teamName}" Created Successfully!`,
        text: `Congratulations! Your hackathon team "${teamName}" has been successfully created. Invite other miners to join your squad!`,
        html: `<p>Congratulations!</p><p>Your hackathon team <strong>${teamName}</strong> has been successfully created.</p><p>Invite other miners to join your squad!</p>`
      }
    });

    await batch.commit();
    showToast(`Team "${teamName}" created successfully!`, "success");
    syncTeamSection();
  } catch (error) {
    console.error("Error creating team:", error);
    showToast("Failed to create team. Try again.", "error");
    btn.innerHTML = '<i class="fa-solid fa-circle-plus"></i> CREATE TEAM';
    btn.disabled = false;
  }
}

function renderTeamDashboard(user, teamId, teamData) {
  document.getElementById('dash-team-name').textContent = teamData.name;
  document.getElementById('dash-team-desc').textContent = teamData.description || 'No description provided.';
  document.getElementById('dash-team-tech').textContent = teamData.techStack;
  
  const numMembers = teamData.members.length;
  document.getElementById('team-size-badge').textContent = `${numMembers} / 5 members`;

  const membersList = document.getElementById('team-members-list');
  let membersHtml = '';
  teamData.members.forEach(member => {
    const isLeader = member.role === 'leader';
    membersHtml += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px;">
        <div style="display:flex; align-items:center; gap: 12px; overflow: hidden;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${isLeader ? 'rgba(240,165,0,0.1)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${isLeader ? 'rgba(240,165,0,0.3)' : 'rgba(255,255,255,0.1)'}; display:flex; align-items:center; justify-content:center; color: ${isLeader ? 'var(--color-amber)' : 'var(--text-muted)'}; flex-shrink:0;">
            <i class="fa-solid ${isLeader ? 'fa-crown' : 'fa-user'}"></i>
          </div>
          <div style="overflow: hidden;">
            <div style="font-weight: 700; font-size: 13.5px; color: var(--text-light); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${member.name} ${member.uid === (user.id || user.uid) ? '<span style="font-size:10px; color:var(--color-amber); font-weight:normal;">(You)</span>' : ''}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${member.email}</div>
          </div>
        </div>
        <span class="badge ${isLeader ? 'badge-gold' : 'badge-blue'}">${isLeader ? 'Leader' : 'Member'}</span>
      </div>
    `;
  });
  membersList.innerHTML = membersHtml;

  const isUserLeader = teamData.leaderId === (user.id || user.uid);
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
        .eq('email', identifier)
        .maybeSingle();
    } else {
      profilesResult = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('username', identifier)
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

    if (targetData.team_id) {
      showToast(`"${receiverUsername}" is already in another team.`, "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    if (receiverUid === (user.id || user.uid)) {
      showToast("You cannot invite yourself.", "error");
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> SEND INVITATION';
      btn.disabled = false;
      return;
    }

    const { data: inviteCheck, error: checkError } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('team_id', currentTeamId)
      .eq('receiver_email', receiverEmail)
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
      sender_id: user.id || user.uid,
      sender_name: currentTeamData.leaderName,
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

    const batch = db.batch();
    const mailRef = db.collection('mail').doc();
    batch.set(mailRef, {
      to: receiverEmail,
      message: {
        subject: `You've been invited to join team "${currentTeamData.name}"!`,
        text: `Hi ${receiverUsername}! You got an invitation to join the team "${currentTeamData.name}" by ${currentTeamData.leaderName}. Log in to your CodeMiners portal and visit the Teams page to accept or decline.`,
        html: `<p>Hi <strong>${receiverUsername}</strong>!</p><p>You got an invitation to join the team <strong>${currentTeamData.name}</strong> by <strong>${currentTeamData.leaderName}</strong>.</p><p>Log in to your <a href="http://localhost:3000/">CodeMiners Portal</a> and visit the <strong>Teams</strong> section to accept or decline the request.</p>`
      }
    });

    await batch.commit();
    showToast(`Invitation sent to ${receiverUsername}!`, "success");
    document.getElementById('invite-identifier').value = '';
    loadSentInvitations(currentTeamId);
  } catch (error) {
    console.error("Error sending invitation:", error);
    showToast("Failed to send invitation.", "error");
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

    if (teamData.members.length >= 5) {
      showToast("This team is already full.", "error"); return;
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id || user.uid)
      .maybeSingle();

    if (profileError) throw profileError;
    const userData = profile || {};
    const username = userData.full_name || userData.username || user.user_metadata?.full_name || user.email;

    const newMember = {
      uid: user.id || user.uid,
      name: username,
      email: user.email,
      role: 'member'
    };

    const updatedMembers = [...teamData.members, newMember];

    const { error: updateTeamError } = await supabaseClient
      .from('teams')
      .update({ members: updatedMembers })
      .eq('id', teamId);

    if (updateTeamError) throw updateTeamError;

    await supabaseClient
      .from('profiles')
      .update({ team_id: teamId })
      .eq('id', user.id || user.uid);

    const { error: updateInviteError } = await supabaseClient
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', inviteId);

    if (updateInviteError) console.warn("Failed to accept invitation record: ", updateInviteError);

    const { data: otherInvites, error: fetchOtherInvitesError } = await supabaseClient
      .from('invitations')
      .select('id')
      .eq('receiver_email', user.email)
      .eq('status', 'pending');

    if (!fetchOtherInvitesError && otherInvites && otherInvites.length > 0) {
      const otherInviteIds = otherInvites.map(d => d.id).filter(id => id !== inviteId);
      if (otherInviteIds.length > 0) {
        await supabaseClient
          .from('invitations')
          .update({ status: 'rejected' })
          .in('id', otherInviteIds);
      }
    }

    showToast(`You have joined "${teamData.name}"!`, "success");
    syncTeamSection();
  } catch (error) {
    console.error("Error accepting invitation:", error);
    showToast("Failed to join team.", "error");
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
      const updatedMembers = currentTeamData.members.filter(m => m.uid !== (user.id || user.uid));
      
      const { error: updateError } = await supabaseClient
        .from('teams')
        .update({ members: updatedMembers })
        .eq('id', currentTeamId);

      if (updateError) throw updateError;

      await supabaseClient
        .from('profiles')
        .update({ team_id: null })
        .eq('id', user.id || user.uid);

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
      for (const member of currentTeamData.members) {
        await supabaseClient
          .from('profiles')
          .update({ team_id: null })
          .eq('id', member.uid);
      }

      const { error: inviteError } = await supabaseClient
        .from('invitations')
        .update({ status: 'revoked' })
        .eq('team_id', currentTeamId);

      if (inviteError) console.warn("Error revoking invitations during disband:", inviteError);

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
// RAZORPAY SDK REGISTRATION PAYMENT PORTAL (HACKATHON ONLY)
// ─────────────────────────────────────────────────────────────
function initRazorpayRegistrationPayment() {
  const teamSize = currentTeamData ? currentTeamData.members.length : 1;
  const rate = teamSize < 5 ? 70 : 50;
  const amount = rate * teamSize;

  document.getElementById('rp-amount').textContent = `₹${amount}`;
  document.getElementById('rp-team-details').textContent = `CodeMiners Hackathon (${teamSize} member${teamSize > 1 ? 's' : ''} @ ₹${rate}/head)`;
}

function payWithRazorpaySDK(btnElement) {
  const fullName = document.getElementById('r-name').value.trim();
  const email = document.getElementById('r-email').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const teamSize = currentTeamData ? currentTeamData.members.length : 1;
  const rate = teamSize < 5 ? 70 : 50;
  const amount = rate * teamSize;

  const originalBtnHtml = btnElement.innerHTML;
  btnElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  btnElement.disabled = true;

  const options = {
    key: 'rzp_live_T77jqjiWmPUazt',
    amount: amount * 100, // in paise
    currency: "INR",
    name: "CodeMiners",
    description: "Hackathon Registration Fee",
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
      college: document.getElementById('r-college').value.trim(),
      year: document.getElementById('r-year').value,
      pin: document.getElementById('r-pin').value.trim(),
      hallticket: document.getElementById('r-hallticket').value.trim(),
      role: 'leader',
      eventName: selectedEvent,
      teamName: document.getElementById('r-team-name') ? document.getElementById('r-team-name').value.trim() : '',
      teamSize: teamSize
    },
    theme: {
      color: "#3395ff"
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
