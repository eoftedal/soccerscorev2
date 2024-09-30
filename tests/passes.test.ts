import { Period } from "../src/types";
import { getPasses } from "../src/match";

const emptyPeriod: Period = {
  start: 0,
  stop: 10000,
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
      start: 0,
      stop: 10000,
      home: {
        ...emptyPeriod.home,
        touches: [
          [0, 0],
          [1000, 0],
          [3000, 0],
        ],
      },
      away: {
        ...emptyPeriod.away,
        touches: [
          [5000, 0],
          [10000, 0],
        ],
      },
    };
    const result = getPasses(period);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(1);
  });

  it("should work with out of play", () => {
    const period: Period = {
      start: 0,
      stop: 10000,
      outOfPlay: [2000],
      home: {
        ...emptyPeriod.home,
        touches: [
          [0, 0],
          [1000, 0],
          [3000, 0],
        ],
      },
      away: {
        ...emptyPeriod.away,
        touches: [
          [5000, 0],
          [10000, 0],
        ],
      },
    };
    const result = getPasses(period);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
  });
});
