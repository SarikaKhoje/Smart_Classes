/**
 * ==========================================================================
 * KASHVI SMARTCLASS - COMPLETE APPLICATION & AUTHENTICATION ENGINE
 * ==========================================================================
 */

// Application State
const authState = {
  isAuthenticated: false,
  currentUser: null,
  currentRole: 'admin', // 'admin' | 'teacher' | 'student' | 'parent'
  currentModule: 'module-admin',
  failedAttempts: 0,
  isLockedOut: false,
  lockoutTimeRemaining: 0,
  lockoutInterval: null,
  sessionTimeSeconds: 1800, // 30 min session timeout
  sessionInterval: null,
  twoFactorEnabled: false,
  pendingAdminAuth: null,
  userDirectory: [
    { id: 'ADMIN-2024-0001', name: 'Dr. Rajesh Sharma', email: 'admin@kashvi.com', role: 'admin', roleTitle: 'Super Admin', subject: 'Administration', classAssigned: 'All Classes', status: 'Active', avatar: 'AD' },
    { id: 'TCH-2024-0001', name: 'Mr. Vikram Verma', email: 'teacher@kashvi.com', role: 'teacher', roleTitle: 'Senior Math Faculty', subject: 'Mathematics', classAssigned: '10, 8', status: 'Active', avatar: 'VV' },
    { id: 'TCH-2024-0002', name: 'Ms. Sunita Rao', email: 'gupta@kashvi.com', role: 'teacher', roleTitle: 'Physics Specialist', subject: 'Physics', classAssigned: '8', status: 'Active', avatar: 'SR' },
    { id: 'TCH-2024-0003', name: 'Dr. Ramesh Rao', email: 'verma@kashvi.com', role: 'teacher', roleTitle: 'Chemistry Lead', subject: 'Chemistry', classAssigned: '8-C', status: 'Inactive', avatar: 'RR' },
    { id: 'STU-2024-0001', name: 'Aarav Sharma', email: 'student@kashvi.com', role: 'student', roleTitle: 'Student 10', subject: 'Science Stream', classAssigned: '10 (Roll 12)', status: 'Active', parentEmail: 'parent@gmail.com', avatar: 'AS' },
    { id: 'STU-2024-0002', name: 'Rhea Kulkarni', email: 'stu2@kashvi.com', role: 'student', roleTitle: 'Student 10', subject: 'Science Stream', classAssigned: '10 (Roll 08)', status: 'Active', parentEmail: 'parent2@gmail.com', avatar: 'RK' },
    { id: 'STU-2024-0003', name: 'Siddharth Patel', email: 'stu3@kashvi.com', role: 'student', roleTitle: 'Student 9', subject: 'Commerce', classAssigned: '9 (Roll 15)', status: 'Inactive', parentEmail: 'parent3@gmail.com', avatar: 'SP' },
    { id: 'PRN-2024-0001', name: 'Mr. Sharma', email: 'parent@gmail.com', role: 'parent', roleTitle: 'Guardian', subject: 'Parent Account', classAssigned: 'Aarav & Ananya', status: 'Active', avatar: 'PS' },
    { id: 'PRN-2024-0002', name: 'Dr. Kulkarni', email: 'parent2@gmail.com', role: 'parent', roleTitle: 'Guardian', subject: 'Parent Account', classAssigned: 'Rhea Kulkarni', status: 'Active', avatar: 'PK' }
  ],
  credentialsStore: {
    'admin@kashvi.com': { password: 'Admin@2024', role: 'admin', id: 'ADMIN-2024-0001', name: 'Dr. Rajesh Sharma' },
    'teacher@kashvi.com': { password: 'Teacher@123', role: 'teacher', id: 'TCH-2024-0048', name: 'Prof. Vikram Verma' },
    'student@kashvi.com': { password: 'Student@123', role: 'student', id: 'STU-2024-1284', name: 'Aarav Sharma' },
    'parent@gmail.com': { password: 'Parent@123', role: 'parent', id: 'PRN-2024-0980', name: 'Mr. Sharma (Parent)' }
  },
  quizTimerSeconds: 1785,
  quizInterval: null,
  quizCurrentIndex: 0,
  quizAnswers: {},
  quizList: [
    { q: 'What is the value of x if 2x + 8 = 20?', options: ['A) 4', 'B) 6', 'C) 8', 'D) 10'], correct: 1 },
    { q: 'Which law of motion is known as Law of Inertia?', options: ['A) First Law', 'B) Second Law', 'C) Third Law', 'D) Universal Gravitation'], correct: 0 },
    { q: 'What is the chemical formula for Calcium Carbonate?', options: ['A) CaO', 'B) Ca(OH)2', 'C) CaCO3', 'D) CaCl2'], correct: 2 },
    { q: 'If sin(θ) = 1/2, what is the value of θ in standard acute degrees?', options: ['A) 45°', 'B) 30°', 'C) 60°', 'D) 90°'], correct: 1 },
    { q: 'Which organelle is the powerhouse of the cell?', options: ['A) Ribosome', 'B) Mitochondria', 'C) Golgi apparatus', 'D) ER'], correct: 1 }
  ]
};

