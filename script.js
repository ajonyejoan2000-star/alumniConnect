// ==================== STATE ====================
const AppState = {
    currentPage: null, // MUST BE NULL
    dataSaver: false,
    umojaCredits: 450,
    selectedFlavours: [],
    guilds: { 'backend': false, 'founders': false }, 
    user: {
        name: 'Amina',
        cohort: 'Cohort 4',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoAEFobyfMLd_s-4Kye84lyQH2dtfI-YiTzyOceOWem1HnRtT7c3u4DR5G-pK9qYPxPTYNUWr6NN4zrmPZrOzm7mCw9loOrn-HjX7jptbCIFQpBCmgrlyN-6DhVshDs4HeZ9ocdREVSdQ38i_CG4id3jM1Zr_LTsIKR7_uZ3ba3QkS03MO4sxa7TF4l22jBsf1z4j9VPOKDVSl-xjQtzvOM2F5MlV_DmX_sHwvHp70qQp9VOlslBEzaGCXoXfcITYdudipiR9g-94v'
    }
};

// Pages that use the authenticated layout
const AUTHED_PAGES = ['dashboard', 'parlour', 'wall', 'board', 'directory', 'guilds', 'profile'];
const PUBLIC_PAGES = ['landing', 'partner'];
const ONBOARDING_PAGES = ['onboarding'];

// ==================== ROUTER ====================
function navigate(page) {
    if (AppState.currentPage === page) return;
    
    document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    
    AppState.currentPage = page;
    window.location.hash = page;
    
    updateLayout(page);
    updateBottomNav(page);
    window.scrollTo(0, 0);
}

function updateLayout(page) {
    document.getElementById('topbar-public').style.display = 'none';
    document.getElementById('topbar-onboarding').style.display = 'none';
    document.getElementById('topbar-authed').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'none';
    document.getElementById('umoja-tracker').style.display = 'none';
    document.getElementById('fab-button').style.display = 'none';
    
    if (PUBLIC_PAGES.includes(page)) {
        document.getElementById('topbar-public').style.display = 'flex';
    } else if (ONBOARDING_PAGES.includes(page)) {
        document.getElementById('topbar-onboarding').style.display = 'flex';
    } else if (AUTHED_PAGES.includes(page)) {
        document.getElementById('topbar-authed').style.display = 'flex';
        document.getElementById('bottom-nav').style.display = 'flex';
        document.getElementById('umoja-tracker').style.display = 'block';
        document.getElementById('fab-button').style.display = 'flex';
    }
}

function updateBottomNav(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('data-page');
        if (linkPage === page) {
            link.classList.remove('text-on-surface-variant');
            link.classList.add('bg-primary-container', 'text-on-primary-container', 'rounded-full', 'translate-y-[-2px]');
            link.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 1";
        } else {
            link.classList.add('text-on-surface-variant');
            link.classList.remove('bg-primary-container', 'text-on-primary-container', 'rounded-full', 'translate-y-[-2px]');
            link.querySelector('.material-symbols-outlined').style.fontVariationSettings = "'FILL' 0";
        }
    });
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    if (document.getElementById('page-' + hash)) navigate(hash);
});

// ==================== DATA SAVER TOGGLE ====================
function toggleDataSaver() {
    AppState.dataSaver = !AppState.dataSaver;
    document.body.classList.toggle('data-saver-on', AppState.dataSaver);
    document.querySelectorAll('.toggle-track').forEach(t => {
        t.classList.toggle('active', AppState.dataSaver);
        t.setAttribute('aria-checked', AppState.dataSaver);
    });
    showToast(AppState.dataSaver ? 'Data-Saver Mode: ON' : 'Data-Saver Mode: OFF', 'cloud_download');
}

