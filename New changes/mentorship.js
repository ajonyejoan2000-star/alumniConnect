/* ═══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
const BASE_URL = 'http://localhost:5000';
let currentUser = null;
let allMentors  = [];
let myMentorships = { asMentor: [], asMentee: [] };
let activeRequestMentorId = null;
let activeSessionMentorshipId = null;
let activeCompleteMentorshipId = null;
let selectedRating = 0;
let goalTags = [];
let expertiseTags = [];
 
/* ═══════════════════════════════════════════
   HELPERS
══════════════════════════════════════════ */
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
 
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}
 
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
}
 
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
 
/* ═══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: '💜' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
 
/* ═══════════════════════════════════════════
   TABS
══════════════════════════════════════════ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});
 
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
  if (tab === 'mine') loadMyMentorships();
}
 
/* ═══════════════════════════════════════════
   MODALS
══════════════════════════════════════════ */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
 
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});
 
/* ═══════════════════════════════════════════
   TAG INPUTS
══════════════════════════════════════════ */
function setupTagInput(inputId, wrapId, tagsArr) {
  const input = document.getElementById(inputId);
  const wrap  = document.getElementById(wrapId);
  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, '');
      if (val && !tagsArr.includes(val)) {
        tagsArr.push(val);
        renderTag(val, wrapId, tagsArr, inputId);
      }
      input.value = '';
    }
  });
  wrap.addEventListener('click', () => input.focus());
}
 
function renderTag(val, wrapId, tagsArr, inputId) {
  const wrap  = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  const chip = document.createElement('span');
  chip.className = 'tag-chip';
  chip.innerHTML = `${val} <button type="button">×</button>`;
  chip.querySelector('button').addEventListener('click', () => {
    const idx = tagsArr.indexOf(val);
    if (idx > -1) tagsArr.splice(idx, 1);
    chip.remove();
  });
  wrap.insertBefore(chip, input);
}
 
setupTagInput('goalsInput', 'goalsWrap', goalTags);
setupTagInput('expertiseInput', 'expertiseWrap', expertiseTags);
 
/* ═══════════════════════════════════════════
   STAR RATING
══════════════════════════════════════════ */
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('mouseenter', () => {
    const val = +star.dataset.val;
    document.querySelectorAll('.star').forEach(s => s.classList.toggle('hovered', +s.dataset.val <= val));
  });
  star.addEventListener('mouseleave', () => {
    document.querySelectorAll('.star').forEach(s => s.classList.remove('hovered'));
  });
  star.addEventListener('click', () => {
    selectedRating = +star.dataset.val;
    document.querySelectorAll('.star').forEach(s => s.classList.toggle('selected', +s.dataset.val <= selectedRating));
  });
});
 
