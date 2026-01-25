import type { Match } from "../types";
import { getPassStrings } from "./getPassStrings";

export function getMatchPassStrings(match: Match): [number[], number[]] {
  const periods = match.periods.map(getPassStrings);
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