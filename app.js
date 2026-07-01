/* ============================================
   CodeMiners Hackathon — App Logic
   GSAP Animations · Firebase Auth
   ============================================ */

// ─────────────────────────────────────────────
// Firebase and Supabase Configuration
// ─────────────────────────────────────────────
if (typeof firebaseConfig !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

const SUPABASE_URL = 'https://omxgqhwogkihrdnlonoq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UGnbbIMZrz-jZvLN8pS7jw_1LGAp3HP';
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ─────────────────────────────────────────────
// DOM References
// ─────────────────────────────────────────────
const DOM = {
  // Hero
  heroBadge:    document.getElementById('heroBadge'),
  heroContainer:document.getElementById('hero'),

  // Glass Card
  glassCard:    document.getElementById('glassCard'),
  cardHeader:   document.getElementById('cardHeader'),
  cardTitle:    document.getElementById('cardTitle'),
  cardSubtitle: document.getElementById('cardSubtitle'),

  // OAuth buttons
  btnGoogle:    document.getElementById('authGoogle'),
  socialAuth:   document.getElementById('oauthProviders'),
  divider:      document.getElementById('divider'),

  // Form
  authForm:     document.getElementById('authForm'),
  nameGroup:    document.getElementById('nameGroup'),
  nameInput:    document.getElementById('nameInput'),
  emailLabel:   document.getElementById('emailLabel'),
  emailInput:   document.getElementById('emailInput'),
  passwordInput:document.getElementById('passwordInput'),
  passwordToggle: document.getElementById('passwordToggle'),
  messageBox:   document.getElementById('messageBox'),
  btnSubmit:    document.getElementById('btnSubmit'),
  btnText:      document.getElementById('btnText'),
  btnLoader:    document.getElementById('btnLoader'),

  // Toggle
  toggleText:   document.getElementById('toggleText'),
  toggleBtn:    document.getElementById('toggleBtn'),
  forgotBtn:    document.getElementById('forgotBtn'),

  // Particles
  particlesContainer: document.getElementById('network-canvas'),

  // SVG filter elements
  turbulence:   document.getElementById('turbulence'),
  displacement: document.getElementById('displacement'),
};

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
let isSignUp = false;
let isLoading = false;

// ─────────────────────────────────────────────
// Particles System
// ─────────────────────────────────────────────
function initNetworkCanvas() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  
  function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    
    particles = [];
    const numParticles = Math.floor((width * height) / 10000); 
    
    for (let i = 0; i < numParticles; i++) {
      const isLarge = Math.random() > 0.9;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isLarge ? 0.2 : 0.6),
        vy: (Math.random() - 0.5) * (isLarge ? 0.2 : 0.6),
        radius: isLarge ? Math.random() * 3 + 3.5 : Math.random() * 2.0 + 1.5,
        isLarge: isLarge
      });
    }
  }
  
  window.addEventListener('resize', initCanvas);
  initCanvas();

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      
      // Motion
      p.x += p.vx;
      p.y += p.vy;
      
      // Screen boundaries bounce
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      const maxNodeOpacity = p.isLarge ? 0.25 : 0.75; 
      ctx.fillStyle = `rgba(240, 165, 0, ${maxNodeOpacity})`;
      ctx.fill();
    }
    
    // Connect nearby particles
    const connectionDistance = 160;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let p1 = particles[i];
        let p2 = particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq < connectionDistance * connectionDistance) {
          const dist = Math.sqrt(distSq);
          const baseOpacity = 1 - (dist / connectionDistance);
          const finalOpacity = baseOpacity * 0.45;
          
          if (finalOpacity > 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(240, 165, 0, ${finalOpacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }
    
    requestAnimationFrame(drawNetwork);
  }
  
  drawNetwork();
}

// ─────────────────────────────────────────────
// Liquid Glass SVG Filter Animation
// ─────────────────────────────────────────────
function animateLiquidGlass() {
  if (!DOM.turbulence || !DOM.displacement) return;

  // Subtle continuous turbulence animation
  const tl = gsap.timeline({ repeat: -1, yoyo: true });

  tl.to(DOM.turbulence, {
    attr: { baseFrequency: '0.02' },
    duration: 4,
    ease: 'sine.inOut',
  })
  .to(DOM.turbulence, {
    attr: { baseFrequency: '0.012' },
    duration: 3,
    ease: 'sine.inOut',
  })
  .to(DOM.turbulence, {
    attr: { baseFrequency: '0.018' },
    duration: 3.5,
    ease: 'sine.inOut',
  });

  // Displacement scale breathing
  gsap.to(DOM.displacement, {
    attr: { scale: 12 },
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
}

// ─────────────────────────────────────────────
// Page Entrance Animation
// ─────────────────────────────────────────────
function playEntranceAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Glass container header entrance
  tl.from(DOM.heroContainer, {
    opacity: 0,
    y: -30,
    scale: 0.9,
    duration: 1,
    ease: 'back.out(1.2)'
  }, 0.1);

  // Glass card
  tl.from(DOM.glassCard, {
    opacity: 0,
    y: 40,
    duration: 1,
    ease: 'power3.out',
  }, 0.4);

  // Form inputs stagger
  tl.from('.input-group', {
    opacity: 0,
    y: 12,
    duration: 0.4,
    stagger: 0.08,
  }, 0.9);

  // Submit button
  tl.from(DOM.btnSubmit, {
    opacity: 0,
    y: 10,
    scale: 0.95,
    duration: 0.5,
    ease: 'back.out(1.7)',
  }, 1.1);

  // Divider
  tl.from(DOM.divider, {
    opacity: 0,
    scaleX: 0,
    duration: 0.5,
  }, 1.2);

  // OAuth buttons stagger
  tl.from([DOM.btnGoogle], {
    opacity: 0,
    y: 15,
    duration: 0.5,
    stagger: 0.1,
  }, 1.4);

  // Auth toggle
  tl.from('.auth-toggle', {
    opacity: 0,
    duration: 0.4,
  }, 1.6);
}

// ─────────────────────────────────────────────
// Input Focus Animations
// ─────────────────────────────────────────────
function setupInputAnimations() {
  const inputs = document.querySelectorAll('.input-field');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input.closest('.input-wrapper'), {
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
      });
      // Subtle card glow pulse
      gsap.to(DOM.glassCard, {
        boxShadow: '0 16px 48px rgba(0,0,0,0.25), 0 0 60px rgba(243, 156, 18, 0.2)',
        duration: 0.4,
      });
    });

    input.addEventListener('blur', () => {
      gsap.to(input.closest('.input-wrapper'), {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(DOM.glassCard, {
        boxShadow: '0 16px 48px rgba(0,0,0,0.25), 0 0 40px rgba(243, 156, 18, 0.15)',
        duration: 0.4,
      });
    });
  });
}

