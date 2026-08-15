/* ============================================================
   LifeDrop — Blood Donation System
   Application Logic — Routing, Theming, Forms
   ============================================================ */

(function () {
  'use strict';

  // ===================== DOM REFS =====================
  const views = document.querySelectorAll('.view');

  const toastContainer = document.getElementById('toast-container');

  // Landing
  const heroCTA = document.getElementById('hero-cta');

  // Auth
  const authForm = document.getElementById('auth-form');
  const actionTabs = document.querySelectorAll('.action-tabs__btn');
  const segmentBtns = document.querySelectorAll('.segment-control__btn');
  const passwordInput = document.getElementById('auth-password');
  const passwordToggle = document.getElementById('password-toggle');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authSubmitText = document.getElementById('auth-submit-text');
  const guestBtn = document.getElementById('guest-btn');
  const authSwitchLink = document.getElementById('auth-switch-link');
  const authFooterText = document.getElementById('auth-footer-text');

  // Dynamic form fields
  const fieldName = document.getElementById('field-name');
  const fieldRoleSpecific = document.getElementById('field-role-specific');
  const labelName = document.getElementById('label-name');
  const labelRoleField = document.getElementById('label-role-field');
  const authRoleFieldInput = document.getElementById('auth-role-field');

  // Camp form
  const campForm = document.getElementById('camp-form');

  // Sign-out buttons
  const signOutBtns = [
    document.getElementById('signout-donor'),
    document.getElementById('signout-hospital'),
    document.getElementById('signout-bloodbank'),
  ];

  // Theme toggles (multiple across views)
  const themeToggles = document.querySelectorAll('.theme-toggle');

  // State
  let currentAction = 'signin'; // 'signin' or 'signup'
  let currentRole = 'donor';    // 'donor', 'hospital', 'bloodbank'

  // ===================== THEME =====================
  function getPreferredTheme() {
    const stored = localStorage.getItem('lifedrop-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lifedrop-theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Initialize theme
  setTheme(getPreferredTheme());

  // Bind all theme toggles
  themeToggles.forEach((btn) => btn.addEventListener('click', toggleTheme));

  // ===================== VIEW SWITCHING (with History API) =====================
  /**
   * Switch to a view by ID.
   * @param {string} viewId - The target view element ID.
   * @param {boolean} pushHistory - If true, push a new history entry (default).
   *                                Set false when handling popstate to avoid duplicate entries.
   */
  function switchView(viewId, pushHistory = true) {
    views.forEach((v) => v.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      target.style.animation = 'none';
      target.offsetHeight; // force reflow
      target.style.animation = '';
    }

    // Push a history entry so the browser back button works
    if (pushHistory) {
      history.pushState({ view: viewId }, '', `#${viewId}`);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const viewId = (e.state && e.state.view) ? e.state.view : 'view-landing';
    switchView(viewId, false);
  });

  // Set initial history state for the landing page (replace, don't push)
  history.replaceState({ view: 'view-landing' }, '', '#view-landing');

  // Hero CTA -> Auth
  if (heroCTA) {
    heroCTA.addEventListener('click', () => switchView('view-auth'));
  }


  // ===================== AUTH: ACTION TABS (Sign In / Sign Up) =====================
  function setAction(action) {
    currentAction = action;
    actionTabs.forEach((b) => {
      const isActive = b.dataset.action === action;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Toggle signup fields
    const signupFields = document.querySelectorAll('.signup-field');
    signupFields.forEach((f) => {
      f.style.display = action === 'signup' ? '' : 'none';
    });

    // Update submit button text
    if (authSubmitText) {
      authSubmitText.textContent = action === 'signup' ? 'Create Account' : 'Sign In';
    }

    // Update footer text and link
    if (authFooterText) {
      authFooterText.textContent = action === 'signup'
        ? 'Already have an account?'
        : "Don't have an account?";
    }
    if (authSwitchLink) {
      authSwitchLink.textContent = action === 'signup' ? 'Sign in here' : 'Register here';
    }

    // Update role-specific field for current role
    updateRoleField();
  }

  actionTabs.forEach((btn) => {
    btn.addEventListener('click', () => setAction(btn.dataset.action));
  });

  // Footer link toggles
  if (authSwitchLink) {
    authSwitchLink.addEventListener('click', (e) => {
      e.preventDefault();
      setAction(currentAction === 'signin' ? 'signup' : 'signin');
    });
  }

  // ===================== AUTH: ROLE TABS =====================
  function setRole(role) {
    currentRole = role;
    segmentBtns.forEach((b) => {
      const isActive = b.dataset.tab === role;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    updateRoleField();
  }

  function updateRoleField() {
    if (!labelName || !labelRoleField || !authRoleFieldInput) return;

    // Name label
    switch (currentRole) {
      case 'hospital':
        labelName.textContent = 'Hospital Name';
        break;
      case 'bloodbank':
        labelName.textContent = 'Organization Name';
        break;
      default:
        labelName.textContent = 'Full Name';
    }

    // Role-specific field
    switch (currentRole) {
      case 'donor':
        labelRoleField.textContent = 'Blood Group';
        authRoleFieldInput.placeholder = 'e.g., A+';
        authRoleFieldInput.type = 'text';
        break;
      case 'hospital':
        labelRoleField.textContent = 'Registration ID';
        authRoleFieldInput.placeholder = 'e.g., REG-1001';
        authRoleFieldInput.type = 'text';
        break;
      case 'bloodbank':
        labelRoleField.textContent = 'License Number';
        authRoleFieldInput.placeholder = 'e.g., LIC-5001';
        authRoleFieldInput.type = 'text';
        break;
    }
  }

  segmentBtns.forEach((btn) => {
    btn.addEventListener('click', () => setRole(btn.dataset.tab));
  });

  // ===================== PASSWORD TOGGLE =====================
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      const eyeOpen = passwordToggle.querySelector('.eye-open');
      const eyeClosed = passwordToggle.querySelector('.eye-closed');
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? 'none' : '';
        eyeClosed.style.display = isPassword ? '' : 'none';
      }
    });
  }

  // ===================== TOASTS =====================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = {
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    };
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ===================== ROUTING LOGIC =====================
  function routeToDashboard(role) {
    const viewMap = {
      donor: 'view-donor',
      hospital: 'view-hospital',
      bloodbank: 'view-bloodbank',
    };
    switchView(viewMap[role] || 'view-donor');
  }

  // ===================== AUTH FORM SUBMIT =====================
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('auth-email').value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Simulate auth
      const btn = authSubmitBtn;
      const origHTML = btn.innerHTML;
      btn.innerHTML = '<span class="btn-spinner"></span> Processing...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.disabled = false;

        const label = currentAction === 'signup' ? 'Account created' : 'Signed in';
        const roleName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        showToast(`${label} as ${roleName}`, 'success');

        routeToDashboard(currentRole);
      }, 1200);
    });
  }

  // ===================== GUEST BUTTON =====================
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      showToast('Continuing as Guest (Donor View)', 'info');
      routeToDashboard('donor');
    });
  }

  // ===================== SIGN OUT =====================
  signOutBtns.forEach((btn) => {
    if (btn) {
      btn.addEventListener('click', () => {
        showToast('Signed out successfully.', 'info');
        switchView('view-landing');
        if (authForm) authForm.reset();
      });
    }
  });

  // ===================== CAMP FORM =====================
  if (campForm) {
    campForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('camp-name').value.trim();
      const date = document.getElementById('camp-date').value;
      const address = document.getElementById('camp-address').value.trim();

      if (!name || !date || !address) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const btn = document.getElementById('schedule-camp-btn');
      const origHTML = btn.innerHTML;
      btn.innerHTML = '<span class="btn-spinner"></span> Scheduling...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        showToast(`"${name}" scheduled for ${date}!`, 'success');
        campForm.reset();
      }, 1500);
    });
  }

  // ===================== ANIMATIONS =====================
  // Animate stat bars on view
  const statBars = document.querySelectorAll('.stat-card__bar-fill');
  if (statBars.length) {
    const barObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const width = target.style.width;
            target.style.width = '0%';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                target.style.width = width;
              });
            });
            barObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.3 }
    );
    statBars.forEach((bar) => barObserver.observe(bar));
  }

  // ===================== DYNAMIC SPINNER CSS =====================
  const spinnerStyle = document.createElement('style');
  spinnerStyle.textContent = `
    .btn-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: btn-spin 0.6s linear infinite;
    }
    @keyframes btn-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinnerStyle);
})();
