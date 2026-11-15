/* EdelMark — cadres vides, cartes suspendues, verso qui suit le pointeur. */
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

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var cards = [];

  document.querySelectorAll(".hanger").forEach(function (hanger, index) {
    var hit = hanger.querySelector(".hit");
    var front = hanger.querySelector(".front");
    var back = hanger.querySelector(".back");
    var backHit = hanger.querySelector(".back-hit");
    var scene = hanger.querySelector(".scene");
    if (!hit || !front || !back || !backHit || !scene) return;

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

    var drop = parseFloat(hanger.style.getPropertyValue("--drop")) || 24;
    var card = {
      el: hanger,
      scene: scene,
      len: 200 + drop * 2.4,
      ang: (index - 1.5) * 0.045,
      vel: (index % 2 ? 0.11 : -0.09),
      phase: index * 1.9,
      rate: 0.72 + index * 0.11,
      tracking: false,
      px: 0.5,
      py: 0.35,
      rx: 0,
      ry: 0,
      gx: 46,
      gy: 34
    };
    cards.push(card);

    hanger.addEventListener("pointermove", function (event) {
      if (reduce.matches || event.pointerType === "touch") return;
      if (hanger.classList.contains("is-shut")) {
        card.tracking = false;
        return;
      }
      var box = scene.getBoundingClientRect();
      if (!box.width || !box.height) return;
      card.tracking = true;
      card.px = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
      card.py = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    });

    hanger.addEventListener("pointerleave", function () {
      card.tracking = false;
    });

    paint(false);
  });

  function damp(current, target, dt, rate) {
    return current + (target - current) * Math.min(1, dt * rate);
  }

  var last = 0;
  var raf = 0;

  function tick(now) {
    var dt = Math.min(0.032, last ? (now - last) / 1000 : 0.016);
    last = now;
    var t = now / 1000;

    cards.forEach(function (card) {
      var showing = card.tracking && !card.el.classList.contains("is-shut");
      var acc = -(1280 / card.len) * Math.sin(card.ang);
      if (!showing) {
        acc += Math.sin(t * card.rate + card.phase) * 0.16;
        acc += Math.sin(t * card.rate * 1.8 + card.phase * 2) * 0.05;
      } else {
        acc += -card.ang * 8;
      }
      card.vel = (card.vel + acc * dt) * Math.exp((showing ? -3.2 : -0.42) * dt);
      card.ang += card.vel * dt;
      if (card.ang > 0.1) {
        card.ang = 0.1;
        if (card.vel > 0) card.vel *= -0.2;
      }
      if (card.ang < -0.1) {
        card.ang = -0.1;
        if (card.vel < 0) card.vel *= -0.2;
      }

      var deg = card.ang * 180 / Math.PI;
      var velDeg = card.vel * 180 / Math.PI;
      var targetRx;
      var targetRy;
      var targetGx;
      var targetGy;

      if (showing) {
        targetRy = (0.5 - card.px) * 18;
        targetRx = (card.py - 0.5) * 14;
        targetGx = card.px * 100;
        targetGy = card.py * 100;
      } else {
        targetRx = Math.max(-5, Math.min(5, -velDeg * 1.1));
        targetRy = deg * 0.35;
        targetGx = Math.max(12, Math.min(88, 50 + deg * 4.2 + velDeg * 1.4));
        targetGy = Math.max(16, Math.min(84, 40 - deg * 1.1 + velDeg * 2));
      }

      card.rx = damp(card.rx, targetRx, dt, showing ? 14 : 8);
      card.ry = damp(card.ry, targetRy, dt, showing ? 14 : 8);
      card.gx = damp(card.gx, targetGx, dt, showing ? 11 : 6);
      card.gy = damp(card.gy, targetGy, dt, showing ? 11 : 6);

      card.el.style.setProperty("--hang", deg.toFixed(2) + "deg");
      card.el.style.setProperty("--rx", card.rx.toFixed(2) + "deg");
      card.el.style.setProperty("--ry", card.ry.toFixed(2) + "deg");
      card.el.style.setProperty("--gx", card.gx.toFixed(1) + "%");
      card.el.style.setProperty("--gy", card.gy.toFixed(1) + "%");
    });

    raf = window.requestAnimationFrame(tick);
  }

  function start() {
    if (raf || reduce.matches) return;
    last = 0;
    raf = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
    cards.forEach(function (card) {
      card.el.style.removeProperty("--hang");
      card.el.style.removeProperty("--rx");
      card.el.style.removeProperty("--ry");
      card.el.style.removeProperty("--gx");
      card.el.style.removeProperty("--gy");
    });
  }

  if (!reduce.matches) start();
  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (reduce.matches) stop();
      else start();
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else if (!reduce.matches) {
      start();
    }
  });
})();
