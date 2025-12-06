const user = JSON.parse(localStorage.getItem("user"));

// Genel hata gösterme fonksiyonu
function showError(message) {
  const box = document.getElementById("error-box");
  if (!box) return;

  box.textContent = message;
  box.classList.remove("d-none");
}

if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "index.html";
} else {
  const chats = document.querySelector(".chats");
  const chatlist = document.querySelector(".chat_list");
  const messageText = document.querySelector("#messageText");
  const messageSendBtn = document.querySelector("#messageSendButton");
  let messageSendFriend;
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://chatapp-api-5smg.onrender.com/chathub?userId=" + user.id)
    .configureLogging(signalR.LogLevel.None)
    .withAutomaticReconnect()
    .build();

  window.addEventListener("load", () => loadFriends());

  messageText.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && messageText.value.trim().length > 0) {
      if (messageSendFriend) {
        await sendMessage(messageSendFriend, messageText.value);
        messageText.value = "";
      } else {
        alert("Listeden Kişi Seçmelisiniz!");
      }
    }
  });

  messageSendBtn.addEventListener("click", async (e) => {
    if (messageSendFriend) {
      await sendMessage(messageSendFriend, messageText.value);
      messageText.value = "";
    }
  });

  async function sendMessage(receiverId, content) {
    try {
      const senderIdNumber = parseInt(user.id);
      const receiverIdNumber = parseInt(receiverId);

      if (isNaN(senderIdNumber) || isNaN(receiverIdNumber)) {
        console.error("UserId veya ReceiverId geçerli sayı değil!");
        showError("Mesaj gönderilemedi: Kullanıcı bilgisi geçersiz.");
        return;
      }

      await connection.invoke(
        "SendMessage",
        senderIdNumber,
        receiverIdNumber,
        content
      );
    } catch (err) {
      console.error("Hub mesaj gönderilemedi:", err);
      showError("Mesaj gönderilemedi. Gerçek zamanlı bağlantı kurulamadı.");
    }
  }

  async function loadFriends() {
    try {
      const response = await fetch(
        `https://chatapp-api-5smg.onrender.com/api/friend/${user.id}`
      );

      if (!response.ok) {
        showError(
          "Arkadaş listesi yüklenemedi. Sunucuya bağlanılamıyor (API hatası)."
        );
        return;
      }

      const friends = await response.json();
      chats.innerHTML = "";

      for (let friend of friends) {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.dataset.email = friend.friendId;
        li.dataset.username = friend.username;

        const statusText = friend.isOnline ? "Çevrimiçi" : "Çevrimdışı";
        const statusClass = friend.isOnline ? "text-success" : "text-secondary";

        li.innerHTML = `
          <div class="row">
            <div class="col-5 text-center position-relative">
              <img src="${
                friend.profilePictureUrl || "./assets/profilphoto.png"
              }" class="profile-img" />
              <span class="${statusClass} position-absolute bottom-0 end-0 small" style="background:white; border-radius:50%; padding:2px 5px;">
                ●
              </span>
            </div>
            <div class="col-7">
              <h5 class="text-black">${friend.username}</h5>
              <p class="text-truncate p-0 m-0 text-dark">
                ${
                  friend.lastMessage
                    ? (friend.lastMessageSenderId === user.id
                        ? `<span class="fw-bold">Siz: </span>`
                        : `<span class="fw-bold">${friend.username}: </span>`) +
                      friend.lastMessage
                    : ""
                }
              </p>
              <p class="last-online p-0 m-0 ${statusClass}">
                <small>${statusText}</small>
              </p>
            </div>
          </div>
        `;

        li.addEventListener("click", () => {
          messageSendFriend = li.dataset.email;

          document.querySelector(".chat-img_text").textContent =
            li.dataset.username;
          loadMessage(li.dataset.email);
          document.querySelector(".chat-container").classList.remove("d-none");

          const collapseElement = document.getElementById("friendList");
          const bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
          if (bsCollapse) bsCollapse.hide();
        });

        chats.appendChild(li);
      }
    } catch (err) {
      showError(
        "Arkadaş listesi yüklenirken bir hata oluştu. Sunucuya erişilemiyor."
      );
    }
  }

  async function loadMessage(currentFriend) {
    chatlist.innerHTML = "";
    try {
      const response = await fetch(
        `https://chatapp-api-5smg.onrender.com/api/message/${user.id}/${currentFriend}`
      );

      if (!response.ok) {
        showError("Mesajlar yüklenemedi. Sunucuya bağlanılamıyor.");
        return;
      }

      const messages = await response.json();

      for (let message of messages) {
        const msgDate = new Date(message.sentAt);
        const dateTime = `${msgDate.toLocaleDateString()} ${msgDate.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )}`;
        const li = document.createElement("li");
        li.className =
          message.senderID === user.id ? "chat_item me" : "chat_item";
        li.innerHTML = `<div class="d-flex align-items-start mb-2">
  <!-- Mesaj İçeriği -->
  <div class="flex-grow-1 me-2">
    <p class="message mb-1">
      ${message.content}
    </p>
    <div class="message-time"><small>${dateTime}</small></div>
  </div>

  <!-- İşlem Dropdown -->
  <div class="flex-shrink-0">
    <div class="dropdown">
      <button
        class="btn p-0"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="bi bi-three-dots-vertical fs-4"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="#">Düzenle</a></li>
        <li><a class="dropdown-item" href="#">Sil</a></li>
        <li><a class="dropdown-item" href="#">Paylaş</a></li>
      </ul>
    </div>
  </div>
</div>

`;
        chatlist.appendChild(li);
      }

      chatlist.scrollTop = chatlist.scrollHeight;
    } catch (err) {
      console.error("Load messages error:", err);
      showError("Mesajlar yüklenirken bir hata oluştu. Sunucuya erişilemiyor.");
    }
  }

  // SignalR eventleri
  connection.on("ReceiveMessage", (senderId, receiverId, message, sentAt) => {
    if (
      (senderId == messageSendFriend && receiverId == user.id) ||
      (receiverId == messageSendFriend && senderId == user.id)
    ) {
      const msgDate = new Date(sentAt);
      const dateTime = `${msgDate.toLocaleDateString()} ${msgDate.toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
      )}`;
      const li = document.createElement("li");
      li.className = senderId === user.id ? "chat_item me" : "chat_item";
      li.innerHTML = `
        <div class="d-flex align-items-start mb-2">
  <!-- Mesaj İçeriği -->
  <div class="flex-grow-1 me-2">
    <p class="message mb-1">
      ${message}
    </p>
    <div class="message-time"><small>${dateTime}</small></div>
  </div>

  <!-- İşlem Dropdown -->
  <div class="flex-shrink-0">
    <div class="dropdown">
      <button
        class="btn p-0"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i class="bi bi-three-dots-vertical fs-4"></i>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="#">Düzenle</a></li>
        <li><a class="dropdown-item" href="#">Sil</a></li>
        <li><a class="dropdown-item" href="#">Paylaş</a></li>
      </ul>
    </div>
  </div>
</div>`;
      chatlist.appendChild(li);
      chatlist.scrollTop = chatlist.scrollHeight;
    }
  });

  // Friend list last message event
  connection.on("LastMessage", () => {
    loadFriends();
  });

  // Online/offline durum event
  connection.on("UpdateUserStatus", (userId, isOnline) => {
    const friendLi = [...chats.children].find(
      (li) => parseInt(li.dataset.email) === userId
    );
    if (!friendLi) return;

    const statusSpan = friendLi.querySelector(".last-online");
    if (statusSpan) {
      statusSpan.textContent = isOnline ? "Çevrimiçi" : "Çevrimdışı";
      statusSpan.classList.remove("text-success", "text-secondary");
      statusSpan.classList.add(isOnline ? "text-success" : "text-secondary");
    }

    const badge = friendLi.querySelector("span.position-absolute");
    if (badge) {
      badge.classList.remove("text-success", "text-secondary");
      badge.classList.add(isOnline ? "text-success" : "text-secondary");
    }
  });

  // Hub başlat
  async function startConnection() {
    try {
      await connection.start();
    } catch (err) {
      console.error("Hub bağlantı hatası:", err);
      showError(
        "Gerçek zamanlı bağlantı kurulamadı. Sunucu kapalı olabilir veya ulaşılamıyor."
      );
      setTimeout(startConnection, 5000);
    }
  }

  startConnection();
}
