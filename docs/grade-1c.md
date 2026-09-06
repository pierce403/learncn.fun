# Grade 1C · Week 1A

The standalone page at `/1c/` is based on the user-supplied **1C-Week 1 Newsletter
26-27.pdf**, Week 1A (September 1–4, 2026), “Chinese Learning Point” on page 2.
The original newsletter remains private and is not included in this repository.

## Coverage

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

## Game behavior

Each activity starts with teaching cards. Vocabulary games practice every word in
reading and listening (or written recognition with sound off). Sentence games use
tap-to-order tiles. Counting games use an interactive ten-frame and Chinese choices.
Wrong answers allow retries; incorrect or hinted words get one review at the end.
Completing an activity earns a star regardless of mistakes.

Only aggregate completion counts and best first-try results are stored locally,
under `learncn.1c.week1.v1`. This is separate from the main apps' book-level state.
Unavailable or corrupt browser storage does not block play. Audio uses browser
speech synthesis and never requires a microphone or speech recognition model.
Every listening prompt has a written hint if playback is unavailable. The device
may use an online speech service, depending on its installed voices.

## Routing and validation

Vite builds two actual HTML entrypoints: `/index.html` and `/1c/index.html`.
GitHub Pages redirects `/1c` to `/1c/`; the relative asset URLs emitted for each
entrypoint also support loading `/1c/index.html` directly. No SPA fallback is needed.
The existing home screen includes a link to the new activity.

Run `npm test` and `npm run build`. Tests cover exact curriculum coverage, number
mappings, question generation, sentence solvability, review selection, and progress
validation. Check the generated `dist/1c/index.html` and its asset references when
changing the build setup.
