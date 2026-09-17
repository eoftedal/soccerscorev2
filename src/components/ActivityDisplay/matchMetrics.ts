import type { Match, TeamData } from "@/models/types";
import { msToTimeString } from "@/timeUtils";
import {
  getMatchAveragePassStrings,
  getMatchPassAcc,
  getMatchPasses,
  getMatchPassStrings,
  getMatchPossession,
  getMatchRecoveryTime,
  getMatchShotAccuracy,
  getMatchShots,
  getMatchTotalStat,
} from "@/models/match";

export type MatchMetric =
  | "goals"
  | "shots"
  | "shotAccuracy"
  | "corners"
  | "offsides"
  | "freekicks"
  | "penalties"
  | "possession"
  | "possessionTime"
  | "recoveryTime"
  | "touches"
  | "passAccuracy"
  | "passes"
  | "passStrings3"
  | "passStrings5"
  | "passStrings7"
  | "longestPassString"
  | "averagePassString"
  | "yellowCards"
  | "redCards";

export type MatchMetricDef = {
  key: MatchMetric;
  label: string;
  values: (match: Match) => [number, number];
  formatter?: (n: number) => string;
  percentage?: boolean;
  invert?: boolean;
};

/** How one team's value for a metric changed compared to another match */
export type MetricTrend = { team: "home" | "away"; change: "better" | "worse" };

const oneDecimal = (n: number) => n.toFixed(1);

function totals(stat: keyof TeamData) {
  return (match: Match): [number, number] => [
    getMatchTotalStat(match, "home", stat),
    getMatchTotalStat(match, "away", stat),
  ];
}
function firstTwo(data: number[]): [number, number] {
  return [data[0], data[1]];
}
function passStringsOfLength(length: number) {
  return (match: Match) => firstTwo(getMatchPassStrings(match).map((x) => x[length]));
}
function longestPassString(match: Match): [number, number] {
  const passStrings = getMatchPassStrings(match);
  return [Math.max(0, passStrings[0].length - 1), Math.max(0, passStrings[1].length - 1)];
}
function averageRecoveryTime(match: Match): [number, number] {
  const data = getMatchRecoveryTime(match);
  return [
    data[0][1] == 0 ? 0 : data[0][0] / data[0][1] / 1000,
    data[1][1] == 0 ? 0 : data[1][0] / data[1][1] / 1000,
  ];
}
function possessionTime(match: Match): [number, number] {
  const possession = getMatchPossession(match);
  return [possession[2], possession[3]];
}

// Rows shown for a match, in display order. PeriodColumn renders the same rows in the same order.
export const matchMetrics: MatchMetricDef[] = [
  { key: "goals", label: "Goals", values: totals("goals") },
  { key: "shots", label: "Shots", values: getMatchShots },
  {
    key: "shotAccuracy",
    label: "Shots %",
    values: getMatchShotAccuracy,
    formatter: oneDecimal,
    percentage: true,
  },
  { key: "corners", label: "Corners", values: totals("corners") },
  { key: "offsides", label: "Off-sides", values: totals("offsides"), invert: true },
  { key: "freekicks", label: "Free kicks", values: totals("freekicks") },
  { key: "penalties", label: "Penalties", values: totals("penalties") },
  {
    key: "possession",
    label: "Possession",
    values: (m) => firstTwo(getMatchPossession(m)),
    formatter: oneDecimal,
    percentage: true,
  },
  { key: "possessionTime", label: "Poss.time", values: possessionTime, formatter: msToTimeString },
  {
    key: "recoveryTime",
    label: "Recov.time",
    values: averageRecoveryTime,
    formatter: oneDecimal,
    invert: true,
  },
  { key: "touches", label: "Touches", values: totals("touches") },
  {
    key: "passAccuracy",
    label: "Pass %",
    values: getMatchPassAcc,
    formatter: oneDecimal,
    percentage: true,
  },
  { key: "passes", label: "Passes", values: getMatchPasses },
  { key: "passStrings3", label: "3-strings", values: passStringsOfLength(3) },
  { key: "passStrings5", label: "5-strings", values: passStringsOfLength(5) },
  { key: "passStrings7", label: "7-strings", values: passStringsOfLength(7) },
  { key: "longestPassString", label: "Longest string", values: longestPassString },
  {
    key: "averagePassString",
    label: "Avg string",
    values: getMatchAveragePassStrings,
    formatter: oneDecimal,
  },
  { key: "yellowCards", label: "Yellow cards", values: totals("yellowCards"), invert: true },
  { key: "redCards", label: "Red cards", values: totals("redCards"), invert: true },
];
