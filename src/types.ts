declare const __brand: unique symbol;
type BrandedNumber<T> = number & {[__brand]: T };
type BrandedString<T> = string & {[__brand]: T };
export type GoalScorer = BrandedString<"GoalScorer">;

export type Timestamp = BrandedNumber<"timestamp">;
export type Delta = BrandedNumber<"delta">;
export type MatchEvent = Timestamp;
export type UpField = BrandedNumber<"upfield">;
export type MatchEventWithDelta = [Timestamp, Delta];
export type FirstTouchEvent = [Timestamp, Delta];
export type TeamName = BrandedString<"team name">;
export type DateString = BrandedString<"date">;
export type TimeString = BrandedString<"time">;
export type PeriodNumber = BrandedNumber<"period">;
export type PeriodLength = BrandedNumber<"periodLength">;
export type ExtraPeriodLength= BrandedNumber<"extraPeriodLength">;

export type Match = {
  id: string;
  location: string;
  date: DateString;
  time: TimeString;
  homeTeam: TeamName;
  awayTeam: TeamName;
  gameType: string;
  state: "not_started" | "paused" | "in_progress" | "finished";
  currentPeriod: PeriodNumber;
  periods: Period[];
  periodLength: PeriodLength;
  extraPeriodLength: ExtraPeriodLength;
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
