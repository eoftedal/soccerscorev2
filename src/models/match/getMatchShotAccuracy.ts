import type { Match } from "../types";
import { getMatchShots } from "./getMatchShots";
import type { TeamStat } from "./types";

export function getMatchShotAccuracy(match: Match): TeamStat {
  const shots = getMatchShots(match);
  const goals = match.periods
    .map((x) => [x.home.goals.length, x.away.goals.length])
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  return [
    shots[0] == 0 ? 0 : (goals[0] / shots[0]) * 100,
    shots[1] == 0 ? 0 : (goals[1] / shots[1]) * 100,
  ];
}