// ─────────────────────────────────────────────
// Button Hover Animations
// ─────────────────────────────────────────────
function setupButtonAnimations() {
  // Social buttons
  [DOM.btnGoogle].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' });
    });
  });

  // Primary button
  DOM.btnSubmit.addEventListener('mouseenter', () => {
    if (!isLoading) {
      gsap.to(DOM.btnSubmit, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
    }
  });
  DOM.btnSubmit.addEventListener('mouseleave', () => {
    gsap.to(DOM.btnSubmit, { scale: 1, duration: 0.25, ease: 'power2.out' });
  });
}

// ─────────────────────────────────────────────
// Password Visibility Toggle
// ─────────────────────────────────────────────
DOM.passwordToggle.addEventListener('click', () => {
  const isPassword = DOM.passwordInput.type === 'password';
  DOM.passwordInput.type = isPassword ? 'text' : 'password';

  const eyeOpen   = DOM.passwordToggle.querySelector('.eye-open');
  const eyeClosed = DOM.passwordToggle.querySelector('.eye-closed');

  eyeOpen.style.display   = isPassword ? 'none' : 'block';
  eyeClosed.style.display = isPassword ? 'block' : 'none';

  gsap.from(DOM.passwordToggle, { scale: 0.7, duration: 0.25, ease: 'back.out(2)' });
});

// ─────────────────────────────────────────────
// Show Message
// ─────────────────────────────────────────────
function showMessage(text, type = 'error') {
  DOM.messageBox.textContent = text;
  DOM.messageBox.className = `message-box ${type} visible`;

  // Auto-hide after 5s
  setTimeout(() => {
    DOM.messageBox.className = 'message-box';
  }, 5000);
}

// ─────────────────────────────────────────────
// Loading State
// ─────────────────────────────────────────────
function setLoading(state) {
  isLoading = state;
  if (state) {
    DOM.btnSubmit.classList.add('loading');
  } else {
    DOM.btnSubmit.classList.remove('loading');
  }
}

function showSuccessOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    gsap.fromTo(overlay, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  }
}

