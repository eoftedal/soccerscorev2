import type { Match, Period, TeamData } from "./types";

enum EventType {
  Touch,
  Shot,
  Corner,
  Penalty,
  Freekick,
}

type Side = "H" | "A";

function getAllTeamEvents(data: TeamData): Array<[[number, number], EventType]> {
  return data.touches
    .map((x) => [x, EventType.Touch] as [[number, number], EventType])
    .concat(data.corners.map((x) => [x, EventType.Corner]))
    .concat(data.freekicks.map((x) => [x, EventType.Freekick]))
    .concat(data.penalties.map((x) => [x, EventType.Penalty]));
}

export function getAllEventsSorted(period: Period) {
  const homeEvents: Array<[Side, [number, number], EventType]> = getAllTeamEvents(period.home).map(
    (x) => ["H", ...x],
  );
  const awayEvents: Array<[Side, [number, number], EventType]> = getAllTeamEvents(period.away).map(
    (x) => ["A", ...x],
  );
  const allEvents = homeEvents.concat(awayEvents);
  allEvents.sort((a, b) => a[1][0] - b[1][0]);
  return allEvents;
}

export function getPossession(period: Period): [number, number, number, number] {
  const allEvents = getAllEventsSorted(period);
  const possession = [0, 0];
  let previous = -1;
  let previousT = "";
  allEvents.forEach((x) => {
    if (previous != -1 && previousT != "") {
      if (previousT == "H") {
        possession[0] += x[1][0] - x[1][1] - previous;
      } else if (previousT == "A") {
        possession[1] += x[1][0] - x[1][1] - previous;
      }
    }
    previous = x[1][0];
    previousT = x[0];
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
export function getMatchPossession(match: Match): [number, number, number, number] {
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
  return match.periods.reduce((acc, x) => acc + x[team][stat].length, 0);
}

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
      if (count > 0) {
        strings[x[0]][0] += count;
        strings[x[0]][1]++;
      }
      count = 0;
    }
    previous = x[0];
  });
  return [
    result[0],
    result[1],
    strings.H[1] == 0 ? 0 : strings.H[0] / strings.H[1],
    strings.A[1] == 0 ? 0 : strings.A[0] / strings.A[1],
    strings.H,
    strings.A,
  ];
}

export function getMatchAveragePassStrings(match: Match): [number, number] {
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
  const result = {} as Record<string, number[]>;
  match.periods.forEach((p, i) => {
    p[side].goals.forEach((x) => {
      const goalTime = Math.ceil((x[0] - p.start) / 60000) + i * m.periodLength;
      const name = x[1] || "Unknown";
      result[name] = result[name] ?? [];
      result[name].push(goalTime);
    });
  });
  const all = Object.entries(result);
  all.sort((a, b) => {
    return Math.min(...a[1]) - Math.min(...b[1]);
  });
  return all;
}
