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

  var BASE = "https://knskyj.github.io/housingplaza-assets/hp/";

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

  /* 順序固定（依存の読みやすさ用。実カスケードはすべて head 末尾） */
  [
    "hp-page.css?v=1",
    "hp-loading.css?v=17",
    "hp-header.css?v=70",
    "hp-hero.css?v=24",
    "hp-topics.css?v=14",
    "hp-intro.css?v=26",
    "hp-services.css?v=14",
    "hp-stores.css?v=38",
    "hp-search.css?v=20",
    "hp-panels.css?v=40",
    "hp-news.css?v=17",
    "hp-recruit.css?v=8",
    "hp-footer.css?v=30",
    "hp-inview.css?v=18",
  ].forEach(function (file) {
    loadCss(BASE + file);
  });

  [
    "hp-page.js?v=2",
    "hp-loading.js?v=15",
    "hp-header.js?v=34",
    "hp-hero.js?v=9",
    "hp-news.js?v=1",
    "hp-inview.js?v=17",
  ].forEach(function (file) {
    loadJs(BASE + file);
  });
})();
