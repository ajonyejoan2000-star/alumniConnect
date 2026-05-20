 function createPost(){

      const postText = document.getElementById("postText").value;
      const imageUrl = document.getElementById("imageUrl").value;

      if(postText.trim() === ""){
        alert("Please write something");
        return;
      }

      const feed = document.getElementById("feed");

      const post = document.createElement("div");
      post.classList.add("post");

      post.innerHTML = `

        <div class="post-header">

          <div class="user">

            <div class="avatar">
              YU
            </div>

            <div class="user-info">
              <h3>You</h3>
              <p>Just now</p>
            </div>

          </div>

          <i class="fa-solid fa-ellipsis"></i>

        </div>

        <div class="post-content">
          ${postText}
        </div>

        ${imageUrl ? `
          <img class="post-image" src="${imageUrl}">
        ` : ""}

        <div class="actions">

          <div class="action-btn">
            <i class="fa-regular fa-heart"></i>
            <span>Like</span>
          </div>

          <div class="action-btn">
            <i class="fa-regular fa-comment"></i>
            <span>Comment</span>
          </div>

          <div class="action-btn">
            <i class="fa-solid fa-share"></i>
            <span>Share</span>
          </div>

        </div>

      `;

      feed.prepend(post);

      document.getElementById("postText").value = "";
      document.getElementById("imageUrl").value = "";

    }
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