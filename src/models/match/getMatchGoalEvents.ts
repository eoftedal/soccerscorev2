import type { Assister, GoalScorer, Match, Period } from "../types";

export function getMatchGoalEvents(match: Match) {
  const events = match.periods.flatMap((p) =>
    p.home.goals
      .map((x) => [x, "home", p] as [[number, GoalScorer, Assister?], "home" | "away", Period])
      .concat(p.away.goals.map((x) => [x, "away", p])),
  );
  return events.sort((a, b) => a[0][0] - b[0][0]);
}
