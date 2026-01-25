import type { Match } from "../types";

export function getMatchGoals(match: Match, team: "home" | "away"): number {
  const penaltyGoals =
    match?.penaltyRound?.events?.map((x) => x[team == "home" ? 0 : 1]).filter((x) => x[0]).length ??
    0;
  return match.periods.reduce((acc, x) => acc + (x[team].goals ?? []).length, 0) + penaltyGoals;
}