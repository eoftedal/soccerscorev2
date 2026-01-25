import type { Match } from "../types";
import { getPeriodPassStrings } from "./getPeriodPassStrings";

export function getMatchPassStrings(match: Match): [number[], number[]] {
  const periods = match.periods.map(getPeriodPassStrings);
  const total = [[], []] as [number[], number[]];
  periods.forEach((x) => {
    x[0].forEach((y, i) => {
      total[0][i] = (total[0][i] ?? 0) + y;
    });
    x[1].forEach((y, i) => {
      total[1][i] = (total[1][i] ?? 0) + y;
    });
  });
  return total;
}
