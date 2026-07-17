# learncn.fun

Tiny Chinese practice apps aligned to the 14-level character-count path printed in the
《小羊上山儿童汉语分级读物》 series. Built with React, TypeScript, and Tailwind as static HTML/CSS/JS.

## Apps

- Read: multiple-choice character quiz (English or Pinyin answers)
- Read Out Loud: local Mandarin voice practice using Vosk
- Write: guided stroke-order practice (HanziWriter)

Every app shares one persisted book-level picker. Practice can cover either the characters newly
introduced at a level or the cumulative inventory through that level.

## Curriculum status

The printed path is cumulative: 60, 120, 180, 240, 310, 390, 490, 600, 750, 950, 1,250, 1,680,
2,260, and 3,000 characters. Levels 1–6 currently contain provisional transcriptions. Levels 7–14
are modeled as roadmap metadata but are not selectable until exact character lists can be verified.

See [`docs/curriculum.md`](docs/curriculum.md) for counts, provenance, and verification status.

This is an independent practice tool. It is not affiliated with or endorsed by the authors,
童趣出版有限公司, or 人民邮电出版社. No story text, illustrations, audio, or publisher assets are
included.

## License

Apache-2.0 (see `LICENSE`).

## Local dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm test
npm run preview
```

## GitHub Pages

This repo includes a GitHub Actions workflow that builds and deploys `dist/` to GitHub Pages on pushes to `main`.

In GitHub:

1. Repo Settings → Pages
2. Set Source to **GitHub Actions**

Custom domain is configured via `public/CNAME`.
