(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(id) { return document.getElementById(id); }

  /* ---------- theme ---------- */
  function activeTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { window.localStorage.setItem("sr-theme", t); } catch (e) {}
  }
  function initTheme() {
    $("themeToggle").addEventListener("click", function () {
      applyTheme(activeTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ---------- nav scroll state + progress bar ---------- */
  function initScrollChrome() {
    var nav = $("nav");
    var bar = $("progressBar");
    var backToTop = $("backToTop");

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      nav.classList.toggle("scrolled", y > 8);
      backToTop.classList.toggle("visible", y > 500);

      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      bar.style.width = Math.min(100, (y / max) * 100) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- mobile nav ---------- */
  function initMobileNav() {
    var toggle = $("navToggle");
    var links = $("navLinks");

    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });

    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- active nav highlighting ---------- */
  function initActiveNav() {
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
    var sections = navLinks
      .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || !sections.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- hero entrance sequence ---------- */
  function initHeroReveal() {
    var items = document.querySelectorAll(".reveal[data-reveal]");
    if (reducedMotion) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    items.forEach(function (el) {
      var delay = parseInt(el.getAttribute("data-reveal"), 10) || 0;
      window.setTimeout(function () { el.classList.add("in"); }, 90 + delay * 90);
    });
  }

  /* ---------- scroll reveal for sections/cards ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal-io");
    if (!("IntersectionObserver" in window) || reducedMotion) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          window.setTimeout(function () { entry.target.classList.add("in"); }, i * 40);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initTheme();
    initScrollChrome();
    initMobileNav();
    initActiveNav();
    initHeroReveal();
    initScrollReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