// ==================== FLAVOUR CHIP TOGGLE ====================
function toggleChip(el) { 
    el.classList.toggle('selected');
    const nameEl = el.querySelector('.font-label-sm, .font-label-md');
    const flavourName = nameEl ? nameEl.innerText.trim() : '';
    
    if (el.classList.contains('selected')) {
        if (!AppState.selectedFlavours.includes(flavourName)) AppState.selectedFlavours.push(flavourName);
    } else {
        AppState.selectedFlavours = AppState.selectedFlavours.filter(f => f !== flavourName);
    }
}

// ==================== PARLOUR TAB TOGGLE ====================
function toggleParlourTab(tab) {
    const btnF = document.getElementById('toggle-flavours');
    const btnA = document.getElementById('toggle-availability');
    const viewF = document.getElementById('parlour-flavours-view');
    const viewA = document.getElementById('parlour-availability-view');

    if (tab === 'flavours') {
        btnF.classList.add('bg-primary','text-on-primary'); btnF.classList.remove('text-on-surface-variant');
        btnA.classList.remove('bg-primary','text-on-primary'); btnA.classList.add('text-on-surface-variant');
        viewF.style.display = 'block';
        viewA.style.display = 'none';
    } else {
        btnA.classList.add('bg-primary','text-on-primary'); btnA.classList.remove('text-on-surface-variant');
        btnF.classList.remove('bg-primary','text-on-primary'); btnF.classList.add('text-on-surface-variant');
        viewF.style.display = 'none';
        viewA.style.display = 'block';
    }
}

// ==================== CHAT ====================
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    const chatBody = document.getElementById('chat-body');
    const newMsg = document.createElement('div');
    newMsg.className = 'flex flex-col items-end max-w-[80%] ml-auto';
    newMsg.innerHTML = `
        <div class="chat-bubble-sent p-4 rounded-xl rounded-tr-none">
            <p class="font-body-md">${escapeHtml(msg)}</p>
        </div>
        <span class="mt-1 font-label-sm text-[10px] text-on-surface-variant">Just now</span>
    `;
    chatBody.appendChild(newMsg);
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ==================== SHOUTOUT WALL ====================
function openShoutoutModal() { document.getElementById('shoutout-modal').style.display = 'flex'; }
function closeShoutoutModal() { document.getElementById('shoutout-modal').style.display = 'none'; }

function submitShoutout() {
    const text = document.getElementById('shoutout-text').value.trim();
    if (!text) return;
    
    const feed = document.getElementById('wall-feed');
    const newPost = document.createElement('article');
    newPost.className = 'wall-post bg-surface border-2 border-primary p-5 md:p-6 hover:bg-surface-container transition-colors group';
    newPost.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="ds-img-placeholder w-12 h-12 rounded-full flex-shrink-0">[P]</div>
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-label-md text-label-md"><span class="text-primary">${AppState.user.name}</span> posted</h4>
                    <span class="font-label-sm text-label-sm text-on-surface-variant">Just now</span>
                </div>
                <p class="font-body-md text-body-lg text-on-surface border-l-4 border-primary-fixed-dim pl-4 py-1 italic mb-4">"${escapeHtml(text)}"</p>
                <div class="flex items-center gap-6">
                    <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-vibrant-pink transition-colors active:scale-90" onclick="likePost(this)">
                        <span class="material-symbols-outlined text-[20px]">favorite</span>
                        <span class="font-label-sm text-label-sm like-count">0</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    feed.insertBefore(newPost, feed.firstChild);
    
    updateUmoja(10);
    document.getElementById('shoutout-text').value = '';
    closeShoutoutModal();
    showToast('+10 Umoja Credits earned!', 'payments');
}

function likePost(btn) {
    const countEl = btn.querySelector('.like-count');
    let count = parseInt(countEl.textContent);
    const icon = btn.querySelector('.material-symbols-outlined');
    
    if (btn.classList.contains('liked')) {
        count--;
        btn.classList.remove('liked');
        icon.style.fontVariationSettings = "'FILL' 0";
        btn.classList.remove('text-vibrant-pink');
        btn.classList.add('text-on-surface-variant');
    } else {
        count++;
        btn.classList.add('liked');
        icon.style.fontVariationSettings = "'FILL' 1";
        btn.classList.add('text-vibrant-pink');
        btn.classList.remove('text-on-surface-variant');
    }
    countEl.textContent = count;
}

