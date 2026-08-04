/* SkyPress カスタムJSにこの内容だけ貼る（?v= を更新でキャッシュ破棄） */
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

  var s = document.createElement("script");
  s.src = "https://knskyj.github.io/housingplaza-assets/hp/hp-header.js?v=6";
  s.defer = true;
  document.head.appendChild(s);
})();
