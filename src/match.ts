import type { Delta, Match, MatchEventWithDelta, Period, TeamData } from "./types";

export enum EventType {
  Touch,
  Shot,
  Corner,
  Penalty,
  Freekick,
  OutOfPlay,
  Goal,
}

type Side = "H" | "A" | "N";

function getAllTeamEvents(
  data: TeamData,
  includeGoals?: boolean,
): Array<[MatchEventWithDelta, EventType]> {
  return data.touches
    .map((x) => [x, EventType.Touch] as [MatchEventWithDelta, EventType])
    .concat(data.corners.map((x) => [x, EventType.Corner]))
    .concat(data.freekicks.map((x) => [x, EventType.Freekick]))
    .concat(data.penalties.map((x) => [x, EventType.Penalty]))
    .concat(includeGoals ? data.goals.map((x) => [[x[0], 0 as Delta], EventType.Goal]) : []);
}

export function getAllEventsSorted(
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

export function getPossession(period: Period): [Percentage, Percentage, TotalTime, TotalTime] {
  const allEvents = getAllEventsSorted(period, true);
  const possession = [0, 0];
  let previous = -1;
  let previousT = "";
  allEvents.forEach((x) => {
    if (previous != -1 && previousT != "") {
      const delay = x[1][1] > 600 ? x[1][1] : 0;
      if (previousT == "H") {
        possession[0] += x[1][0] - delay - previous;
      } else if (previousT == "A") {
        possession[1] += x[1][0] - delay - previous;
      }
    }
    previous = x[1][0];
    previousT = x[0];
    if (x[2] == EventType.Goal) {
      previousT = "N";
    }
  });
  const total = possession[0] + possession[1];
  if (total == 0) return [0, 0, 0, 0];
  return [
    (possession[0] / total) * 100,
    (possession[1] / total) * 100,
    possession[0],
    possession[1],
  ];
}



type Percentage = number;
type TotalTime = number;
export function getMatchPossession(match: Match): [Percentage, Percentage, TotalTime, TotalTime] {
  const periods = match.periods.map(getPossession);
  const total = periods.reduce((acc, x) => [acc[0] + x[2], acc[1] + x[3]], [0, 0]);
  return [
    (total[0] / (total[0] + total[1])) * 100,
    (total[1] / (total[0] + total[1])) * 100,
    total[0],
    total[1],
  ];
}

export function getTotal(match: Match, team: "home" | "away", stat: keyof TeamData): number {
  return match.periods.reduce((acc, x) => acc + (x[team][stat] ?? []).length, 0);
}

/**
 * 
 * @returns strings home, strings away, avg home, avg away, strings and passes home, strings and passes away 
 */
export function getPassStrings(
  period: Period,
): [number[], number[], number, number, [number, number], [number, number]] {
  const allEvents = getAllEventsSorted(period);
  let count = 0;
  let previous = "";
  const result = [[], []] as [number[], number[]];
  const strings: { H: [number, number]; A: [number, number] } = {
    H: [0, 0],
    A: [0, 0],
  };
  allEvents.forEach((x) => {
    if (previous == x[0] && x[2] == EventType.Touch) {
      count++;
      result[x[0] == "H" ? 0 : 1][count] = (result[x[0] == "H" ? 0 : 1][count] ?? 0) + 1;
    } else {
      if (count > 0 && (previous == "H" || previous == "A")) {
        strings[previous][0] += count;
        strings[previous][1]++;
      }
      count = 0;
    }
    previous = x[0];
  });
  if (count > 0 && (previous == "H" || previous == "A")) {
    strings[previous][0] += count;
    strings[previous][1]++;
  }
  return [
    result[0], //array of strings home
    result[1], //array of strings away
    strings.H[1] == 0 ? 0 : strings.H[0] / strings.H[1], //avg string home
    strings.A[1] == 0 ? 0 : strings.A[0] / strings.A[1], //avg string away
    strings.H, // [passes, strings]
    strings.A, // [passes, strings]
  ];
}

type HomeStat = number;
type AwayStat = number;
type TeamStat = [HomeStat, AwayStat];

export function getMatchAveragePassStrings(match: Match): TeamStat {
  const data = match.periods
    .map((p) => getPassStrings(p))
    .map((x) => [x[4], x[5]])
    .reduce(
      (a, b) => {
        return [
          [a[0][0] + b[0][0], a[0][1] + b[0][1]],
          [a[1][0] + b[1][0], a[1][1] + b[1][1]],
        ];
      },
      [
        [0, 0],
        [0, 0],
      ],
    );
  return [
    data[0][1] == 0 ? 0 : data[0][0] / data[0][1],
    data[1][1] == 0 ? 0 : data[1][0] / data[1][1],
  ];
}

export function getMatchPassStrings(match: Match): [number[], number[]] {
  const periods = match.periods.map(getPassStrings);
  const total = [[], []] as [number[], number[]];
  periods.forEach((x) => {
    x[0].forEach((y, i) => {
      total[0][i] = (total[0][i] ?? 0) + y;
    });
    x[1].forEach((y, i) => {
      total[1][i] = (total[1][i] ?? 0) + y;
    });
  });
  return total;
}

export function swapSides(match: Match) {
  match.periods.forEach((x) => {
    const { home, away } = x;
    x.home = away;
    x.away = home;
  });
  const { homeTeam, awayTeam } = match;
  match.homeTeam = awayTeam;
  match.awayTeam = homeTeam;
}

export function goalScorers(match: Match, side: "home" | "away") {
  const m = match;
  if (!m) return [];
  const result = {} as Record<string, [number, number, string][]>;

  match.periods.forEach((p, i) => {
    const allEvents = getAllEventsSorted(p, false);
    p[side].goals.forEach((x) => {
      const eventsBefore = allEvents.filter((y) => y[1][0] < x[0] && y[2] != EventType.OutOfPlay);
      let elapsed = i * m.periodLength;
      if (i > 1) {
        elapsed = 2 * m.periodLength + (i - 2) * m.extraPeriodLength;
      }
      const prevEvent = eventsBefore[eventsBefore.length - 1];
      const goalTime = Math.ceil((x[0] - p.start) / 60000) + elapsed;
      const name = x[1] || "Unknown";
      result[name] = result[name] ?? [];
      const tag = prevEvent[2] == EventType.Penalty ? " (pen)" : "";
      result[name].push([goalTime, i, tag]);
    });
  });
  const all = Object.entries(result);
  all.sort((a, b) => {
    return Math.min(...a[1].map((x) => x[0])) - Math.min(...b[1].map((x) => x[0]));
  });
  return all;
}

export function getShots(period: Period): TeamStat {
  return [
    period.home.shots.length + period.home.goals.length + period.home.penalties.length,
    period.away.shots.length + period.away.goals.length + period.away.penalties.length,
  ];
}
export function getShotAccuracy(period: Period): TeamStat {
  const shots = getShots(period);
  const goals = [period.home.goals.length, period.away.goals.length];
  return [
    shots[0] == 0 ? 0 : (goals[0] / shots[0]) * 100,
    shots[1] == 0 ? 0 : (goals[1] / shots[1]) * 100,
  ];
}

export function getMatchShots(match: Match): TeamStat {
  return match.periods.map(getShots).reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
}
export function getMatchShotAccuracy(match: Match): TeamStat {
  const shots = getMatchShots(match);
  const goals = match.periods
    .map((x) => [x.home.goals.length, x.away.goals.length])
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  return [
    shots[0] == 0 ? 0 : (goals[0] / shots[0]) * 100,
    shots[1] == 0 ? 0 : (goals[1] / shots[1]) * 100,
  ];
}
export function getPasses(period: Period): TeamStat {
  const allEvents = getAllEventsSorted(period);
  let prev: Side | undefined = undefined;
  const passes: [number, number] = [0, 0];
  allEvents.forEach((x) => {
    if (prev == x[0] && x[2] == EventType.Touch) {
      passes[x[0] == "H" ? 0 : 1]++;
    }
    prev = x[0];
  });
  return passes;
}
export function getMatchPasses(match: Match): TeamStat {
  const strings = match.periods.map(getPasses);
  return [strings.reduce((a, b) => a + b[0], 0), strings.reduce((a, b) => a + b[1], 0)];
}

export function getAllTouches(period: Period): TeamStat {
  return [
    period.home.touches.length + period.home.corners.length + period.home.freekicks.length,
    period.away.touches.length + period.away.corners.length + period.away.freekicks.length,
  ];
}
export function getPassAcc(period: Period): TeamStat {
  const allTouches = getAllTouches(period);
  const allPasses = getPasses(period);
  return [(allPasses[0] / allTouches[0]) * 100, (allPasses[1] / allTouches[1]) * 100];
}

export function getMatchPassAcc(match: Match): TeamStat {
  const allTouches = match.periods
    .map((p) => getAllTouches(p))
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  const allPasses = getMatchPasses(match);
  return [(allPasses[0] / allTouches[0]) * 100, (allPasses[1] / allTouches[1]) * 100];
}