// ==================== OPPORTUNITY BOARD ====================
function setBoardFilter(btn) {
    document.querySelectorAll('.board-filter').forEach(b => {
        b.classList.remove('bg-primary','text-on-primary','brutalist-border');
        b.classList.add('bg-surface-container-high','text-on-surface-variant','border','border-outline-variant');
    });
    btn.classList.add('bg-primary','text-on-primary','brutalist-border');
    btn.classList.remove('bg-surface-container-high','text-on-surface-variant','border','border-outline-variant');
}

function unlockPremium() {
    if (AppState.umojaCredits >= 10) {
        updateUmoja(-10);
        document.getElementById('premium-gate').style.display = 'none';
        showToast('Premium details unlocked! -10 UC', 'lock_open');
    } else {
        showToast('Not enough Umoja Credits!', 'error');
    }
}

function applyJob(btn) {
    btn.innerText = "Applied ✓";
    btn.disabled = true;
    btn.classList.remove('border-primary', 'text-primary', 'hover:bg-primary-fixed-dim/20');
    btn.classList.add('border-outline-variant', 'text-on-surface-variant', 'opacity-60');
    showToast('Application submitted!', 'send');
}

// ==================== ASK/OFFER DIRECTORY ====================
function setDirectoryFilter(btn) {
    document.querySelectorAll('.dir-filter').forEach(b => {
        b.classList.remove('bg-primary','text-on-primary','brutalist-border');
        b.classList.add('bg-surface-container-high','text-on-surface-variant','border','border-outline-variant');
    });
    btn.classList.add('bg-primary','text-on-primary','brutalist-border');
    btn.classList.remove('bg-surface-container-high','text-on-surface-variant','border','border-outline-variant');
    
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.dir-card').forEach(c => {
        const offers = c.getAttribute('data-offers') || '';
        const asks = c.getAttribute('data-asks') || '';
        
        if (filter === 'all') {
            c.style.display = 'flex';
        } else if (filter === 'offers') {
            c.style.display = offers.trim() !== '' ? 'flex' : 'none'; 
        } else if (filter === 'asks') {
            c.style.display = asks.trim() !== '' ? 'flex' : 'none'; 
        }
    });
}

function connectAlumni(btn) {
    btn.innerText = "Connected";
    btn.disabled = true;
    btn.classList.remove('bg-primary');
    btn.classList.add('bg-surface-container-high', 'text-on-surface-variant');
    updateUmoja(5);
    showToast('+5 Umoja for connecting!', 'handshake');
}

// ==================== GUILDS & COUNCILS ====================
function joinGuild(btn, guildKey) {
    AppState.guilds[guildKey] = !AppState.guilds[guildKey];
    const isJoining = AppState.guilds[guildKey];
    
    if (isJoining) {
        btn.innerText = "Leave Guild";
        btn.classList.remove('bg-primary', 'hover:bg-deep-purple', 'border-primary', 'hover:bg-primary/5', 'text-white');
        btn.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border-outline-variant');
        showToast('Joined Guild!', 'check_circle');
    } else {
        btn.innerText = "Join Guild";
        btn.classList.add('bg-primary', 'hover:bg-deep-purple', 'border-primary', 'hover:bg-primary/5', 'text-white');
        btn.classList.remove('bg-surface-container-high', 'text-on-surface-variant', 'border-outline-variant');
        showToast('Left Guild.', 'remove_circle');
    }
}

function nominateSteward(btn) {
    btn.innerText = "Nominated ✓";
    btn.disabled = true;
    btn.classList.add('opacity-60');
    showToast('Steward nomination submitted!', 'how_to_reg');
}

