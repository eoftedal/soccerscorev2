import type { Match } from "../types";
import { getPeriodShots } from "./getPeriodShots";
import type { TeamStat } from "./types";

export function getMatchShots(match: Match): TeamStat {
  return match.periods.map(getPeriodShots).reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
}
