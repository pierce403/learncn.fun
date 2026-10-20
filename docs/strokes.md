# Stroke names and playground

Both Write and Grade 1C tracing say each accepted stroke's Mandarin name. The
hint/Show button also says the next stroke. A visible name, pinyin, and short
English direction work with sound off. The final stroke and character share one
speech sequence so completion feedback does not interrupt the final stroke name.

Learn strokes is available from the main app picker, Write, and the Grade 1C map.
It has six basic strokes and a second set of six turns/hooks. Opening the game
or switching sets starts drawing immediately, with no introductory cards. Each
stroke’s name is spoken as its touch, pen, or mouse drawing pad appears. The
Watch again button provides an optional animation and audio hint.
Each stroke is one continuous gesture from the gold dot to the end ring. A faint
guide and replayable animation show direction. Attempts are checked for the start,
end, length, and ordered shape (discrete Fréchet distance with a generous 10-unit
tolerance on a 100-unit pad). This rejects taps, reverse strokes, shortcuts and
large backtracking without requiring calligraphic precision. Turns and hooks stay
in one gesture. A retry replaces the previous attempt; interrupted gestures are
cancelled, and extra fingers are ignored. The score counts first tries, with one
fish for every completed stroke. Progress in weekly lessons is unchanged.
SVG teaching diagrams show writing direction from a gold start dot and honor
reduced-motion preferences. The game needs no external images or character data.

## Data

`src/data/character-strokes.json` is a curriculum-only subset of the MIT-licensed
[cnchar-order 3.2.6](https://github.com/theajack/cnchar) dictionary. Its license is
retained in `docs/cnchar-order-LICENSE.txt`. Stroke counts were checked against
[hanzi-writer-data 2.0.1](https://github.com/chanind/hanzi-writer-data), the pinned
version used by Hanzi Writer 3.7.3. These checks cover 414 distinct characters
(the 390 book characters plus Grade 1C vocabulary). The runtime refuses to map
names if a drawing's stroke count differs. No stroke labels are guessed from
mouse movements.

cnchar groups some variants in the same code. The generator explicitly resolves
horizontal hooks in roof/food components, reclining hooks in 心, the curved
hook in 阝, angular 竖折 versus curved 竖弯, and 横折弯钩 versus 横斜钩. Source code `d` (点2) is normalized to 点. Pinyin, short English cues,
and simplified teaching SVGs are app-authored. Names can vary between teaching
systems; this app uses Mandarin names for simplified-character handwriting.

To regenerate, unpack `cnchar-order@3.2.6` and `hanzi-writer-data@2.0.1` from npm
outside the repository, then run:

```
node scripts/generate-stroke-names.cjs /path/to/cnchar-order/package /path/to/hanzi-writer-data/package
npm test
npm run build
```

When changing curricula, regenerate and check compound strokes against the
actual Hanzi Writer shape/order, not just its total count. Writer callbacks are
zero-indexed, as documented in [Hanzi Writer](https://hanziwriter.org/docs.html).
