/**
 * Housingplaza hero — fade slideshow + zoom-out (no Crafto / Swiper / jQuery).
 * Markup: #housing [data-hp-hero]
 */
(function () {
  "use strict";

  var INTERVAL_MS = 5000;
  var FADE_MS = 2000;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  ready(function () {
    var root = document.querySelector("#housing [data-hp-hero]");
    if (!root || root.getAttribute("data-hp-ready") === "1") return;
    root.setAttribute("data-hp-ready", "1");

    var housing = document.querySelector("#housing");
    var waitEnter =
      housing &&
      housing.hasAttribute("data-hp-top") &&
      !housing.classList.contains("hp-is-entered");

    var slides = Array.prototype.slice.call(
      root.querySelectorAll("[data-hp-hero-slide]")
    );
    if (slides.length < 2) return;

    var index = slides.findIndex(function (el) {
      return el.classList.contains("is-active");
    });
    if (index < 0) {
      index = 0;
      slides[0].classList.add("is-active");
    }

    var timer = null;
    var fading = false;
    var started = false;

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function schedule() {
      clearTimer();
      if (!started || reduceMotion() || document.hidden) return;
      timer = setTimeout(next, INTERVAL_MS);
    }

    function restartZoom(el) {
      var media = el.querySelector(".hp-hero__media");
      if (!media) return;
      el.classList.remove("is-settled");
      media.style.animation = "none";
      // force reflow so zoom restarts on every activation
      void media.offsetWidth;
      media.style.animation = "";
    }

    function next() {
      if (fading || slides.length < 2) return;
      fading = true;
      var cur = slides[index];
      var nextIndex = (index + 1) % slides.length;
      var nxt = slides[nextIndex];

      /* 退場スライドはズーム完了位置のままフェードアウト */
      cur.classList.add("is-settled");
      cur.classList.remove("is-active");
      cur.classList.add("is-leaving");

      nxt.classList.remove("is-settled");
      nxt.classList.add("is-active");
      restartZoom(nxt);
      index = nextIndex;

      setTimeout(function () {
        cur.classList.remove("is-leaving");
        fading = false;
        schedule();
      }, reduceMotion() ? 0 : FADE_MS);
    }

    function start() {
      if (started) return;
      started = true;
      restartZoom(slides[index]);
      schedule();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearTimer();
      else schedule();
    });

    if (waitEnter) {
      window.addEventListener("hp:entered", start, { once: true });
      /* フォールバック: ローディングJS未読込でも開始 */
      setTimeout(function () {
        if (!started) start();
      }, 4000);
    } else {
      start();
    }
  });
})();
