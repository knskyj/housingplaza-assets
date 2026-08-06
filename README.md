# housingplaza-assets

いい生活（SkyPress）検証用の静的アセット配信。

## URLs（GitHub Pages: branch `main` / folder `/docs`）

- https://knskyj.github.io/housingplaza-assets/hp/hp-header.css
- https://knskyj.github.io/housingplaza-assets/hp/hp-header.js

SkyPress には `docs/hp/skypress-css.css` / `skypress-js.js` の中身だけ貼る。

- **skypress-css.css**: ちらつき防止のみ（`@import` は使わない）
- **skypress-js.js**: Pages の CSS を `<link>` で head 末尾注入し、続けて JS を読み込む

## Update from housingplaza workspace

```bash
cd housingplaza-assets
cp ../production-snapshot/admin-export/custom-code/css/hp-header.css docs/hp/
cp ../production-snapshot/admin-export/custom-code/js/hp-header.js docs/hp/
git add docs/hp && git commit -m "Update hp-header" && git push
```

Bump `?v=` in `skypress-js.js` if cache sticks.
