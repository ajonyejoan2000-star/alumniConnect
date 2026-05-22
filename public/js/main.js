// ============================================
//  AlumniConnect — main.js
//  Shared JS logic across all pages
// ============================================

const API_BASE = 'http://localhost:5000'; // updated from 3000 → 5000
let token    = localStorage.getItem('token')    || null;
let userName = localStorage.getItem('userName') || null;
let userId   = localStorage.getItem('userId')   || null;

// ── SAVE SESSION ──
function saveSession(tok, name) {
  token    = tok;
  userName = name;
  try {
    const payload = JSON.parse(atob(tok.split('.')[1]));
    userId = payload.id;
    localStorage.setItem('userId', userId);
  } catch (e) {
    console.log('Token parse error:', e);
  }
  localStorage.setItem('token',    tok);
  localStorage.setItem('userName', name);
}

// ── CREATE POST ──
async function createPost() {
  const postText = document.getElementById('postText')?.value?.trim();
  const imageUrl = document.getElementById('imageUrl')?.value?.trim();

  if (!postText) {
    alert('Please write something before posting.');
    return;
  }
  if (!token) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/events/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title:       postText.slice(0, 40),
        description: postText,
        image:       imageUrl || undefined,
        date:        new Date()
      })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to post. Please try again.');
      return;
    }

    renderSinglePost(data);
    document.getElementById('postText').value  = '';
    document.getElementById('imageUrl').value  = '';

    // Remove sample post if present
    const sample = document.getElementById('sample-post');
    if (sample) sample.remove();

  } catch (err) {
    alert(err.message || 'Error creating post.');
  }
}

// ── RENDER SINGLE POST ──
function renderSinglePost(post) {
  const feed = document.getElementById('feed');
  if (!feed) return;

  const name    = post.createdBy?.name || userName || 'You';
  const initial = name.charAt(0).toUpperCase();
  const time    = new Date(post.createdAt || new Date()).toLocaleString();

  const postDiv = document.createElement('div');
  postDiv.className = 'post';
  postDiv.innerHTML = `
    <div class="post-header">
      <div class="post-user">
        <div class="avatar">${initial}</div>
        <div class="user-info">
          <h3>${name}</h3>
          <p>${time}</p>
        </div>
      </div>
      <button class="post-menu-btn"><i class="bi bi-three-dots"></i></button>
    </div>
    <div class="post-content">${post.description || post.title || ''}</div>
    ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image" onerror="this.style.display='none'"/>` : ''}
    <div class="post-actions">
      <button class="action-btn" onclick="toggleLike(this)">
        <i class="bi bi-heart"></i> <span>0</span>
      </button>
      <button class="action-btn">
        <i class="bi bi-chat-dots"></i> <span>Comment</span>
      </button>
      <button class="action-btn">
        <i class="bi bi-share"></i> <span>Share</span>
      </button>
    </div>
  `;

  feed.prepend(postDiv);
}

// ── LOAD FEED ──
async function loadFeed() {
  const feed = document.getElementById('feed');
  if (!feed) return;

  try {
    const res = await fetch(`${API_BASE}/events/event`);
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const sample = document.getElementById('sample-post');
      if (sample) sample.remove();

      data.reverse().forEach(renderSinglePost);
    }
  } catch (err) {
    console.log('Feed load error (API may not be running):', err.message);
  }
}

// ── LIKE TOGGLE ──
function toggleLike(btn) {
  const count = btn.querySelector('span');
  const icon  = btn.querySelector('i');
  const liked = btn.classList.toggle('liked');
  icon.className  = liked ? 'bi bi-heart-fill' : 'bi bi-heart';
  const current   = parseInt(count.textContent) || 0;
  count.textContent = liked ? current + 1 : Math.max(0, current - 1);
}