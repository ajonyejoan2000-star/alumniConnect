// ============================================================
// CONFIG
// ============================================================
const API_BASE = 'http://localhost:5000';

// ============================================================
// STATE
// ============================================================
let state = {
  opportunities: [],
  currentPage: 1,
  totalPages: 1,
  total: 0,
  view: 'grid',
  activeTab: 'all',
  filters: { search: '', type: '', location: '', skill: '', remote: '' },
  currentUser: null,
  loading: false,
  savedIds: new Set()
};

// ============================================================
// AUTH HELPERS  ← moved up, before anything that calls them
// ============================================================
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

function authHeaders() {
  const t = getToken();
  return t
    ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }
    : { 'Content-Type': 'application/json' };
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ============================================================
// POST OPPORTUNITY MODAL
// ← removed the token check so the modal always opens;
//   the submit itself will fail if not logged in
// ============================================================
function openPostModal() {
  document.getElementById('postModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePostModal() {
  document.getElementById('postModal').classList.remove('open');
  document.body.style.overflow = '';
}

function clearForm() {
  ['f_title','f_type','f_description','f_company',
   'f_location','f_salary','f_deadline','f_skills',
   'f_link','f_category'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const remote = document.getElementById('f_remote');
  if (remote) remote.checked = false;
}

async function submitOpportunity() {
  const title       = document.getElementById('f_title').value.trim();
  const type        = document.getElementById('f_type').value;
  const description = document.getElementById('f_description').value.trim();

  if (!title || !type || !description) {
    showToast('Title, type, and description are required', 'error');
    return;
  }

  const skillsRaw = document.getElementById('f_skills').value;
  const skills = skillsRaw
    ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const payload = {
    title,
    type,
    description,
    company:  document.getElementById('f_company').value.trim(),
    location: document.getElementById('f_location').value.trim(),
    salary:   document.getElementById('f_salary').value.trim(),
    deadline: document.getElementById('f_deadline').value || undefined,
    skills,
    link:     document.getElementById('f_link').value.trim(),
    category: document.getElementById('f_category').value.trim(),
    remote:   document.getElementById('f_remote').checked
  };

  const btn = document.getElementById('submitPostBtn');
  const originalText = btn.textContent;
  btn.textContent = 'Posting...';
  btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/opportunities`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to post');

    showToast('Opportunity posted successfully! 🎉', 'success');
    closePostModal();
    clearForm();
    fetchOpportunities(1);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ============================================================
// VIEW OPPORTUNITY MODAL
// ============================================================
function closeViewModal() {
  document.getElementById('viewModal').classList.remove('open');
  document.body.style.overflow = '';
}

async function viewOpportunity(id) {
  document.getElementById('viewModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('viewModalBody').innerHTML =
    `<div style="text-align:center;padding:3rem;color:var(--text-muted)">Loading...</div>`;

  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const opp = data.data || data;
    document.getElementById('viewModalTitle').textContent = opp.title || 'Opportunity';
    renderViewBody(opp);
  } catch (err) {
    document.getElementById('viewModalBody').innerHTML =
      `<p style="color:var(--red);text-align:center;padding:2rem">${err.message}</p>`;
  }
}

function renderViewBody(opp) {
  const poster = opp.postedBy || {};
  const isOwner = state.currentUser && opp.postedBy?._id === state.currentUser;
  const token = getToken();
  const saved = state.savedIds.has(opp._id);
  const expired = isExpired(opp.deadline);
  const soon = deadlineSoon(opp.deadline);
  const alreadyApplied = token && opp.applicants?.some(
    a => a.user?._id === state.currentUser || a.user === state.currentUser
  );

  let html = `
    <div class="view-header-banner">
      <div class="card-badges" style="margin-bottom:0.75rem">
        ${typeBadge(opp.type)}
        ${opp.remote ? '<span class="badge badge-remote">🌐 Remote</span>' : ''}
        ${opp.category ? `<span class="badge badge-job">${escHtml(opp.category)}</span>` : ''}
      </div>
      <div class="view-title">${escHtml(opp.title || '')}</div>
      ${opp.company ? `<div class="view-company">🏢 ${escHtml(opp.company)}</div>` : ''}
      <div class="view-meta-row">
        ${opp.location ? `<span class="meta-item">${iconPin()} ${escHtml(opp.location)}</span>` : ''}
        ${opp.salary ? `<span class="meta-item">${iconMoney()} ${escHtml(opp.salary)}</span>` : ''}
        ${opp.applicants?.length != null
          ? `<span class="meta-item">${iconUser()} ${opp.applicants.length} applicant${opp.applicants.length !== 1 ? 's' : ''}</span>`
          : ''}
      </div>
    </div>`;

  if (opp.deadline) {
    const daysLeft = Math.ceil((new Date(opp.deadline) - Date.now()) / 86400000);
    if (expired) {
      html += `<div class="deadline-warning" style="color:var(--red);background:rgba(248,113,113,0.08);border-color:rgba(248,113,113,0.2)">⛔ Application deadline has passed</div>`;
    } else if (soon) {
      html += `<div class="deadline-warning">⏰ Deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — ${new Date(opp.deadline).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'long'})}</div>`;
    } else {
      html += `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:1rem">${iconCal()} Deadline: <strong style="color:var(--text)">${new Date(opp.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</strong></div>`;
    }
  }

  if (opp.description) {
    html += `<div class="view-section-title">About this opportunity</div>
             <div class="view-description">${escHtml(opp.description)}</div>`;
  }

  if (opp.skills?.length) {
    html += `<div class="view-section-title">Skills</div>
             <div class="view-skills">${opp.skills.map(s => `<span class="view-skill">${escHtml(s)}</span>`).join('')}</div>`;
  }

  if (poster.name || poster.email) {
    html += `<div class="view-section-title">Posted by</div>
             <div class="poster-row">
               <div class="poster-avatar">${poster.profilePicture
                 ? `<img src="${poster.profilePicture}" alt="${poster.name}">`
                 : avatarText(poster.name || 'U')}</div>
               <div class="poster-info">
                 <strong>${escHtml(poster.name || 'Unknown')}</strong>
                 <small>${escHtml(poster.email || '')}</small>
               </div>
             </div>`;
  }

  html += `<div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.5rem">`;

  if (!expired && !alreadyApplied && !isOwner) {
    html += `<button class="btn btn-primary" onclick="applyToOpportunity('${opp._id}', this)">🚀 Apply Now</button>`;
  } else if (alreadyApplied) {
    html += `<button class="btn btn-ghost" disabled>✓ Already Applied</button>`;
  }

  if (opp.link) {
    html += `<a href="${escHtml(opp.link)}" target="_blank" rel="noopener" class="btn btn-ghost">🔗 External Link</a>`;
  }

  html += `<button class="btn ${saved ? 'btn-danger' : 'btn-ghost'}" onclick="toggleSaveFromModal('${opp._id}', this)">${saved ? '★ Unsave' : '☆ Save'}</button>`;
  html += `</div>`;

  if (isOwner && opp.applicants?.length) {
    html += `<div class="applicants-section">
               <div class="view-section-title" style="margin-top:1.5rem">Applicants (${opp.applicants.length})</div>`;
    opp.applicants.forEach(a => {
      const u = a.user || {};
      html += `<div class="applicant-row">
        <div style="display:flex;align-items:center;gap:0.6rem">
          <div class="poster-avatar" style="width:30px;height:30px;font-size:0.75rem">${u.profilePicture
            ? `<img src="${u.profilePicture}">`
            : avatarText(u.name || 'U')}</div>
          <div>
            <strong style="font-size:0.875rem">${escHtml(u.name || 'Applicant')}</strong>
            <small style="display:block;font-size:0.75rem;color:var(--text-muted)">${escHtml(u.email || '')}</small>
          </div>
        </div>
        <select class="status-select status-${a.status || 'pending'}" onchange="updateStatus('${opp._id}', '${a.user?._id || a.user}', this)">
          <option value="pending"  ${a.status === 'pending'  ? 'selected' : ''}>⏳ Pending</option>
          <option value="accepted" ${a.status === 'accepted' ? 'selected' : ''}>✅ Accepted</option>
          <option value="rejected" ${a.status === 'rejected' ? 'selected' : ''}>❌ Rejected</option>
        </select>
      </div>`;
    });
    html += `</div>`;
  }

  document.getElementById('viewModalBody').innerHTML = html;
}

