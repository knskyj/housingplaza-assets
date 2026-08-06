/* SkyPress カスタムJSにこの内容だけ貼る（ハードリロードで更新確認。?v= はむやみに上げない）
 *
 * CSS は @import ではなく <link> を head 末尾へ注入する。
 * テーマ／他カスタムCSSより後に載せ、会社情報（.hp-about-links）などの上書き負けを防ぐ。
 */
(function () {
  /* /test/ は検索除外 */
  if (/^\/test\/?$/.test(location.pathname)) {
    var meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
  }

  /* jsDelivr @main はキャッシュ遅れがあるため、反映確認時はコミット固定 */
  var BASE =
    "https://cdn.jsdelivr.net/gh/knskyj/housingplaza-assets@14b9f7a/docs/hp/";

  function loadCss(href) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    document.head.appendChild(l);
  }

  function loadJs(src) {
    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }

  /* テーマは 400/700 のみ → 500/600 を確実に足す（CSS @import と二重でも可） */
  if (!document.querySelector('link[data-hp-noto]')) {
    var pre1 = document.createElement("link");
    pre1.rel = "preconnect";
    pre1.href = "https://fonts.googleapis.com";
    document.head.appendChild(pre1);
    var pre2 = document.createElement("link");
    pre2.rel = "preconnect";
    pre2.href = "https://fonts.gstatic.com";
    pre2.crossOrigin = "anonymous";
    document.head.appendChild(pre2);
    var noto = document.createElement("link");
    noto.rel = "stylesheet";
    noto.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap";
    noto.setAttribute("data-hp-noto", "1");
    document.head.appendChild(noto);
  }

  /* 順序固定（依存の読みやすさ用。実カスケードはすべて head 末尾） */
  [
    "hp-page.css?v=1",
    "hp-loading.css?v=17",
    "hp-header.css?v=71",
    "hp-hero.css?v=24",
    "hp-topics.css?v=14",
    "hp-intro.css?v=30",
    "hp-stores.css?v=40",
    "hp-search.css?v=20",
    "hp-panels.css?v=40",
    "hp-news.css?v=17",
    "hp-recruit.css?v=8",
    "hp-footer.css?v=35",
    "hp-inview.css?v=18",
  ].forEach(function (file) {
    loadCss(BASE + file);
  });

  [
    "hp-page.js?v=2",
    "hp-loading.js?v=15",
    "hp-header.js?v=35",
    "hp-hero.js?v=9",
    "hp-news.js?v=1",
    "hp-inview.js?v=17",
  ].forEach(function (file) {
    loadJs(BASE + file);
  });
})();
