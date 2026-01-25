import type { Match } from "../types";

export function sortMatchesByDateTime(matches: Match[]): Match[] {
  return matches.slice().sort((a, b) => {
    return (
      new Date(b.date + "T" + b.time + ":00").getTime() -
      new Date(a.date + "T" + a.time + ":00").getTime()
    );
  });
}
