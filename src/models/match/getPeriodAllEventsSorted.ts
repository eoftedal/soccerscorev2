import type { Delta, MatchEventWithDelta, Period } from "../types";
import { getAllTeamEvents } from "./getAllTeamEvents";
import { type Side, EventType } from "./types";

export function getPeriodAllEventsSorted(
  period: Period,
  includeGoals?: boolean,
): Array<[Side, MatchEventWithDelta, EventType]> {
  const homeEvents: Array<[Side, MatchEventWithDelta, EventType]> = getAllTeamEvents(
    period.home,
    includeGoals,
  ).map((x) => ["H", ...x]);
  const awayEvents: Array<[Side, MatchEventWithDelta, EventType]> = getAllTeamEvents(
    period.away,
    includeGoals,
  ).map((x) => ["A", ...x]);
  const allEvents = homeEvents
    .concat(awayEvents)
    .concat(period.outOfPlay?.map((x) => ["N", [x, 0 as Delta], EventType.OutOfPlay]) ?? []);
  allEvents.sort((a, b) => a[1][0] - b[1][0]);
  return allEvents;
}
