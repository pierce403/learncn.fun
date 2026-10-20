# Grade 1C character practice

`/1c/` follows the owner-supplied **Grade 1 List of Characters for Recognition and Writing.pdf** (欢乐伙伴 一年级 生字表), received October 19, 2026. The PDF stays private. The character lists are transcribed in `src/apps/grade-1c/character-lists.json` with their original order and chapter boundaries.

## Full curriculum

The 19 chapters contain 364 recognition entries (362 unique characters) and 167 writing characters (all unique). 采 and 话 recur in recognition lists and remain in both assigned chapters. Writing entries 自己 and 老师 are split into their two characters. Every writing character occurs somewhere in the recognition syllabus; some are revisited for writing in a later chapter.

`character-metadata.json` contains the app's pinyin and short English meanings, not content claimed to be in the PDF. It reuses existing catalog/newsletter metadata where suitable and supplies the remaining character glosses. Character meanings are context dependent. The readings for 抹 and 爪 were checked against the Ministry of Education dictionaries ([抹](https://dict.mini.moe.edu.tw/SearchIndex/word_detail?breadcrumbs=Search_%E6%8A%B9_one&dictSearchField=%E6%8A%B9&wordID=D0003384), [爪](https://dict.revised.moe.edu.tw/dictView.jsp?ID=8042&la=0&powerMode=0)). All speech sends the original Hanzi to the selected Mandarin voice; no pronunciation phrases are substituted.

## Schedule and locks

The owner requested one textbook chapter per week. Week 1 starts September 1, 2026, using the school start from the original newsletters. Subsequent weeks unlock each Monday in `America/Los_Angeles`; the school-local date is calculated independently of the device's configured time zone and daylight-saving changes. October 19–23 is Week 8. The schedule advances weekly and does not infer holiday pauses absent a supplied school calendar. `weekly-curriculum.ts` is the source for release dates.

The map displays all 19 weeks, with Read and Write islands for each. Future week navigation, island selection, lesson start, next-lesson routing, and the continuous practice pool all respect the release cap. Completion of earlier activities does not unlock future weeks. The cap refreshes on focus, tab visibility changes, and once per minute. These are curriculum pacing controls, not a security boundary against a user changing their device clock or source.

## Direct practice

There are no introductory teaching cards or automatic narrated instructions. Reading shows a Hanzi character with three meaning choices; related synonyms such as 爸/父 are excluded as distractors. Writing opens the existing finger/pen tracing pad, including spoken stroke names and optional stroke help. Each activity covers its entire assigned list once, then reviews missed or hinted characters. All activities use direct Mandarin character audio through Listen and Slow buttons. A tap fallback remains available if drawing cannot load; it never counts as a clean handwriting success in the word history.

A completed activity earns a star even when help was needed. Read and Write for every currently available week must be completed to unlock Continuous play. When a new week opens, those new activities must be completed before continuous play can resume; a running continuous session checks again before its next question.

## Adaptive continuous play

Continuous play mixes reading and handwriting without a fixed round length. Next draws a new question; End practice returns to the map. Only unlocked characters are candidates. Each character/skill pair appears once in the pool even if it appears in multiple weeks. The previous three pairs are excluded when other candidates are available.

Word history is keyed by `read:<hanzi>` or `write:<hanzi>` and saves after the first result on each question. A wrong answer or hint is recorded immediately, so leaving the question doesn't erase the difficulty. Retrying that same question successfully does not overwrite the miss or create a clean result. A later review is a new attempt. Repeated wrong taps/stroke hints within one question do not inflate the attempt count.

Selection weight is 2 for an unseen pair, otherwise `1 + 12 * difficulty`, plus 2 when the most recent attempt needed help. Each miss/hint adds 0.5 to difficulty up to 1. Each clean success multiplies it by 0.65. Every pair retains positive weight; sustained clean practice gradually removes extra focus. The interface shows the currently trickiest pairs.

## Local progress and migration

New completion records use `learncn.1c.characters.v1`. Word history uses `learncn.1c.word-history.v1`. Both are local to this browser, with no account, microphone, analytics, or server-side player data. Corrupt records are rejected, and unavailable storage leaves the current visit usable.

The prior `learncn.1c.week1.v1` save remains untouched. On first use of the new curriculum, completed old character activities contribute coverage: writing also contributes recognition. A new activity receives a carried-over star only if every assigned character is covered by those completed old activities. The combined old Week 4 IDs are still migrated by the existing parser. Full completion of the old four-week map credits the new Week 1 and Week 2 reading and writing activities. Unrelated number/phrase lessons cannot award later chapter stars. The earlier newsletter data stays in `curriculum.ts` for this migration and its regression tests.

## Validation

Tests cover PDF counts and chapter boundaries, direct prompts, distinct answer choices, Pacific week release and DST boundaries, lock enforcement, completion migration, immediate mistake persistence, independent reading/writing history, weighted practice, continuous eligibility and re-locking, and storage corruption. The existing trace, speech, hosting, and production build checks remain required.
