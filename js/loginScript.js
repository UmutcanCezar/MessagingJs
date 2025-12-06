const loginForm = document.querySelector("#login-form");
const loginFormbg = document.querySelector("#login-form .form-bg");
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
  window.location.href = "chat.html";
} else {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();

    // Önce eski alert'leri kaldır
    const oldAlert = loginFormbg.querySelector(".alert");
    if (oldAlert) oldAlert.remove();

    // Boş alan kontrolü
    if (!email || !pass) {
      loginFormbg.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
        Boş Bırakılan Alanları Doldurun!
      </div>`
      );
      return;
    }

    const body = { email, password: pass };

    try {
      const response = await fetch(
        "https://chatapp-api-5smg.onrender.com/api/User/Login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        loginFormbg.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-info">${err}</div>`
        );
        return;
      }

      const data = await response.json();

      // user bilgisini localStorage'a kaydet
      localStorage.setItem("user", JSON.stringify(data.user));

      // Token varsa kaydet
      if (data.token) localStorage.setItem("token", data.token);

      // Giriş başarılı → chat sayfasına yönlendir
      window.location.href = "chat.html";
    } catch (err) {
      loginFormbg.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-danger">
        Sunucu Hatası!
      </div>`
      );
    }
  });
}
