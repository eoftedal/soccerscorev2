import type { Match, TeamData } from "../types";

export function getTotal(match: Match, team: "home" | "away", stat: keyof TeamData): number {
  return match.periods.reduce((acc, x) => acc + (x[team][stat] ?? []).length, 0);
}