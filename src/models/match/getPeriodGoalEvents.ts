import type { Assister, GoalScorer, Period } from "../types";

export function getPeriodGoalEvents(period: Period) {
  const events = period.home.goals
    .map((x) => [x, "home", period] as [[number, GoalScorer, Assister?], "home" | "away", Period])
    .concat(
      period.away.goals.map(
        (x) => [x, "away", period] as [[number, GoalScorer, Assister?], "home" | "away", Period],
      ),
    );
  return events.sort((a, b) => a[0][0] - b[0][0]);
}
