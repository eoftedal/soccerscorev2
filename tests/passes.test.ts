import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MatchEventWithDelta, Period, Timestamp } from "../src/models/types";
import { getPeriodPasses, getPeriodPassStrings } from "../src/models/match";
function asTimeseries(data: Array<[number, number]>) {
  return data as Array<MatchEventWithDelta>;
}

const emptyPeriod: Period = {
  start: 0 as Timestamp,
  stop: 10000 as Timestamp,
  home: {
    touches: [],
    corners: [],
    freekicks: [],
    penalties: [],
    redCards: [],
    yellowCards: [],
    goals: [],
    shots: [],
  },
  away: {
    touches: [],
    corners: [],
    freekicks: [],
    penalties: [],
    redCards: [],
    yellowCards: [],
    goals: [],
    shots: [],
  },
};

describe("should calculate possession", () => {
  it("should work with normal events", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [1000, 0],
          [3000, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: asTimeseries([
          [5000, 0],
          [10000, 0],
        ]),
      },
    };
    const result = getPeriodPasses(period);
    assert.strictEqual(result[0], 2);
    assert.strictEqual(result[1], 1);
  });

  it("should work with out of play", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [2000 as Timestamp],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [1000, 0],
          [3000, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: asTimeseries([
          [5000, 0],
          [10000, 0],
        ]),
      },
    };
    const result = getPeriodPasses(period);
    assert.strictEqual(result[0], 1);
    assert.strictEqual(result[1], 1);
  });
});

describe("should calculate strings", () => {
  it("should be zero for 0 or 1 touch", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [2000 as Timestamp],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: [
        ],
      },
    };
    const x = getPeriodPassStrings(period);
    assert.strictEqual(x[0].length, 0);
    assert.strictEqual(x[1].length, 0);
    assert.strictEqual(x[2], 0);
    assert.strictEqual(x[3], 0);

  });
  it("should be 1 for a single pass", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [2000 as Timestamp],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [500, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: [
        ],
      },
    };
    const x = getPeriodPassStrings(period);
    assert.strictEqual(x[0][1], 1);
    assert.strictEqual(x[1].length, 0);
    assert.strictEqual(x[2], 1);
    assert.strictEqual(x[3], 0);
    assert.deepStrictEqual(x[4], [1,1]);
    assert.deepStrictEqual(x[5], [0,0]);
  });

  it("should be 1.5 for a 2 and a 1", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [2000 as Timestamp],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [500, 0],
          [2100, 0],
          [3000, 0],
          [4000, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: [
        ],
      },
    };
    const x = getPeriodPassStrings(period);
    assert.deepStrictEqual(x[0], [, 2, 1]);
    assert.strictEqual(x[1].length, 0);
    assert.strictEqual(x[2], 1.5);
    assert.strictEqual(x[3], 0);
    assert.deepStrictEqual(x[4], [3,2]);
    assert.deepStrictEqual(x[5], [0,0]);
  });
  it("should be 2 for a 1 and 3 string", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [500, 0],
          [2100, 0],
          [3000, 0],
          [4000, 0],
          [5000, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: asTimeseries([
          [700,0],
          [1000,0]
        ]),
      },
    };
    const x = getPeriodPassStrings(period);
    assert.deepStrictEqual(x[0], [, 2, 1, 1]);
    assert.deepStrictEqual(x[1], [, 1]);
    assert.strictEqual(x[2], 2);
    assert.strictEqual(x[3], 1);
    assert.deepStrictEqual(x[4], [4,2]);
    assert.deepStrictEqual(x[5], [1,1]);
  });
  it("should count interceptions", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      outOfPlay: [],
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [500, 0],
          [1000, 0],
          [1200, 0],
        ]),
      },
      away: {
        ...emptyPeriod.away,
        touches: asTimeseries([
          [1100,0],
          [1300,0]
        ]),
      },
    };
    const x = getPeriodPassStrings(period);
    assert.deepStrictEqual(x[0], [, 1, 1]);
    assert.deepStrictEqual(x[1], []);
    assert.strictEqual(x[2], 2);
    assert.strictEqual(x[3], 0);
    assert.deepStrictEqual(x[4], [2,1]);
    assert.deepStrictEqual(x[5], [0,0]);
  });
});