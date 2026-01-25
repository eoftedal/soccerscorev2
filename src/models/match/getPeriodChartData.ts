import type { Period, Timestamp } from "../types";
import { getAllEventsSorted } from "./getAllEventsSorted";
import { CUTOFF, EventType } from "./types";

export interface PeriodChartData {
  lines: Array<[number, number, number, number, number]>;
  homeGoals: number[];
  awayGoals: number[];
  homeRedCards: number[];
  awayRedCards: number[];
}

export function getPeriodChartData(period: Period): PeriodChartData {
  const events = getAllEventsSorted(period);
  if (events.length == 0) {
    return { lines: [], homeGoals: [], awayGoals: [], homeRedCards: [], awayRedCards: [] };
  }
  const startTime = events[0][1][0];
  const endTime = events[events.length - 1][1][0];
  const totalTime = endTime - startTime;
  const slotTime = totalTime / 50;
  let time = startTime;
  let prev = events[0][0];
  let prevTime = time;
  const lines: Array<[number, number, number, number, number]> = [];
  let x = 0;

  while (time < endTime) {
    const times = [0, 0];
    const slotEvents = events.filter((x) => x[1][0] >= time && x[1][0] < time + slotTime);
    const after = events.find((x) => x[1][0] >= time + slotTime);
    slotEvents.forEach((x, i) => {
      if (x[0] == prev && x[2] == EventType.Touch) {
        let pTime = x[1][1] > CUTOFF ? prevTime + x[1][1] : prevTime;
        if (pTime < time) pTime = time;
        let t = x[1][0] - pTime;
        if (t > 0) times[x[0] == "H" ? 0 : 1] += t;
        if (t < 0)
          console.log("NEGATIVE", i, t, x[1][1], x[1][0], prevTime, x[0], x[1][0] - prevTime);
      }
      prevTime = x[1][0];
      prev = x[0];
    });
    if (after) {
      if (prev == after[0] && after[2] == EventType.Touch) {
        let t = time + slotTime - prevTime;
        if (after[1][1] > CUTOFF) t -= after[1][1];
        if (t > 0) times[after[0] == "H" ? 0 : 1] += t;
      }
    }
    lines.push([x, 49, x, 49 - 50 * (times[0] / slotTime), 2]);
    lines.push([x, 51, x, 51 + 50 * (times[1] / slotTime), 2]);
    x += 2;
    time = (time + slotTime) as Timestamp;
  }

  const homeGoals = period.home.goals.map((x) => {
    return ((x[0] - startTime) / totalTime) * 100;
  });
  const awayGoals = period.away.goals.map((x) => {
    return ((x[0] - startTime) / totalTime) * 100;
  });
  const homeRedCards = period.home.redCards.map((x) => {
    return ((x - startTime) / totalTime) * 100;
  });
  const awayRedCards = period.away.redCards.map((x) => {
    return ((x - startTime) / totalTime) * 100;
  });

  return { lines, homeGoals, awayGoals, homeRedCards, awayRedCards };
}
