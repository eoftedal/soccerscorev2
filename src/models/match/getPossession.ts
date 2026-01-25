import type { Period } from "../types";
import { getAllEventsSorted } from "./getAllEventsSorted";
import { CUTOFF, EventType, type Percentage, type TotalTime } from "./types";

export function getPossession(period: Period): [Percentage, Percentage, TotalTime, TotalTime] {
  const allEvents = getAllEventsSorted(period, true);
  const possession = [0, 0];
  let previous = -1;
  let previousT = "";
  allEvents.forEach((x) => {
    if (previous != -1 && previousT != "") {
      const delay = x[1][1] > CUTOFF ? x[1][1] : 0;
      if (previousT == "H") {
        possession[0] += x[1][0] - delay - previous;
      } else if (previousT == "A") {
        possession[1] += x[1][0] - delay - previous;
      }
    }
    previous = x[1][0];
    previousT = x[0];
    if (x[2] == EventType.Goal || x[2] == EventType.Offside) {
      previousT = "N";
    }
  });
  const total = possession[0] + possession[1];
  if (total == 0) return [0, 0, 0, 0];
  return [
    (possession[0] / total) * 100,
    (possession[1] / total) * 100,
    possession[0],
    possession[1],
  ];
}