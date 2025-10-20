declare const __brand: unique symbol;
type BrandedNumber<T> = number & { [__brand]: T };
type BrandedString<T> = string & { [__brand]: T };
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
export type ExtraPeriodLength = BrandedNumber<"extraPeriodLength">;

export type TeamId = BrandedString<"teamId">;
export type LogoId = BrandedString<"logoId">;
export type TeamLogoRef = LogoId;
export type MatchLogoRef = LogoId | `team:${string}`;
export type DataUrl = `data:${string}`;

export type Logo = {
  id: LogoId;
  name: string;
  dataUrl: DataUrl;
  uploadedAt: number;
};

export type Team = {
  id: TeamId;
  name: TeamName;
  homeground: string;
  displayName?: TeamName;
  logo?: TeamLogoRef;
};

export type Match = {
  id: string;
  belongsTo?: TeamId;
  homeTeam: TeamName;
  awayTeam: TeamName;
  homeLogo?: MatchLogoRef;
  awayLogo?: MatchLogoRef;
  location: string;
  date: DateString;
  time: TimeString;
  gameType: string;
  state: "not_started" | "paused" | "in_progress" | "finished";
  currentPeriod: PeriodNumber;
  periods: Period[];
  periodLength: PeriodLength;
  extraPeriodLength: ExtraPeriodLength;
  tags?: string[];
  penaltyRound?: PenaltyRound;
};

/**
 * ExportMatch type for exporting matches with embedded logo data URLs
 * instead of logo IDs or references
 */
export type ExportMatch = Omit<Match, "homeLogo" | "awayLogo"> & {
  homeLogo?: DataUrl;
  awayLogo?: DataUrl;
};

export type Period = {
  home: TeamData;
  away: TeamData;
  outOfPlay?: Array<MatchEvent>;
  start: Timestamp;
  stop: Timestamp | undefined;
};

export type PenaltyRound = {
  start: "home" | "away";
  events: Array<[[boolean, GoalScorer], [boolean, GoalScorer]]>;
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
