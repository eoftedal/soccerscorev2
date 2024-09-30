import { Period } from "../src/types";
import { getPossession } from "../src/match";

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
    const result = getPossession(period);
    expect(result[2]).toBe(5000);
    expect(result[3]).toBe(5000);
  });

  it("should work with normal delayed event", () => {
    const period: Period = {
      start: 0,
      stop: 10000,
      home: {
        ...emptyPeriod.home,
        touches: [
          [0, 0],
          [1000, 700],
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
    const result = getPossession(period);
    expect(result[2]).toBe(4300);
    expect(result[3]).toBe(5000);
  });
  it("should work with normal delayed corner", () => {
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
        corners: [[2000, 700]],
      },
      away: {
        ...emptyPeriod.away,
        touches: [
          [5000, 0],
          [10000, 0],
        ],
      },
    };
    const result = getPossession(period);
    expect(result[2]).toBe(4300);
    expect(result[3]).toBe(5000);
  });

  it("should work with out-of-play events", () => {
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
    const result = getPossession(period);
    expect(result[2]).toBe(4000);
    expect(result[3]).toBe(5000);
  });
});
