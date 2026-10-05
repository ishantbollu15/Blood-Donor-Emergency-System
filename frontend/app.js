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
  const heroLetsGo = document.getElementById('hero-lets-go');

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

  // Profile menus
  const profileMenus = document.querySelectorAll('.profile-menu');

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

  // ===================== PROFILE MENU =====================
  profileMenus.forEach((menu) => {
    menu.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close others
      profileMenus.forEach((m) => {
        if (m !== menu) m.classList.remove('open');
      });
      menu.classList.toggle('open');
    });
  });

  document.addEventListener('click', () => {
    profileMenus.forEach((m) => m.classList.remove('open'));
  });

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
      try {
        history.pushState({ view: viewId }, '', `#${viewId}`);
      } catch (e) {
        // Ignore SecurityError on file://
      }
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const viewId = (e.state && e.state.view) ? e.state.view : 'view-landing';
    switchView(viewId, false);
  });

  // Set initial history state for the landing page (replace, don't push)
  try {
    history.replaceState({ view: 'view-landing' }, '', '#view-landing');
  } catch (e) {
    // Ignore SecurityError
  }

  // Hero Let's Go -> Auth Page
  if (heroLetsGo) {
    heroLetsGo.addEventListener('click', () => switchView('view-auth'));
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
      
      const nameInput = document.getElementById('auth-name');
      const name = nameInput ? nameInput.value.trim() : '';
      const roleField = authRoleFieldInput ? authRoleFieldInput.value.trim() : '';

      if (!email || !password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const btn = authSubmitBtn;
      const origHTML = btn.innerHTML;
      btn.innerHTML = '<span class="btn-spinner"></span> Processing...';
      btn.disabled = true;

      const userData = {
        name: currentAction === 'signup' && name ? name : (currentRole === 'hospital' ? 'City Hospital' : currentRole === 'bloodbank' ? 'Central Bank' : 'John Doe'),
        email: email,
        password: password,
        role: currentRole,
        extraInfo: currentAction === 'signup' && roleField ? roleField : (currentRole === 'donor' ? 'A+' : currentRole === 'hospital' ? 'REG-1234' : 'LIC-5678')
      };

      const url = currentAction === 'signup' ? 'http://localhost:8080/api/auth/register' : 'http://localhost:8080/api/auth/login';

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      .then(async response => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Authentication failed');
        }
        return response.json();
      })
      .then(data => {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        
        localStorage.setItem('lifedrop-user', JSON.stringify({
           name: data.name,
           email: data.email,
           role: data.role,
           extra: data.extraInfo
        }));
        updateProfileData();

        const label = currentAction === 'signup' ? 'Account created' : 'Signed in';
        const roleName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
        showToast(`${label} as ${roleName}`, 'success');

        routeToDashboard(currentRole);
      })
      .catch(error => {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        showToast(error.message, 'error');
      });
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
        localStorage.removeItem('lifedrop-user');
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

      const campData = {
        name: name,
        date: date,
        locationType: 'Hospital',
        address: address,
        createdBy: 'Logged In User'
      };

      fetch('http://localhost:8080/api/camps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campData)
      })
      .then(async response => {
        if (!response.ok) throw new Error('Failed to schedule camp');
        return response.json();
      })
      .then(data => {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        showToast(`"${data.name}" scheduled for ${data.date}!`, 'success');
        campForm.reset();
      })
      .catch(error => {
        btn.innerHTML = origHTML;
        btn.disabled = false;
        showToast(error.message, 'error');
      });
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
  document.head.appendChild(spinnerStyle);  // ===================== UPDATE PROFILE =====================
  function updateProfileData() {
    const userStr = localStorage.getItem('lifedrop-user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const avatars = document.querySelectorAll('.user-avatar');
        avatars.forEach(av => {
          av.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';
          av.title = user.name || 'User';
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  // Call on init
  updateProfileData();

  // ===================== CUSTOM TRANSLATE SWITCHER =====================
  const btnLangHi = document.getElementById('btn-lang-hi');
  const btnLangEn = document.getElementById('btn-lang-en');

  const dict = {
    // ===== Landing / Hero =====
    "LifeDrop": "लाइफड्रॉप",
    "Home": "होम",
    "Life Drop": "लाइफ ड्रॉप",
    "Save a Life Today.": "आज एक जीवन बचाएं।",
    "Every year, millions of lives are lost due to the unavailability of blood during emergencies. Life Drop is our initiative to bridge the gap between blood donors and those in critical need, ensuring that a single drop can save up to three lives. Join us in this noble cause.": "हर साल, आपात स्थितियों में रक्त की अनुपलब्धता के कारण लाखों लोगों की जान चली जाती है। लाइफ ड्रॉप रक्तदाताओं और गंभीर ज़रूरतमंदों के बीच की खाई को पाटने की हमारी पहल है, ताकि एक बूंद से तीन जीवन बचाए जा सकें। इस नेक काम में हमारा साथ दें।",
    "Let's Go": "चलिए शुरू करें",
    "Active Donors": "सक्रिय रक्तदाता",
    "Partner Hospitals": "साझेदार अस्पताल",
    "Satisfaction Rate": "संतुष्टि दर",
    "12K+": "12K+",
    "50+": "50+",
    "98%": "98%",

    // ===== Auth =====
    "Sign In": "साइन इन करें",
    "Sign Up": "साइन अप करें",
    "Donor": "रक्तदाता",
    "Hospital": "अस्पताल",
    "Blood Bank": "ब्लड बैंक",
    "Full Name": "पूरा नाम",
    "Email Address": "ईमेल पता",
    "Password": "पासवर्ड",
    "Blood Group": "रक्त समूह",
    "Registration ID": "पंजीकरण आईडी",
    "License Number": "लाइसेंस संख्या",
    "Create Account": "खाता बनाएं",
    "or": "या",
    "Continue without signing in (Guest View)": "बिना साइन इन किए जारी रखें (अतिथि दृश्य)",
    "Don't have an account?": "खाता नहीं है?",
    "Register here": "यहाँ पंजीकरण करें",
    "Already have an account?": "पहले से खाता है?",
    "Sign in here": "यहाँ साइन इन करें",
    "Hospital Name": "अस्पताल का नाम",
    "Organization Name": "संगठन का नाम",

    // ===== Donor Dashboard =====
    "Prototype Mode": "प्रोटोटाइप मोड",
    "Guest User": "अतिथि उपयोगकर्ता",
    "Not provided": "उपलब्ध नहीं",
    "N/A": "लागू नहीं",
    "Nearest Locations": "निकटतम स्थान",
    "Browse nearby hospitals and active blood camps": "आस-पास के अस्पतालों और सक्रिय रक्त शिविरों को ब्राउज़ करें",
    "Hospitals": "अस्पताल",
    "City General Hospital": "सिटी जनरल अस्पताल",
    "123 Main Street, Downtown": "123 मुख्य सड़क, डाउनटाउन",
    "Hospital Facility": "अस्पताल सुविधा",
    "Open 24/7": "24/7 खुला",
    "2.3 km": "2.3 कि.मी.",
    "View Details": "विवरण देखें",
    "Metro Health Care": "मेट्रो हेल्थ केयर",
    "456 Oak Avenue, Midtown": "456 ओक एवेन्यू, मिडटाउन",
    "8 AM – 10 PM": "सुबह 8 – रात 10",
    "4.1 km": "4.1 कि.मी.",
    "Blood Camps": "रक्त शिविर",
    "Spring Blood Drive": "वसंत रक्तदान अभियान",
    "State University, Block A": "राज्य विश्वविद्यालय, ब्लॉक ए",
    "College Campus": "कॉलेज परिसर",
    "March 15, 2026": "15 मार्च, 2026",
    "5.6 km": "5.6 कि.मी.",
    "Register to Donate": "दान करने के लिए पंजीकरण करें",
    "Engineering Dept Drive": "इंजीनियरिंग विभाग अभियान",
    "Engineering College, Main Hall": "इंजीनियरिंग कॉलेज, मुख्य हॉल",
    "April 2, 2026": "2 अप्रैल, 2026",
    "7.2 km": "7.2 कि.मी.",
    "Nearby Donation Centers": "पास के रक्तदान केंद्र",
    "Find hospitals and active camps near you to donate blood": "रक्तदान करने के लिए अपने पास अस्पताल और सक्रिय शिविर खोजें",
    "City General": "सिटी जनरल",
    "Metro Health": "मेट्रो हेल्थ",
    "Spring Drive": "वसंत अभियान",
    "Eng. Dept": "इंजी. विभाग",
    "Health Centers": "स्वास्थ्य केंद्र",
    "Sign Out": "साइन आउट",
    "Email:": "ईमेल:",
    "Blood Group:": "रक्त समूह:",
    "Reg Number:": "पंजी. संख्या:",

    // ===== Hospital Dashboard =====
    "VERIFIED": "सत्यापित",
    "Registration: REG-1001": "पंजीकरण: REG-1001",
    "Connected Blood Banks Network": "जुड़े हुए ब्लड बैंक नेटवर्क",
    "Real-time inventory data from authorized blood banks": "अधिकृत ब्लड बैंकों से रीयल-टाइम इन्वेंट्री डेटा",
    "Central Blood Bank": "केंद्रीय ब्लड बैंक",
    "Bank ID: BB-2001 • Est. 2018": "बैंक आईडी: BB-2001 • स्था. 2018",
    "Network Active": "नेटवर्क सक्रिय",
    "Last synced: 2 minutes ago": "अंतिम सिंक: 2 मिनट पहले",
    "Request Blood": "रक्त का अनुरोध करें",
    "Blood Inventory": "रक्त सूची",
    "units": "इकाइयाँ",
    "ADEQUATE": "पर्याप्त",
    "SURPLUS": "अधिशेष",
    "LIMITED": "सीमित",
    "CRITICAL": "गंभीर",
    "Hospital Name": "अस्पताल का नाम",

    // ===== Blood Bank Dashboard =====
    "Blood Bank Control Panel": "ब्लड बैंक नियंत्रण पैनल",
    "Operational": "सक्रिय",
    "Organize Blood Camp": "रक्त शिविर आयोजित करें",
    "Schedule a new blood donation drive": "नया रक्तदान अभियान शेड्यूल करें",
    "Camp Name": "शिविर का नाम",
    "Date": "दिनांक",
    "Location Type": "स्थान का प्रकार",
    "College Campus (Restricted)": "कॉलेज परिसर (प्रतिबंधित)",
    "In this prototype version, camp scheduling is restricted to college campuses only.": "इस प्रोटोटाइप संस्करण में, शिविर शेड्यूलिंग केवल कॉलेज परिसरों तक सीमित है।",
    "Campus Address": "परिसर का पता",
    "Clear Form": "फॉर्म साफ़ करें",
    "Schedule Blood Camp": "रक्त शिविर शेड्यूल करें",
    "Current Inventory": "वर्तमान सूची",
    "Bank Name": "बैंक का नाम",

    // ===== Badge / misc =====
    "Trusted by 50+ Hospitals Nationwide": "देशभर में 50+ अस्पतालों द्वारा विश्वसनीय",
    "🩸 Trusted by 50+ Hospitals Nationwide": "🩸 देशभर में 50+ अस्पतालों द्वारा विश्वसनीय",
    "Hindi": "हिन्दी",
    "English": "English",

    // ===== Placeholders (handled separately) =====
    "John Doe": "जॉन डो",
    "you@example.com": "आप@उदाहरण.com",
    "••••••••": "••••••••",
    "e.g., A+": "उदा., A+",
    "e.g., REG-1001": "उदा., REG-1001",
    "e.g., LIC-5001": "उदा., LIC-5001",
    "e.g., Spring Blood Drive": "उदा., वसंत रक्तदान अभियान",
    "Enter the full campus address...": "पूरा परिसर पता दर्ज करें..."
  };

  let currentLang = 'en';

  function translatePage(lang) {
    currentLang = lang;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walk.nextNode()) {
      if (node.parentElement && node.parentElement.closest('.custom-lang-switcher')) continue;
      if (node.parentElement && (node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) continue;
      
      let text = node.nodeValue.trim();
      if (!text) continue;

      // Store the original text the first time we see this node
      if (typeof node._origText === 'undefined') {
        node._origText = node.nodeValue;
      }

      if (lang === 'hi') {
        // Try exact match first
        if (dict[text]) {
          node.nodeValue = node._origText.replace(text, dict[text]);
        }
      } else {
        // Restore original
        node.nodeValue = node._origText;
      }
    }
    
    // Also translate placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    inputs.forEach(input => {
      if (!input.hasAttribute('data-orig-placeholder')) {
        input.setAttribute('data-orig-placeholder', input.placeholder);
      }
      let orig = input.getAttribute('data-orig-placeholder');
      if (lang === 'hi' && dict[orig]) {
        input.placeholder = dict[orig];
      } else if (lang === 'en') {
        input.placeholder = orig;
      }
    });

    // Translate readonly input values
    const readonlyInputs = document.querySelectorAll('input[readonly]');
    readonlyInputs.forEach(input => {
      if (!input.hasAttribute('data-orig-value')) {
        input.setAttribute('data-orig-value', input.value);
      }
      let orig = input.getAttribute('data-orig-value');
      if (lang === 'hi' && dict[orig]) {
        input.value = dict[orig];
      } else if (lang === 'en') {
        input.value = orig;
      }
    });
  }

  if (btnLangHi) {
    btnLangHi.addEventListener('click', () => {
      translatePage('hi');
      btnLangHi.style.display = 'none';
      if (btnLangEn) btnLangEn.style.display = 'flex';
    });
  }

  if (btnLangEn) {
    btnLangEn.addEventListener('click', () => {
      translatePage('en');
      btnLangEn.style.display = 'none';
      if (btnLangHi) btnLangHi.style.display = 'flex';
    });
  }

})();
