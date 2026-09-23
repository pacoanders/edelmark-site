/* EdelMark — lien WhatsApp
   Le numéro n'apparaît jamais en clair dans la page : il est stocké à l'envers
   et le lien n'est assemblé qu'au chargement, pour décourager les robots
   qui ramassent les numéros. Format : indicatif sans +, sans espaces, inversé.
   Exemple : 41 79 123 45 67 → "41791234567" → "76543219714". Vide = lien masqué. */
(function () {
  "use strict";
  var WA_CODE = "78314078714";
  var MESSAGE = "Bonjour, j'aimerais parler d'une formation IA pour mon équipe : ";

  var link = document.querySelector(".wa-link");
  if (!link || !/^\d{9,15}$/.test(WA_CODE)) return;
  var num = WA_CODE.split("").reverse().join("");
  link.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(MESSAGE);
  link.hidden = false;
})();

/* EdelMark — apparition des trois étapes, 1 puis 2 puis 3 */
(function () {
  "use strict";
  var steps = document.querySelector(".steps");
  if (!steps || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  steps.classList.add("anim");
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      io.disconnect();
      steps.classList.add("is-visible");
    }
  }, { threshold: 0.25 });
  io.observe(steps);
})();

/* EdelMark — comparateur avant/après */
(function () {
  "use strict";

  var cmp = document.querySelector(".cmp");
  if (!cmp) return;

  var frame  = cmp.querySelector(".cmp-frame");
  var range  = cmp.querySelector(".cmp-range");
  var search = cmp.querySelector(".app-search");
  var text   = cmp.querySelector(".app-search-text");
  var rows   = Array.prototype.slice.call(cmp.querySelectorAll(".app-table tbody tr"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mise à l'échelle de la scène 1000 × 600 ---------- */

  function fit() {
    cmp.style.setProperty("--scale", frame.clientWidth / 1000);
  }
  fit();
  if ("ResizeObserver" in window) {
    new ResizeObserver(fit).observe(frame);
  } else {
    window.addEventListener("resize", fit);
  }

  /* ---------- Position ---------- */

  function setPos(v) {
    cmp.style.setProperty("--pos", v + "%");
    range.value = Math.round(v);
    range.setAttribute("aria-valuetext",
      "Nouveau logiciel visible à " + Math.round(100 - v) + " %");
  }

  range.addEventListener("input", function () {
    setPos(Number(range.value));
  });

  /* ---------- Filtre du tableau ---------- */

  function normalize(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  var rowText = rows.map(function (tr) {
    return normalize(tr.cells[0].textContent + " " + tr.cells[1].textContent);
  });

  function filter(q) {
    var n = normalize(q);
    rows.forEach(function (tr, i) {
      tr.hidden = n !== "" && rowText[i].indexOf(n) === -1;
    });
  }

  function resetSearch() {
    text.textContent = "";
    search.classList.remove("is-typing");
    filter("");
  }

  /* ---------- Animation d'introduction (une seule fois) ---------- */

  if (reduceMotion) {
    setPos(50);
    return;
  }

  var timers = [];
  var raf = 0;
  var stopped = false;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    resetSearch();
    cleanup();
  }

  var userEvents = ["pointerdown", "touchstart", "keydown", "input"];
  function cleanup() {
    userEvents.forEach(function (e) { range.removeEventListener(e, stop); });
  }
  userEvents.forEach(function (e) {
    range.addEventListener(e, stop, { passive: true });
  });

  // cubic-bezier(.65, 0, .35, 1)
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function calc(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= (calc(t, x1, x2) - x) / s;
      }
      return calc(Math.min(Math.max(t, 0), 1), y1, y2);
    };
  }
  var ease = bezier(0.65, 0, 0.35, 1);

  function slide(from, to, duration, done) {
    var start = null;
    function step(now) {
      if (stopped) return;
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      setPos(from + (to - from) * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
      else done();
    }
    raf = requestAnimationFrame(step);
  }

  function typeWord(word, done) {
    search.classList.add("is-typing");
    word.split("").forEach(function (ch, i) {
      later(function () {
        text.textContent += ch;
        filter(text.textContent);
        if (i === word.length - 1) done();
      }, 70 * (i + 1));
    });
  }

  function play() {
    slide(100, 50, 1600, function () {
      later(function () {
        typeWord("palette", function () {
          later(function () {
            resetSearch();
            stopped = true;
            cleanup();
          }, 2500);
        });
      }, 300);
    });
  }

  setPos(100);

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        io.disconnect();
        if (!stopped) later(play, 250);
      }
    }, { threshold: 0.45 });
    io.observe(frame);
  } else {
    play();
  }
})();
