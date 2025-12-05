const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");

  window.location.href = "index.html";
} else {
  // Kullanıcı Bilgileri Güncelleme
  document.getElementById("infoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      username: document.getElementById("ad").value.trim() || null,
      emailAddress: document.getElementById("eposta").value.trim() || null,
    };

    try {
      const res = await fetch(
        `https://chatapp-api-5smg.onrender.com/api/user/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        alert(data?.message || "Hata oluştu");
        return;
      }

      // LOCAL STORAGE GÜNCELLE
      if (body.username) user.username = body.username;
      if (body.emailAddress) user.emailAddress = body.emailAddress;

      localStorage.setItem("user", JSON.stringify(user));

      alert(data?.message || "Bilgiler Güncellendi!");
    } catch (err) {
      console.error("Hata:", err);
      alert("Bir hata oluştu.");
    }
  });

  // Şifre Güncelleme
  document
    .getElementById("passwordForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const pass = document.getElementById("pass").value;
      const pass2 = document.getElementById("pass2").value;

      if (pass !== pass2) {
        alert("Şifreler eşleşmiyor!");
        return;
      }
      if (!pass || !pass2) {
        alert("Kutuları Doldurun!");
        return;
      }

      const body = {
        password: pass,
      };

      try {
        const res = await fetch(
          `https://chatapp-api-5smg.onrender.com/api/user/${user.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        let data = null;
        try {
          data = await res.json();
        } catch {}

        if (!res.ok) {
          alert(data?.message || "Şifre güncellenemedi!");
          return;
        }

        // LOCAL STORAGE PASSWORD UPDATE
        user.password = pass;
        localStorage.setItem("user", JSON.stringify(user));

        alert("Şifre güncellendi!");
      } catch (err) {
        console.error("Hata:", err);
        alert("Şifre güncellenirken hata oluştu.");
      }
    });
}
