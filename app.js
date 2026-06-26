/* ============================================
   CodeMiners Hackathon — App Logic
   GSAP Animations · Firebase Auth
   ============================================ */

// ─────────────────────────────────────────────
// Firebase Configuration
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBPXWdCMkXUtubyOx5OGR6iPxcmqJDqex8",
  authDomain:        "codeminer.firebaseapp.com",
  projectId:         "codeminer",
  storageBucket:     "codeminer.firebasestorage.app",
  messagingSenderId: "904581344425",
  appId:             "1:904581344425:web:37ae619d7d8403957f8db8",
  measurementId:     "G-1P9T3KN8VJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// ─────────────────────────────────────────────
// DOM References
// ─────────────────────────────────────────────
const DOM = {
  // Hero
  heroBadge:    document.getElementById('heroBadge'),
  heroTitle:    document.querySelectorAll('.hero__title-line'),
  heroSubtitle: document.getElementById('heroSubtitle'),

  // Glass Card
  glassCard:    document.getElementById('glassCard'),
  cardHeader:   document.getElementById('cardHeader'),
  cardTitle:    document.getElementById('cardTitle'),
  cardSubtitle: document.getElementById('cardSubtitle'),

  // OAuth buttons
  btnGoogle:    document.getElementById('authGoogle'),
  btnGithub:    document.getElementById('authGithub'),
  socialAuth:   document.getElementById('oauthProviders'),
  divider:      document.getElementById('divider'),

  // Form
  authForm:     document.getElementById('authForm'),
  nameGroup:    document.getElementById('nameGroup'),
  nameInput:    document.getElementById('nameInput'),
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

  // Particles
  particlesContainer: document.getElementById('particles-container'),

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
function createParticles() {
  const count = window.innerWidth < 640 ? 18 : 35;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const isAmber = Math.random() > 0.4;
    const size = Math.random() * 6 + 2;

    particle.classList.add('particle', isAmber ? 'particle--amber' : 'particle--white');
    particle.style.width  = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left   = `${Math.random() * 100}%`;
    particle.style.top    = `${Math.random() * 100}%`;
    particle.style.opacity = '0';

    DOM.particlesContainer.appendChild(particle);

    // Animate each particle
    gsap.to(particle, {
      opacity: Math.random() * 0.6 + 0.1,
      duration: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 2,
    });

    gsap.to(particle, {
      y: () => `${(Math.random() - 0.5) * 200}`,
      x: () => `${(Math.random() - 0.5) * 100}`,
      duration: Math.random() * 15 + 10,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 5,
    });
  }
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

  // Hero badge
  tl.from(DOM.heroBadge, {
    opacity: 0,
    y: -15,
    duration: 0.6,
  }, 0);

  // Hero title letters stagger
  tl.from(DOM.heroTitle, {
    opacity: 0,
    yPercent: 100,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power4.out',
  }, 0.15);

  // Subtitle
  tl.from(DOM.heroSubtitle, {
    opacity: 0,
    y: 10,
    duration: 0.7,
  }, 0.5);

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
  tl.from([DOM.btnGoogle, DOM.btnGithub], {
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
  [DOM.btnGoogle, DOM.btnGithub].forEach(btn => {
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

  gsap.from(DOM.messageBox, {
    y: -8,
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
  });

  // Auto-hide after 5s
  setTimeout(() => {
    gsap.to(DOM.messageBox, {
      opacity: 0,
      maxHeight: 0,
      padding: 0,
      duration: 0.3,
      onComplete: () => {
        DOM.messageBox.className = 'message-box';
      },
    });
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

// ─────────────────────────────────────────────
// Login / Sign-Up Toggle
// ─────────────────────────────────────────────
DOM.toggleBtn.addEventListener('click', () => {
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
      DOM.cardTitle.textContent    = 'Create Account';
      DOM.cardSubtitle.textContent = 'Join CodeMiners';
      DOM.nameGroup.style.display  = 'flex';
      DOM.btnText.textContent      = 'Sign Up';
      DOM.toggleText.textContent   = 'Already have an account?';
      DOM.toggleBtn.textContent    = 'Sign In';
    } else {
      DOM.cardTitle.textContent    = 'Welcome Back';
      DOM.cardSubtitle.textContent = 'Sign in to your account';
      DOM.nameGroup.style.display  = 'none';
      DOM.btnText.textContent      = 'Sign In';
      DOM.toggleText.textContent   = "Don't have an account?";
      DOM.toggleBtn.textContent    = 'Sign Up';
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
// Firebase Auth — Email / Password
// ─────────────────────────────────────────────
DOM.authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isLoading) return;

  const email    = DOM.emailInput.value.trim();
  const password = DOM.passwordInput.value;

  if (!email || !password) {
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
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const name = DOM.nameInput.value.trim();
      if (name) {
        await userCredential.user.updateProfile({ displayName: name });
      }
      showMessage('Account created successfully!', 'success');
      // Short delay before redirect
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } else {
      await auth.signInWithEmailAndPassword(email, password);
      showMessage('Signed in successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    }
  } catch (error) {
    const messages = {
      'auth/user-not-found':          'No account found with this email.',
      'auth/wrong-password':          'Incorrect password. Try again.',
      'auth/invalid-credential':      'Invalid credentials. Please check and try again.',
      'auth/email-already-in-use':    'An account with this email already exists.',
      'auth/weak-password':           'Password should be at least 6 characters.',
      'auth/invalid-email':           'Please enter a valid email address.',
      'auth/too-many-requests':       'Too many attempts. Please try again later.',
      'auth/network-request-failed':  'Network error. Check your connection.',
    };
    showMessage(messages[error.code] || error.message);
  } finally {
    setLoading(false);
  }
});

// ─────────────────────────────────────────────
// Firebase Auth — Google Sign-In
// ─────────────────────────────────────────────
DOM.btnGoogle.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    showMessage('Signed in with Google!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 800);
  } catch (error) {
    if (error.code !== 'auth/popup-closed-by-user') {
      showMessage(error.message);
    }
  }
});

// ─────────────────────────────────────────────
// Firebase Auth — GitHub Sign-In
// ─────────────────────────────────────────────
DOM.btnGithub.addEventListener('click', async () => {
  const provider = new firebase.auth.GithubAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    showMessage('Signed in with GitHub!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
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
  if (user && window.location.pathname.endsWith('index.html') === false &&
      window.location.pathname !== '/' &&
      !window.location.pathname.endsWith('/')) {
    // User is already signed in — handled by redirect in sign-in flow
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
  createParticles();
  playEntranceAnimation();
  setupInputAnimations();
  setupButtonAnimations();
}