// ============================================================
// APPLY
// ============================================================
async function applyToOpportunity(id, btn) {
  if (!getToken()) { showToast('Please sign in to apply', 'error'); return; }
  btn.disabled = true;
  btn.textContent = 'Applying...';

  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}/apply`, {
      method: 'POST',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to apply');

    showToast('Application submitted! 🎉', 'success');
    btn.textContent = '✓ Applied';
    btn.classList.replace('btn-primary', 'btn-ghost');
    fetchOpportunities(state.currentPage);
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = '🚀 Apply Now';
  }
}

// ============================================================
// SAVE / UNSAVE
// ============================================================
async function toggleSave(id, btn) {
  if (!getToken()) { showToast('Please sign in to save opportunities', 'error'); return; }

  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}/save`, {
      method: 'POST',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const opp = data.data;
    const nowSaved = opp?.saved?.includes(state.currentUser) ?? !state.savedIds.has(id);

    if (nowSaved) {
      state.savedIds.add(id);
      btn.classList.add('saved');
      showToast('Saved ⭐', 'success');
    } else {
      state.savedIds.delete(id);
      btn.classList.remove('saved');
      showToast('Removed from saved', 'info');
    }
    btn.querySelector('svg').setAttribute('fill', nowSaved ? 'currentColor' : 'none');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function toggleSaveFromModal(id, btn) {
  if (!getToken()) { showToast('Please sign in to save opportunities', 'error'); return; }

  try {
    const res = await fetch(`${API_BASE}/opportunities/${id}/save`, {
      method: 'POST',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const nowSaved = !state.savedIds.has(id);
    if (nowSaved) {
      state.savedIds.add(id);
      btn.textContent = '★ Unsave';
      btn.className = 'btn btn-danger';
      showToast('Saved ⭐', 'success');
    } else {
      state.savedIds.delete(id);
      btn.textContent = '☆ Save';
      btn.className = 'btn btn-ghost';
      showToast('Removed from saved', 'info');
    }
    renderCards();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// UPDATE APPLICATION STATUS (owner)
// ============================================================
async function updateStatus(oppId, applicantId, select) {
  const status = select.value;
  select.className = `status-select status-${status}`;

  try {
    const res = await fetch(`${API_BASE}/opportunities/${oppId}/applicants/${applicantId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast(`Status updated to ${status}`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================
// CARDS & PAGINATION
// ============================================================
function renderCards() {
  const container = document.getElementById('cardsContainer');
  container.className = state.view === 'grid' ? 'cards-grid' : 'cards-list';

  if (!state.opportunities.length) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No opportunities found</h3>
      <p>${state.activeTab === 'saved'
        ? "You haven't saved any opportunities yet."
        : 'Try adjusting your filters or check back later.'}</p>
    </div>`;
    return;
  }
  container.innerHTML = state.opportunities.map((o, i) => renderCard(o, i)).join('');
}

function renderLoading() {
  const container = document.getElementById('cardsContainer');
  container.className = 'loading-grid';
  container.innerHTML = Array(6).fill(`
    <div class="skeleton">
      <div class="skel-line" style="height:44px;width:44px;border-radius:10px;margin-bottom:12px"></div>
      <div class="skel-line" style="height:18px;width:70%"></div>
      <div class="skel-line" style="height:13px;width:45%"></div>
      <div class="skel-line" style="height:13px;width:80%;margin-top:8px"></div>
      <div class="skel-line" style="height:13px;width:60%"></div>
      <div class="skel-line" style="height:32px;width:100px;margin-top:12px;border-radius:9px"></div>
    </div>`).join('');
  document.getElementById('resultsCount').textContent = 'Loading...';
}

function renderError() {
  document.getElementById('cardsContainer').innerHTML = `<div class="empty-state">
    <div class="empty-icon">⚠️</div>
    <h3>Could not load opportunities</h3>
    <p>Make sure your server is running on port 5000 and try again.</p>
  </div>`;
}

function renderAuthNotice() {
  document.getElementById('cardsContainer').innerHTML = `<div class="auth-notice">
    <h3>Sign in required</h3>
    <p>You need to be logged in to view saved opportunities.</p>
    <a href="/login" class="btn btn-primary">Sign In</a>
  </div>`;
}

function updateResultsCount() {
  const label = state.activeTab === 'saved' ? 'saved opportunities' : 'opportunities';
  document.getElementById('resultsCount').innerHTML =
    `Showing <strong>${state.opportunities.length}</strong> of <strong>${state.total}</strong> ${label}`;
}

function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;
  if (state.totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `<button class="page-btn" onclick="goToPage(${state.currentPage - 1})" ${state.currentPage <= 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = 1; i <= state.totalPages; i++) {
    if (i === 1 || i === state.totalPages || Math.abs(i - state.currentPage) <= 1) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (Math.abs(i - state.currentPage) === 2) {
      html += `<span style="color:var(--text-muted);padding:0 4px">…</span>`;
    }
  }
  html += `<button class="page-btn" onclick="goToPage(${state.currentPage + 1})" ${state.currentPage >= state.totalPages ? 'disabled' : ''}>›</button>`;
  container.innerHTML = html;
}

// ============================================================
// FILTERS & TABS
// ============================================================
function applyFilters() {
  state.filters.search   = document.getElementById('searchInput').value.trim();
  state.filters.type     = document.getElementById('typeFilter').value;
  state.filters.location = document.getElementById('locationFilter').value;
  state.filters.skill    = document.getElementById('skillFilter').value.trim();
  state.currentPage = 1;
  fetchOpportunities(1);
}

function clearFilters() {
  document.getElementById('searchInput').value  = '';
  document.getElementById('typeFilter').value   = '';
  document.getElementById('locationFilter').value = '';
  document.getElementById('skillFilter').value  = '';
  state.filters = { search: '', type: '', location: '', skill: '' };
  fetchOpportunities(1);
}

function switchTab(tab) {
  state.activeTab = tab;
  document.getElementById('tab-all')?.classList.toggle('active', tab === 'all');
  document.getElementById('tab-saved')?.classList.toggle('active', tab === 'saved');
  document.getElementById('filterBar').style.display = tab === 'all' ? '' : 'none';
  const pg = document.getElementById('pagination');
  if (pg) pg.innerHTML = '';

  if (tab === 'all') fetchOpportunities(1);
  else fetchSavedOpportunities(1);
}

function goToPage(page) {
  if (page < 1 || page > state.totalPages) return;
  state.currentPage = page;
  if (state.activeTab === 'saved') fetchSavedOpportunities(page);
  else fetchOpportunities(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setView(v) {
  state.view = v;
  document.getElementById('gridViewBtn')?.classList.toggle('active', v === 'grid');
  document.getElementById('listViewBtn')?.classList.toggle('active', v === 'list');
  renderCards();
}

// ============================================================
// FETCH
// ============================================================
async function fetchOpportunities(page = 1) {
  state.loading = true;
  renderLoading();

  const { search, type, location, skill } = state.filters;
  const params = new URLSearchParams({ page, limit: 12 });
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (location === 'remote') params.append('remote', 'true');
  else if (location === 'onsite') params.append('remote', 'false');
  if (skill) params.append('skill', skill);

  try {
    const res = await fetch(`${API_BASE}/opportunities?${params}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();

    state.opportunities = data.opportunities || [];
    state.total         = data.pagination?.total       || 0;
    state.totalPages    = data.pagination?.pages       || 1;
    state.currentPage   = data.pagination?.currentPage || 1;

    renderCards();
    renderPagination();
    updateResultsCount();
  } catch (err) {
    console.error(err);
    renderError();
  } finally {
    state.loading = false;
  }
}

async function fetchSavedOpportunities(page = 1) {
  if (!getToken()) { renderAuthNotice(); return; }
  state.loading = true;
  renderLoading();

  try {
    const res = await fetch(`${API_BASE}/opportunities/saved?page=${page}&limit=12`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Not authorised');
    const data = await res.json();

    state.opportunities = data.opportunities || [];
    state.total         = data.pagination?.total       || 0;
    state.totalPages    = data.pagination?.pages       || 1;
    state.currentPage   = data.pagination?.currentPage || 1;

    renderCards();
    renderPagination();
    updateResultsCount();
  } catch (err) {
    renderAuthNotice();
  } finally {
    state.loading = false;
  }
}

// ============================================================
// RENDER HELPERS
// ============================================================
function typeBadge(type) {
  if (!type) return '';
  const cls = { Job: 'badge-job', Internship: 'badge-internship', Scholarship: 'badge-scholarship', Hackathon: 'badge-hackathon' }[type] || 'badge-job';
  return `<span class="badge ${cls}">${type}</span>`;
}

function avatarText(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(date) {
  if (!date) return '';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7)  return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function deadlineSoon(deadline) {
  if (!deadline) return false;
  const days = (new Date(deadline) - Date.now()) / 86400000;
  return days >= 0 && days <= 5;
}

function isExpired(deadline) {
  if (!deadline) return false;
  return new Date(deadline) < Date.now();
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderCard(opp, idx) {
  const poster   = opp.postedBy || {};
  const initials = avatarText(poster.name || opp.company || 'A');
  const skills   = (opp.skills || []).slice(0, 3);
  const expired  = isExpired(opp.deadline);
  const soon     = deadlineSoon(opp.deadline);
  const saved    = state.savedIds.has(opp._id);

  return `
    <div class="opp-card" onclick="viewOpportunity('${opp._id}')" style="animation-delay:${idx * 0.06}s;${expired ? 'opacity:0.6' : ''}">
      <div class="card-top">
        <div class="card-avatar">
          ${poster.profilePicture
            ? `<img src="${poster.profilePicture}" alt="${poster.name}" onerror="this.style.display='none'">`
            : initials}
        </div>
        <div class="card-badges">
          ${typeBadge(opp.type)}
          ${opp.remote ? '<span class="badge badge-remote">🌐 Remote</span>' : ''}
          ${expired ? '<span class="badge" style="background:rgba(248,113,113,0.1);color:var(--red);border-color:rgba(248,113,113,0.2)">Expired</span>' : ''}
          ${soon && !expired ? '<span class="badge" style="background:rgba(240,192,64,0.1);color:var(--gold);border-color:rgba(240,192,64,0.2)">⏰ Closing soon</span>' : ''}
        </div>
      </div>
      <div class="card-title">${escHtml(opp.title || 'Untitled')}</div>
      <div class="card-company">
        ${opp.company ? `<strong>${escHtml(opp.company)}</strong>` : ''}
        ${poster.name && opp.company ? ' · ' : ''}
        ${poster.name ? escHtml(poster.name) : ''}
      </div>
      <div class="card-meta">
        ${opp.location  ? `<span class="meta-item">${iconPin()} ${escHtml(opp.location)}</span>` : ''}
        ${opp.salary    ? `<span class="meta-item">${iconMoney()} ${escHtml(opp.salary)}</span>` : ''}
        ${opp.deadline  ? `<span class="meta-item">${iconCal()} ${new Date(opp.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>` : ''}
        ${opp.createdAt ? `<span class="meta-item">${iconClock()} ${timeAgo(opp.createdAt)}</span>` : ''}
        ${opp.applicants?.length ? `<span class="meta-item">${iconUser()} ${opp.applicants.length} applicant${opp.applicants.length !== 1 ? 's' : ''}</span>` : ''}
      </div>
      ${opp.description ? `<p class="card-description">${escHtml(opp.description)}</p>` : ''}
      ${skills.length ? `<div class="card-skills">
        ${skills.map(s => `<span class="skill-tag">${escHtml(s)}</span>`).join('')}
        ${(opp.skills||[]).length > 3 ? `<span class="skill-tag">+${opp.skills.length - 3}</span>` : ''}
      </div>` : ''}
      <div class="card-footer">
        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); viewOpportunity('${opp._id}')">View Details</button>
        <div class="card-actions">
          <button class="save-btn ${saved ? 'saved' : ''}" title="${saved ? 'Unsave' : 'Save'}" onclick="event.stopPropagation(); toggleSave('${opp._id}', this)">
            <svg viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>`;
}

// ICONS
function iconPin()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`; }
function iconMoney() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`; }
function iconCal()   { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`; }
function iconClock() { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`; }
function iconUser()  { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`; }

// ============================================================
// INIT  ← always last
// ============================================================
function initUser() {
  const token = getToken();
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    state.currentUser = payload.id || payload._id || payload.userId;
    if (payload.name) {
      const el = document.getElementById('userGreeting');
      if (el) { el.textContent = `Hi, ${payload.name.split(' ')[0]}`; el.style.display = 'inline'; }
    }
  } catch {}
}

// Modal overlay close
document.getElementById('postModal').addEventListener('click', function(e) {
  if (e.target === this) closePostModal();
});
document.getElementById('viewModal').addEventListener('click', function(e) {
  if (e.target === this) closeViewModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePostModal(); closeViewModal(); }
});

// Search on Enter
document.getElementById('searchInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') applyFilters();
});

initUser();
fetchOpportunities(1);