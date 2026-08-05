/**
 * Housingplaza header — mega menu + mobile drawer.
 * No jQuery. No Bootstrap JS. Scoped to [data-hp-header] inside #housing.
 */
(function () {
  "use strict";

  var FADE_MS = 300;
  var DRAWER_MS = 600;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var root = document.querySelector("#housing [data-hp-header]");
    if (!root) return;
    if (root.getAttribute("data-hp-ready") === "1") return;
    root.setAttribute("data-hp-ready", "1");

    /* いい生活は PC で viewport=1180 / body min-width:1180 固定 → 窓リサイズで切れないように解除
       （#housing .hp-header があるページでのみ実行） */
    document.documentElement.classList.add("hp-header-active");
    document.body.classList.add("hp-header-active");
    var vp = document.querySelector('meta[name="viewport"]');
    var desiredVp = "width=device-width, initial-scale=1";
    if (vp) {
      if (vp.getAttribute("content") !== desiredVp) {
        vp.setAttribute("content", desiredVp);
      }
    } else {
      vp = document.createElement("meta");
      vp.name = "viewport";
      vp.content = desiredVp;
      document.head.appendChild(vp);
    }

    var megaItems = Array.prototype.slice.call(root.querySelectorAll("[data-hp-mega]"));
    var navItems = Array.prototype.slice.call(
      root.querySelectorAll(".hp-header__nav .hp-header__item")
    );
    var bar = root.querySelector(".hp-header__bar");
    var burger = root.querySelector("[data-hp-burger]");
    var drawer = root.querySelector("[data-hp-drawer]");
    var drawerInner = drawer && drawer.querySelector(".hp-header__drawer-inner");
    var brand = root.querySelector(".hp-header__brand");
    var backdrop = root.querySelector("[data-hp-backdrop]");
    var mq = window.matchMedia("(min-width: 1100px)");
    var backdropHideTimer = null;
    var drawerHideTimer = null;
    var navLeaveTimer = null;
    var backdropShowRaf = null;

    /* Infcurion: overflow クリップ内で下から出現させるラッパー */
    function wrapReveal(host) {
      if (!host || host.querySelector(".hp-header__reveal-clip")) return;
      var clip = document.createElement("div");
      clip.className = "hp-header__reveal-clip";
      var reveal = document.createElement("div");
      reveal.className = "hp-header__reveal";
      while (host.firstChild) reveal.appendChild(host.firstChild);
      clip.appendChild(reveal);
      host.appendChild(clip);
    }

    if (brand) wrapReveal(brand);
    if (drawerInner) {
      var kids = Array.prototype.slice.call(drawerInner.children);
      for (var wi = 0; wi < kids.length; wi++) {
        var clipHost = document.createElement("div");
        clipHost.className = "hp-header__drawer-reveal";
        drawerInner.insertBefore(clipHost, kids[wi]);
        clipHost.appendChild(kids[wi]);
        wrapReveal(clipHost);
      }
    }

    function restartReveals() {
      var nodes = root.querySelectorAll(".hp-header__reveal");
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.animation = "none";
        void nodes[i].offsetWidth;
        nodes[i].style.animation = "";
      }
    }

    function isDrawerActive() {
      return (
        root.classList.contains("is-open") ||
        root.classList.contains("is-drawer-closing")
      );
    }

    function syncBackdrop() {
      if (!backdrop) return;
      var show =
        isDrawerActive() ||
        root.classList.contains("is-mega-open") ||
        root.classList.contains("is-nav-hover");

      if (backdropHideTimer) {
        clearTimeout(backdropHideTimer);
        backdropHideTimer = null;
      }
      if (backdropShowRaf) {
        cancelAnimationFrame(backdropShowRaf);
        backdropShowRaf = null;
      }

      if (show) {
        backdrop.hidden = false;
        // PCメガ時は暗転を見た目だけにし、ホバー判定を奪わない
        backdrop.style.pointerEvents = isDrawerActive() ? "" : "none";
        backdropShowRaf = window.requestAnimationFrame(function () {
          backdropShowRaf = null;
          if (
            isDrawerActive() ||
            root.classList.contains("is-mega-open") ||
            root.classList.contains("is-nav-hover")
          ) {
            backdrop.classList.add("is-visible");
          }
        });
      } else {
        backdrop.classList.remove("is-visible");
        backdropHideTimer = setTimeout(function () {
          if (!backdrop.classList.contains("is-visible")) {
            backdrop.hidden = true;
            backdrop.style.pointerEvents = "";
          }
          backdropHideTimer = null;
        }, FADE_MS);
      }
    }

    function setNavHover(on) {
      if (on) root.classList.add("is-nav-hover");
      else root.classList.remove("is-nav-hover");
      syncBackdrop();
    }

    function cancelNavLeave() {
      if (navLeaveTimer) {
        clearTimeout(navLeaveTimer);
        navLeaveTimer = null;
      }
    }

    function scheduleNavLeave() {
      cancelNavLeave();
      navLeaveTimer = setTimeout(function () {
        navLeaveTimer = null;
        clearNavState();
      }, 80);
    }

    function isInNavZone(node) {
      if (!node || !node.closest) return false;
      return !!(
        node.closest(".hp-header__nav") ||
        node.closest(".hp-header__panel")
      );
    }

    function hidePanelLater(item, panel) {
      if (!panel) return;
      if (panel._hpHide) clearTimeout(panel._hpHide);
      panel._hpHide = setTimeout(function () {
        if (!item.classList.contains("is-open")) panel.hidden = true;
        panel._hpHide = null;
      }, FADE_MS);
    }

    function closeAllMega(immediate) {
      megaItems.forEach(function (item) {
        item.classList.remove("is-open");
        var btn = item.querySelector(".hp-header__trigger");
        var panel = item.querySelector(".hp-header__panel");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (!panel) return;
        if (immediate) {
          if (panel._hpHide) clearTimeout(panel._hpHide);
          panel.hidden = true;
        } else {
          hidePanelLater(item, panel);
        }
      });
      root.classList.remove("is-mega-open");
      syncBackdrop();
    }

    function hydratePanelImages(panel) {
      if (!panel || panel.getAttribute("data-hp-hydrated") === "1") return;
      var imgs = panel.querySelectorAll("img[data-hp-src]");
      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        var src = img.getAttribute("data-hp-src");
        if (!src) continue;
        img.setAttribute("src", src);
        img.removeAttribute("data-hp-src");
      }
      panel.setAttribute("data-hp-hydrated", "1");
    }

    function openMega(item) {
      megaItems.forEach(function (other) {
        if (other === item) return;
        other.classList.remove("is-open");
        var otherBtn = other.querySelector(".hp-header__trigger");
        var otherPanel = other.querySelector(".hp-header__panel");
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
        if (otherPanel) {
          if (otherPanel._hpHide) clearTimeout(otherPanel._hpHide);
          otherPanel.hidden = true;
        }
      });

      var btn = item.querySelector(".hp-header__trigger");
      var panel = item.querySelector(".hp-header__panel");
      if (panel) {
        if (panel._hpHide) clearTimeout(panel._hpHide);
        hydratePanelImages(panel);
        panel.hidden = false;
        void panel.offsetWidth;
      }
      item.classList.add("is-open");
      if (btn) btn.setAttribute("aria-expanded", "true");
      root.classList.add("is-mega-open");
      root.classList.remove("is-header-hidden");
      syncBackdrop();
    }

    function toggleMega(item) {
      if (item.classList.contains("is-open")) {
        closeAllMega(false);
      } else {
        openMega(item);
      }
    }

    function clearNavState() {
      cancelNavLeave();
      closeAllMega(false);
      setNavHover(false);
    }

    function lockScroll() {
      var sbw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = "hidden";
      document.documentElement.style.paddingRight = sbw > 0 ? sbw + "px" : "";
    }

    function unlockScroll() {
      document.documentElement.style.overflow = "";
      document.documentElement.style.paddingRight = "";
    }

    function closeDrawer() {
      if (!root.classList.contains("is-open") && !root.classList.contains("is-drawer-closing")) {
        return;
      }
      if (burger) {
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "メニューを開く");
      }
      unlockScroll();

      if (!drawer) {
        root.classList.remove("is-open", "is-drawer-closing");
        if (backdrop) backdrop.classList.remove("is-drawer-veil");
        syncBackdrop();
        return;
      }

      var accs = drawer.querySelectorAll(".hp-header__acc");
      for (var i = 0; i < accs.length; i++) accs[i].open = false;

      /* Infcurion: 白パネルは上へ抜け、ブランド色はフェードアウト */
      root.classList.add("is-drawer-closing");
      root.classList.remove("is-open");
      syncBackdrop();

      if (drawerHideTimer) clearTimeout(drawerHideTimer);
      drawerHideTimer = setTimeout(function () {
        root.classList.remove("is-drawer-closing");
        drawer.hidden = true;
        syncBackdrop();
        /* フェード完了後に紺ベールを外す（途中で暗転色に戻らないように） */
        setTimeout(function () {
          if (backdrop && !isDrawerActive()) {
            backdrop.classList.remove("is-drawer-veil");
          }
        }, FADE_MS);
        drawerHideTimer = null;
      }, DRAWER_MS);
    }

    function openDrawer() {
      clearNavState();
      if (drawerHideTimer) {
        clearTimeout(drawerHideTimer);
        drawerHideTimer = null;
      }
      root.classList.remove("is-drawer-closing");
      if (backdrop) backdrop.classList.add("is-drawer-veil");
      if (drawer) {
        drawer.hidden = false;
        /* アニメ再起動のため一度リフロー */
        void drawer.offsetWidth;
      }
      restartReveals();
      root.classList.add("is-open");
      root.classList.remove("is-header-hidden");
      if (burger) {
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "メニューを閉じる");
      }
      lockScroll();
      syncBackdrop();
    }

    megaItems.forEach(function (item) {
      var btn = item.querySelector(".hp-header__trigger");
      if (!btn) return;

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (!mq.matches) return;
        toggleMega(item);
        setNavHover(item.classList.contains("is-open"));
      });
    });

    navItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        if (!mq.matches) return;
        cancelNavLeave();
        setNavHover(true);
        if (item.hasAttribute("data-hp-mega")) openMega(item);
        else closeAllMega(false);
      });
    });

    // ナビ／メガパネルから外れたら閉じる（バー全体だとロゴ・CTA上で暗転が残る）
    var nav = root.querySelector(".hp-header__nav");
    if (nav) {
      nav.addEventListener("mouseenter", function () {
        if (!mq.matches) return;
        cancelNavLeave();
      });
      nav.addEventListener("mouseleave", function (e) {
        if (!mq.matches) return;
        if (isInNavZone(e.relatedTarget)) {
          cancelNavLeave();
          return;
        }
        scheduleNavLeave();
      });
    }

    megaItems.forEach(function (item) {
      var panel = item.querySelector(".hp-header__panel");
      if (!panel) return;
      panel.addEventListener("mouseenter", function () {
        if (!mq.matches) return;
        cancelNavLeave();
      });
      panel.addEventListener("mouseleave", function (e) {
        if (!mq.matches) return;
        if (isInNavZone(e.relatedTarget)) {
          cancelNavLeave();
          return;
        }
        scheduleNavLeave();
      });
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target) || (backdrop && e.target === backdrop)) {
        clearNavState();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        clearNavState();
        closeDrawer();
      }
    });

    if (burger) {
      burger.addEventListener("click", function () {
        if (root.classList.contains("is-open")) closeDrawer();
        else openDrawer();
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        clearNavState();
        closeDrawer();
      });
    }

    function onViewportChange() {
      if (mq.matches) closeDrawer();
      else clearNavState();
    }

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onViewportChange);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onViewportChange);
    }

    var scrollTicking = false;
    var lastScrollY = window.scrollY || 0;
    var wasPastHero = false;

    function heroScrollThreshold() {
      var hero =
        document.querySelector("#housing .hp-hero") ||
        document.querySelector("#housing .swiper.full-screen") ||
        document.querySelector("#housing .full-screen") ||
        document.querySelector(".swiper.full-screen");
      if (!hero) return 24;
      var headerH = (bar && bar.offsetHeight) || 76;
      var top = hero.getBoundingClientRect().top + window.scrollY;
      return Math.max(24, top + hero.offsetHeight - headerH);
    }

    function clearHeaderNoAnim() {
      root.classList.remove("is-header-no-anim");
    }

    function syncHeaderHide(y, pastHero, justCrossedDown, goingDown, goingUp) {
      /*
       * PC / モバイル共通:
       * - ヒーロー内: 常時表示（透過・fixed）→ 隠さない
       * - ヒーロー過ぎ + 下スクロール: 隠す
       * - 上スクロール / ページ最下部: 白背景で表示（is-scrolled）
       */
      if (
        root.classList.contains("is-open") ||
        root.classList.contains("is-drawer-closing") ||
        root.classList.contains("is-mega-open")
      ) {
        root.classList.remove("is-header-hidden");
        clearHeaderNoAnim();
        return;
      }
      var doc = document.documentElement;
      var nearBottom = y + window.innerHeight >= doc.scrollHeight - 96;

      if (!pastHero || nearBottom || goingUp) {
        root.classList.remove("is-header-hidden");
        clearHeaderNoAnim();
      } else if (pastHero && (goingDown || justCrossedDown)) {
        /* 境界を下方向に越えた瞬間は白バーが一瞬出ないよう遷移なしで隠す */
        if (justCrossedDown) root.classList.add("is-header-no-anim");
        root.classList.add("is-header-hidden");
        if (justCrossedDown) {
          window.requestAnimationFrame(function () {
            window.requestAnimationFrame(clearHeaderNoAnim);
          });
        }
      }
    }

    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY || document.documentElement.scrollTop;
        var pastHero = y > heroScrollThreshold();
        var goingDown = y > lastScrollY + 2;
        var goingUp = y < lastScrollY - 2;
        var justCrossedDown = pastHero && !wasPastHero && y >= lastScrollY;

        if (pastHero) root.classList.add("is-scrolled");
        else root.classList.remove("is-scrolled");
        syncHeaderHide(y, pastHero, justCrossedDown, goingDown, goingUp);
        wasPastHero = pastHero;
        lastScrollY = y;
        scrollTicking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  });
})();
