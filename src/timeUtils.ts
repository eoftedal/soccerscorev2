import type { Delta, Timestamp } from "./types";

export function msToTimeString(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function now() : Timestamp {
  return Date.now() as Timestamp;
}
export function delta(t: Timestamp, holdStart?: Timestamp) : Delta {
  return (holdStart ? t - holdStart : 0) as Delta;
}

export function formatScoringTime(
  time: number,
  period: number,
  periodDuration: number,
  extraPeriodLength: number,
): string {
  console.log(time, period, periodDuration, extraPeriodLength);
  let periodEnds = (period + 1) * periodDuration;
  if (period > 1) {
    periodEnds = 2 * periodDuration + (period - 1) * extraPeriodLength;
  }
  const extraTime = time - periodEnds;
  if (extraTime <= 0) return `${time}`;
  return `${periodEnds}+${extraTime}`;
}
