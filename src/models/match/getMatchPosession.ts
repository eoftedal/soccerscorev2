import type { Match } from "../types";
import { getPeriodPossession } from "./getPeriodPossession";
import type { Percentage, TotalTime } from "./types";

export function getMatchPossession(match: Match): [Percentage, Percentage, TotalTime, TotalTime] {
  const periods = match.periods.map(getPeriodPossession);
  const total = periods.reduce((acc, x) => [acc[0] + x[2], acc[1] + x[3]], [0, 0]);
  return [
    (total[0] / (total[0] + total[1])) * 100,
    (total[1] / (total[0] + total[1])) * 100,
    total[0],
    total[1],
  ];
}
