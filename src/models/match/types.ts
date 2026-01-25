export enum EventType {
  Touch,
  Shot,
  Corner,
  Penalty,
  Freekick,
  OutOfPlay,
  Goal,
  Offside,
}

export type Side = "H" | "A" | "N";

export const CUTOFF = 600;

export type Percentage = number;
export type TotalTime = number;

export type HomeStat = number;
export type AwayStat = number;
export type TeamStat = [HomeStat, AwayStat];
