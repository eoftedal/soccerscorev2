import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  DateString,
  ExtraPeriodLength,
  Match,
  PeriodLength,
  PeriodNumber,
  Team,
  TeamId,
  TeamName,
  TimeString,
} from "@/types";




export const useMatchStore = defineStore("match", () => {
  const matchIndex = ref([] as string[]);
  const loadedIndex = JSON.parse(window.localStorage.getItem("matchIndex") ?? "[]") as string[];
  const teams = ref<Record<TeamId, Team>>(JSON.parse(window.localStorage.getItem("teams") ?? "{}"));

  loadedIndex.forEach((id) => {
    matchIndex.value.push(id);
  });

  const matches = ref<Match[]>([]);
  loadedIndex.forEach((id) => {
    const data = window.localStorage.getItem("match-" + id);
    if (data) {
      const match = JSON.parse(data) as Match;
      if (!match.gameType) match.gameType = "9v9";
      if (!match.extraPeriodLength) match.extraPeriodLength = 10 as ExtraPeriodLength;
      matches.value.push(match);
    }
  });

  function getMatch(id: string): Match | undefined {
    const data = window.localStorage.getItem("match-" + id);
    if (data) {
      const m = JSON.parse(data) as Match;
      if (!m.gameType) m.gameType = "9v9";
      if (!m.extraPeriodLength) m.extraPeriodLength = 10 as ExtraPeriodLength;
      if (!m.tags) m.tags = [];
      return m;
    }
    return undefined;
  }

  function saveMatch(match: Match) {
    console.log("Dey see me saving", match.date);
    if (!matchIndex.value.includes(match.id)) {
      matchIndex.value.push(match.id);
      window.localStorage.setItem("matchIndex", JSON.stringify(matchIndex.value));
    }
    window.localStorage.setItem("match-" + match.id, JSON.stringify(match));
  }

  function newMatch(id: TeamId) {
    const team = teams.value[id];
    matches.value.push({
      id: new Date().getTime().toString(),
      belongsTo: id,
      homeTeam: team.name,
      awayTeam: "Motstander" as TeamName,
      homeLogo: `team:${id}`,
      gameType: "11v11",
      currentPeriod: -1 as PeriodNumber,
      periods: [],
      date: new Date().toISOString().split("T")[0] as DateString,
      time: new Date().toTimeString().split(":").slice(0, 2).join(":") as TimeString,
      location: "Nadderud kunstgress",
      state: "not_started",
      periodLength: 35 as PeriodLength,
      extraPeriodLength: 10 as ExtraPeriodLength,
      tags: [],
    });
    console.log(matches);
  }

  function newTeam(teamName: TeamName) {
    const team: Team = {
      id: window.crypto.randomUUID() as TeamId,
      name: teamName
    };
    saveTeam(team);
    return team;
  }

  function saveTeam(team: Team) {
    teams.value[team.id] = team;
    window.localStorage.setItem("teams", JSON.stringify(teams.value));
  }

  function getMatches(teamId: TeamId) {
    return matches.value.filter(m => m.belongsTo == teamId);
  }

  return { matches, teams, newMatch, saveMatch, getMatch, newTeam, getMatches, saveTeam };
});
