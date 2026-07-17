# Curriculum and provenance

## Level model

The back cover of a legitimately owned Level 1 book describes `阅读字量范围`—the cumulative number
of distinct characters a child can read at each level. It is not the number of story tokens or a
count of multi-character vocabulary words.

| Level | New characters | Cumulative characters | App status |
| ---: | ---: | ---: | --- |
| 1 | 60 | 60 | Provisional transcription |
| 2 | 60 | 120 | Provisional transcription |
| 3 | 60 | 180 | Provisional transcription |
| 4 | 60 | 240 | Provisional transcription |
| 5 | 70 | 310 | Provisional transcription |
| 6 | 80 | 390 | Provisional transcription |
| 7 | 100 | 490 | Planned; no list loaded |
| 8 | 110 | 600 | Planned; no list loaded |
| 9 | 150 | 750 | Planned; no list loaded |
| 10 | 200 | 950 | Planned; no list loaded |
| 11 | 300 | 1,250 | Planned; no list loaded |
| 12 | 430 | 1,680 | Planned; no list loaded |
| 13 | 580 | 2,260 | Planned; no list loaded |
| 14 | 740 | 3,000 | Planned; no list loaded |

The app stores only each level's newly introduced characters and computes cumulative practice sets.
Changing book level is an explicit learner choice; streaks never unlock or add curriculum silently.

## Vocabulary status

Levels 1–6 are transcribed from the core-character rows in an [unofficial hand-typed
reference](https://www.skyfox.org/little-sheep-up-mountain-word-table.html). Extension/out-of-level
characters are intentionally excluded. The six lists have the expected 60/60/60/60/70/80 sizes and
no duplicates across levels, but they should still be compared character-for-character with the
total-character charts supplied with legitimately owned sets.

The app's pinyin and short English glosses are study metadata, not publisher material. A character
can have other readings and meanings in other contexts.

The publisher's [2025 recap, posted in February
2026](https://zhuanlan.zhihu.com/p/2004274733521330595) said Level 7 was complete and expected in the
second half of 2026. The remaining level counts describe a roadmap, not currently obtainable exact
official lists. Planned levels therefore remain metadata-only and are not shown in the picker,
rather than being filled with an unrelated frequency list.

## Verification checklist

For each new or corrected level:

1. Compare the core/total character chart against the owned book set.
2. Enter only newly introduced core characters in `src/data/level-character-seeds.ts`.
3. Check the intended reading and child-friendly English gloss in the context used by the books.
4. Add or verify a contextual speech override in `src/data/words.ts` when an isolated character can
   be pronounced differently by browser text-to-speech.
5. Run `npm test` to verify per-level counts, cumulative targets, unique characters, stable IDs, and
   representative polyphonic speech contexts.

This project does not reproduce the series' stories, illustrations, exercises, audio, video, logos,
or companion-app content.
