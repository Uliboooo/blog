## Uliboooo Blog

Astro, Cloudflare Pages.

## ビルドキャッシュ

ビルド時間の大半は画像処理が占める。キャッシュはどちらも
`node_modules/.astro` の下に置いてある。

- `node_modules/.astro/assets` — 記事画像の最適化結果 (Astro 標準)
- `node_modules/.astro/og` — OG 画像の PNG (`src/utils/ogImage.ts`)

OG 画像のキャッシュキーは satori が出力した SVG のハッシュなので、タイトル・
description・`src/utils/og.ts` のテーマやレイアウトを変えれば自動で作り直される。
バージョン番号を手で上げる必要はない。

Cloudflare Pages 側ではビルドキャッシュが**デフォルトで無効**なので、有効に
しないと毎回すべて再生成される。Workers & Pages > プロジェクト > Settings >
Build > Build cache から Enable する (V2 以降のビルドシステムが必要)。

Pages のビルドキャッシュは許可リスト方式で任意のディレクトリを追加できないが、
Astro プロジェクトでは `node_modules/.astro` が対象に入っているため、上記
2 つのキャッシュはどちらもそのまま引き継がれる。逆に言うと、キャッシュを
この場所以外に置くと CI では効かない。

## 相互リンク

募集中です。以下に例。200x40px

[![pre](./links_preview.png)](https://blog.uliboooo.dev/about_me/#links)