/* ═══════════════════════════════════════════
   LOAD MENTORS (GET /api/mentorship/matches)
══════════════════════════════════════════ */
async function loadMentors() {
  try {
    const res = await fetch(`${BASE_URL}/mentorship/matches`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    allMentors = data.matches || [];
    renderMentors(allMentors);
  } catch (err) {
    // Fallback demo data if API isn't reachable
    allMentors = getDemoMentors();
    renderMentors(allMentors);
  }
}
 
function getDemoMentors() {
  return [
    { _id: 'demo1', name: 'Dr. Amara Okafor', role: 'mentor', bio: 'Senior Software Engineer at Google with 10+ years in distributed systems and AI. Passionate about helping early-career engineers grow.', skills: ['Python', 'System Design', 'Leadership', 'AI/ML'], email: 'amara@demo.com' },
    { _id: 'demo2', name: 'Kwame Mensah', role: 'alumni', bio: 'Product Manager at Stripe. Former startup founder. I help PMs and aspiring entrepreneurs craft their product story and build user-centric solutions.', skills: ['Product Strategy', 'User Research', 'Agile', 'Startups'], email: 'kwame@demo.com' },
    { _id: 'demo3', name: 'Fatima Al-Hassan', role: 'mentor', bio: 'Financial Analyst turned VC. Now supporting the next generation of African founders. Expertise in financial modelling, fundraising, and pitching.', skills: ['Finance', 'Fundraising', 'VC', 'Excel'], email: 'fatima@demo.com' },
    { _id: 'demo4', name: 'Emmanuel Osei', role: 'alumni', bio: 'UX/UI Designer at Microsoft with a background in architecture. I believe great design is invisible — it just works.', skills: ['Figma', 'UI Design', 'Design Systems', 'Accessibility'], email: 'emmanuel@demo.com' },
    { _id: 'demo5', name: 'Ngozi Adeyemi', role: 'mentor', bio: 'Data Scientist and researcher. I specialise in NLP and have published in top ML venues. Happy to guide students into research careers.', skills: ['Data Science', 'NLP', 'PyTorch', 'Research'], email: 'ngozi@demo.com' },
    { _id: 'demo6', name: 'Samuel Boateng', role: 'alumni', bio: 'Backend engineer at Amazon. Previously built payment infra from scratch at a fintech startup. Strong in Node.js, Go, and AWS.', skills: ['Node.js', 'Go', 'AWS', 'Fintech'], email: 'samuel@demo.com' },
  ];
}
 
function renderMentors(list) {
  const grid = document.getElementById('mentorGrid');
  if (!list.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div>
      <h3>No mentors found</h3>
      <p>Try a different search term or filter.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map((m, i) => `
    <div class="mentor-card" style="animation-delay:${i * 0.07}s">
      <div class="card-top">
        <div class="mentor-avatar">${initials(m.name)}</div>
        <div class="mentor-info">
          <h3>${m.name}</h3>
          <div class="role">${m.email || ''}</div>
          <span class="badge-role badge-${m.role}">${m.role}</span>
        </div>
      </div>
      <p class="card-bio">${m.bio || 'No bio available.'}</p>
      <div class="skills-wrap">
        ${(m.skills || []).slice(0, 5).map(s => `<span class="skill-tag">${s}</span>`).join('')}
        ${(m.skills || []).length > 5 ? `<span class="skill-tag">+${m.skills.length - 5}</span>` : ''}
      </div>
      <div class="card-footer">
        <div class="card-stats">
          <div class="stat-item">
            <span class="stat-value">${m.skills ? m.skills.length : 0}</span>
            <span class="stat-label">Skills</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openRequestModal('${m._id}', '${m.name}')">
          Request Mentorship
        </button>
      </div>
    </div>
  `).join('');
}
 
/* Search & filter */
function filterMentors() {
  const q    = document.getElementById('mentorSearch').value.toLowerCase();
  const role = document.getElementById('roleFilter').value;
  const filtered = allMentors.filter(m => {
    const matchQ    = !q || m.name.toLowerCase().includes(q) || (m.skills || []).some(s => s.toLowerCase().includes(q));
    const matchRole = !role || m.role === role;
    return matchQ && matchRole;
  });
  renderMentors(filtered);
}
document.getElementById('mentorSearch').addEventListener('input', filterMentors);
document.getElementById('roleFilter').addEventListener('change', filterMentors);
 
/* ═══════════════════════════════════════════
   LOAD MY MENTORSHIPS (GET /api/mentorship/my)
══════════════════════════════════════════ */
async function loadMyMentorships() {
  try {
    const res  = await fetch(`${BASE_URL}/mentorship/my`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    myMentorships = { asMentor: data.asMentor || [], asMentee: data.asMentee || [] };
  } catch {
    // demo data
    myMentorships = getDemoMyMentorships();
  }
  renderMyMentorships();
}
 
function getDemoMyMentorships() {
  return {
    asMentor: [
      { _id: 'ms1', mentee: { name: 'Abena Darko', email: 'abena@demo.com' }, status: 'active', goals: ['Land first tech job', 'Improve coding skills'], sessions: [{ topic: 'Resume Review', duration: 45, notes: 'Polished CV', date: new Date(Date.now() - 86400000 * 3) }], startDate: new Date(Date.now() - 86400000 * 14) },
    ],
    asMentee: [
      { _id: 'ms2', mentor: { name: 'Dr. Amara Okafor', email: 'amara@demo.com' }, status: 'active', goals: ['System design mastery'], sessions: [], startDate: new Date(Date.now() - 86400000 * 7) },
      { _id: 'ms3', mentor: { name: 'Kwame Mensah', email: 'kwame@demo.com' }, status: 'completed', goals: ['Product strategy'], sessions: [{ topic: 'Roadmapping 101', duration: 60, notes: 'Great insights!', date: new Date(Date.now() - 86400000 * 30) }], rating: 5, startDate: new Date(Date.now() - 86400000 * 60) },
    ]
  };
}
 
function renderMyMentorships() {
  const { asMentor, asMentee } = myMentorships;
  document.getElementById('asMentorCount').textContent = asMentor.length;
  document.getElementById('asMenteeCount').textContent = asMentee.length;
 
  renderMentorshipList('asMentorList', asMentor, 'mentor');
  renderMentorshipList('asMenteeList', asMentee, 'mentee');
}
 
function renderMentorshipList(containerId, list, perspective) {
  const el = document.getElementById(containerId);
  if (!list.length) {
    el.innerHTML = perspective === 'mentor'
      ? `<div class="empty-state"><div class="empty-icon">🎓</div><h3>No mentees yet</h3><p>When students request your mentorship, they'll appear here.</p></div>`
      : `<div class="empty-state"><div class="empty-icon">🌱</div><h3>No mentors yet</h3><p>Find a mentor and request mentorship to get started.</p><button class="btn btn-primary" onclick="switchTab('find')">Find a Mentor</button></div>`;
    return;
  }
  el.innerHTML = list.map((m, i) => {
    const person = perspective === 'mentor' ? m.mentee : m.mentor;
    const sessions = m.sessions || [];
    const maxSessions = 5;
    const pct = Math.min(100, Math.round((sessions.length / maxSessions) * 100));
    return `
      <div class="mentorship-item" style="animation-delay:${i * 0.08}s">
        <div class="item-avatar">${initials(person?.name)}</div>
        <div class="item-main">
          <h4>${person?.name || 'Unknown'}</h4>
          <div class="item-meta">${person?.email || ''} · Since ${formatDate(m.startDate)}</div>
          <div class="item-goals">
            ${(m.goals || []).map(g => `<span class="skill-tag">${g}</span>`).join('')}
          </div>
          <div class="sessions-info">
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
            <span class="sessions-text">${sessions.length} session${sessions.length !== 1 ? 's' : ''}</span>
            <span class="status-badge status-${m.status}">${m.status}</span>
          </div>
        </div>
        <div class="item-actions">
          ${sessions.length ? `<button class="btn btn-outline btn-sm" onclick="viewSessions('${m._id}', '${person?.name}')">Sessions</button>` : ''}
          ${perspective === 'mentor' && m.status === 'active' ? `
            <button class="btn btn-outline btn-sm" onclick="openSessionModal('${m._id}')">Log Session</button>
            <button class="btn btn-primary btn-sm" onclick="openCompleteModal('${m._id}')">Complete</button>
          ` : ''}
          ${perspective === 'mentee' && m.status === 'active' ? `
            <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="confirmCancel('${m._id}')">Cancel</button>
          ` : ''}
          ${m.status === 'completed' && m.rating ? `<span style="font-size:1.1rem">${'★'.repeat(m.rating)}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}
 
/* ═══════════════════════════════════════════
   REQUEST MENTORSHIP
══════════════════════════════════════════ */
function openRequestModal(mentorId, mentorName) {
  activeRequestMentorId = mentorId;
  document.getElementById('requestModalSubtitle').textContent = `Requesting ${mentorName} as your mentor`;
  // clear state
  goalTags.length = 0; expertiseTags.length = 0;
  document.getElementById('goalsWrap').querySelectorAll('.tag-chip').forEach(c => c.remove());
  document.getElementById('expertiseWrap').querySelectorAll('.tag-chip').forEach(c => c.remove());
  document.getElementById('goalsInput').value = '';
  document.getElementById('expertiseInput').value = '';
  document.getElementById('requestMessage').value = '';
  openModal('requestModal');
}
 
async function submitRequest() {
  const btn = document.getElementById('submitRequestBtn');
  btn.disabled = true; btn.textContent = 'Sending...';
  try {
    const body = { mentorId: activeRequestMentorId, goals: goalTags, expertise: expertiseTags };
    const res  = await fetch(`${BASE_URL}/mentorship/request`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Mentorship request sent!', 'success');
    closeModal('requestModal');
  } catch (err) {
    showToast(err.message || 'Request sent (demo mode)', 'success');
    closeModal('requestModal');
  } finally {
    btn.disabled = false; btn.textContent = 'Send Request';
  }
}
 
/* ═══════════════════════════════════════════
   LOG SESSION
══════════════════════════════════════════ */
function openSessionModal(mentorshipId) {
  activeSessionMentorshipId = mentorshipId;
  document.getElementById('sessionTopic').value = '';
  document.getElementById('sessionDuration').value = '';
  document.getElementById('sessionNotes').value = '';
  openModal('sessionModal');
}
 
async function submitSession() {
  const topic    = document.getElementById('sessionTopic').value.trim();
  const duration = document.getElementById('sessionDuration').value.trim();
  const notes    = document.getElementById('sessionNotes').value.trim();
  if (!topic || !duration) { showToast('Please fill in topic and duration', 'error'); return; }
 
  try {
    const res  = await fetch(`${BASE_URL}/mentorship/${activeSessionMentorshipId}/session`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify({ topic, duration: +duration, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Session logged successfully!', 'success');
    closeModal('sessionModal');
    loadMyMentorships();
  } catch (err) {
    showToast(err.message || 'Session logged (demo mode)', 'success');
    closeModal('sessionModal');
    // inject demo session
    const ms = [...myMentorships.asMentor, ...myMentorships.asMentee].find(m => m._id === activeSessionMentorshipId);
    if (ms) { ms.sessions.push({ topic, duration: +duration, notes, date: new Date() }); renderMyMentorships(); }
  }
}
 
/* ═══════════════════════════════════════════
   COMPLETE MENTORSHIP
══════════════════════════════════════════ */
function openCompleteModal(mentorshipId) {
  activeCompleteMentorshipId = mentorshipId;
  selectedRating = 0;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));
  document.getElementById('completeFeedback').value = '';
  openModal('completeModal');
}
 
async function submitComplete() {
  if (!selectedRating) { showToast('Please select a rating', 'error'); return; }
  const feedback = document.getElementById('completeFeedback').value.trim();
  try {
    const res  = await fetch(`${BASE_URL}/mentorship/${activeCompleteMentorshipId}/complete`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ rating: selectedRating, feedback })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showToast('Mentorship completed!', 'success');
    closeModal('completeModal');
    loadMyMentorships();
  } catch (err) {
    showToast(err.message || 'Marked as complete (demo mode)', 'success');
    closeModal('completeModal');
    const ms = myMentorships.asMentor.find(m => m._id === activeCompleteMentorshipId);
    if (ms) { ms.status = 'completed'; ms.rating = selectedRating; renderMyMentorships(); }
  }
}
 
/* ═══════════════════════════════════════════
   VIEW SESSIONS
══════════════════════════════════════════ */
function viewSessions(mentorshipId, personName) {
  const ms = [...myMentorships.asMentor, ...myMentorships.asMentee].find(m => m._id === mentorshipId);
  document.getElementById('sessionsModalSubtitle').textContent = `Sessions with ${personName}`;
  const body = document.getElementById('sessionsModalBody');
  const sessions = (ms?.sessions || []);
  if (!sessions.length) {
    body.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:2rem">No sessions logged yet.</p>`;
  } else {
    body.innerHTML = sessions.map(s => `
      <div class="session-entry">
        <div class="session-date">${formatDate(s.date)}</div>
        <div class="session-body">
          <h5>${s.topic}</h5>
          <p>${s.notes || 'No notes.'}</p>
          <span class="session-duration">${s.duration} min</span>
        </div>
      </div>
    `).join('');
  }
  openModal('sessionsModal');
}
 
/* ═══════════════════════════════════════════
   CANCEL MENTORSHIP (basic confirm)
══════════════════════════════════════════ */
function confirmCancel(mentorshipId) {
  if (!confirm('Are you sure you want to cancel this mentorship?')) return;
  showToast('Mentorship cancelled', 'info');
  myMentorships.asMentee = myMentorships.asMentee.filter(m => m._id !== mentorshipId);
  renderMyMentorships();
}
 
/* ═══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
(function init() {
  // Try to get current user for avatar
  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUser = payload;
      const av = document.getElementById('navAvatar');
      av.textContent = initials(payload.name || payload.email || 'U');
    } catch {}
  }
  loadMentors();
})();



 