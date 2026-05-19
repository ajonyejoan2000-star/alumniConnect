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