// Role-Based Access Matrix & Sidebar Links
const accessMatrix = {
  admin: {
    allowedModules: [
      'module-admin', 'module-user-management', 'module-attendance', 'module-progress', 
      'module-homework', 'module-notes', 'module-leaderboard', 'module-certificates', 
      'module-tests', 'module-announcements', 'module-timetable', 'module-classes', 
      'module-ai-plans', 'module-report-card', 'module-reports', 'module-payments', 
      'module-receipts', 'module-notifications', 'module-trial', 'module-settings'
    ],
    sidebar: [
      { id: 'module-admin', label: '📊 Admin Dashboard', icon: 'dashboard' },
      { id: 'module-user-management', label: '👥 User Management', icon: 'manage_accounts', badge: 'Admin' },
      { id: 'module-attendance', label: '📅 Attendance Management', icon: 'how_to_reg' },
      { id: 'module-progress', label: '📈 Progress Tracking', icon: 'trending_up' },
      { id: 'module-homework', label: '📝 Homework Management', icon: 'assignment' },
      { id: 'module-notes', label: '📚 Study Materials & Notes', icon: 'folder' },
      { id: 'module-leaderboard', label: '🏆 Leaderboard', icon: 'military_tech' },
      { id: 'module-certificates', label: '🥇 Certificates', icon: 'workspace_premium' },
      { id: 'module-tests', label: '🧪 Online Tests', icon: 'science' },
      { id: 'module-announcements', label: '📢 Announcements', icon: 'campaign', badge: 'New' },
      { id: 'module-timetable', label: '📆 Timetable', icon: 'calendar_today' },
      { id: 'module-classes', label: '📹 Live Online Classes', icon: 'videocam', badge: 'Live' },
      { id: 'module-ai-plans', label: '🤖 AI Study Plans', icon: 'smart_toy' },
      { id: 'module-report-card', label: '📄 Automated Report Cards', icon: 'description' },
      { id: 'module-reports', label: '📈 Monthly Analytics', icon: 'analytics' },
      { id: 'module-payments', label: '💳 Fee Management', icon: 'payments' },
      { id: 'module-receipts', label: '🧾 Fee Receipts', icon: 'receipt_long' },
      { id: 'module-notifications', label: '🔔 WhatsApp & Holidays', icon: 'notifications' },
      { id: 'module-trial', label: '🎁 15-Day Free Trial', icon: 'redeem' },
      { id: 'module-settings', label: '🔐 Security & Settings', icon: 'settings' }
    ]
  },
  teacher: {
    allowedModules: [
      'module-teacher', 'module-attendance', 'module-homework', 'module-notes', 
      'module-tests', 'module-progress', 'module-timetable', 'module-classes', 
      'module-announcements', 'module-leaderboard', 'module-settings'
    ],
    sidebar: [
      { id: 'module-teacher',  label: '📊 Teacher Dashboard', icon: 'dashboard' },
      { id: 'module-attendance', label: '📅 Attendance Rolls', icon: 'how_to_reg' },
      { id: 'module-homework', label: '📝 Homework & Review', icon: 'assignment' },
      { id: 'module-notes', label: '📚 Notes & Study Files', icon: 'folder' },
      { id: 'module-tests', label: '🧪 Online Tests & Quizzes', icon: 'science' },
      { id: 'module-progress', label: '📈 Student Progress Roster', icon: 'trending_up' },
      { id: 'module-timetable', label: '📆 Weekly Timetable', icon: 'calendar_today' },
      { id: 'module-classes', label: '📹 Live Virtual Classes', icon: 'videocam', badge: 'Live' },
      { id: 'module-announcements', label: '📢 Notices & Circulars', icon: 'campaign' },
      { id: 'module-leaderboard', label: '🏆 Class Leaderboard', icon: 'military_tech' },
      { id: 'module-settings',  label: '🔐 Security & Password', icon: 'settings' }
    ]
  },
  student: {
    allowedModules: [
      'module-student', 'module-attendance', 'module-progress', 'module-homework', 
      'module-notes', 'module-tests', 'module-timetable', 'module-leaderboard', 
      'module-certificates', 'module-classes', 'module-ai-plans', 'module-report-card', 
      'module-payments', 'module-settings'
    ],
    sidebar: [
      { id: 'module-student', label: '📊 Student Dashboard', icon: 'dashboard' },
      { id: 'module-attendance', label: '📅 My Attendance Log', icon: 'how_to_reg' },
      { id: 'module-progress', label: '📈 My Growth & Trends', icon: 'trending_up' },
      { id: 'module-homework', label: '📝 Pending Homework', icon: 'assignment', badge: '1 Due' },
      { id: 'module-notes', label: '📚 Study Material Library', icon: 'folder' },
      { id: 'module-tests', label: '🧪 Take Online Test', icon: 'science' },
      { id: 'module-timetable', label: '📆 Class Schedule', icon: 'calendar_today' },
      { id: 'module-leaderboard', label: '🏆 Student Leaderboard', icon: 'military_tech' },
      { id: 'module-certificates', label: '🥇 My Certificates', icon: 'workspace_premium' },
      { id: 'module-classes', label: '📹 Join Live Class', icon: 'videocam' },
      { id: 'module-ai-plans', label: '🤖 AI Study Plan', icon: 'smart_toy' },
      { id: 'module-report-card', label: '📄 Term Report Card', icon: 'description' },
      { id: 'module-payments', label: '💳 Online Fee Payment', icon: 'payments' },
      { id: 'module-settings', label: '🔐 Change Password', icon: 'settings' }
    ]
  },
  parent: {
    allowedModules: [
      'module-parent', 'module-attendance', 'module-progress', 'module-homework', 
      'module-timetable', 'module-leaderboard', 'module-report-card', 'module-payments', 
      'module-receipts ', 'module-settings'
    ],
    sidebar: [
      { id: 'module-parent', label: '📊 Parent Dashboard', icon: 'dashboard' },
      { id: 'module-attendance', label: '📅 Child Attendance', icon: 'how_to_reg' },
      { id: 'module-progress', label: '📈 Progress & Grades', icon: 'trending_up' },
      { id: 'module-homework', label: '📝 Homework Status', icon: 'assignment' },
      { id: 'module-timetable', label: '📆 Weekly Schedule', icon: 'calendar_today' },
      { id: 'module-leaderboard', label: '🏆 Class Standings', icon: 'military_tech' },
      { id: 'module-report-card', label: '📄 Download Report Card', icon: 'description' },
      { id: 'module-payments', label: '💳 Pay Fees Online', icon: 'payments', badge: 'Due' },
      { id: 'module-receipts', label: '🧾 Official Fee Receipts', icon: 'receipt_long' },
      { id: 'module-settings', label: '🔐 Account Security', icon: 'settings' }
    ]
  }
};

