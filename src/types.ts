export type Match = {
  id: string;
  location: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  state: "not_started" | "paused" | "in_progress" | "finished";
  currentPeriod: number;
  periods: Period[];
  periodLength: number;
};

export type Period = {
  home: TeamData;
  away: TeamData;
  outOfPlay?: Array<MatchEvent>;
  start: number;
  stop: number | undefined;
};

export type TeamData = {
  goals: Array<[MatchEvent, string]>;
  shots: Array<MatchEvent>;
  offsides?: Array<MatchEvent>;
  touches: Array<MatchEventWithDelta>;
  corners: Array<MatchEventWithDelta>;
  freekicks: Array<MatchEventWithDelta>;
  penalties: Array<MatchEventWithDelta>;
  yellowCards: Array<MatchEvent>;
  redCards: Array<MatchEvent>;
};
type MatchEvent = number;
type MatchEventWithDelta = [number, number];
