type GoalScorer = string;
export type Timestamp = number;
export type Delta = number;
export type MatchEvent = Timestamp;
export type UpField = number;
export type MatchEventWithDelta = [Timestamp, Delta];
export type FirstTouchEvent = [Timestamp, Delta, UpField?];

export type Match = {
  id: string;
  location: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  gameType: string;
  state: "not_started" | "paused" | "in_progress" | "finished";
  currentPeriod: number;
  periods: Period[];
  periodLength: number;
  extraPeriodLength: number;
  tags?: string[];
};

export type Period = {
  home: TeamData;
  away: TeamData;
  outOfPlay?: Array<MatchEvent>;
  start: Timestamp;
  stop: Timestamp | undefined;
};

export type TeamData = {
  goals: Array<[MatchEvent, GoalScorer]>;
  shots: Array<MatchEvent>;
  offsides?: Array<MatchEvent>;
  touches: Array<FirstTouchEvent>;
  corners: Array<MatchEventWithDelta>;
  freekicks: Array<MatchEventWithDelta>;
  penalties: Array<MatchEventWithDelta>;
  yellowCards: Array<MatchEvent>;
  redCards: Array<MatchEvent>;
};
