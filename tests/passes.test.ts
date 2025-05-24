import { MatchEventWithDelta, Period, Timestamp } from "../src/types";
import { getPasses, getPassStrings } from "../src/match";
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
    const result = getPasses(period);
    expect(result[0]).toBe(2);
    expect(result[1]).toBe(1);
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
    const result = getPasses(period);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe(1);
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
    const x = getPassStrings(period);
    expect(x[0].length).toBe(0);
    expect(x[1].length).toBe(0);
    expect(x[2]).toBe(0);
    expect(x[3]).toBe(0);

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
    const x = getPassStrings(period);
    expect(x[0][1]).toBe(1);
    expect(x[1].length).toBe(0);
    expect(x[2]).toBe(1);
    expect(x[3]).toBe(0);
    expect(x[4]).toEqual([1,1]);
    expect(x[5]).toEqual([0,0]);
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
    const x = getPassStrings(period);
    expect(x[0]).toEqual([undefined, 2, 1]);
    expect(x[1].length).toBe(0);
    expect(x[2]).toBe(1.5);
    expect(x[3]).toBe(0);
    expect(x[4]).toEqual([3,2]);
    expect(x[5]).toEqual([0,0]);
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
    const x = getPassStrings(period);
    expect(x[0]).toEqual([undefined, 2, 1, 1]);
    expect(x[1]).toEqual([undefined, 1]);
    expect(x[2]).toBe(2);
    expect(x[3]).toBe(1);
    expect(x[4]).toEqual([4,2]);
    expect(x[5]).toEqual([1,1]);
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
    const x = getPassStrings(period);
    expect(x[0]).toEqual([undefined, 1, 1]);
    expect(x[1]).toEqual([]);
    expect(x[2]).toBe(2);
    expect(x[3]).toBe(0);
    expect(x[4]).toEqual([2,1]);
    expect(x[5]).toEqual([0,0]);
  });
});