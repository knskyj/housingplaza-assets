/**
 * Housingplaza — shared inview (fade-up / stagger / shutter).
 * Starts after hp:entered (or immediately if already entered / no gate).
 * Auto-wires TOP sections under #housing[data-hp-top].
 *
 * Stagger: 親を1回だけ監視し、子へ同時に .is-in（CSS delay で波打たせる）
 */
(function () {
  "use strict";

  var ROOT_MARGIN = "-80px 0px";

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

  function mark(el) {
    if (!el || el.classList.contains("is-in")) return;
    el.classList.add("is-in");
  }

  function markStaggerGroup(container) {
    if (!container || container.classList.contains("is-in")) return;
    container.classList.add("is-in");
    var kids = container.querySelectorAll(":scope > [data-hp-inview]");
    for (var i = 0; i < kids.length; i++) mark(kids[i]);
  }

  function wireStagger(container) {
    if (!container || container.getAttribute("data-hp-stagger-ready") === "1") {
      return;
    }
    container.setAttribute("data-hp-stagger", "");
    container.setAttribute("data-hp-stagger-ready", "1");
    var kids = container.children;
    for (var i = 0; i < kids.length; i++) {
      var kid = kids[i];
      kid.setAttribute("data-hp-inview", "");
      kid.style.setProperty("--hp-stagger", String(i));
    }
  }

  function wireFade(node) {
    if (!node || node.getAttribute("data-hp-inview") != null) return;
    node.setAttribute("data-hp-inview", "");
  }

  function autoWireTop(root) {
    if (!root || root.getAttribute("data-hp-inview-wired") === "1") return;
    root.setAttribute("data-hp-inview-wired", "1");

    [
      ".hp-intro__inner",
      ".hp-about-links__brand",
      ".hp-about-links__title",
      ".hp-stores__en",
      ".hp-stores__title",
      ".hp-stores__desc",
      ".hp-search__en",
      ".hp-search__title",
      ".hp-panels__en",
      ".hp-panels__title",
      ".hp-footer__en",
      ".hp-footer__title",
      ".hp-footer__hours",
      ".hp-footer__actions",
      ".hp-news__en",
      ".hp-news__title",
      ".hp-news__more",
      ".hp-recruit__en",
      ".hp-recruit__title",
      ".hp-recruit__lead",
      ".hp-recruit__cta",
    ].forEach(function (sel) {
      root.querySelectorAll(sel).forEach(wireFade);
    });

    [
      ".hp-about-links__list",
      ".hp-stores__grid",
      ".hp-search__grid",
      ".hp-panels__actions",
      ".hp-news__list",
    ].forEach(function (sel) {
      root.querySelectorAll(sel).forEach(wireStagger);
    });
  }

  function observeAll(scope) {
    var root = scope || document;
    var groups = Array.prototype.slice.call(
      root.querySelectorAll("[data-hp-stagger]")
    );
    var solos = Array.prototype.slice
      .call(root.querySelectorAll("[data-hp-inview], [data-hp-shutter]"))
      .filter(function (el) {
        return !el.closest("[data-hp-stagger]");
      });

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      groups.forEach(markStaggerGroup);
      solos.forEach(mark);
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var t = entry.target;
          if (t.hasAttribute("data-hp-stagger")) markStaggerGroup(t);
          else mark(t);
          io.unobserve(t);
        });
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0.08 }
    );

    groups.forEach(function (el) {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
    solos.forEach(function (el) {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
  }

  function start() {
    var housing = document.getElementById("housing");
    if (!housing) return;
    if (housing.getAttribute("data-hp-top") != null) {
      autoWireTop(housing);
    }
    observeAll(housing);
  }

  function whenEntered(fn) {
    var housing = document.getElementById("housing");
    if (
      !housing ||
      !housing.classList.contains("hp-await-enter") ||
      housing.classList.contains("hp-is-entered")
    ) {
      fn();
      return;
    }
    var done = false;
    function run() {
      if (done) return;
      done = true;
      window.removeEventListener("hp:entered", run);
      fn();
    }
    window.addEventListener("hp:entered", run);
    setTimeout(run, 4000);
  }

  ready(function () {
    whenEntered(start);
  });
})();