// ─────────────────────────────────────────────
// Login / Sign-Up Toggle
// ─────────────────────────────────────────────
let isToggling = false;
DOM.toggleBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (isToggling) return;
  isToggling = true;
  isSignUp = !isSignUp;

  const tl = gsap.timeline();

  // Fade out card content
  tl.to([DOM.cardHeader, DOM.authForm, '.auth-toggle'], {
    opacity: 0,
    y: -10,
    duration: 0.2,
    stagger: 0.03,
  });

  tl.call(() => {
    if (isSignUp) {
      DOM.cardTitle.innerHTML = '<i class="fa-solid fa-user-plus"></i> Join CodeMiners';
      DOM.cardSubtitle.textContent = 'Begin your journey into the future';
      DOM.emailLabel.textContent = 'Email Address';
      DOM.nameGroup.style.display  = 'flex';
      DOM.btnText.textContent      = 'Sign Up';
      DOM.toggleText.textContent   = 'Already have an account?';
      DOM.toggleBtn.textContent    = 'Sign In';
      if (DOM.forgotBtn) DOM.forgotBtn.parentElement.style.display = 'none';
    } else {
      // Switch to Sign-In view
      DOM.toggleBtn.textContent = 'Sign Up';
      DOM.toggleText.textContent = 'Don\'t have an account?';
      DOM.btnText.textContent = 'Sign In';
      DOM.nameGroup.style.display  = 'none';
      DOM.emailInput.placeholder = '';
      DOM.cardTitle.innerHTML = '<i class="fa-solid fa-fingerprint"></i> Welcome Back';
      DOM.cardSubtitle.textContent = 'Access your neural dashboard';
      DOM.emailLabel.textContent = 'Email Address';
      if (DOM.forgotBtn) DOM.forgotBtn.parentElement.style.display = 'block';
    }

    // Clear any messages
    DOM.messageBox.className = 'message-box';
  });

  // Fade in with new content
  tl.to([DOM.cardHeader, DOM.authForm, '.auth-toggle'], {
    opacity: 1,
    y: 0,
    duration: 0.35,
    stagger: 0.05,
    ease: 'power2.out',
    onComplete: () => { isToggling = false; }
  });

  // If showing name field, animate it in
  if (!isSignUp) return;
  tl.from(DOM.nameGroup, {
    height: 0,
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
  }, '<');
});

// ─────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────
if (DOM.forgotBtn) {
  DOM.forgotBtn.addEventListener('click', async () => {
    const inputVal = DOM.emailInput.value.trim();
    if (!inputVal) {
      showMessage('Please enter your email address first.');
      return;
    }
    if (!inputVal.includes('@')) {
      showMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await auth.sendPasswordResetEmail(inputVal);
      showMessage('Password reset link sent to your email!', 'success');
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  });
}

// ─────────────────────────────────────────────
// Firebase Auth — Email / Password
// ─────────────────────────────────────────────
DOM.authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  const inputVal = DOM.emailInput.value.trim();
  const password = DOM.passwordInput.value;

  if (!inputVal || !password) {
    showMessage('Please fill in all fields.');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);

  try {
    if (isSignUp) {
      const email = inputVal;
      const fullName = DOM.nameInput.value.trim();
      
      if (!fullName) {
        showMessage('Please enter your full name.');
        setLoading(false);
        return;
      }

      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      
      await userCredential.user.updateProfile({ displayName: fullName });

      // Save user profile directly to Supabase profiles table
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: userCredential.user.uid,
          email: email,
          full_name: fullName,
          username: email.split('@')[0],
          created_at: new Date().toISOString()
        });

      if (profileError) throw profileError;
      
      // Send verification email and sign out
      await userCredential.user.sendEmailVerification();
      await auth.signOut();
      
      showMessage('Account created! Verification link sent to your email.', 'success');
    } else {
      const loginEmail = inputVal;
      if (!loginEmail.includes('@')) {
        showMessage('Please enter a valid email address.');
        setLoading(false);
        return;
      }

      const userCredential = await auth.signInWithEmailAndPassword(loginEmail, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        await auth.signOut();
        showMessage('Please verify your email address first.');
        return;
      }

      const success = await ensureProfileWithFullName(user);
      if (!success) {
        showMessage('Login cancelled. Full name is required.');
        return;
      }
      
      showSuccessOverlay();
      showMessage('Signed in successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'portal.html';
      }, 800);
    }
  } catch (error) {
    showMessage(error.message);
  } finally {
    setLoading(false);
  }
});

