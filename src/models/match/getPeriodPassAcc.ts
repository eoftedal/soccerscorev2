import type { Period } from "../types";
import { getPeriodAllTouches } from "./getPeriodAllTouches";
import { getPeriodPasses } from "./getPeriodPasses";
import type { TeamStat } from "./types";

export function getPeriodPassAcc(period: Period): TeamStat {
  const allTouches = getPeriodAllTouches(period);
  const allPasses = getPeriodPasses(period);
  return [
    allTouches[0] == 0 ? 0 : (allPasses[0] / allTouches[0]) * 100,
    allTouches[1] == 0 ? 0 : (allPasses[1] / allTouches[1]) * 100,
  ];
}
