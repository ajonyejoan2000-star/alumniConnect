// CONFIG
const API_BASE = 'http://localhost:5000';

let token = localStorage.getItem('token')||null;
let userName = localStorage.getItem('userName')||null;
let userId = localStorage.getItem('userId')||null;
let editingId = null;
let deletingId = null;

// SESSIO
function saveSession(tok, name, email){
    token = tok;
    userName = name;

    try {
        const payload = JSON.parse(atob(tok.split('.')[1]));
        userId = payload.id;
        localStorage.setItem('userId', userId);
    } catch (error) {
        
    }

    localStorage.setItem('token', tok);
    localStorage.setItem('userName', name);
}
// SIGN UP
async function signUp(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('password').value;  
    const confirmPassword = document.getElementById('confirm-password').value;
    const btn = document.getElementById('signup-btn');

    if (!email || !name || !password || !confirmPassword) {
    alert("Please fill all fields");
    return;
}

    try {
        const res = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, name, password, confirmPassword })
        });
        console.log(res);
        
        const data = await res.json();
        console.log("REGISTER RESPONSE:", data);

        if(!res.ok) throw new Error(data.message || 'Failed to register');
        saveSession(data.token, data.user.name, data.user.email);
        alert(data.message || 'Registration successful! Please log in.');
        document.getElementById('signupForm').reset();
    } catch (error) {
        alert(error.message);
    }
}