# housingplaza-assets

いい生活（SkyPress）検証用の静的アセット配信。

## URLs（配信: jsDelivr → GitHub `main` / `docs/hp`）

SkyPress の `skypress-js.js` は GitHub Pages ではなく jsDelivr から CSS/JS を読む（Pages のデプロイ遅延を避ける）。

- https://cdn.jsdelivr.net/gh/knskyj/housingplaza-assets@main/docs/hp/hp-header.css

参考（Pages 直リンク、更新が遅れる場合あり）:

- https://knskyj.github.io/housingplaza-assets/hp/hp-header.css
- https://knskyj.github.io/housingplaza-assets/hp/hp-header.js

SkyPress には `docs/hp/skypress-css.css` / `skypress-js.js` の中身だけ貼る。

- **skypress-css.css**: ちらつき防止のみ（`@import` は使わない）
- **skypress-js.js**: jsDelivr の CSS を `<link>` で head 末尾注入し、続けて JS を読み込む

## Update from housingplaza workspace

```bash
cd housingplaza-assets
cp ../production-snapshot/admin-export/custom-code/css/hp-header.css docs/hp/
cp ../production-snapshot/admin-export/custom-code/js/hp-header.js docs/hp/
git add docs/hp && git commit -m "Update hp-header" && git push
```

Bump `?v=` in `skypress-js.js` if cache sticks.
