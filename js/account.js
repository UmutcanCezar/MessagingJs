const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
  window.location.href = "index.html";
} else {
  // Kullanıcı Bilgileri Güncelleme
  const userSettings = document.querySelector("#userSettings");
  const infoForm = document.getElementById("infoForm");
  const passwordForm = document.getElementById("passwordForm");

  infoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Eski alert varsa kaldır
    const oldAlert = infoForm.querySelector(".alert");
    if (oldAlert) oldAlert.remove();

    const body = {
      username: document.getElementById("ad").value.trim() || null,
      emailAddress: document.getElementById("eposta").value.trim() || null,
    };

    if (!body.username && !body.emailAddress) {
      infoForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
          En az bir alanı doldurmalısınız.
        </div>`
      );
      return;
    }

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
        infoForm.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-danger">
            ${data?.message || "Güncelleme başarısız!"}
          </div>`
        );
        return;
      }

      // LOCAL STORAGE GÜNCELLE
      if (body.username) user.username = body.username;
      if (body.emailAddress) user.emailAddress = body.emailAddress;
      localStorage.setItem("user", JSON.stringify(user));

      infoForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-success">
          Bilgiler başarıyla güncellendi.
        </div>`
      );
    } catch (err) {
      console.error(err);
      infoForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-danger">
          Bir hata oluştu.
        </div>`
      );
    }
  });

  // Şifre Güncelleme
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Eski alert varsa kaldır
    const oldAlert = passwordForm.querySelector(".alert");
    if (oldAlert) oldAlert.remove();

    const pass = document.getElementById("pass").value.trim();
    const pass2 = document.getElementById("pass2").value.trim();

    if (!pass || !pass2) {
      passwordForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
          Şifre kutularını doldurmalısınız.
        </div>`
      );
      return;
    }

    if (pass !== pass2) {
      passwordForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
          Şifreler eşleşmiyor!
        </div>`
      );
      return;
    }

    const body = { password: pass };

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
        passwordForm.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-danger">
            ${data?.message || "Şifre güncellenemedi!"}
          </div>`
        );
        return;
      }

      // LOCAL STORAGE UPDATE
      user.password = pass;
      localStorage.setItem("user", JSON.stringify(user));

      passwordForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-success">
          Şifre başarıyla güncellendi.
        </div>`
      );
    } catch (err) {
      console.error(err);
      passwordForm.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-danger">
          Şifre güncellenirken hata oluştu.
        </div>`
      );
    }
  });
}
