/**
 * Housingplaza — site-wide page fade.
 * サイト内リンクはフェードアウト後に遷移。着地はフェードイン。
 * TOP 初回ローディング中はフェードインをスキップ（hp:entered 待ち）。
 */
(function () {
  "use strict";

  var FADE_MS = 380;

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

  function sameOrigin(url) {
    try {
      return new URL(url, location.href).origin === location.origin;
    } catch (e) {
      return false;
    }
  }

  function shouldIntercept(anchor) {
    if (!anchor || anchor.tagName !== "A") return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (anchor.hasAttribute("download")) return false;
    if (anchor.getAttribute("data-hp-no-fade") != null) return false;
    var href = anchor.getAttribute("href");
    if (!href || href.charAt(0) === "#") return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (!sameOrigin(href)) return false;
    try {
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.search === location.search) {
        return false;
      }
    } catch (e) {
      return false;
    }
    return true;
  }

  document.documentElement.classList.add("hp-page");

  ready(function () {
    if (reduceMotion()) {
      document.documentElement.classList.add("hp-page-enter");
      return;
    }

    var topLoading =
      document.documentElement.classList.contains("hp-preload") &&
      !!document.querySelector("#housing[data-hp-top]");

    if (topLoading) {
      window.addEventListener(
        "hp:entered",
        function () {
          document.documentElement.classList.add("hp-page-enter");
        },
        { once: true }
      );
      setTimeout(function () {
        document.documentElement.classList.add("hp-page-enter");
      }, 8000);
    } else {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.documentElement.classList.add("hp-page-enter");
        });
      });
    }

    document.addEventListener(
      "click",
      function (event) {
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        var anchor = event.target.closest && event.target.closest("a");
        if (!shouldIntercept(anchor)) return;

        event.preventDefault();
        var href = anchor.href;
        document.documentElement.classList.remove("hp-page-enter");
        document.documentElement.classList.add("hp-page-leave");
        setTimeout(function () {
          location.href = href;
        }, FADE_MS);
      },
      true
    );
  });
})();