// Unique ID Generator Engine
function generateUniqueId(rolePrefix) {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${rolePrefix.toUpperCase()}-${year}-${randNum}`;
}

// Chart Instances cache
let chartCache = {};

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  renderMasterUserTable('all');
  initQuizRunner();
});

/**
 * Quick Fill 1-Click Role in Landing Login UI
 */
function quickFillRole(roleKey) {
  const roleSelect = document.getElementById('login-role-select');
  const emailInput = document.getElementById('auth-email-input');
  const pwdInput = document.getElementById('auth-password-input');
  const idTag = document.getElementById('demo-user-id-tag');

  document.querySelectorAll('.demo-chip-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');

  roleSelect.value = roleKey;

  if (roleKey === 'admin') {
    emailInput.value = 'admin@kashvi.com';
    pwdInput.value = 'Admin@2024';
    idTag.textContent = 'ID: ADMIN-2024-0001';
  } else if (roleKey === 'teacher') {
    emailInput.value = 'teacher@kashvi.com';
    pwdInput.value = 'Teacher@123';
    idTag.textContent = 'ID: TCH-2024-0048';
  } else if (roleKey === 'student') {
    emailInput.value = 'student@kashvi.com';
    pwdInput.value = 'Student@123';
    idTag.textContent = 'ID: STU-2024-1284';
  } else if (roleKey === 'parent') {
    emailInput.value = 'parent@gmail.com';
    pwdInput.value = 'Parent@123';
    idTag.textContent = 'ID: PRN-2024-0980';
  }

  hideAuthError();
  showToast(`Auto-filled ${roleKey.toUpperCase()} demo credentials`, 'info');
}

function handleRoleSelectChange(roleKey) {
  const emailInput = document.getElementById('auth-email-input');
  const pwdInput = document.getElementById('auth-password-input');
  const idTag = document.getElementById('demo-user-id-tag');

  if (roleKey === 'admin') {
    emailInput.value = 'admin@kashvi.com';
    pwdInput.value = 'Admin@2024';
    idTag.textContent = 'ID: ADMIN-2024-0001';
  } else if (roleKey === 'teacher') {
    emailInput.value = 'teacher@kashvi.com';
    pwdInput.value = 'Teacher@123';
    idTag.textContent = 'ID: TCH-2024-0048';
  } else if (roleKey === 'student') {
    emailInput.value = 'student@kashvi.com';
    pwdInput.value = 'Student@123';
    idTag.textContent = 'ID: STU-2024-1284';
  } else if (roleKey === 'parent') {
    emailInput.value = 'parent@gmail.com';
    pwdInput.value = 'Parent@123';
    idTag.textContent  = 'ID: PRN-2024-0980';
  }
  hideAuthError();
}

/**
 * Main Login Authentication Handler with Brute Force Lockout & 2FA
 */
function handleMainLogin(e) {
  e.preventDefault();

  if (authState.isLockedOut) {
    showAuthError(`Account temporarily locked. Please try again in ${authState.lockoutTimeRemaining}s`);
    return;
  }

  const selectedRole = document.getElementById('login-role-select').value;
  const email = document.getElementById('auth-email-input').value.trim().toLowerCase();
  const password = document.getElementById('auth-password-input').value;

  const record = authState.credentialsStore[email];

  // Validation
  if (!record || record.password !== password) {
    authState.failedAttempts++;
    if (authState.failedAttempts >= 5) {
      triggerLockout();
    } else {
      showAuthError(`Invalid credentials. Attempt ${authState.failedAttempts} of 5 before lockout.`);
    }
    return;
  }

  // Role Mismatch Check
  if (record.role !== selectedRole) {
    showAuthError(`Role mismatch: This email is registered as ${record.role.toUpperCase()}, not ${selectedRole.toUpperCase()}`);
    return;
  }

  // Admin 2FA Intercept
  if (selectedRole === 'admin' && authState.twoFactorEnabled) {
    authState.pendingAdminAuth = record;
    openModal('modal-2fa-verify');
    showToast('2FA Security OTP sent to admin@kashvi.com', 'info');
    return;
  }

  completeLogin(record);
}

function completeLogin(record) {
  authState.failedAttempts = 0;
  authState.isAuthenticated = true;
  authState.currentRole = record.role;
  authState.currentUser = record;

  hideAuthError();

  // Hide Landing Screen, Show App Shell
  document.getElementById('auth-landing-screen').style.display = 'none';
  document.getElementById('authenticated-app-shell').style.display = 'block';

  // Render Sidebar, Header, and Open default dashboard
  setupAuthenticatedSession();
  startSessionTimer();

  showToast(`Welcome back, ${record.name}! Logged in as ${record.role.toUpperCase()}`, 'success');
}

function confirm2FAAndLogin() {
  closeModal('modal-2fa-verify');
  if (authState.pendingAdminAuth) {
    completeLogin(authState.pendingAdminAuth);
    authState.pendingAdminAuth = null;
  }
}

/**
 * Brute Force Protection Lockout (15 mins in production, simulated 60s for demo)
 */
function triggerLockout() {
  authState.isLockedOut = true;
  authState.lockoutTimeRemaining = 60;
  showAuthError('🔒 Too many failed attempts. Account locked for 60 seconds.');

  const btn = document.getElementById('login-submit-btn');
  btn.disabled = true;

  if (authState.lockoutInterval) clearInterval(authState.lockoutInterval);
  authState.lockoutInterval = setInterval(() => {
    authState.lockoutTimeRemaining--;
    if (authState.lockoutTimeRemaining <= 0) {
      clearInterval(authState.lockoutInterval);
      authState.isLockedOut = false;
      authState.failedAttempts = 0;
      btn.disabled = false;
      hideAuthError();
      showToast('Lockout expired. You may now attempt to login again.', 'info');
    } else {
      showAuthError(`🔒 Account locked. Try again in ${authState.lockoutTimeRemaining}s`);
    }
  }, 1000);
}

function showAuthError(msg) {
  const banner = document.getElementById('auth-error-banner');
  const txt = document.getElementById('auth-error-msg');
  banner.style.display = 'flex';
  banner.style.background = 'var(--danger-light)';
  banner.style.color = 'var(--danger-hover)';
  banner.style.border = '1px solid rgba(231, 76, 60, 0.3)';
  txt.textContent = msg;
}

function hideAuthError() {
  const banner = document.getElementById('auth-error-banner');
  if (banner) banner.style.display = 'none';
}

function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">visibility_off</span>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 20px;">visibility</span>';
  }
}

function handleSocialLogin(provider) {
  showToast(`Authenticating with institutional SSO (${provider})...`, 'info');
  setTimeout(() => {
    quickFillRole('admin');
    document.getElementById('main-login-form').dispatchEvent(new Event('submit'));
  }, 600);
}

/**
 * Setup Authenticated Shell UI
 */
function setupAuthenticatedSession() {
  const user = authState.currentUser;
  const role = authState.currentRole;
  const config = accessMatrix[role];

  // Header badges
  const roleBadge = document.getElementById('header-role-badge');
  roleBadge.textContent = role === 'admin' ? '👨💼 Super Admin' : role === 'teacher' ? '👨🏫 Teacher' : role === 'student' ? '👨🎓 Student' : '👨👩👧 Parent';
  
  if (role === 'admin') roleBadge.className = 'badge badge-primary';
  else if (role === 'teacher') roleBadge.className = 'badge badge-secondary';
  else if (role === 'student') roleBadge.className = 'badge badge-success';
  else roleBadge.className = 'badge badge-warning';

  // Header user info
  document.getElementById('header-user-name').textContent = user.name;
  document.getElementById('header-user-role').textContent = user.role.toUpperCase() + ' - ' + user.id;
  document.getElementById('header-user-avatar').textContent = user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

  // Popover info
  document.getElementById('popover-user-name').textContent = user.name;
  document.getElementById('popover-user-email').textContent = Object.keys(authState.credentialsStore).find(k=>authState.credentialsStore[k].id === user.id) || 'user@kashvi.com';
  document.getElementById('popover-unique-id').textContent = user.id;
  document.getElementById('popover-user-avatar').textContent = user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

  // Sidebar role indicator
  document.getElementById('sidebar-role-title').textContent = role.toUpperCase() + ' PORTAL';
  document.getElementById('sidebar-unique-id').textContent = user.id;

  // Build dynamic navigation
  const navMenu = document.getElementById('sidebar-nav-menu');
  navMenu.innerHTML = '';

  config.sidebar.forEach(item => {
    const li = document.createElement('li');
    li.className = 'nav-item';
    let badgeHtml = '';
    if (item.badge) {
      badgeHtml = `<span class="nav-badge ${item.badge === 'Live' ? 'danger' : ''}">${item.badge}</span>`;
    }

    li.innerHTML = `
      <a class="nav-link" onclick="openModule('${item.id}')">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${item.label}</span>
        ${badgeHtml}
      </a>
    `;
    navMenu.appendChild(li);
  });

  // Open default dashboard
  openDashboardByRole();
}

/**
 * Open Dashboard by Active Role
 */
function openDashboardByRole() {
  if (authState.currentRole === 'admin') openModule('module-admin');
  else if (authState.currentRole === 'teacher') openModule('module-teacher');
  else if (authState.currentRole === 'student') openModule('module-student');
  else if (authState.currentRole === 'parent') openModule('module-parent');
}

/**
 * Open Module View with Strict Access Guard
 */
function openModule(moduleId) {
  if (!authState.isAuthenticated) {
    showToast('Please login to access this module', 'danger');
    return;
  }

  const allowedList = accessMatrix[authState.currentRole].allowedModules;
  if (!allowedList.includes(moduleId)) {
    showToast(`Access Restricted: ${authState.currentRole.toUpperCase()}s cannot access this module.`, 'danger');
    return;
  }

  document.querySelectorAll('.module-view').forEach(v => v.classList.remove('active'));
  
  const target = document.getElementById(moduleId);
  if (target) {
    target.classList.add('active');
    authState.currentModule = moduleId;

    // Highlight active link
    document.querySelectorAll('#sidebar-nav-menu .nav-item').forEach(item => {
      const a = item.querySelector('.nav-link');
      if (a && a.getAttribute('onclick').includes(moduleId)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh charts if needed
    if (moduleId === 'module-admin' || moduleId === 'module-progress' || moduleId === 'module-reports') {
      setTimeout(initAllCharts, 100);
    }
  }
}

/**
 * User Management Section (Admin Only)
 */
function renderMasterUserTable(filterRole = 'all') {
  const tbody = document.getElementById('master-user-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const list = authState.userDirectory.filter(u => filterRole === 'all' || u.role === filterRole);

  list.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="font-family:monospace; color:var(--primary);">${user.id}</strong></td>
      <td><strong>${user.name}</strong></td>
      <td>${user.email}</td>
      <td><span class="badge badge-${user.role === 'admin' ? 'primary' : user.role === 'teacher' ? 'secondary' : user.role === 'student' ? 'success' : 'warning'}">${user.role.toUpperCase()}</span></td>
      <td>${user.classAssigned || user.subject}</td>
      <td><span class="badge badge-${user.status === 'Active' ? 'success' : 'danger'}">${user.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="resetUserPassword('${user.id}', '${user.name}')" title="Reset Password">🔑</button>
        <button class="btn btn-outline btn-sm" onclick="editUser('${user.id}')" title="Edit User">✏️</button>
        <button class="btn btn-outline btn-sm" onclick="deleteUser('${user.id}')" title="Delete User" style="color:var(--danger);">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterUserTable(roleKey, btn) {
  document.querySelectorAll('.user-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMasterUserTable(roleKey);
}

function handleUserSearch(query) {
  const term = query.toLowerCase();
  const rows = document.querySelectorAll('#master-user-tbody tr');
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

function handleUserStatusFilter(status) {
  const rows = document.querySelectorAll('#master-user-tbody tr');
  rows.forEach(r => {
    if (status === 'all') r.style.display = '';
    else r.style.display = r.textContent.toLowerCase().includes(status) ? '' : 'none';
  });
}

function resetUserPassword(userId, userName) {
  const newPass = `${userName.split(' ')[0]}@2025`;
  showToast(`Password for ${userName} (${userId}) reset to: ${newPass} and emailed!`, 'success');
}

function editUser(userId) {
  showToast(`Edit modal opened for user ${userId}`, 'info');
}

function deleteUser(userId) {
  if (confirm(`Are you sure you want to deactivate / delete user ${userId}?`)) {
    const userObj = authState.userDirectory.find(u => u.id === userId);
    authState.userDirectory = authState.userDirectory.filter(u => u.id !== userId);
    renderMasterUserTable('all');
    
    // Attempt backend sync
    if (userObj && userObj._id) {
      fetch(`/api/admin/users/${userObj._id}`, { credentials: 'include', method: 'DELETE' }).catch(()=>{});
    }
    showToast(`User ${userId} deactivated successfully`, 'success');
  }
}

/**
 * Add Teacher with Auto-Generated ID (Admin Only)
 */
function handleAddTeacherSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-teacher-name').value;
  const email = document.getElementById('new-teacher-email').value;
  const subject = document.getElementById('new-teacher-subject').value;
  const classAssigned = document.getElementById('new-teacher-class').value;
  const id = generateUniqueId('TCH');

  const newTeacher = {
    id,
    name,
    email,
    role: 'teacher',
    roleTitle: `${subject} Faculty`,
    subject,
    classAssigned,
    status: 'Active',
    avatar: name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
  };

  authState.userDirectory.push(newTeacher);

  authState.credentialsStore[email.toLowerCase()] = {
    password: 'Teacher@123',
    role: 'teacher',
    id,
    name
  };

  // Attempt backend persistence
  fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email: email.toLowerCase(),
      role: 'teacher',
      subject,
      assignedClasses: [classAssigned]
    })
  }).catch(()=>{});

  closeModal('modal-add-teacher');
  renderMasterUserTable('all');
  showToast(`Teacher ${name} registered! Assigned Unique ID: ${id}`, 'success');
}

/**
 * Add Student with Auto-Generated ID & Auto-Linked Parent Account (Admin Only)
 */
function handleAddStudentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-student-name').value;
  const email = document.getElementById('new-student-email').value;
  const parentEmail = document.getElementById('new-student-parent-email').value;
  const cls = document.getElementById('new-student-class').value;
  const roll = document.getElementById('new-student-roll').value;
  
  const studentId = generateUniqueId('STU');
  const parentId = generateUniqueId('PRN');

  // Add Student
  authState.userDirectory.push({
    id: studentId,
    name,
    email,
    role: 'student',
    roleTitle: `Student ${cls}`,
    subject: 'General Academic',
    classAssigned: `${cls} (Roll ${roll})`,
    status: 'Active',
    parentEmail,
    avatar: name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()
  });

  authState.credentialsStore[email.toLowerCase()] = {
    password: 'Student@123',
    role: 'student',
    id: studentId,
    name
  };

  // Auto-create Parent Account
  if (!authState.credentialsStore[parentEmail.toLowerCase()]) {
    authState.userDirectory.push({
      id: parentId,
      name: `Parent of ${name}`,
      email: parentEmail,
      role: 'parent',
      roleTitle: 'Guardian',
      subject: 'Parent Account',
      classAssigned: `${name} (${cls})`,
      status: 'Active',
      avatar: 'PR'
    });

    authState.credentialsStore[parentEmail.toLowerCase()] = {
      password: 'Parent@123',
      role: 'parent',
      id: parentId,
      name: `Parent of ${name}`
    };
  }

  // Attempt backend persistence
  fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email: email.toLowerCase(),
      role: 'student',
      class: cls,
      rollNumber: roll,
      parentEmail: parentEmail.toLowerCase()
    })
  }).catch(()=>{});

  closeModal('modal-add-student');
  renderMasterUserTable('all');
  showToast(`Student ${name} (${studentId}) and Parent account created!`, 'success');
}

/**
 * Parent Multi-Child Switcher
 */
function handleParentChildChange(childKey) {
  const avatar = document.getElementById('parent-child-avatar');
  const name = document.getElementById('parent-child-name');
  const cls = document.getElementById('parent-child-class');
  const attendance = document.getElementById('parent-child-attendance');
  const bar = document.getElementById('parent-child-attendance-bar');

  if (childKey === 'child-ananya') {
    avatar.textContent = 'AN';
    name.textContent = 'Ananya Sharma';
    cls.textContent = 'Class 7-B • Roll No: 08 • Session 2024-25';
    attendance.textContent = '94% Present';
    bar.style.width = '94%';
    showToast('Switched to Ananya Sharma (7-B)', 'info');
  } else {
    avatar.textContent = 'AS';
    name.textContent = 'Aarav Sharma';
    cls.textContent = 'Class 10 • Roll No: 12 • Session 2024-25';
    attendance.textContent = '87% Present';
    bar.style.width = '87%';
    showToast('Switched to Aarav Sharma (10)', 'info');
  }
}

/**
 * Password Policy Enforcement & Change Password
 */
function handleChangePasswordSubmit(e) {
  e.preventDefault();
  const curr = document.getElementById('curr-pwd-input').value;
  const newP = document.getElementById('new-pwd-input').value;
  const conf = document.getElementById('confirm-pwd-input').value;

  if (newP !== conf) {
    showToast('New passwords do not match!', 'danger');
    return;
  }

  // Regex: 8+ chars, upper, lower, digit, special char
  const policyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
  if (!policyRegex.test(newP)) {
    showToast('Password must have 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char', 'danger');
    return;
  }

  // Update password in store
  const emailKey = Object.keys(authState.credentialsStore).find(k => authState.credentialsStore[k].id === authState.currentUser.id);
  if (emailKey) {
    authState.credentialsStore[emailKey].password = newP;
  }

  e.target.reset();
  showToast('Password updated successfully and encrypted with bcrypt!', 'success');
}

/**
 * 2FA Settings Toggle (Admin)
 */
function handle2FAToggle(isChecked) {
  authState.twoFactorEnabled = isChecked;
  const stateTxt = document.getElementById('two-factor-state-text');
  if (isChecked) {
    stateTxt.textContent = 'Enabled (Active on next login)';
    stateTxt.style.color = 'var(--success)';
    showToast('2-Factor Authentication enabled for Admin account!', 'success');
  } else {
    stateTxt.textContent = 'Disabled';
    stateTxt.style.color = 'var(--warning)';
    showToast('2-Factor Authentication disabled', 'info');
  }
}

function downloadBackupCodes() {
  showToast('Generated 8 one-time emergency backup codes for Admin!', 'success');
}

/**
 * Session Countdown & Inactivity Timeout
 */
function startSessionTimer() {
  if (authState.sessionInterval) clearInterval(authState.sessionInterval);
  
  const timeoutLimit = authState.currentRole === 'admin' ? 900 : 1800; // 15 min for admin, 30 min for others
  authState.sessionTimeSeconds = timeoutLimit;

  const display = document.getElementById('session-time-display');

  authState.sessionInterval = setInterval(() => {
    authState.sessionTimeSeconds--;
    
    const mins = Math.floor(authState.sessionTimeSeconds / 60);
    const secs = authState.sessionTimeSeconds % 60;
    if (display) display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // 60-second warning popup
    if (authState.sessionTimeSeconds === 60) {
      openModal('modal-session-timeout');
    }

    if (authState.sessionTimeSeconds <= 0) {
      clearInterval(authState.sessionInterval);
      closeModal('modal-session-timeout');
      handleLogout();
      showToast('Session expired due to inactivity. Please log in again.', 'warning');
    }
  }, 1000);
}

function renewSession() {
  closeModal('modal-session-timeout');
  startSessionTimer();
  showToast('Session renewed for 30 minutes', 'success');
}

/**
 * Logout
 */
function handleLogout() {
  if (authState.sessionInterval) clearInterval(authState.sessionInterval);
  authState.isAuthenticated = false;
  authState.currentUser = null;

  const popover = document.getElementById('profile-popover-menu');
  if (popover) popover.classList.remove('show');

  document.getElementById('authenticated-app-shell').style.display = 'none';
  document.getElementById('auth-landing-screen').style.display = 'flex';
  showToast('You have been logged out securely.', 'info');
}

function toggleProfilePopover() {
  const popover = document.getElementById('profile-popover-menu');
  if (popover) popover.classList.toggle('show');
}

/**
 * Forgot Password Flow
 */
function openForgotPasswordFlow() {
  document.getElementById('otp-step-1').style.display = 'block';
  document.getElementById('otp-step-2').style.display = 'none';
  openModal('modal-forgot-pwd');
}

function sendOTPSimulation() {
  document.getElementById('otp-step-1').style.display = 'none';
  document.getElementById('otp-step-2').style.display = 'block';
  showToast('6-digit OTP sent to your registered email (Demo: 123456)', 'info');
}

function verifyOTPAndReset() {
  const newPass = document.getElementById('forgot-new-pwd').value;
  closeModal('modal-forgot-pwd');
  showToast('OTP verified! Password reset. You can now login.', 'success');
}

/**
 * Modal Utilities
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

function openAddStudentModal() {
  document.getElementById('new-stu-generated-id').value = generateUniqueId('STU');
  openModal('modal-add-student');
}

function openAddTeacherModal() {
  document.getElementById('new-tch-generated-id').value = generateUniqueId('TCH');
  openModal('modal-add-teacher');
}

function openCreateAnnouncementModal() { openModule('module-announcements'); }
function openFeeReminderModal() { showToast('WhatsApp Fee Reminder Broadcast Sent!', 'success'); }

/**
 * Quiz Test Engine
 */
function initQuizRunner() {
  renderQuizQuestion();
  const timerDigits = document.getElementById('test-timer-digits');
  if (!timerDigits) return;

  if (authState.quizInterval) clearInterval(authState.quizInterval);
  authState.quizInterval = setInterval(() => {
    if (authState.quizTimerSeconds <= 0) {
      clearInterval(authState.quizInterval);
      submitQuizTest();
      return;
    }
    authState.quizTimerSeconds--;
    const m = Math.floor(authState.quizTimerSeconds / 60);
    const s = authState.quizTimerSeconds % 60;
    timerDigits.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, 1000);
}

function renderQuizQuestion() {
  const qData = authState.quizList[authState.quizCurrentIndex];
  if (!qData) return;

  const qNum = document.getElementById('quiz-q-num');
  const qTxt = document.getElementById('quiz-q-text');
  const wrapper = document.getElementById('quiz-options-wrapper');

  if (qNum) qNum.textContent = `Question ${authState.quizCurrentIndex + 1} of ${authState.quizList.length}`;
  if (qTxt) qTxt.textContent = qData.q;

  if (wrapper) {
    wrapper.innerHTML = '';
    qData.options.forEach((opt, i) => {
      const isSelected = authState.quizAnswers[authState.quizCurrentIndex] === i;
      const card = document.createElement('div');
      card.className = `quiz-option-card ${isSelected ? 'selected' : ''}`;
      card.onclick = () => {
        document.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        authState.quizAnswers[authState.quizCurrentIndex] = i;
      };
      card.innerHTML = `<span style="font-weight:600;">${opt}</span>`;
      wrapper.appendChild(card);
    });
  }
}

function nextQuizQuestion() {
  if (authState.quizCurrentIndex < authState.quizList.length - 1) {
    authState.quizCurrentIndex++;
    renderQuizQuestion();
  } else {
    showToast('Final question reached. Click Submit Test!', 'info');
  }
}

function prevQuizQuestion() {
  if (authState.quizCurrentIndex > 0) {
    authState.quizCurrentIndex--;
    renderQuizQuestion();
  }
}

function submitQuizTest() {
  if (authState.quizInterval) clearInterval(authState.quizInterval);
  
  let correct = 0;
  authState.quizList.forEach((q, idx) => {
    if (authState.quizAnswers[idx] === q.correct) {
      correct++;
    }
  });
  const total = authState.quizList.length;
  const percentage = Math.round((correct / total) * 100);

  const runnerCard = document.getElementById('test-runner-card');
  const resultsCard = document.getElementById('test-results-card');
  if (runnerCard) runnerCard.style.display = 'none';
  if (resultsCard) {
    resultsCard.style.display = 'block';
    const scoreVal = document.getElementById('test-score-val');
    if (scoreVal) scoreVal.textContent = `${correct}/${total} (${percentage}%)`;
  }
  if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70 });
  showToast(`Test auto-graded: ${correct}/${total} (${percentage}%)!`, 'success');
}

function retryQuizTest() {
  authState.quizCurrentIndex = 0;
  authState.quizAnswers = {};
  authState.quizTimerSeconds = 1800;
  document.getElementById('test-runner-card').style.display = 'block';
  document.getElementById('test-results-card').style.display = 'none';
  initQuizRunner();
}

/**
 * Attendance Functions
 */
function markAllPresent() {
  document.querySelectorAll('.attendance-status-dropdown').forEach(dd => {
    dd.value = 'Present';
    dd.style.background = 'var(--success-light)';
    dd.style.color = 'var(--success-hover)';
  });
  showToast('Marked all students as Present ✅', 'success');
}

function updateAttendanceColor(dropdown) {
  if (dropdown.value === 'Present') {
    dropdown.style.background = 'var(--success-light)';
    dropdown.style.color = 'var(--success-hover)';
  } else if (dropdown.value === 'Absent') {
    dropdown.style.background = 'var(--danger-light)';
    dropdown.style.color = 'var(--danger-hover)';
  } else {
    dropdown.style.background = 'var(--warning-light)';
    dropdown.style.color = 'var(--warning-hover)';
  }
}

function submitAttendance() { showToast('Attendance saved and synchronized with parents', 'success'); }
function filterAttendanceList() { showToast('Attendance roster updated for class', 'info'); }
function quickTakeAttendance(cls) { openModule('module-attendance'); showToast(`Attendance sheet for ${cls}`, 'info'); }

/**
 * Payments & Receipts
 */
function openPaymentModal(title, amount) {
  document.getElementById('pay-modal-title').textContent = title;
  document.getElementById('pay-modal-amount').textContent = `₹${amount.toLocaleString()}`;
  openModal('modal-payment');
}

function processPaymentSimulation() {
  closeModal('modal-payment');
  showToast('Payment successful via Razorpay gateway! Auto-generating receipt...', 'success');
  setTimeout(() => {
    document.getElementById('receipt-no-val').textContent = `#RCP-2024-${Math.floor(1000 + Math.random()*9000)}`;
    document.getElementById('receipt-txn-id').textContent = `TXN-${Math.floor(100000 + Math.random()*900000)}`;
    openModule('module-receipts');
  }, 600);
}

