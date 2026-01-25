import type { Period } from "../types";
import { getShots } from "./getShots";
import type { TeamStat } from "./types";

export function getShotAccuracy(period: Period): TeamStat {
  const shots = getShots(period);
  const goals = [period.home.goals.length, period.away.goals.length];
  return [
    shots[0] == 0 ? 0 : (goals[0] / shots[0]) * 100,
    shots[1] == 0 ? 0 : (goals[1] / shots[1]) * 100,
  ];
}