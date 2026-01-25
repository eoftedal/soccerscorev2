import type { Match } from "../types";
import { getPeriodAllEventsSorted } from "./getPeriodAllEventsSorted";
import { CUTOFF, EventType } from "./types";

export function getMatchGoalScorers(match: Match, side: "home" | "away") {
  const m = match;
  if (!m) return [];
  const result = {} as Record<string, [number, number, string, number][]>;

  match.periods.forEach((p, i) => {
    const allEvents = getPeriodAllEventsSorted(p, false);
    p[side].goals.forEach((x) => {
      const eventsBefore = allEvents.filter((y) => y[1][0] < x[0]);
      if (
        eventsBefore[eventsBefore.length - 1] &&
        eventsBefore[eventsBefore.length - 1][2] == EventType.OutOfPlay
      ) {
        eventsBefore.pop();
      }
      const sameSideEvents = [];
      for (let j = eventsBefore.length - 1; j >= 0; j--) {
        if (
          (eventsBefore[j][0] == "H" && side == "home") ||
          (eventsBefore[j][0] == "A" && side == "away")
        ) {
          if (eventsBefore[j][2] == EventType.Shot) continue;
          sameSideEvents.push(eventsBefore[j]);
          if (eventsBefore[j][1][1] >= CUTOFF) break;
          if (eventsBefore[j][2] != EventType.Touch) break;
        } else {
          break;
        }
      }
      let elapsed = i * m.periodLength;
      if (i > 1) {
        elapsed = 2 * m.periodLength + (i - 2) * m.extraPeriodLength;
      }
      const prevEvent = eventsBefore[eventsBefore.length - 1];
      const goalTime = Math.ceil((x[0] - p.start) / 60000) + elapsed;
      const name = x[1] || "Unknown";
      result[name] = result[name] ?? [];
      const tag = prevEvent?.[2] == EventType.Penalty ? " (pen)" : "";
      console.log(side, sameSideEvents, eventsBefore.slice(-14), goalTime, i, tag);
      let passCount = sameSideEvents.length - 1;
      if (passCount < 0) passCount = 0;
      result[name].push([goalTime, i, tag, passCount]);
    });
  });
  const all = Object.entries(result);
  all.sort((a, b) => {
    return Math.min(...a[1].map((x) => x[0])) - Math.min(...b[1].map((x) => x[0]));
  });
  return all;
}
