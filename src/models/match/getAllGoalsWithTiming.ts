import type { Assister, GoalScorer, Match } from "../types";

export type GoalWithTiming = ["H" | "A", number, GoalScorer, Assister?];

export function getAllGoalsWithTiming(match: Match): GoalWithTiming[][] {
  return match.periods.map((p, i) => {
    const homeGoals = p.home.goals.map((g) => ["H", ...g] as GoalWithTiming);
    const awayGoals = p.away.goals.map((g) => ["A", ...g] as GoalWithTiming);
    const a = [...homeGoals, ...awayGoals];
    a.sort((a, b) => a[1] - b[1]);
    let elapsed = i * match.periodLength;
    if (i > 1) {
      elapsed = 2 * match.periodLength + (i - 2) * match.extraPeriodLength;
    }
    a.forEach((g) => {
      g[1] = Math.ceil((g[1] - p.start) / 60000) + elapsed;
    });
    return a;
  });
}
