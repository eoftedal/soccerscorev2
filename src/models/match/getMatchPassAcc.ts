import type { Match } from "../types";
import { getPeriodAllTouches } from "./getPeriodAllTouches";
import { getMatchPasses } from "./getMatchPasses";
import type { TeamStat } from "./types";

export function getMatchPassAcc(match: Match): TeamStat {
  const allTouches = match.periods
    .map((p) => getPeriodAllTouches(p))
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  const allPasses = getMatchPasses(match);
  return [(allPasses[0] / allTouches[0]) * 100, (allPasses[1] / allTouches[1]) * 100];
}
