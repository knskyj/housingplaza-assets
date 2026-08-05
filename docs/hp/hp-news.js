/**
 * Housingplaza — fill TOPICS (latest 1) + News list (latest 3)
 * from CPT REST: /wp-json/wp/v2/info?per_page=3
 * On failure, leave HTML fallback as-is.
 */
(function () {
  "use strict";

  var ENDPOINT = "/wp-json/wp/v2/info?per_page=3";
  var BADGE = "お知らせ";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function decodeTitle(html) {
    var el = document.createElement("textarea");
    el.innerHTML = html || "";
    return el.value;
  }

  function formatDate(iso) {
    if (!iso || typeof iso !== "string") return null;
    var m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return {
      datetime: m[1] + "-" + m[2] + "-" + m[3],
      display: m[1] + "." + m[2] + "." + m[3],
    };
  }

  function toPath(link) {
    if (!link) return "/info/";
    try {
      var u = new URL(link, location.origin);
      return u.pathname + (u.pathname.slice(-1) === "/" ? "" : "/");
    } catch (e) {
      return link;
    }
  }

  function normalizePosts(data) {
    if (!Array.isArray(data)) return [];
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var p = data[i];
      if (!p || !p.title || !p.title.rendered) continue;
      var d = formatDate(p.date);
      if (!d) continue;
      out.push({
        title: decodeTitle(p.title.rendered),
        href: toPath(p.link),
        datetime: d.datetime,
        display: d.display,
      });
    }
    return out;
  }

  function fillTopics(post) {
    var root = document.querySelector("#housing .hp-topics");
    if (!root || !post) return;
    var time = root.querySelector(".hp-topics__date");
    var link = root.querySelector(".hp-topics__link");
    var title = root.querySelector(".hp-topics__title");
    var badge = root.querySelector(".hp-topics__badge");
    if (time) {
      time.setAttribute("datetime", post.datetime);
      time.textContent = post.display;
    }
    if (link) link.setAttribute("href", post.href);
    if (title) title.textContent = post.title;
    if (badge) badge.textContent = BADGE;
  }

  function fillNews(posts) {
    var list = document.querySelector("#housing .hp-news__list");
    if (!list) return;
    var items = list.querySelectorAll(":scope > li");
    var i;
    for (i = 0; i < items.length; i++) {
      var li = items[i];
      var post = posts[i];
      if (!post) {
        li.hidden = true;
        continue;
      }
      li.hidden = false;
      var a = li.querySelector(".hp-news__item");
      if (!a) continue;
      a.setAttribute("href", post.href);
      var time = a.querySelector("time");
      if (time) {
        time.setAttribute("datetime", post.datetime);
        time.textContent = post.display;
      }
      var badge = a.querySelector(".hp-news__badge");
      if (badge) badge.textContent = BADGE;
      var title = a.querySelector(".hp-news__item-title");
      if (title) title.textContent = post.title;
    }
  }

  function run() {
    var housing = document.getElementById("housing");
    if (!housing) return;
    if (
      !housing.querySelector(".hp-topics") &&
      !housing.querySelector(".hp-news")
    ) {
      return;
    }

    fetch(ENDPOINT, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("hp-news: " + res.status);
        return res.json();
      })
      .then(function (data) {
        var posts = normalizePosts(data);
        if (!posts.length) return;
        fillTopics(posts[0]);
        fillNews(posts);
      })
      .catch(function () {
        /* keep HTML fallback */
      });
  }

  ready(run);
})();
