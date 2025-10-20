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
import { useLogoStore } from "./logos";




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
    return matches.value.find((m) => m.id === id);
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
    console.log(matches);
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
    window.localStorage.setItem("teams", JSON.stringify(teams.value));
  }

  function getMatches(teamId: TeamId) {
    return matches.value.filter(m => m.belongsTo == teamId);
  }

  // Migration: Move data URL logos to logos store
  function migrateLogos() {
    const logoStore = useLogoStore();
    const migrationKey = "logos-migrated";
    
    // Only run migration once
    if (localStorage.getItem(migrationKey) === "true") {
      return;
    }

    let migrated = false;

    // Migrate team logos
    Object.values(teams.value).forEach((team) => {
      if (team.logo && team.logo.startsWith("data:")) {
        // Check if this data URL already exists in logos store
        let logoId = logoStore.findLogoByDataUrl(team.logo);
        
        if (!logoId) {
          // Create new logo entry
          logoId = logoStore.addLogo(team.name, team.logo);
        }
        
        // Update team to reference logo ID
        team.logo = logoId;
        migrated = true;
      }
    });

    // Save updated teams if migrated
    if (migrated) {
      window.localStorage.setItem("teams", JSON.stringify(teams.value));
    }

    // Migrate match logos
    matchIndex.value.forEach((id) => {
      const data = window.localStorage.getItem("match-" + id);
      if (data) {
        const match = JSON.parse(data) as Match;
        let matchMigrated = false;

        // Migrate home logo
        if (match.homeLogo && match.homeLogo.startsWith("data:")) {
          let logoId = logoStore.findLogoByDataUrl(match.homeLogo);
          
          if (!logoId) {
            logoId = logoStore.addLogo(match.homeTeam, match.homeLogo);
          }
          
          match.homeLogo = logoId;
          matchMigrated = true;
        }

        // Migrate away logo
        if (match.awayLogo && match.awayLogo.startsWith("data:")) {
          let logoId = logoStore.findLogoByDataUrl(match.awayLogo);
          
          if (!logoId) {
            logoId = logoStore.addLogo(match.awayTeam, match.awayLogo);
          }
          
          match.awayLogo = logoId;
          matchMigrated = true;
        }

        // Save updated match
        if (matchMigrated) {
          window.localStorage.setItem("match-" + id, JSON.stringify(match));
        }
      }
    });

    // Mark migration as complete
    localStorage.setItem(migrationKey, "true");
  }

  // Run migration on store initialization
  migrateLogos();

  return { matches, teams, newMatch, saveMatch, getMatch, newTeam, getMatches, saveTeam };
});
