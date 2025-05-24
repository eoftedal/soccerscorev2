import { GoalScorer, MatchEventWithDelta, Period, Timestamp } from "../src/types";
import { getPossession } from "../src/match";

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
    const result = getPossession(period);
    expect(result[2]).toBe(5000);
    expect(result[3]).toBe(5000);
  });

  it("should work with normal delayed event", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      home: {
        ...emptyPeriod.home,
        touches: asTimeseries([
          [0, 0],
          [1000, 700],
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
    const result = getPossession(period);
    expect(result[2]).toBe(4300);
    expect(result[3]).toBe(5000);
  });
  it("should work with normal delayed corner", () => {
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
        corners: asTimeseries([[2000, 700]]),
      },
      away: {
        ...emptyPeriod.away,
        touches: asTimeseries([
          [5000, 0],
          [10000, 0],
        ]),
      },
    };
    const result = getPossession(period);
    expect(result[2]).toBe(4300);
    expect(result[3]).toBe(5000);
  });

  it("should work with out-of-play events", () => {
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
    const result = getPossession(period);
    expect(result[2]).toBe(4000);
    expect(result[3]).toBe(5000);
  });

  it("should work with goal events", () => {
    const period: Period = {
      start: 0 as Timestamp,
      stop: 10000 as Timestamp,
      home: {
        ...emptyPeriod.home,
        goals: [[2000, "PlayerA"] as [Timestamp, GoalScorer]],
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
    const result = getPossession(period);
    expect(result[2]).toBe(4000);
    expect(result[3]).toBe(5000);
  });
});
