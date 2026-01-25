import type { Match } from "../types";
import { getPassStrings } from "./getPassStrings";
import type { TeamStat } from "./types";

export function getMatchAveragePassStrings(match: Match): TeamStat {
  const data = match.periods
    .map((p) => getPassStrings(p))
    .map((x) => [x[4], x[5]])
    .reduce(
      (a, b) => {
        return [
          [a[0][0] + b[0][0], a[0][1] + b[0][1]],
          [a[1][0] + b[1][0], a[1][1] + b[1][1]],
        ];
      },
      [
        [0, 0],
        [0, 0],
      ],
    );
  return [
    data[0][1] == 0 ? 0 : data[0][0] / data[0][1],
    data[1][1] == 0 ? 0 : data[1][0] / data[1][1],
  ];
}