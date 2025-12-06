const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "index.html";
} else {
  const container = document.querySelector("#incomingRequestsList");
  const searchInput = document.querySelector("#searchInput");

  let allRequests = []; // Tüm gelen istekleri tutacak

  async function loadIncomingRequests() {
    container.innerHTML = "Yükleniyor...";

    try {
      const res = await fetch(
        `https://chatapp-api-5smg.onrender.com/api/friendrequest/pending/${user.id}`
      );
      if (!res.ok) throw new Error("Sunucu hatası: " + res.status);

      let requests = [];
      try {
        requests = await res.json();
      } catch {
        container.innerHTML = `<div class="alert alert-danger">Sunucudan geçersiz veri geldi.</div>`;
        return;
      }

      allRequests = requests; // global olarak kaydet
      renderIncomingRequests(allRequests);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger">Gelen istekler yüklenemedi.</div>`;
    }
  }

  function renderIncomingRequests(requests) {
    container.innerHTML = "";

    if (!requests || requests.length === 0) {
      container.innerHTML = `<div class="alert alert-info">Gelen arkadaş isteği yok.</div>`;
      return;
    }

    requests.forEach((r) => {
      const div = document.createElement("div");
      div.className =
        "request-item d-flex align-items-center justify-content-between mb-2 p-2 border rounded";
      div.innerHTML = `
            <div>
                <strong>${r.username}</strong><br>
                <small>${r.emailAddress}</small>
            </div>
            <div>
                <button class="btn btn-success btn-sm me-1 accept-btn">Kabul Et</button>
                <button class="btn btn-danger btn-sm reject-btn">Reddet</button>
            </div>
        `;

      // Kabul et butonu
      div.querySelector(".accept-btn").addEventListener("click", async () => {
        try {
          const res = await fetch(
            `https://chatapp-api-5smg.onrender.com/api/friendrequest/accept/${r.requestId}`,
            { method: "POST" }
          );
          if (!res.ok) throw new Error("İstek kabul edilemedi.");
          loadIncomingRequests(); // Listeyi tekrar yükle
        } catch (err) {
          console.error(err);
        }
      });

      // Reddet butonu
      div.querySelector(".reject-btn").addEventListener("click", async () => {
        try {
          const res = await fetch(
            `https://chatapp-api-5smg.onrender.com/api/friendrequest/reject/${r.requestId}`,
            { method: "DELETE" }
          );
          if (!res.ok) throw new Error("İstek reddedilemedi.");
          alert("İstek reddedildi.");
          loadIncomingRequests(); // Listeyi tekrar yükle
        } catch (err) {
          console.error(err);
          alert("İstek reddedilemedi.");
        }
      });

      container.appendChild(div);
    });
  }

  // Filtreleme
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim().toLowerCase();
    if (!term) {
      renderIncomingRequests(allRequests);
      return;
    }
    const filtered = allRequests.filter((r) =>
      r.username.toLowerCase().includes(term)
    );
    renderIncomingRequests(filtered);
  });

  // Başlangıçta yükle
  loadIncomingRequests();
}
