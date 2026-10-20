import type { Ref } from "react";
import type { WordHistory } from "./practice";
import { trophyCase, type TrophyCharacter } from "./trophies";

export function TrophyIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h10v5a5 5 0 0 1-10 0V3Zm0 2H3v2a4 4 0 0 0 5 4m9-6h4v2a4 4 0 0 1-5 4M12 13v5m-4 3h8m-7-3h6v3H9z"/></svg>;
}

function CharacterCard({ character }: { character: TrophyCharacter }) {
  return <li className="one-c-trophy-card">
    <div className="one-c-trophy-word"><strong lang="zh-CN">{character.word.hanzi}</strong><div><span lang="zh-Latn-pinyin">{character.word.pinyin}</span><p>{character.word.english}</p></div></div>
    <dl>{character.skills.map(({ skill, result }) => <div key={skill}><dt>{skill === "read" ? "Reading" : "Writing"}</dt><dd>{result?.attempts ? <><strong>{result.successes} / {result.attempts}</strong> successful{result.streak > 1 && <small>{result.streak} in a row</small>}</> : "Not tried yet"}</dd></div>)}</dl>
  </li>;
}

export default function TrophyCase({ history, currentWeek, headingRef }: { history: WordHistory; currentWeek: number; headingRef: Ref<HTMLHeadingElement> }) {
  const collection = trophyCase(history, currentWeek);
  const shelves = [
    { id: "best", title: "Doing best", description: "Your strongest characters right now. Keep them growing!", empty: "Your successes will appear here as you practice.", characters: collection.best },
    { id: "untried", title: "Still to try", description: "Every new character is a chance to grow.", empty: "You've tried every character available so far!", characters: collection.untried },
    { id: "practice", title: "Needs the most practice", description: "These get extra attention in continuous play. The trickiest come first.", empty: "No tricky characters right now. Keep playing!", characters: collection.practice },
  ];
  return <section className="one-c-trophy-case">
    <div className="one-c-trophy-intro"><span className="one-c-trophy-emblem"><TrophyIcon/></span><div><h1 ref={headingRef} tabIndex={-1}>Trophy case</h1><p>{collection.total} characters from {currentWeek ? `weeks 1–${currentWeek}` : "your upcoming weeks"}</p></div></div>
    <p className="one-c-small">Reading and writing each show successful attempts / total attempts. Recent practice decides the order.</p>
    <nav className="one-c-trophy-links" aria-label="Trophy case sections">{shelves.map(shelf => <a key={shelf.id} href={`#trophy-${shelf.id}`}>{shelf.title}<span>{shelf.characters.length}</span></a>)}</nav>
    {shelves.map(shelf => <section key={shelf.id} id={`trophy-${shelf.id}`} className={`one-c-trophy-shelf ${shelf.id}`} aria-labelledby={`trophy-${shelf.id}-heading`}>
      <h2 id={`trophy-${shelf.id}-heading`}>{shelf.title} <span>{shelf.characters.length}</span></h2><p className="one-c-small">{shelf.description}</p>
      {shelf.characters.length ? <ul className="one-c-trophy-grid">{shelf.characters.map(character => <CharacterCard key={character.word.hanzi} character={character}/>)}</ul> : <p className="one-c-trophy-empty">{shelf.empty}</p>}
    </section>)}
  </section>;
}