function voteNow(btn) {
    btn.innerText = "Voted ✓";
    btn.disabled = true;
    btn.classList.remove('hover:bg-white');
    btn.classList.add('opacity-60');
    updateUmoja(5);
    showToast('+5 Umoja for voting!', 'gavel');
}

// ==================== USER PROFILE ====================
function updateOffers() {
    const textarea = document.getElementById('profile-offers');
    const text = textarea.value.trim();
    if (!text) return;
    
    const container = document.getElementById('offers-tags');
    const tags = text.split(',').map(t => t.trim()).filter(t => t);
    container.innerHTML = tags.map(t => `<span class="bg-primary-fixed-dim text-primary text-[11px] px-3 py-1 rounded">${t}</span>`).join('');
    textarea.value = '';
    showToast('Offers updated!', 'handshake');
}

function updateAsks() {
    const textarea = document.getElementById('profile-asks');
    const text = textarea.value.trim();
    if (!text) return;
    
    const container = document.getElementById('asks-tags');
    const tags = text.split(',').map(t => t.trim()).filter(t => t);
    container.innerHTML = tags.map(t => `<span class="bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] px-3 py-1 rounded">${t}</span>`).join('');
    textarea.value = '';
    showToast('Asks updated!', 'help_center');
}

function logout() {
    AppState.umojaCredits = 450;
    document.getElementById('umoja-display').textContent = AppState.umojaCredits;
    const p = document.getElementById('profile-umoja');
    if(p) p.textContent = AppState.umojaCredits;
    
    if(document.getElementById('profile-offers')) document.getElementById('profile-offers').value = '';
    if(document.getElementById('profile-asks')) document.getElementById('profile-asks').value = '';
    
    showToast('Logged out successfully', 'logout');
    navigate('landing');
}

// ==================== PARTNER PORTAL ====================
function subscribePartner(btn) {
    btn.innerText = "Subscribed ✓";
    btn.disabled = true;
    btn.classList.add('opacity-60');
    showToast('Partner Portal access granted!', 'business_center');
}

function filterPartnerTalent(role) {
    document.querySelectorAll('.partner-card').forEach(card => {
        const cardRole = card.getAttribute('data-role');
        if (role === 'all' || cardRole === role) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function viewPortfolio() {
    showToast('Opening portfolio in new tab...', 'open_in_new');
}

function requestIntro(btn) {
    btn.innerText = "Requested ✓";
    btn.disabled = true;
    btn.classList.remove('bg-primary', 'text-white');
    btn.classList.add('bg-surface-container-high', 'text-on-surface-variant', 'border-outline-variant');
    showToast('Intro request sent to alumni!', 'send');
}

// ==================== UMOJA CREDITS ====================
function updateUmoja(amount) {
    AppState.umojaCredits += amount;
    document.getElementById('umoja-display').textContent = AppState.umojaCredits;
    const p = document.getElementById('profile-umoja');
    if(p) p.textContent = AppState.umojaCredits;
}

// ==================== FAB HANDLER ====================
function handleFAB() {
    if (AppState.currentPage === 'wall') openShoutoutModal();
    else showToast('Create new content', 'add');
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, icon = 'check_circle') {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').textContent = message;
    document.getElementById('toast-icon').textContent = icon;
    
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.pointerEvents = 'none';
    }, 3000);
}

// ==================== UTILITY ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '') || 'landing';
    navigate(hash);

    const chatInput = document.getElementById('chat-input');
    if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key==='Enter') sendChatMessage(); });

    const wallSearch = document.getElementById('wall-search');
    if(wallSearch) wallSearch.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.wall-post').forEach(p => {
            p.style.display = p.innerText.toLowerCase().includes(term) ? 'block' : 'none';
        });
    });

    const dirSearch = document.getElementById('directory-search');
    if(dirSearch) dirSearch.addEventListener('input', e => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.dir-card').forEach(c => {
            const text = (c.getAttribute('data-offers') + ' ' + c.getAttribute('data-asks')).toLowerCase();
            c.style.display = text.includes(term) ? 'flex' : 'none';
        });
    });
});