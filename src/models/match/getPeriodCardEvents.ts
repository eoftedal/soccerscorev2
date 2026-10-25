import type { Period } from "../types";

export function getPeriodCardEvents(period: Period) {
  const events = period.home.yellowCards
    .map(
      (x) =>
        [[x, "yellow"], "home", period, "card"] as [
          [number, "yellow" | "red"],
          "home" | "away",
          Period,
          "card",
        ],
    )
    .concat(
      period.home.redCards.map(
        (x) =>
          [[x, "red"], "home", period, "card"] as [
            [number, "yellow" | "red"],
            "home" | "away",
            Period,
            "card",
          ],
      ),
    )
    .concat(
      period.away.yellowCards.map(
        (x) =>
          [[x, "yellow"], "away", period, "card"] as [
            [number, "yellow" | "red"],
            "home" | "away",
            Period,
            "card",
          ],
      ),
    )
    .concat(
      period.away.redCards.map(
        (x) =>
          [[x, "red"], "away", period, "card"] as [
            [number, "yellow" | "red"],
            "home" | "away",
            Period,
            "card",
          ],
      ),
    );
  return events.sort((a, b) => a[0][0] - b[0][0]);
}
