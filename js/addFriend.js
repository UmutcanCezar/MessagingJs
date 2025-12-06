const user = JSON.parse(localStorage.getItem("user"));
const container = document.querySelector("#notFriendsList");

if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "index.html";
} else {
  let allUsers = [];

  async function loadNotFriends() {
    try {
      const response = await fetch(
        `https://chatapp-api-5smg.onrender.com/api/friend/notfriends/${user.id}`
      );
      if (!response.ok) {
        container.innerHTML = "";
        container.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-info">
        Sunucu Hatası!
        </div>`
        );
      }

      allUsers = await response.json();
    } catch (err) {
      container.innerHTML = "";
      container.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
      Sunucu Hatası!
      </div>`
      );
    }
  }

  function renderUsers(users) {
    container.innerHTML = "";
    for (let u of users) {
      const div = document.createElement("div");
      div.className = "user-item";
      div.innerHTML = `
    <img src="${u.profilePictureUrl || "../assets/profilphoto.png"}" alt="${
        u.username
      }" class="pp" />
      <div>
      <strong>${u.username}</strong><br>
      <small>${u.emailAddress}</small>
      </div>
      <button class="add-btn">Ekle</button>
      `;

      const btn = div.querySelector(".add-btn");
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Gönderiliyor...";
        try {
          const req = await fetch(
            `https://chatapp-api-5smg.onrender.com/api/friendrequest/send?senderId=${user.id}&receiverId=${u.friendId}`,
            {
              method: "POST",
            }
          );
          const data = await req.json();
          btn.textContent = "İstek Gönderildi";
        } catch (err) {
          console.error(err);
          alert("İstek gönderilemedi.");
          btn.disabled = false;
          btn.textContent = "Ekle";
        }
      });
      container.appendChild(div);
    }
  }

  document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (!term) {
      renderUsers([]);
      return;
    }
    const filtered = allUsers.filter((u) =>
      u.username.toLowerCase().includes(term)
    );
    if (filtered.length > 0) renderUsers(filtered);
    else {
      renderUsers([]);
      container.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
      Kullanıcı Bulunamadı.
      </div>`
      );
    }
  });

  loadNotFriends();
}
