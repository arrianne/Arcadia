document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const navOverlay = document.getElementById("nav-overlay");
  const scrollThreshold = 50;

  // Hero intro: only animate on first visit to homepage this session
  const hero = document.querySelector(".hero.hero--full");
  const isHomepage =
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/index.html");
  if (hero && isHomepage) {
    if (sessionStorage.getItem("heroIntroSeen")) {
      hero.classList.add("hero--skip-intro");
    } else {
      const introDuration = 3600 + 800; // copy delay + fade duration (ms)
      window.setTimeout(() => {
        sessionStorage.setItem("heroIntroSeen", "1");
      }, introDuration);
    }
  }

  function handleScroll() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  function toggleNav() {
    const isOpen = header.classList.toggle("is-nav-open");
    navToggle?.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function closeNav() {
    header.classList.remove("is-nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  navToggle?.addEventListener("click", toggleNav);

  navOverlay?.addEventListener("click", (e) => {
    if (e.target === navOverlay || e.target.closest(".nav--mobile a")) {
      closeNav();
    }
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll(); // Run once in case page loads scrolled

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
