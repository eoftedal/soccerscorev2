import type { Period } from "../types";
import { getPeriodShots } from "./getPeriodShots";
import type { TeamStat } from "./types";

export function getPeriodShotAccuracy(period: Period): TeamStat {
  const shots = getPeriodShots(period);
  const goals = [period.home.goals.length, period.away.goals.length];
  return [
    shots[0] == 0 ? 0 : (goals[0] / shots[0]) * 100,
    shots[1] == 0 ? 0 : (goals[1] / shots[1]) * 100,
  ];
}
