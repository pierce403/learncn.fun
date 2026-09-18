# Grade 1C · Weeks 1–3

The standalone page at `/1c/` uses the user-supplied Grade 1C newsletters for
2026–27. The original newsletters remain private and are not included in this
repository. The map has 18 islands grouped into three weeks.

## Week 1A · September 1–4

Source: **1C-Week 1 Newsletter 26-27.pdf**, especially “Chinese Learning Point,” p. 2.

- Meet your class: 上学, 老师, 学生.
- Say hello: 早安, 午安, 晚安.
- Move & play: 起立, 坐下, 举手, 放下, 洗手, 喝水.
- Make a friend: 你好，我叫__。 / 请问你叫什么名字？ / 我今年__岁了。
- Count with me: numbers 0–10, linked to numerals, a ten-frame, and Chinese and
  English number words. This supports the number recognition within 10 described
  on page 1; the newsletter does not supply a specific number-word list.

The vocabulary translations and tone-marked pinyin follow the sheet. Spacing and
punctuation are normalized, including `wǎn ān` for the sheet's `wǎn 'ān`.
The action tips, sentence puzzles, and number activities are original examples.
Sentence puzzles use the fictional name 小明 (Xiaoming) and age six, then encourage
children to substitute their own details out loud. No name or age is collected.
The newsletter's administrative dates and English classroom recap are not lessons.

## Week 2B · September 8–11

Source: **1C-Week 2 Newsletter 26-27.pdf**, pp. 1–2. Six islands cover pinyin
finals a, o, e, i, u, ü, er; initials y and w; recognition of 衣、鱼、雨、耳、牙;
writing 一、二、五、口、人; comparing quantities; and number sequences within 10.
Character cards include the newsletter's word combinations and example sentences.
Comparison and sequence puzzles are original practice for the math goals.

## Week 3A · September 14–18

Source: **1C-Week 3 Newsletter 26-27..pdf**, pp. 1–2, supplied September 18, 2026.
Seven new islands cover:

- Meet the family: 爷爷、奶奶、爸爸、妈妈.
- Brothers & sisters: 哥哥、姐姐、弟弟、妹妹.
- Family words: 家人、父母、儿子、女儿.
- Who is he?: 他是谁？ / 他是我的爷爷。 / 你家有几个人？ / 我家有六个人。
- Counting words: fill a single measure-word gap in 一个人、一条鱼、一件雨衣、两只耳朵.
- Make a number: identify a missing part of a whole within 10.
- Add with me: add two groups, including zero, with totals no greater than 10.

All 12 family terms and four sentence patterns come from p. 2. Displayed pinyin
keeps the newsletter's syllable tones, with normalized spacing and punctuation;
browser speech may use natural neutral tones in repeated family words. The tips
clarify that 爷爷 and 奶奶 refer to paternal grandparents. Six people is a practice
example, not an assumption about the child's family, and no family details are collected.

Page 1 mentions measure words without giving a list. The four gap exercises are
original practice using people and the fish, raincoat, and ears already encountered
in Week 2. Contextual 一 changes tone in the displayed phrase pinyin; 只 is read zhī.
The composition and addition puzzles are also original, based on p. 1's math goals.
Existing Week 2 sequences remain available for ordering review. Lesson 2 initials
and character-writing lists are not supplied yet and are not invented here.

## Game behavior

Each activity starts with teaching cards. Vocabulary games practice every word in
reading and listening (or written recognition with sound off). Sentence games use
two meaning choices with optional spoken answers. Counting games use an interactive
ten-frame and Chinese choices. Week 3 uses two choices throughout; measure-word
and arithmetic answers show Hanzi and pinyin. Number parts use both different
colors and circle/diamond shapes, so color alone is not required to solve them.
Wrong answers allow retries; incorrect or hinted words get one review at the end.
Completing an activity earns a star regardless of mistakes.

Only aggregate completion counts and best first-try results are stored locally,
under `learncn.1c.week1.v1`. This is separate from the main apps' book-level state.
Week 1 and Week 2 IDs remain unchanged, so existing stars survive the new week.
Unavailable or corrupt browser storage does not block play. Audio uses browser
speech synthesis and never requires a microphone or speech recognition model.
Every listening prompt has a written hint if playback is unavailable. The device
may use an online speech service, depending on its installed voices.
The lesson uses the same speech helper as Read and Write. An incomplete browser
voice list does not disable listening: when no matching voice is listed, playback
requests `zh-CN` (or `en-US`) and lets the browser select a voice. The lesson only
shows a playback error after speech actually fails, or if speech is unsupported.

## Routing and validation

Vite builds two actual HTML entrypoints: `/index.html` and `/1c/index.html`.
GitHub Pages redirects `/1c` to `/1c/`; the relative asset URLs emitted for each
entrypoint also support loading `/1c/index.html` directly. No SPA fallback is needed.
The existing home screen includes a link to the new activity.

Run `npm test` and `npm run build`. Tests cover exact curriculum coverage, number
mappings, question generation, sentence solvability, review selection, and progress
validation. Check the generated `dist/1c/index.html` and its asset references when
changing the build setup.
