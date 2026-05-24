// ============================================================
// STATE
// ============================================================
let dataSaverActive = false;
let currentPage = null;
let pageHistory = [];

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page, pushHistory = true) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(el => {
    el.style.display = 'none';
  });

  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) target.style.display = 'block';

  // Hide all headers
  document.querySelectorAll('.topbar').forEach(h => h.style.display = 'none');

  // Determine which header to show
  const publicPages = ['landing', 'partner', 'register'];
  const onboardingPages = ['onboarding'];
  const authedPages = ['dashboard', 'parlour', 'wall', 'board', 'directory', 'guilds', 'profile'];

  if (publicPages.includes(page)) {
    document.getElementById('topbar-public').style.display = 'flex';
  } else if (onboardingPages.includes(page)) {
    document.getElementById('topbar-onboarding').style.display = 'flex';
  } else if (authedPages.includes(page)) {
    document.getElementById('topbar-authed').style.display = 'flex';
  }

  // Track history for back navigation
  if (pushHistory && currentPage !== page) {
    pageHistory.push(currentPage || 'landing');
    window.history.pushState({ page: page }, '', '#' + page);
  }

  currentPage = page;

  // Update personalization if logged in
  if (authedPages.includes(page)) {
    personalizeDashboard();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

function goBack() {
  if (pageHistory.length > 0) {
    const prevPage = pageHistory.pop();
    navigate(prevPage, false);
    window.history.back(); // sync browser history
  } else {
    navigate('dashboard', false);
  }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.page) {
    // Don't push to history again
    pageHistory.pop(); // remove the current page from our stack
    navigate(e.state.page, false);
  } else {
    navigate('landing', false);
  }
});

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Determine start page from URL hash or default to landing
  const hash = window.location.hash.replace('#', '');
  const validPages = ['landing','register','onboarding','dashboard','parlour','wall','board','directory','guilds','profile','partner'];
  const startPage = validPages.includes(hash) ? hash : 'landing';
  navigate(startPage, false);

  // Flavour chip toggle selection
  document.querySelectorAll('.flavour-chip').forEach(chip => {
    chip.addEventListener('click', function() {
      this.classList.toggle('ring-4');
      this.classList.toggle('ring-offset-2');
      this.classList.toggle('scale-105');
      this.classList.toggle('selected');
    });
  });
});

// ============================================================
// PERSONALIZATION
// ============================================================
function personalizeDashboard() {
  const user = JSON.parse(localStorage.getItem('tv_user') || 'null');
  if (!user) return;

  const welcome = document.getElementById('dashboard-welcome');
  if (welcome) welcome.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;

  const profileName = document.getElementById('profile-name');
  if (profileName) profileName.textContent = user.name;

  const profileRole = document.getElementById('profile-role-cohort');
  if (profileRole) profileRole.textContent = `Cohort ${user.cohort} • ${user.role}`;

  const profileId = document.getElementById('profile-alumni-id');
  if (profileId) profileId.textContent = `Alumni ID: ${user.alumniId}`;
}