// Helper to ensure profile exists and has a validated Full Name (requires user input if missing)
async function ensureProfileWithFullName(user) {
  try {
    const { data: profile, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.uid)
      .maybeSingle();

    if (fetchError) throw fetchError;

    let fullName = (profile && profile.full_name) ? profile.full_name.trim() : '';
    let dbUsername = (profile && profile.username) ? profile.username.trim() : '';

    let needsUpsert = false;

    if (!dbUsername) {
      while (!dbUsername) {
        let input = prompt("Enter your Username (letters, numbers, underscores only):");
        if (input === null) {
          await auth.signOut();
          return false;
        }
        input = input.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (!input) {
          alert("Username is required and must contain valid characters.");
          continue;
        }
        
        const { data: existing, error: err } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('username', input)
          .maybeSingle();
          
        if (existing && existing.id !== user.uid) {
          alert("That username is already taken. Please choose another.");
        } else {
          dbUsername = input;
        }
      }
      needsUpsert = true;
    }

    if (!fullName) {
      fullName = prompt("Enter your Full Name (NOTE: You cannot change this later. For corrections, contact support at codeminerscommunity@gmail.com):");
      while (!fullName || !fullName.trim()) {
        if (fullName === null) {
          await auth.signOut();
          return false;
        }
        fullName = prompt("Full Name is required. Enter your Full Name (NOTE: You cannot change this later. For corrections, contact support at codeminerscommunity@gmail.com):");
      }
      fullName = fullName.trim();
      needsUpsert = true;
    }

    if (needsUpsert) {
      // Upsert the profile record
      const { error: upsertError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: user.uid,
          email: user.email || '',
          full_name: fullName,
          username: dbUsername,
          created_at: profile ? profile.created_at : new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      // Sync display name in Firebase Auth
      await user.updateProfile({ displayName: fullName });
    }
    return true;
  } catch (err) {
    console.error("Error verifying profile:", err);
    throw err;
  }
}

// ─────────────────────────────────────────────
// Firebase Auth — Google Sign-In
// ─────────────────────────────────────────────
DOM.btnGoogle.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const userCredential = await auth.signInWithPopup(provider);
    const user = userCredential.user;
    
    const success = await ensureProfileWithFullName(user);
    if (!success) {
      showMessage('Login cancelled. Full name is required.');
      return;
    }

    showMessage('Signed in with Google!', 'success');
    setTimeout(() => {
      window.location.href = 'portal.html';
    }, 800);
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showMessage(error.message);
    }
  }
});



// ─────────────────────────────────────────────
// Auth State Observer
// ─────────────────────────────────────────────
auth.onAuthStateChanged((user) => {
  if (user && user.emailVerified && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))) {
    window.location.href = 'portal.html';
  }
});

// ─────────────────────────────────────────────
// Initialize Everything
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Wait for GSAP to load
  if (typeof gsap === 'undefined') {
    window.addEventListener('load', init);
  } else {
    init();
  }
});

function init() {
  initNetworkCanvas();
  playEntranceAnimation();
  setupInputAnimations();
  setupButtonAnimations();
  initLiquidGlassPhysics();
}

function initLiquidGlassPhysics() {
  const card = document.getElementById('glassCard');
  if (!card) return;

  // Inject shimmer overlay if not already present
  let shimmer = card.querySelector('.glass-shimmer');
  if (!shimmer) {
    shimmer = document.createElement('div');
    shimmer.className = 'glass-shimmer';
    card.appendChild(shimmer);
  }

  // MOUSE ENTER / TOUCH START
  function handleActiveStart(e) {
    card.style.borderColor = 'rgba(243, 156, 18, 0.4)';
    card.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(243, 156, 18, 0.2)';
  }

  // MOUSE LEAVE / TOUCH END
  function handleActiveEnd() {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
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
    
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    // Cap rotation to max 3.5 degrees for elegance and stability
    const maxTilt = 3.5;
    const tiltX = Math.max(-maxTilt, Math.min(maxTilt, ((yc - y) / yc) * maxTilt));
    const tiltY = Math.max(-maxTilt, Math.min(maxTilt, ((x - xc) / xc) * maxTilt));

    if (shimmer) {
      const shimmerX = (x / rect.width) * 100;
      const shimmerY = (y / rect.height) * 100;
      card.style.setProperty('--shimmer-x', `${shimmerX}%`);
      card.style.setProperty('--shimmer-y', `${shimmerY}%`);
      shimmer.style.opacity = '0.85';
    }

    const isTouch = e.touches !== undefined;
    const scale = isTouch ? 0.97 : 1.03;
    
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
  }

  // Desktop Mouse Events
  card.addEventListener('mousemove', handleMove);
  card.addEventListener('mouseenter', handleActiveStart);
  card.addEventListener('mouseleave', handleActiveEnd);
  card.addEventListener('mousedown', () => {
    card.style.transform = 'perspective(1000px) scale(0.97)';
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
}
