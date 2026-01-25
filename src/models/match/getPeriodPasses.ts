import type { Period } from "../types";
import { getPeriodAllEventsSorted } from "./getPeriodAllEventsSorted";
import { EventType, type Side, type TeamStat } from "./types";

export function getPeriodPasses(period: Period): TeamStat {
  const allEvents = getPeriodAllEventsSorted(period);
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
