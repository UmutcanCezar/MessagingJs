const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "index.html";
} else {
  // Gönderilen istekleri yükle
  async function loadSentRequests() {
    const container = document.querySelector("#sentRequestsList");
    container.innerHTML = "Yükleniyor...";

    try {
      const response = await fetch(
        `http://localhost:5298/api/friendrequest/pending/${user.id}`
      );
      if (!response.ok) throw new Error(`Sunucu hatası: ${response.status}`);

      let sentRequests = [];
      try {
        sentRequests = await response.json();
      } catch {
        container.innerHTML = `<div class="alert alert-danger">Sunucudan geçersiz veri geldi.</div>`;
        return;
      }

      renderSentRequests(sentRequests);
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="alert alert-danger">Gönderilen istekler yüklenemedi.</div>`;
    }
  }

  // Gönderilen istekleri render et
  function renderSentRequests(requests) {
    const container = document.querySelector("#sentRequestsList");
    container.innerHTML = "";

    if (!requests || requests.length === 0) {
      container.innerHTML = `<div class="alert alert-info">Gönderilen istek yok.</div>`;
      return;
    }

    requests.forEach((r) => {
      const div = document.createElement("div");
      div.className =
        "sent-request-item d-flex align-items-center justify-content-between mb-2 p-2 border rounded";
      div.innerHTML = `
      <div>
        <strong>${r.username}</strong><br>
        <small>${r.emailAddress}</small>
      </div>
      <button class="btn btn-danger btn-sm cancel-btn">İptal Et</button>
    `;

      const btn = div.querySelector(".cancel-btn");
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "İptal ediliyor...";
        try {
          const req = await fetch(
            `https://chatapp-api-5smg.onrender.com/api/friendrequest/reject/${r.requestId}`,
            { method: "DELETE" }
          );

          if (!req.ok) throw new Error(`Sunucu hatası: ${req.status}`);

          alert("İstek iptal edildi.");
          loadSentRequests(); // Listeyi tekrar yükle
        } catch (err) {
          console.error(err);
          alert("İstek iptal edilemedi.");
          btn.disabled = false;
          btn.textContent = "İptal Et";
        }
      });

      container.appendChild(div);
    });
  }

  // Sayfa açıldığında gönderilen istekleri yükle
  loadSentRequests();
}
