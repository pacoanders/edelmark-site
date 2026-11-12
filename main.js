/* EdelMark — lien WhatsApp
   Le numéro n'apparaît jamais en clair dans la page : il est stocké à l'envers
   et le lien n'est assemblé qu'au chargement, pour décourager les robots
   qui ramassent les numéros. Format : indicatif sans +, sans espaces, inversé.
   Vide = lien masqué. */
(function () {
  "use strict";
  var WA_CODE = "78314078714";
  var MESSAGE = "Bonjour, j\u2019aimerais un audit pour mon commerce\u202f: ";

  var link = document.querySelector(".wa-link");
  if (!link || !/^\d{9,15}$/.test(WA_CODE)) return;
  var num = WA_CODE.split("").reverse().join("");
  link.href = "https://wa.me/" + num + "?text=" + encodeURIComponent(MESSAGE);
  link.hidden = false;
})();

/* EdelMark — comparateur. Le visiteur déplace le trait, rien ne joue seul. */
(function () {
  "use strict";

  var cmp = document.querySelector(".cmp");
  if (!cmp) return;

  var frame = cmp.querySelector(".cmp-frame");
  var range = cmp.querySelector(".cmp-range");

  function fit() {
    cmp.style.setProperty("--scale", frame.clientWidth / 1000);
  }
  fit();
  if ("ResizeObserver" in window) {
    new ResizeObserver(fit).observe(frame);
  } else {
    window.addEventListener("resize", fit);
  }

  function setPos(v) {
    var n = Math.min(100, Math.max(0, Number(v)));
    cmp.style.setProperty("--pos", n + "%");
    range.value = String(Math.round(n));
    range.setAttribute("aria-valuetext",
      "Outil propre visible à " + Math.round(100 - n) + " %");
  }

  range.addEventListener("input", function () {
    setPos(range.value);
  });

  setPos(range.value);
})();
