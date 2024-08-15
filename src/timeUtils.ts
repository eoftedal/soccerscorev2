export function msToTimeString(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatScoringTime(time: number, period: number, periodDuration: number) {
  const extraTime = time - (period + 1) * periodDuration;
  if (extraTime <= 0) return time;
  return `${periodDuration * (period + 1)}+${extraTime}`;
}
