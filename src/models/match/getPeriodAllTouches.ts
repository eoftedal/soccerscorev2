import type { Period } from "../types";
import type { TeamStat } from "./types";

export function getPeriodAllTouches(period: Period): TeamStat {
  return [
    period.home.touches.length + period.home.corners.length + period.home.freekicks.length,
    period.away.touches.length + period.away.corners.length + period.away.freekicks.length,
  ];
}
