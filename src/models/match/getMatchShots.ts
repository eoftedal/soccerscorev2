import type { Match } from "../types";
import { getShots } from "./getShots";
import type { TeamStat } from "./types";

export function getMatchShots(match: Match): TeamStat {
  return match.periods.map(getShots).reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
}