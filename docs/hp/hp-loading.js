/**
 * Housingplaza TOP — session-first loading + every-reload entrance.
 * - Loading spinner: once per session (sessionStorage)
 * - Header / hero copy / topics entrance: every reload
 * Markup: #housing[data-hp-top] + [data-hp-loading]
 * Force loading: ?hp-loading=1  /  hold: ?hp-loading=hold
 */
(function () {
  "use strict";

  var STORAGE_KEY = "hp-top-session-loaded";
  var MIN_MS = 1600;
  var FADE_MS = 400;

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function forceLoading() {
    try {
      return /(?:^|[?&])hp-loading=(?:1|hold)(?:&|$)/.test(location.search);
    } catch (e) {
      return false;
    }
  }

  function holdLoading() {
    try {
      return /(?:^|[?&])hp-loading=hold(?:&|$)/.test(location.search);
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

  function hideLoader(loading) {
    if (!loading) return;
    loading.hidden = true;
    loading.setAttribute("aria-hidden", "true");
    loading.removeAttribute("aria-busy");
    loading.classList.remove("is-active", "is-leaving");
  }

  /** 入場アニメ再生（ローディング完了後） */
  function playEntrance(root, opts) {
    var shouldMark = !opts || opts.mark !== false;
    root.classList.add("hp-await-enter");
    root.classList.remove("hp-is-loading", "hp-end-loading");
    /* すでに隠し状態なら外さず、そのまま入場へ */
    root.classList.remove("hp-is-entered");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("hp-is-entered");
        unlockScroll();
        if (shouldMark) markSession();
        window.dispatchEvent(new CustomEvent("hp:entered"));
      });
    });
  }

  /** ローディングなしで入場のみ（リロード毎回） */
  function enterWithoutLoader(root, loading) {
    hideLoader(loading);
    unlockScroll();
    root.classList.add("hp-await-enter");
    root.classList.remove("hp-is-entered", "hp-is-loading", "hp-end-loading");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("hp-is-entered");
        markSession();
        window.dispatchEvent(new CustomEvent("hp:entered"));
      });
    });
  }

  function enterInstant(root, loading) {
    hideLoader(loading);
    unlockScroll();
    root.classList.remove("hp-await-enter", "hp-is-loading", "hp-end-loading");
    root.classList.add("hp-is-entered");
    markSession();
    window.dispatchEvent(new CustomEvent("hp:entered"));
  }

  ready(function () {
    var root = document.querySelector("#housing[data-hp-top]");
    if (!root || root.getAttribute("data-hp-loading-ready") === "1") return;
    root.setAttribute("data-hp-loading-ready", "1");

    var loading = root.querySelector("[data-hp-loading]") ||
      document.querySelector("body > .hp-loading[data-hp-loading]");
    var scrollBtn = root.querySelector("[data-hp-hero-scroll]");
    var topics = root.querySelector(".hp-topics");
    var forced = forceLoading() || holdLoading();

    if (forced) clearSession();

    if (loading && loading.parentElement !== document.body) {
      document.body.appendChild(loading);
    }

    var skipLoader =
      !forced && (sessionSeen() || !loading);

    if (reduceMotion()) {
      enterInstant(root, loading);
    } else if (skipLoader) {
      enterWithoutLoader(root, loading);
    } else {
      root.classList.add("hp-is-loading", "hp-await-enter");
      root.classList.remove("hp-is-entered");
      document.documentElement.classList.add("hp-preload");
      loading.hidden = false;
      loading.removeAttribute("hidden");
      loading.classList.add("is-active");
      loading.setAttribute("aria-busy", "true");
      loading.setAttribute("aria-hidden", "false");

      if (holdLoading()) {
        return;
      }

      var started = Date.now();

      function endLoading() {
        var wait = Math.max(0, MIN_MS - (Date.now() - started));
        setTimeout(function () {
          /* オーバーレイ退場と入場を同時に（画像だけ先に見えてローディングが残るのを防ぐ） */
          root.classList.add("hp-end-loading");
          loading.classList.add("is-leaving");
          playEntrance(root, { mark: true });
          setTimeout(function () {
            hideLoader(loading);
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

      var smoothScrollTo = function (targetY, duration) {
        var startY = window.scrollY || document.documentElement.scrollTop;
        var distance = targetY - startY;
        if (!distance) return;
        var dur = reduceMotion() ? 0 : duration;
        var startTime = performance.now();
        var step = function (now) {
          var progress = dur ? Math.min((now - startTime) / dur, 1) : 1;
          window.scrollTo(0, startY + distance * easeInOutCubic(progress));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      scrollBtn.addEventListener("click", function (event) {
        event.preventDefault();
        var top =
          topics.getBoundingClientRect().top +
          (window.scrollY || document.documentElement.scrollTop);
        smoothScrollTo(Math.max(0, top), 900);
      });

      /* ページ上部へボタン */
      var pageTop = document.querySelector(".hp-pagetop");
      if (!pageTop) {
        pageTop = document.createElement("a");
        pageTop.className = "hp-pagetop";
        pageTop.href = "#housing";
        pageTop.setAttribute("aria-label", "ページ上部へ");
        pageTop.innerHTML =
          '<span class="hp-pagetop__icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
          "</svg></span>";
        document.body.appendChild(pageTop);
      }

      pageTop.addEventListener("click", function (event) {
        event.preventDefault();
        smoothScrollTo(0, 900);
      });

      var syncScrollVisibility = function () {
        var scrolled =
          (window.scrollY || document.documentElement.scrollTop) > 80;
        scrollBtn.classList.toggle("is-hidden", scrolled);
        pageTop.classList.toggle("is-visible", scrolled);
      };
      window.addEventListener("scroll", syncScrollVisibility, { passive: true });
      syncScrollVisibility();
    }
  });
})();
