import { describe, expect, it } from "vitest";
import { practicePool, recordResult, type WordHistory } from "./practice";
import { trophyCase } from "./trophies";

describe("trophy case", () => {
  it("includes every available character once without exposing future weeks or inventing results", () => {
    const collection = trophyCase({}, 8);
    const available = new Set(practicePool(8).map(item => item.word.hanzi));
    expect(collection.best).toEqual([]);
    expect(collection.practice).toEqual([]);
    expect(new Set(collection.untried.map(item => item.word.hanzi))).toEqual(available);
    expect(collection.untried).toHaveLength(available.size);
    expect(collection.total).toBe(available.size);
    expect(trophyCase({}, 0).total).toBe(0);
  });
  it("ranks strengths and practice needs separately while retaining independent reading and writing results", () => {
    let history: WordHistory = {};
    for (let i = 0; i < 3; i++) history = recordResult(history, "read:一", "correct");
    history = recordResult(history, "read:二", "correct");
    history = recordResult(history, "write:二", "hint");
    history = recordResult(history, "read:五", "miss");
    history = recordResult(history, "read:五", "miss");
    history = recordResult(history, "read:口", "correct");
    let collection = trophyCase(history, 1);
    expect(collection.best.map(item => item.word.hanzi)).toEqual(["一", "口"]);
    expect(collection.practice.map(item => item.word.hanzi)).toEqual(["五", "二"]);
    const two = collection.practice[1];
    expect(two.skills.find(item => item.skill === "read")?.result?.successes).toBe(1);
    expect(two.skills.find(item => item.skill === "write")?.result?.hints).toBe(1);
    for (let i = 0; i < 3; i++) history = recordResult(history, "write:二", "correct");
    collection = trophyCase(history, 1);
    expect(collection.practice.map(item => item.word.hanzi)).toEqual(["五"]);
    expect(collection.best.map(item => item.word.hanzi)).toContain("二");
  });
});
