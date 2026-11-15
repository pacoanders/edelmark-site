/* EdelMark — images absentes restent un cadre vide, et les cartes se retournent. */
(function () {
  "use strict";

  document.querySelectorAll(".frame img").forEach(function (img) {
    var src = img.getAttribute("data-src");
    if (!src) return;
    var probe = new Image();
    probe.onload = function () {
      img.src = src;
      img.hidden = false;
    };
    probe.src = src;
  });

  document.querySelectorAll(".hanger").forEach(function (hanger) {
    var hit = hanger.querySelector(".hit");
    var front = hanger.querySelector(".front");
    var back = hanger.querySelector(".back");
    var backHit = hanger.querySelector(".back-hit");
    if (!hit || !front || !back || !backHit) return;

    function paint(on) {
      hanger.classList.toggle("is-flipped", on);
      if (!on) hanger.classList.remove("is-shut");
      hit.setAttribute("aria-pressed", on ? "true" : "false");
      hit.tabIndex = on ? -1 : 0;
      front.setAttribute("aria-hidden", on ? "true" : "false");
      back.setAttribute("aria-hidden", on ? "false" : "true");
      back.inert = !on;
    }

    function open(fromKeyboard) {
      hanger.classList.remove("is-shut");
      paint(true);
      if (fromKeyboard) backHit.focus();
      else hit.blur();
    }

    function close(fromKeyboard) {
      paint(false);
      hanger.classList.add("is-shut");
      if (fromKeyboard) hit.focus();
    }

    hit.addEventListener("click", function (event) {
      open(event.detail === 0);
    });

    back.addEventListener("click", function (event) {
      if (event.target.closest("a")) return;
      close(event.detail === 0);
    });

    hanger.addEventListener("mouseleave", function () {
      hanger.classList.remove("is-shut");
    });

    paint(false);
  });
})();
