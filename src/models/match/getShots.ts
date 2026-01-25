import type { Period } from "../types";
import type { TeamStat } from "./types";

export function getShots(period: Period): TeamStat {
  return [
    period.home.shots.length + period.home.goals.length + period.home.penalties.length,
    period.away.shots.length + period.away.goals.length + period.away.penalties.length,
  ];
}