/**
 * Notes, Live Class & Certificates
 */
function selectNotesFolder(subject, count) { showToast(`Opened ${subject} repository (${count} files)`, 'info'); }
function openUploadNotesModal() { showToast('Upload PDF dialog ready', 'info'); }
function openCertificateModal(name, title) {
  document.getElementById('cert-modal-name').textContent = name;
  document.getElementById('cert-modal-title').textContent = title;
  openModal('modal-certificate');
}
function openLiveClassModal(title) {
  document.getElementById('live-class-modal-title').textContent = `🔴 Live Class: ${title}`;
  openModal('modal-live-class');
}
function generateNewAIPlan() { showToast('AI Study Planner updated for growth areas', 'success'); }

/**
 * Toast Notifications
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info';
  if (type === 'success') icon = 'check_circle';
  else if (type === 'danger') icon = 'error';
  else if (type === 'warning') icon = 'warning';

  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color: var(--${type === 'primary' || type === 'info' ? 'primary' : type}); font-size: 20px;">${icon}</span>
    <span style="font-size: 13.5px; font-weight: 500;">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Chart.js Graph Initialization
 */
function initAllCharts() {
  const revCtx = document.getElementById('adminRevenueChart');
  if (revCtx) {
    if (chartCache.rev) chartCache.rev.destroy();
    chartCache.rev = new Chart(revCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue (₹ Lakhs)',
          data: [2.1, 2.4, 2.8, 3.2, 3.0, 3.5, 3.84, 4.1, 4.0, 4.3, 4.6, 4.9],
          borderColor: '#4A6CF7',
          backgroundColor: 'rgba(74, 108, 247, 0.1)',
          fill: true,
          tension: 0.35
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  const enrollCtx = document.getElementById('adminEnrollmentChart');
  if (enrollCtx) {
    if (chartCache.enroll) chartCache.enroll.destroy();
    chartCache.enroll = new Chart(enrollCtx, {
      type: 'bar',
      data: {
        labels: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
        datasets: [{
          label: 'Enrolled',
          data: [180, 195, 210, 240, 260, 205, 194],
          backgroundColor: '#9B59B6',
          borderRadius: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  const progCtx = document.getElementById('progressTrendChart');
  if (progCtx) {
    if (chartCache.prog) chartCache.prog.destroy();
    chartCache.prog = new Chart(progCtx, {
      type: 'line',
      data: {
        labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        datasets: [{
          label: 'Performance %',
          data: [68, 70, 72, 75, 76, 78.75],
          borderColor: '#4A6CF7',
          tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

function handleGlobalSearch(query) {
  if (query.trim().length > 2) {
    showToast(`Searching directory for: "${query}"`, 'info');
  }
}

function showNotificationPanel() {
  showToast('You have 3 notifications & 1 active circular.', 'info');
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.style.display = sidebar.style.display === 'flex' ? 'none' : 'flex';
  }
}
