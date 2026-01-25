import type { Period } from "../types";
import { getAllEventsSorted } from "./getAllEventsSorted";
import { EventType, type Side, type TeamStat } from "./types";

export function getPasses(period: Period): TeamStat {
  const allEvents = getAllEventsSorted(period);
  let prev: Side | undefined = undefined;
  const passes: [number, number] = [0, 0];
  allEvents.forEach((x) => {
    if (prev == x[0] && x[2] == EventType.Touch) {
      passes[x[0] == "H" ? 0 : 1]++;
    }
    prev = x[0];
  });
  return passes;
}
