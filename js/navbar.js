// navbar.js

if (!user) {
  alert("Bu sayfaya erişmek için giriş yapmalısınız.");
  window.location.href = "index.html";
} else {
  const navdropdown = document.querySelector("#nav-dropdown");
  const dropdownexit = document.querySelector("#dropdown-exit");

  // Navbar kullanıcı adını göster
  if (navdropdown) navdropdown.textContent = user.username;

  // Çıkış butonu
  if (dropdownexit) {
    dropdownexit.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
}
