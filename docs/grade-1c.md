# Grade 1C character practice

`/1c/` follows the owner-supplied **Grade 1 List of Characters for Recognition and Writing.pdf** (欢乐伙伴 一年级 生字表), received October 19, 2026. The PDF stays private. The character lists are transcribed in `src/apps/grade-1c/character-lists.json` with their original order and chapter boundaries.

## Full curriculum

The 19 chapters contain 364 recognition entries (362 unique characters) and 167 writing characters (all unique). 采 and 话 recur in recognition lists and remain in both assigned chapters. Writing entries 自己 and 老师 are split into their two characters. Every writing character occurs somewhere in the recognition syllabus; some are revisited for writing in a later chapter.

`character-metadata.json` contains the app's pinyin and short English meanings, not content claimed to be in the PDF. It reuses existing catalog/newsletter metadata where suitable and supplies the remaining character glosses. Character meanings are context dependent. The readings for 抹 and 爪 were checked against the Ministry of Education dictionaries ([抹](https://dict.mini.moe.edu.tw/SearchIndex/word_detail?breadcrumbs=Search_%E6%8A%B9_one&dictSearchField=%E6%8A%B9&wordID=D0003384), [爪](https://dict.revised.moe.edu.tw/dictView.jsp?ID=8042&la=0&powerMode=0)). All speech sends the original Hanzi to the selected Mandarin voice; no pronunciation phrases are substituted.

## Schedule and locks

The owner requested one textbook chapter per week. Week 1 starts September 1, 2026, using the school start from the original newsletters. Subsequent weeks unlock each Monday in `America/Los_Angeles`; the school-local date is calculated independently of the device's configured time zone and daylight-saving changes. October 19–23 is Week 8. The schedule advances weekly and does not infer holiday pauses absent a supplied school calendar. `weekly-curriculum.ts` is the source for release dates.

The map displays all 19 weeks, with Read and Write islands for each. The ice path is the sole week selector; there is no horizontal week slider. Island selection, lesson start, next-lesson routing, and the continuous practice pool all respect the release cap. Completion of earlier activities does not unlock future weeks. The cap refreshes on focus, tab visibility changes, and once per minute. These are curriculum pacing controls, not a security boundary against a user changing their device clock or source.

## Direct practice

Reading choices include decorative emoji cues in both answer modes. Shared columns center the emoji-and-label group while keeping every text label aligned with the others; longer labels wrap in the same column. Screen readers announce the answer text without the decorative emoji. Concrete characters use related icons and abstract or grammar words use a speech bubble.

Reading audio matches the main Read game: each new question plays the short Mandarin cue 这是什么字？; Listen and Slow speak the English meaning for CN/pinyin answers and the direct Hanzi for EN answers. Wrong choices play a pop, and correct choices play a ding and say the character in Mandarin. These cues apply to weekly reading, review, and continuous reading. Sound off silences prompts and feedback. Switching answer mode preserves the question without replaying the prompt. There is no teaching-card introduction.

The map's round trophy button opens the Trophy case instead of the old Getting extra practice list. It includes each character from available weeks once, with separate reading and writing attempt counts. Doing best comes first, Still to try follows, and Needs the most practice is at the bottom with the trickiest characters first. Section links jump directly to each list. Ranking uses the same saved recent difficulty as adaptive practice; an untested skill stays labeled Not tried yet, and progress improves as successful attempts reduce difficulty. No new progress store or mastery credit is created by viewing the case.

There are no introductory teaching cards or automatic narrated instructions. Reading shows a Hanzi character with three choices. Answers CN shows pinyin; Answers EN shows English. The small toggle sits in the bottom-right corner, matching the main Read game. It shares `learncn.read.answerMode` with that game and defaults to CN. Both pinyin and English labels are unique within each question, and related synonyms such as 爸/父 are excluded as distractors. Switching modes preserves the current character, disabled wrong answers, and difficulty history. Writing starts with a guided trace, then clears to a blank pad for the same whole character. Reading covers its entire assigned list once, then reviews missed or hinted characters. Writing uses direct Mandarin character audio through Listen and Slow; reading uses the answer-mode audio described above. If drawing cannot load, Retry drawing pad retries the load; there is no tap fallback or skip that can award a writing star.

A reading activity earns a star after its practice and review. Each writing character must pass an unassisted attempt with no mistakes before Next appears. Memory attempts hide outlines and provide no advance stroke highlights. A mistake or Hint reveals guidance, but that attempt cannot pass: the player must retry the entire character on a fresh blank pad. Spoken names follow accepted strokes. The controller independently tracks help and verifies every assigned character before awarding a section star. Guided tracing alone never records a clean writing success. Your turn, Try again, Next, and Done use a large fixed completion bar above the phone safe area. Read and Write for every currently available week must be completed to unlock Continuous play. When a new week opens, those new activities must be completed before continuous play can resume; a running continuous session checks again before its next question.

## Adaptive continuous play

Continuous play mixes reading and handwriting without a fixed round length. Its writing questions start directly from memory, with the same help-and-retry rule. Next draws a new question; End practice returns to the map. Only unlocked characters are candidates. Each character/skill pair appears once in the pool even if it appears in multiple weeks. The previous three pairs are excluded when other candidates are available.

Word history is keyed by `read:<hanzi>` or `write:<hanzi>` and saves after the first result on each question. A wrong answer or hint is recorded immediately, so leaving the question doesn't erase the difficulty. Retrying that same question successfully does not overwrite the miss or create a clean result. A later review or fresh unassisted writing retry is a new attempt. Repeated wrong taps/stroke hints within one question do not inflate the attempt count.

Selection weight is 2 for an unseen pair, otherwise `1 + 12 * difficulty`, plus 2 when the most recent attempt needed help. Each miss/hint adds 0.5 to difficulty up to 1. Each clean success multiplies it by 0.65. Every pair retains positive weight; sustained clean practice gradually removes extra focus. The interface shows the currently trickiest pairs.

## Local progress and migration

New completion records use `learncn.1c.characters.v1`. Word history uses `learncn.1c.word-history.v1`. Both are local to this browser, with no account, microphone, analytics, or server-side player data. Corrupt records are rejected, and unavailable storage leaves the current visit usable.

The prior `learncn.1c.week1.v1` save remains untouched. On first use of the new curriculum, completed old character activities contribute coverage: writing also contributes recognition. A new activity receives a carried-over star only if every assigned character is covered by those completed old activities. The combined old Week 4 IDs are still migrated by the existing parser. Full completion of the old four-week map retains records for the new Week 1 and Week 2 reading and writing activities. Reading records count immediately. Both old newsletter writing and earlier PDF tracing records lack `handwritingVerified: true`, so they remain saved but do not count as writing stars or unlock continuous play until the new unassisted checks are completed. New verified completions retain that flag across reloads. Unrelated number/phrase lessons cannot award later chapter stars. The earlier newsletter data stays in `curriculum.ts` for this migration and its regression tests.

## Validation

Tests cover PDF counts and chapter boundaries, direct prompts, distinct answer choices, Pacific week release and DST boundaries, lock enforcement, completion migration, immediate mistake persistence, independent reading/writing history, weighted practice, continuous eligibility and re-locking, storage corruption, guided-versus-unassisted attempts, mistake/hint retry gates, failed drawing loads, and verified writing progress. The existing trace, speech, hosting, and production build checks remain required.
