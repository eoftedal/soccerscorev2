import type { Period } from "../types";
import { getAllEventsSorted } from "./getAllEventsSorted";
import { CUTOFF, EventType, type Side, type TeamStat } from "./types";

export function getSaves(period: Period): TeamStat {
  const allEvents = getAllEventsSorted(period, true);
  const stat: TeamStat = [0, 0];
  allEvents.forEach((s, i) => {
    if (s[2] != EventType.Shot) return;
    const next = allEvents[i + 1];
    if (!next || next[2] != EventType.Touch) return;
    if (next[1][1] >= CUTOFF) return; //Out of play
    if (s[0] == next[0]) return; // Same side took ball
    if (s[0] == "H") {
      stat[0]++;
    } else {
      stat[1]++;
    }
  });
  return stat;
}
