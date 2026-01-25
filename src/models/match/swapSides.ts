import type { Match } from "../types";

export function swapSides(match: Match) {
  match.periods.forEach((x) => {
    const { home, away } = x;
    x.home = away;
    x.away = home;
  });
  const { homeTeam, awayTeam, homeLogo, awayLogo } = match;
  match.homeTeam = awayTeam;
  match.awayTeam = homeTeam;
  match.homeLogo = awayLogo;
  match.awayLogo = homeLogo;
}
