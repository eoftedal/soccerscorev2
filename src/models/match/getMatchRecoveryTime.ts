import type { Match } from "../types";
import { getPeriodRecoveryTime } from "./getPeriodRecoveryTime";
import { type TotalTime } from "./types";

export type Recoveries = number;

export function getMatchRecoveryTime(
  match: Match,
): [[TotalTime, Recoveries], [TotalTime, Recoveries]] {
  return match.periods.map(getPeriodRecoveryTime).reduce(
    (acc, n) => {
      acc[0][0] += n[0][0];
      acc[0][1] += n[0][1];
      acc[1][0] += n[1][0];
      acc[1][1] += n[1][1];
      return acc;
    },
    [
      [0, 0],
      [0, 0],
    ],
  );
}
