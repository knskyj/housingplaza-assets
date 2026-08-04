# housingplaza-assets

いい生活（SkyPress）検証用の静的アセット配信。

## URLs（GitHub Pages: branch `main` / folder `/docs`）

- https://knskyj.github.io/housingplaza-assets/hp/hp-header.css
- https://knskyj.github.io/housingplaza-assets/hp/hp-header.js

SkyPress には `docs/hp/skypress-css.css` / `skypress-js.js` の中身だけ貼る。

## Update from housingplaza workspace

```bash
cd housingplaza-assets
cp ../production-snapshot/admin-export/custom-code/css/hp-header.css docs/hp/
cp ../production-snapshot/admin-export/custom-code/js/hp-header.js docs/hp/
git add docs/hp && git commit -m "Update hp-header" && git push
```

Bump `?v=` in SkyPress loaders if cache sticks.
