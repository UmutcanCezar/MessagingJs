const register = document.querySelector("#register-form");
const registerbg = document.querySelector("#register-form .form-bg");
register.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("registerName").value;
  const lname = document.getElementById("registerLname").value;
  const email = document.getElementById("registerEmail").value;
  const rPass = document.getElementById("registerPass").value;
  const rPass2 = document.getElementById("registerPass2").value;
  const user = {
    Username: name + " " + lname,
    EmailAddress: email,
    Password: rPass,
  };

  const oldAlert = register.querySelector(".alert");
  if (oldAlert) oldAlert.remove();
  if (
    user.Username.trim().length == 0 ||
    user.Username.trim().length == 0 ||
    user.Username.trim().length == 0
  ) {
    registerbg.insertAdjacentHTML(
      "afterbegin",
      `<div class="alert alert-info">
      Boş Bırakılan Alanları Doldurunuz
   </div>`
    );
  } else if (rPass.value != rPass2.value) {
    register.insertAdjacentHTML(
      "afterbegin",
      `<div class="alert alert-info">
      Girdiğiniz Şifreler Birbirinden Farklı!
   </div>`
    );
  } else {
    try {
      const response = await fetch(
        "https://chatapp-api-5smg.onrender.com/api/User/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      if (!response.ok) {
        const errText = await response.text(); // ✅ string olarak oku
        registerbg.insertAdjacentHTML(
          "afterbegin",
          `<div class="alert alert-info">
          ${errText}
          </div>`
        );
        return;
      }
    } catch (err) {
      registerbg.insertAdjacentHTML(
        "afterbegin",
        `<div class="alert alert-info">
          Sunucu Hatası!
          </div>`
      );
    }
  }
});
