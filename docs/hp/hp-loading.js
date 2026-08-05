/**
 * Housingplaza TOP — session-first loading + first-view entrance.
 * Markup: #housing[data-hp-top] + [data-hp-loading]
 * sessionStorage key: hp-top-session-loaded
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hp-top-session-loaded";
  var MIN_MS = 1000;
  var FADE_MS = 850;

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function sessionSeen() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markSession() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function unlockScroll() {
    document.documentElement.classList.remove("hp-preload");
  }

  function enter(root) {
    root.classList.add("hp-is-entered");
    root.classList.remove("hp-is-loading");
    unlockScroll();
    markSession();
    window.dispatchEvent(new CustomEvent("hp:entered"));
  }

  function hideLoader(loading) {
    if (!loading) return;
    loading.hidden = true;
    loading.setAttribute("aria-hidden", "true");
    loading.removeAttribute("aria-busy");
  }

  ready(function () {
    var root = document.querySelector("#housing[data-hp-top]");
    if (!root || root.getAttribute("data-hp-loading-ready") === "1") return;
    root.setAttribute("data-hp-loading-ready", "1");

    var loading = root.querySelector("[data-hp-loading]");
    var scrollBtn = root.querySelector("[data-hp-hero-scroll]");
    var topics = root.querySelector(".hp-topics");

    function finishWithoutLoader() {
      hideLoader(loading);
      enter(root);
    }

    /* セッション再訪 / 減モーション → 即入場 */
    if (sessionSeen() || reduceMotion() || !loading) {
      document.documentElement.classList.remove("hp-preload");
      finishWithoutLoader();
    } else {
      root.classList.add("hp-is-loading");
      document.documentElement.classList.add("hp-preload");
      loading.hidden = false;
      loading.removeAttribute("hidden");
      loading.setAttribute("aria-busy", "true");
      loading.setAttribute("aria-hidden", "false");

      var started = Date.now();

      function endLoading() {
        var wait = Math.max(0, MIN_MS - (Date.now() - started));
        setTimeout(function () {
          root.classList.add("hp-end-loading");
          setTimeout(function () {
            hideLoader(loading);
            enter(root);
          }, FADE_MS);
        }, wait);
      }

      if (document.readyState === "complete") {
        endLoading();
      } else {
        window.addEventListener("load", endLoading, { once: true });
      }
    }

    /* スクロール矢印 → TOPICS へ */
    if (scrollBtn && topics) {
      if (!topics.id) topics.id = "hp-topics";
      scrollBtn.setAttribute("href", "#" + topics.id);

      var easeInOutCubic = function (t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      scrollBtn.addEventListener("click", function (event) {
        event.preventDefault();
        var top =
          topics.getBoundingClientRect().top +
          (window.scrollY || document.documentElement.scrollTop);
        var startY = window.scrollY || document.documentElement.scrollTop;
        var distance = top - startY;
        if (!distance) return;
        var duration = reduceMotion() ? 0 : 900;
        var startTime = performance.now();
        var step = function (now) {
          var progress = duration ? Math.min((now - startTime) / duration, 1) : 1;
          window.scrollTo(0, startY + distance * easeInOutCubic(progress));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });

      var syncScrollVisibility = function () {
        var scrolled =
          (window.scrollY || document.documentElement.scrollTop) > 0;
        scrollBtn.classList.toggle("is-hidden", scrolled);
      };
      window.addEventListener("scroll", syncScrollVisibility, { passive: true });
      syncScrollVisibility();
    }
  });
})();
