import type { Match } from "../types";

export function getPenaltyScore(match: Match) {
  console.log(match);
  if (!match.penaltyRound) return undefined;
  return [
    match.penaltyRound.events.filter((x) => x[0][0]).length,
    match.penaltyRound.events.filter((x) => x[1][0]).length,
  ];
}