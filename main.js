/* EdelMark — menu, panneau des offres, phrase qui s’écrit au défilement. */
(function () {
  "use strict";

  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  var drop = document.querySelector(".nav-drop");
  var panel = document.getElementById("offres-panel");
  var statement = document.querySelector(".statement");
  var desktop = window.matchMedia("(min-width: 960px)");
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var openTimer = 0;
  var closeTimer = 0;

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    var label = menuBtn.querySelector(".visually-hidden");
    if (label) label.textContent = open ? "Fermer" : "Menu";
  }

  function setMega(open) {
    if (!drop || !panel || !desktop.matches) {
      if (panel) panel.hidden = true;
      document.documentElement.classList.remove("mega-open");
      return;
    }
    drop.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    if (open) {
      document.documentElement.style.setProperty("--mega", panel.offsetHeight + "px");
      document.documentElement.classList.add("mega-open");
    } else {
      document.documentElement.classList.remove("mega-open");
    }
  }

  function scheduleMega(open) {
    window.clearTimeout(openTimer);
    window.clearTimeout(closeTimer);
    if (open) openTimer = window.setTimeout(function () { setMega(true); }, 150);
    else closeTimer = window.setTimeout(function () { setMega(false); }, 120);
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  if (drop && panel) {
    drop.addEventListener("click", function () {
      if (!desktop.matches) return;
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      setMega(panel.hidden);
    });
    drop.addEventListener("mouseenter", function () { scheduleMega(true); });
    drop.addEventListener("mouseleave", function () { scheduleMega(false); });
    drop.addEventListener("focus", function () { setMega(true); });
    panel.addEventListener("mouseenter", function () {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
    });
    panel.addEventListener("mouseleave", function () { scheduleMega(false); });
    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMega(false);
    });
    var zone = document.querySelector(".nav-offres");
    zone.addEventListener("focusout", function (event) {
      if (!zone.contains(event.relatedTarget)) setMega(false);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    setMenu(false);
    setMega(false);
  });

  document.addEventListener("click", function (event) {
    if (!panel || panel.hidden) return;
    if (event.target.closest(".nav-offres") || event.target.closest(".mega")) return;
    setMega(false);
  });

  window.addEventListener("resize", function () {
    if (desktop.matches) setMenu(false);
    else setMega(false);
  });

  if (statement && !motion.matches) {
    var words = statement.querySelectorAll(".w");
    statement.classList.add("is-live");

    function paint() {
      var rect = statement.getBoundingClientRect();
      var start = window.innerHeight * 0.72;
      var travel = Math.max(rect.height, 1);
      var passed = start - rect.top;
      var progress = Math.min(1, Math.max(0, passed / travel));
      var cut = progress * words.length;
      for (var i = 0; i < words.length; i++) {
        words[i].classList.toggle("is-on", i < cut);
      }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        paint();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    paint();
  }
})();
