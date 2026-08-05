/* SkyPress カスタムJSにこの内容だけ貼る（ハードリロードで更新確認。?v= はむやみに上げない） */
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

  function load(src) {
    var s = document.createElement("script");
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }

  load("https://knskyj.github.io/housingplaza-assets/hp/hp-loading.js?v=9");
  load("https://knskyj.github.io/housingplaza-assets/hp/hp-header.js?v=23");
  load("https://knskyj.github.io/housingplaza-assets/hp/hp-hero.js?v=9");
})();
