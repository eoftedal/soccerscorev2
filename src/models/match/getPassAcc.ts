import type { Period } from "../types";
import { getAllTouches } from "./getAllTouches";
import { getPasses } from "./getPasses";
import type { TeamStat } from "./types";

export function getPassAcc(period: Period): TeamStat {
  const allTouches = getAllTouches(period);
  const allPasses = getPasses(period);
  return [(allPasses[0] / allTouches[0]) * 100, (allPasses[1] / allTouches[1]) * 100];
}
