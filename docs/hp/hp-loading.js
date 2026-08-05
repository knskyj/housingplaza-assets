/**
 * Housingplaza TOP — session-first loading + first-view entrance.
 * Markup: #housing[data-hp-top] + [data-hp-loading]
 * sessionStorage key: hp-top-session-loaded
 * Force replay: ?hp-loading=1
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hp-top-session-loaded";
  var MIN_MS = 1600;
  var FADE_MS = 600;

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function forceLoading() {
    try {
      return /(?:^|[?&])hp-loading=1(?:&|$)/.test(location.search);
    } catch (e) {
      return false;
    }
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

  function clearSession() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  function unlockScroll() {
    document.documentElement.classList.remove("hp-preload");
  }

  function enter(root) {
    /* 先に入場クラス → 次フレームでスクロール解除（遷移の開始点を確保） */
    root.classList.add("hp-await-enter");
    root.classList.remove("hp-is-loading");
    requestAnimationFrame(function () {
      root.classList.add("hp-is-entered");
      requestAnimationFrame(function () {
        unlockScroll();
        markSession();
        window.dispatchEvent(new CustomEvent("hp:entered"));
      });
    });
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
    var forced = forceLoading();

    if (forced) clearSession();

    function finishWithoutLoader() {
      hideLoader(loading);
      unlockScroll();
      root.classList.remove("hp-await-enter");
      root.classList.add("hp-is-entered");
      markSession();
      window.dispatchEvent(new CustomEvent("hp:entered"));
    }

    /* セッション再訪 / 減モーション → 即表示（強制時は除く） */
    if (!forced && (sessionSeen() || reduceMotion() || !loading)) {
      finishWithoutLoader();
    } else {
      root.classList.add("hp-is-loading", "hp-await-enter");
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
