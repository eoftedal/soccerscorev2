import type { Match, Period } from "../types";

export function getMatchCardEvents(match: Match) {
  const events = match.periods.flatMap((p) =>
    p.home.yellowCards
      .map(
        (x) =>
          [[x, "yellow"], "home", p, "card"] as [
            [number, "yellow" | "red"],
            "home" | "away",
            Period,
            "card",
          ],
      )
      .concat(
        p.home.redCards.map(
          (x) =>
            [[x, "red"], "home", p, "card"] as [
              [number, "yellow" | "red"],
              "home" | "away",
              Period,
              "card",
            ],
        ),
      )
      .concat(
        p.away.yellowCards.map(
          (x) =>
            [[x, "yellow"], "away", p, "card"] as [
              [number, "yellow" | "red"],
              "home" | "away",
              Period,
              "card",
            ],
        ),
      )
      .concat(
        p.away.redCards.map(
          (x) =>
            [[x, "red"], "away", p, "card"] as [
              [number, "yellow" | "red"],
              "home" | "away",
              Period,
              "card",
            ],
        ),
      ),
  );
  return events.sort((a, b) => a[0][0] - b[0][0]);
}
