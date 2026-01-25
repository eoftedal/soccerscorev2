import { EventType } from "./types";
import type { Delta, MatchEventWithDelta, TeamData } from "../types";

export function getAllTeamEvents(
  data: TeamData,
  includeGoals?: boolean,
): Array<[MatchEventWithDelta, EventType]> {
  return data.touches
    .map((x) => [x, EventType.Touch] as [MatchEventWithDelta, EventType])
    .concat(data.corners.map((x) => [x, EventType.Corner]))
    .concat(data.freekicks.map((x) => [x, EventType.Freekick]))
    .concat(data.penalties.map((x) => [x, EventType.Penalty]))
    .concat(includeGoals ? data.goals.map((x) => [[x[0], 0 as Delta], EventType.Goal]) : [])
    .concat((data.offsides ?? []).map((x) => [[x, 0 as Delta], EventType.Offside]));
}