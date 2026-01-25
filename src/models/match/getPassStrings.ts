import type { Period } from "../types";
import { getAllEventsSorted } from "./getAllEventsSorted";
import { EventType } from "./types";

export function getPassStrings(
  period: Period,
): [number[], number[], number, number, [number, number], [number, number]] {
  const allEvents = getAllEventsSorted(period);
  let count = 0;
  let previous = "";
  const result = [[], []] as [number[], number[]];
  const strings: { H: [number, number]; A: [number, number] } = {
    H: [0, 0],
    A: [0, 0],
  };
  allEvents.forEach((x) => {
    if (previous == x[0] && x[2] == EventType.Touch) {
      count++;
      result[x[0] == "H" ? 0 : 1][count] = (result[x[0] == "H" ? 0 : 1][count] ?? 0) + 1;
    } else {
      if (count > 0 && (previous == "H" || previous == "A")) {
        strings[previous][0] += count;
        strings[previous][1]++;
      }
      count = 0;
    }
    previous = x[0];
  });
  if (count > 0 && (previous == "H" || previous == "A")) {
    strings[previous][0] += count;
    strings[previous][1]++;
  }
  return [
    result[0], //array of strings home
    result[1], //array of strings away
    strings.H[1] == 0 ? 0 : strings.H[0] / strings.H[1], //avg string home
    strings.A[1] == 0 ? 0 : strings.A[0] / strings.A[1], //avg string away
    strings.H, // [passes, strings]
    strings.A, // [passes, strings]
  ];
}