// ============================================================
// REGISTRATION & UNIQUE ID GENERATION
// ============================================================
function generateAlumniId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  let id = 'TV-' + year + '-';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Check for collisions in localStorage
  const existingUsers = JSON.parse(localStorage.getItem('tv_all_users') || '[]');
  while (existingUsers.some(u => u.alumniId === id)) {
    id = 'TV-' + year + '-';
    for (let i = 0; i < 4; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return id;
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const cohort = document.getElementById('reg-cohort').value;
  const role = document.getElementById('reg-role').value;
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errorDiv = document.getElementById('reg-error');

  // Validation
  if (!name || !email || !cohort || !role || !password || !confirm) {
    errorDiv.textContent = 'Please fill in all required fields.';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters.';
    errorDiv.classList.remove('hidden');
    return;
  }

  if (password !== confirm) {
    errorDiv.textContent = 'Passwords do not match.';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Check if email already registered
  const allUsers = JSON.parse(localStorage.getItem('tv_all_users') || '[]');
  if (allUsers.some(u => u.email === email)) {
    errorDiv.textContent = 'This email is already registered. Please sign in instead.';
    errorDiv.classList.remove('hidden');
    return;
  }

  // Generate unique ID
  const alumniId = generateAlumniId();

  // Create user object
  const newUser = {
    alumniId: alumniId,
    name: name,
    email: email,
    cohort: cohort,
    role: role,
    password: password, // In production, this would be hashed
    umojaCredits: 50, // Starting bonus
    joinedDate: new Date().toISOString(),
    offers: [],
    asks: [],
    flavours: []
  };

  // Save to localStorage
  allUsers.push(newUser);
  localStorage.setItem('tv_all_users', JSON.stringify(allUsers));
  localStorage.setItem('tv_user', JSON.stringify(newUser)); // Current logged-in user

  // Show success card
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('reg-success').style.display = 'block';
  document.getElementById('generated-id').textContent = alumniId;

  errorDiv.classList.add('hidden');
  showToast(`Welcome, ${name.split(' ')[0]}! Your ID is ${alumniId}`, 'person_add');
}

// ============================================================
// DATA SAVER TOGGLE
// ============================================================
function toggleDataSaver() {
  dataSaverActive = !dataSaverActive;
  document.body.classList.toggle('data-saver-mode', dataSaverActive);

  // Update ALL toggle tracks across all headers
  document.querySelectorAll('.toggle-track[data-toggle="data-saver"]').forEach(track => {
    track.classList.toggle('active', dataSaverActive);
    track.setAttribute('aria-checked', dataSaverActive);
  });

  showToast(
    dataSaverActive ? 'Data Saver Mode ON — images hidden' : 'Data Saver Mode OFF — images visible',
    'cloud_download'
  );
}

// ============================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================
function showToast(message, icon = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'flex items-center gap-3 bg-surface border-2 border-primary p-4 rounded-xl shadow-lg transition-all transform translate-x-full pointer-events-auto';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-primary">${icon}</span>
    <span class="font-label-sm text-label-sm text-on-surface">${message}</span>
  `;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-full');
    });
  });

  // Animate out and remove
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================
// ICECREAM PARLOUR
// ============================================================
function toggleParlourTab(tab) {
  const flavoursView = document.getElementById('parlour-flavours-view');
  const availabilityView = document.getElementById('parlour-availability-view');
  const tabFlavours = document.getElementById('tab-flavours');
  const tabAvailability = document.getElementById('tab-availability');

  if (tab === 'flavours') {
    flavoursView.style.display = 'block';
    availabilityView.style.display = 'none';
    tabFlavours.classList.add('bg-primary', 'text-on-primary');
    tabFlavours.classList.remove('text-on-surface-variant');
    tabAvailability.classList.remove('bg-primary', 'text-on-primary');
    tabAvailability.classList.add('text-on-surface-variant');
  } else {
    flavoursView.style.display = 'none';
    availabilityView.style.display = 'block';
    tabAvailability.classList.add('bg-primary', 'text-on-primary');
    tabAvailability.classList.remove('text-on-surface-variant');
    tabFlavours.classList.remove('bg-primary', 'text-on-primary');
    tabFlavours.classList.add('text-on-surface-variant');
  }
}

function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chat-body');
  if (!input.value.trim()) return;

  const msgHTML = `
    <div class="flex flex-col items-end max-w-[80%] ml-auto">
      <div class="chat-bubble-sent p-4 rounded-xl rounded-tr-none">
        <p class="font-body-md">${escapeHTML(input.value)}</p>
      </div>
      <span class="mt-1 font-label-sm text-[10px] text-on-surface-variant">Just now</span>
    </div>
  `;
  body.insertAdjacentHTML('beforeend', msgHTML);
  input.value = '';
  body.scrollTop = body.scrollHeight;
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// SHOUTOUT WALL
// ============================================================
function openShoutoutModal() {
  const name = 'You';
  const messages = [
    'Just deployed my first production app! 🚀',
    'Passed my AWS certification today! ☁️',
    'Big shoutout to my mentor for the guidance! 💜',
    'Landed my first tech interview! 🎉'
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  const feed = document.getElementById('wall-feed');
  const postHTML = `
    <article class="wall-post bg-surface border-2 border-primary p-5 md:p-6 hover:bg-surface-container transition-colors group">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full border-2 border-vibrant-pink flex-shrink-0 bg-primary flex items-center justify-center text-white font-bold">Y</div>
        <div class="flex-1">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-label-md text-label-md"><span class="text-primary">${name}</span></h4>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Just now</span>
          </div>
          <p class="font-body-md text-body-lg text-on-surface border-l-4 border-primary-fixed-dim pl-4 py-1 italic mb-4">"${msg}"</p>
          <div class="flex items-center gap-6">
            <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-vibrant-pink transition-colors active:scale-90" onclick="likePost(this)">
              <span class="material-symbols-outlined text-[20px]">favorite</span>
              <span class="font-label-sm text-label-sm like-count">0</span>
            </button>
            <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors active:scale-90">
              <span class="material-symbols-outlined text-[20px]">chat_bubble</span>
              <span class="font-label-sm text-label-sm">0</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
  feed.insertAdjacentHTML('afterbegin', postHTML);
  showToast('+10 Umoja Credits earned!', 'campaign');
}

function likePost(btn) {
  const countEl = btn.querySelector('.like-count');
  let count = parseInt(countEl.textContent);
  if (btn.classList.contains('liked')) {
    count--;
    btn.classList.remove('liked', 'text-vibrant-pink');
    btn.classList.add('text-on-surface-variant');
  } else {
    count++;
    btn.classList.add('liked', 'text-vibrant-pink');
    btn.classList.remove('text-on-surface-variant');
  }
  countEl.textContent = count;
}

// ============================================================
// OPPORTUNITY BOARD
// ============================================================
function setBoardFilter(btn) {
  document.querySelectorAll('.board-filter').forEach(b => {
    b.classList.remove('bg-primary', 'text-on-primary');
    b.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');
  });
  btn.classList.add('bg-primary', 'text-on-primary');
  btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');
  showToast('Filter: ' + btn.dataset.filter, 'filter_list');
}

function unlockPremium() {
  const gate = document.getElementById('premium-gate');
  if (!gate) return;
  gate.innerHTML = `
    <div class="text-left w-full">
      <h4 class="font-headline-md text-headline-md text-primary mb-2">Senior Full-Stack Engineer</h4>
      <p class="font-body-md text-on-surface mb-2"><strong>Requirements:</strong> 5+ years React/Node.js experience.</p>
      <p class="font-body-md text-on-surface mb-2"><strong>Salary:</strong> $80,000 - $120,000</p>
      <p class="font-body-md text-on-surface mb-4"><strong>Benefits:</strong> Remote-first, health cover, conference budget.</p>
      <button onclick="applyJob(this)" class="primary-btn px-6 py-2 rounded-lg font-label-md text-label-md">Apply Now</button>
    </div>
  `;
  showToast('Unlocked for 10 Umoja Credits!', 'lock_open');
}

function applyJob(btn) {
  btn.textContent = 'Applied ✓';
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
  showToast('Application submitted!', 'check_circle');
}

// ============================================================
// DIRECTORY
// ============================================================
function setDirectoryFilter(btn) {
  document.querySelectorAll('.dir-filter').forEach(b => {
    b.classList.remove('bg-primary', 'text-on-primary');
    b.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');
  });
  btn.classList.add('bg-primary', 'text-on-primary');
  btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border', 'border-outline-variant');

  const filter = btn.dataset.filter;
  document.querySelectorAll('.dir-card').forEach(card => {
    if (filter === 'all') {
      card.style.display = 'flex';
    } else if (filter === 'offers') {
      card.style.display = card.dataset.offers ? 'flex' : 'none';
    } else if (filter === 'asks') {
      card.style.display = card.dataset.asks ? 'flex' : 'none';
    }
  });
  showToast('Showing: ' + btn.textContent.trim(), 'group');
}

function connectAlumni(btn) {
  btn.textContent = 'Connected ✓';
  btn.disabled = true;
  btn.classList.remove('bg-primary');
  btn.classList.add('bg-green-600', 'opacity-80', 'cursor-not-allowed');
  showToast('Connection request sent!', 'handshake');
}

// ============================================================
// GUILDS & COUNCILS
// ============================================================
function joinGuild(btn, guildName) {
  if (btn.textContent.trim() === 'Join Guild') {
    btn.textContent = 'Leave Guild';
    btn.classList.remove('bg-primary', 'text-white', 'hover:bg-deep-purple', 'bg-lavender-base', 'text-primary', 'hover:bg-primary', 'hover:text-white');
    btn.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border-2', 'border-outline-variant');
    showToast(`Joined ${guildName} guild!`, 'check_circle');
  } else {
    btn.textContent = 'Join Guild';
    btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border-2', 'border-outline-variant');
    btn.classList.add('bg-primary', 'text-white');
    showToast(`Left ${guildName} guild.`, 'exit_to_app');
  }
}

function nominateSteward(btn) {
  btn.textContent = 'Nominated ✓';
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
  showToast('Steward nomination submitted!', 'how_to_reg');
}

function voteNow(btn) {
  btn.textContent = 'Voted ✓';
  btn.disabled = true;
  btn.classList.add('opacity-80', 'cursor-not-allowed');
  showToast('Vote cast successfully!', 'gavel');
}

// ============================================================
// PROFILE
// ============================================================
function updateOffers() {
  const textarea = document.getElementById('profile-offers');
  const tagsContainer = document.getElementById('offers-tags');
  const newTags = textarea.value.split(',').map(t => t.trim()).filter(t => t);

  if (newTags.length === 0) {
    showToast('Enter at least one offering.', 'warning');
    return;
  }

  tagsContainer.innerHTML = '';
  newTags.forEach(tag => {
    tagsContainer.innerHTML += `<span class="bg-primary-fixed-dim text-primary text-[11px] px-3 py-1 rounded">${escapeHTML(tag)}</span>`;
  });
  textarea.value = '';
  showToast('Offers updated!', 'handshake');
}

function updateAsks() {
  const textarea = document.getElementById('profile-asks');
  const tagsContainer = document.getElementById('asks-tags');
  const newTags = textarea.value.split(',').map(t => t.trim()).filter(t => t);

  if (newTags.length === 0) {
    showToast('Enter at least one ask.', 'warning');
    return;
  }

  tagsContainer.innerHTML = '';
  newTags.forEach(tag => {
    tagsContainer.innerHTML += `<span class="bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] px-3 py-1 rounded">${escapeHTML(tag)}</span>`;
  });
  textarea.value = '';
  showToast('Asks updated!', 'help_center');
}

function logout() {
  localStorage.removeItem('tv_user');
  navigate('landing');
  showToast('Logged out successfully.', 'logout');
}

// ============================================================
// PARTNER PORTAL
// ============================================================
function subscribePartner(btn) {
  btn.textContent = 'Subscribed ✓';
  btn.disabled = true;
  btn.classList.add('opacity-80', 'cursor-not-allowed');
  showToast('Partner subscription activated!', 'business_center');
}

function filterPartnerTalent(role) {
  document.querySelectorAll('.partner-card').forEach(card => {
    if (role === 'all' || card.dataset.role === role) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function requestIntroduction(btn) {
  btn.textContent = 'Requested ✓';
  btn.disabled = true;
  btn.classList.add('opacity-80', 'cursor-not-allowed');
  showToast('Introduction requested!', 'handshake');
}