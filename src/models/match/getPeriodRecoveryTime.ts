import type { MatchEventWithDelta, Period } from "../types";
import { getPeriodAllEventsSorted } from "./getPeriodAllEventsSorted";
import { CUTOFF, EventType, type Side, type TotalTime } from "./types";

export type Recoveries = number;

export function getPeriodRecoveryTime(
  period: Period,
): [[TotalTime, Recoveries], [TotalTime, Recoveries]] {
  const allEvents = getPeriodAllEventsSorted(period, true);
  const result = [] as Array<[Side, TotalTime]>;
  let currentTime = 0;
  let prevEvent: [Side, MatchEventWithDelta, EventType] | null = null;
  let side = "N";
  allEvents.forEach((event) => {
    if (prevEvent == null) {
      // Noone has ball yet
      side = event[0];
      prevEvent = event;
      return;
    }
    const actualEventTime = event[1][0] - (event[1][1] > CUTOFF ? event[1][1] : 0);
    const prevTime = prevEvent[1][0];
    const actualTime = actualEventTime - prevTime;

    // Home side has ball
    if (event[0] == "H") {
      if (prevEvent[0] == "A") {
        // Home side recovered ball
        currentTime += actualTime;
        result.push(["H", currentTime]);
        currentTime = 0;
      } else if (prevEvent[0] == "N" && side == "A") {
        // Home side got ball from out of play when away had before
        result.push(["H", currentTime]);
        currentTime = actualTime;
      } else {
        currentTime += actualTime;
      }
      side = "H";
    } else if (event[0] == "A") {
      if (prevEvent[0] == "H") {
        // Away side recovered ball
        currentTime += actualTime;
        result.push(["A", currentTime]);
        currentTime = 0;
      } else if (prevEvent[0] == "N" && side == "H") {
        // Away side got ball from out of play
        result.push(["A", currentTime]);
        currentTime = actualTime;
      } else {
        currentTime += actualTime;
      }
      side = "A";
    } else {
      // Out of play - add to current team
      currentTime += actualTime;
    }
    prevEvent = event;
  });
  const filtered = result
    .filter((x) => x[1] > 1000) //Filter out subsecond possessions
    .reduce(
      (acc, cur) => {
        if (acc.length > 1 && acc[acc.length - 1][0] == cur[0]) {
          acc[acc.length - 1][1] += cur[1];
        } else {
          acc.push(cur);
        }
        return acc;
      },
      [] as Array<[Side, TotalTime]>,
    );
  const r: [[TotalTime, Recoveries], [TotalTime, Recoveries]] = [
    [
      filtered.filter((x) => x[0] == "H").reduce((a, b) => a + b[1], 0),
      filtered.filter((x) => x[0] == "H").length,
    ],
    [
      filtered.filter((x) => x[0] == "A").reduce((a, b) => a + b[1], 0),
      filtered.filter((x) => x[0] == "A").length,
    ],
  ];
  return r;
}
