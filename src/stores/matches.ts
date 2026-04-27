import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  DataUrl,
  DateString,
  ExtraPeriodLength,
  Match,
  PeriodLength,
  PeriodNumber,
  Team,
  TeamId,
  TeamName,
  TimeString,
} from "@/models/types";
import { useLogoStore } from "./logos";
import { idbGetAll, idbPut, idbGetMeta, idbSetMeta } from "./db";

export const useMatchStore = defineStore("match", () => {
  const teams = ref<Record<TeamId, Team>>({});
  const matches = ref<Match[]>([]);

  async function init() {
    const migrated = await idbGetMeta("matches-localStorage-migrated");
    if (migrated !== "true") {
      const teamsData = localStorage.getItem("teams");
      if (teamsData) {
        try {
          const teamsObj = JSON.parse(teamsData) as Record<TeamId, Team>;
          for (const team of Object.values(teamsObj)) {
            await idbPut("teams", team);
          }
        } catch (e) {
          console.error("Failed to migrate teams from localStorage to IndexedDB", e);
        }
      }

      const indexData = localStorage.getItem("matchIndex");
      if (indexData) {
        try {
          const ids = JSON.parse(indexData) as string[];
          for (const id of ids) {
            const matchData = localStorage.getItem("match-" + id);
            if (matchData) {
              const match = JSON.parse(matchData) as Match;
              if (!match.gameType) match.gameType = "9v9";
              if (!match.extraPeriodLength) match.extraPeriodLength = 10 as ExtraPeriodLength;
              await idbPut("matches", match);
            }
          }
        } catch (e) {
          console.error("Failed to migrate matches from localStorage to IndexedDB", e);
        }
      }

      await idbSetMeta("matches-localStorage-migrated", "true");
    }

    const allTeams = await idbGetAll<Team>("teams");
    for (const team of allTeams) {
      teams.value[team.id] = team;
    }

    const allMatches = await idbGetAll<Match>("matches");
    for (const match of allMatches) {
      if (!match.gameType) match.gameType = "9v9";
      if (!match.extraPeriodLength) match.extraPeriodLength = 10 as ExtraPeriodLength;
      matches.value.push(match);
    }

    const logoStore = useLogoStore();
    await logoStore.initialized;
    await migrateLogoData(logoStore);
  }

  const initialized = init();

  async function migrateLogoData(logoStore: ReturnType<typeof useLogoStore>) {
    if (localStorage.getItem("logos-migrated") === "true") return;

    for (const team of Object.values(teams.value)) {
      if (team.logo && team.logo.startsWith("data:")) {
        let logoId = logoStore.findLogoByDataUrl(team.logo);
        if (!logoId) {
          logoId = logoStore.addLogo(team.name, team.logo as DataUrl);
        }
        team.logo = logoId;
        await idbPut("teams", team);
      }
    }

    for (const match of matches.value) {
      let matchMigrated = false;

      if (match.homeLogo && match.homeLogo.startsWith("data:")) {
        let logoId = logoStore.findLogoByDataUrl(match.homeLogo);
        if (!logoId) {
          logoId = logoStore.addLogo(match.homeTeam, match.homeLogo as DataUrl);
        }
        match.homeLogo = logoId;
        matchMigrated = true;
      }

      if (match.awayLogo && match.awayLogo.startsWith("data:")) {
        let logoId = logoStore.findLogoByDataUrl(match.awayLogo);
        if (!logoId) {
          logoId = logoStore.addLogo(match.awayTeam, match.awayLogo as DataUrl);
        }
        match.awayLogo = logoId;
        matchMigrated = true;
      }

      if (matchMigrated) {
        await idbPut("matches", match);
      }
    }

    localStorage.setItem("logos-migrated", "true");
  }

  function getMatch(id: string): Match | undefined {
    return matches.value.find((m) => m.id === id);
  }

  function saveMatch(match: Match) {
    const index = matches.value.findIndex((m) => m.id === match.id);
    if (index === -1) {
      matches.value.push(match);
    } else {
      matches.value[index] = match;
    }
    idbPut("matches", match);
  }

  function newMatch(id: TeamId) {
    const team = teams.value[id];
    matches.value.push({
      id: new Date().getTime().toString(),
      belongsTo: id,
      homeTeam: (team.displayName || team.name) as TeamName,
      awayTeam: "Motstander" as TeamName,
      homeLogo: `team:${id}`,
      gameType: "11v11",
      currentPeriod: -1 as PeriodNumber,
      periods: [],
      date: new Date().toISOString().split("T")[0] as DateString,
      time: new Date().toTimeString().split(":").slice(0, 2).join(":") as TimeString,
      location: team.homeground ?? "",
      state: "not_started",
      periodLength: 35 as PeriodLength,
      extraPeriodLength: 10 as ExtraPeriodLength,
      tags: [],
    });
  }

  function newTeam(teamName: TeamName) {
    const team: Team = {
      id: window.crypto.randomUUID() as TeamId,
      name: teamName,
      homeground: "",
    };
    saveTeam(team);
    return team;
  }

  function saveTeam(team: Team) {
    teams.value[team.id] = team;
    idbPut("teams", team);
  }

  function getMatches(teamId: TeamId) {
    return matches.value.filter((m) => m.belongsTo == teamId);
  }

  return { matches, teams, initialized, newMatch, saveMatch, getMatch, newTeam, getMatches, saveTeam };
});
