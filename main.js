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

  // Stats count-up: animate numbers when section is in view
  const statsWrap = document.querySelector(".our-story__stats-wrap");
  const statNumEls = document.querySelectorAll(".our-story__stat-num");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (statsWrap && statNumEls.length && !prefersReducedMotion) {
    function parseStatValue(text) {
      const match = String(text)
        .trim()
        .match(/^(\d+)(.*)$/);
      if (!match) return { value: 0, suffix: "" };
      return { value: parseInt(match[1], 10), suffix: match[2] };
    }

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function startValueFor(target) {
      if (target <= 100) return Math.max(0, Math.floor(target * 0.75));
      return Math.floor(target * 0.95);
    }

    function animateValue(el, targetValue, suffix, durationMs) {
      const start = performance.now();
      const startVal = startValueFor(targetValue);
      let lastShown = -1;

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeOutQuart(progress);
        const current = Math.round(startVal + (targetValue - startVal) * eased);
        if (current !== lastShown) {
          lastShown = current;
          el.textContent = current + suffix;
        }
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    let hasAnimated = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasAnimated) return;
        hasAnimated = true;
        const duration = 1000;
        statNumEls.forEach((el) => {
          const { value, suffix } = parseStatValue(el.textContent);
          const startVal = startValueFor(value);
          el.textContent = startVal + suffix;
          animateValue(el, value, suffix, duration);
        });
      },
      { threshold: 0.25, rootMargin: "0px" },
    );
    observer.observe(statsWrap);
  }

  // FAQ accordion: optional single-open behaviour (close others when one opens)
  const accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    const detailsList = accordion.querySelectorAll(".faq-details");
    detailsList.forEach((details) => {
      details.addEventListener("toggle", () => {
        if (details.open) {
          detailsList.forEach((d) => {
            if (d !== details) d.open = false;
          });
        }
      });
    });
  }

  // Testimonial carousel (homepage) — fade in/out
  const testimonialsSection = document.querySelector(".testimonials");
  if (testimonialsSection) {
    const slides = testimonialsSection.querySelectorAll(".testimonials__slide");
    const list = testimonialsSection.querySelector(".testimonials__list");
    const prevBtn = testimonialsSection.querySelector(".testimonials__prev");
    const nextBtn = testimonialsSection.querySelector(".testimonials__next");
    const slider = testimonialsSection.querySelector(".testimonials__slider");
    let currentIndex = 0;
    const total = slides.length;
    const autoplayInterval = 7000;
    let autoplayTimer = null;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion && list)
      list.classList.add("testimonials__list--no-motion");

    function setAriaHidden() {
      slides.forEach((slide, i) => {
        slide.setAttribute(
          "aria-hidden",
          i !== currentIndex ? "true" : "false",
        );
      });
    }

    function showTestimonial(index) {
      const nextIndex = (index + total) % total;
      if (nextIndex === currentIndex) return;
      slides[currentIndex].classList.remove("testimonials__slide--current");
      currentIndex = nextIndex;
      slides[currentIndex].classList.add("testimonials__slide--current");
      setAriaHidden();
    }

    slides[0].classList.add("testimonials__slide--current");
    setAriaHidden();

    function startAutoplay() {
      if (prefersReducedMotion || autoplayTimer || document.hidden) return;
      autoplayTimer = setInterval(() => {
        showTestimonial(currentIndex + 1);
      }, autoplayInterval);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      if (!prefersReducedMotion) startAutoplay();
    }

    prevBtn?.addEventListener("click", () => {
      showTestimonial(currentIndex - 1);
      resetAutoplay();
    });
    nextBtn?.addEventListener("click", () => {
      showTestimonial(currentIndex + 1);
      resetAutoplay();
    });

    // Pause when user hovers or focuses inside the testimonial area
    if (slider) {
      slider.addEventListener("mouseenter", stopAutoplay);
      slider.addEventListener("mouseleave", startAutoplay);
      slider.addEventListener("focusin", stopAutoplay);
      slider.addEventListener("focusout", startAutoplay);
    }

    // Pause when tab is hidden, resume when visible
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        resetAutoplay();
      }
    });

    if (!prefersReducedMotion) startAutoplay();
  }
});
