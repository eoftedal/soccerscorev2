import type { Match } from "../types";
import { getPeriodPasses } from "./getPeriodPasses";
import type { TeamStat } from "./types";

export function getMatchPasses(match: Match): TeamStat {
  const strings = match.periods.map(getPeriodPasses);
  return [strings.reduce((a, b) => a + b[0], 0), strings.reduce((a, b) => a + b[1], 0)];
}
