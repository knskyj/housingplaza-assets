/**
 * Housingplaza TOP — loading every visit + entrance after hero image ready.
 * Markup: #housing[data-hp-top] + [data-hp-loading]
 * Hold: ?hp-loading=hold
 */
(function () {
  "use strict";

  var MIN_MS = 1200;
  var FADE_MS = 400;
  var HERO_IMAGE_TIMEOUT = 5000;

  function reduceMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
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

  function firstHeroImageUrl(root) {
    var hero = root.querySelector("[data-hp-hero]");
    if (!hero) return "";
    var fromHero = /url\(["']?([^"')]+)["']?\)/.exec(hero.style.backgroundImage || "");
    if (fromHero && fromHero[1]) return fromHero[1];
    var media = root.querySelector(".hp-hero__media");
    if (!media) return "";
    var fromMedia = /url\(["']?([^"')]+)["']?\)/.exec(media.style.backgroundImage || "");
    return fromMedia ? fromMedia[1] : "";
  }

  function waitForImage(url, timeoutMs) {
    return new Promise(function (resolve) {
      if (!url) {
        resolve(false);
        return;
      }
      var done = false;
      var finish = function (ok) {
        if (done) return;
        done = true;
        resolve(!!ok);
      };
      var img = new Image();
      img.onload = function () {
        if (img.decode) {
          img.decode().then(function () { finish(true); }).catch(function () { finish(true); });
        } else {
          finish(true);
        }
      };
      img.onerror = function () { finish(false); };
      img.src = url;
      if (img.complete && img.naturalWidth) finish(true);
      setTimeout(function () { finish(false); }, timeoutMs || HERO_IMAGE_TIMEOUT);
    });
  }

  function applyHeroFallback(root, url) {
    var hero = root.querySelector("[data-hp-hero]");
    if (!hero || !url) return;
    if (!hero.style.backgroundImage) {
      hero.style.backgroundImage = 'url("' + url + '")';
    }
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

  function playEntrance(root) {
    root.classList.add("hp-await-enter");
    root.classList.remove("hp-is-loading", "hp-end-loading", "hp-is-entered");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("hp-is-entered");
        unlockScroll();
        window.dispatchEvent(new CustomEvent("hp:entered"));
      });
    });
  }

  function enterWithoutLoader(root, loading) {
    hideLoader(loading);
    unlockScroll();
    root.classList.add("hp-await-enter");
    root.classList.remove("hp-is-entered", "hp-is-loading", "hp-end-loading");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("hp-is-entered");
        window.dispatchEvent(new CustomEvent("hp:entered"));
      });
    });
  }

  function enterInstant(root, loading) {
    hideLoader(loading);
    unlockScroll();
    root.classList.remove("hp-await-enter", "hp-is-loading", "hp-end-loading");
    root.classList.add("hp-is-entered");
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

    if (loading && loading.parentElement !== document.body) {
      document.body.appendChild(loading);
    }

    var heroUrl = firstHeroImageUrl(root);
    applyHeroFallback(root, heroUrl);

    /* マークアップが無いときだけスキップ。毎回ローディング表示 */
    var skipLoader = !loading;

    if (reduceMotion()) {
      enterInstant(root, loading);
    } else if (skipLoader) {
      waitForImage(heroUrl, HERO_IMAGE_TIMEOUT).then(function () {
        enterWithoutLoader(root, loading);
      });
    } else {
      root.classList.add("hp-is-loading", "hp-await-enter");
      root.classList.remove("hp-is-entered");
      document.documentElement.classList.add("hp-preload");
      loading.hidden = false;
      loading.removeAttribute("hidden");
      loading.classList.add("is-active");
      loading.setAttribute("aria-busy", "true");
      loading.setAttribute("aria-hidden", "false");

      if (holdLoading()) return;

      var started = Date.now();

      function endLoading() {
        var minWait = Math.max(0, MIN_MS - (Date.now() - started));
        Promise.all([
          new Promise(function (r) { setTimeout(r, minWait); }),
          waitForImage(heroUrl, HERO_IMAGE_TIMEOUT),
        ]).then(function () {
          root.classList.add("hp-end-loading");
          loading.classList.add("is-leaving");
          playEntrance(root);
          setTimeout(function () {
            hideLoader(loading);
          }, FADE_MS);
        });
      }

      if (document.readyState === "complete") endLoading();
      else window.addEventListener("load", endLoading, { once: true });
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
        var scrollY = window.scrollY || document.documentElement.scrollTop;
        var scrolled = scrollY > 80;
        var doc = document.documentElement;
        var atBottom =
          scrolled &&
          scrollY + window.innerHeight >= doc.scrollHeight - 48;
        scrollBtn.classList.toggle("is-hidden", scrolled);
        pageTop.classList.toggle("is-visible", scrolled);
        pageTop.classList.toggle("is-at-bottom", atBottom);
      };
      window.addEventListener("scroll", syncScrollVisibility, { passive: true });
      window.addEventListener("resize", syncScrollVisibility, { passive: true });
      syncScrollVisibility();
    }
  });
})();
