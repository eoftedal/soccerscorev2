import { ref } from "vue";
import { defineStore } from "pinia";
import type { Match, Period } from "@/types";

function generateDemoMatch2(): Match {
  const start = new Date("2024-06-04T19:00:00").toISOString();
  const m: Match = {
    id: "2",
    location: "Nadderud kunstgress",
    date: start.split("T")[0],
    time: start.split("T")[1].split(":").slice(0, 2).join(":"),
    homeTeam: "Stabæk",
    awayTeam: "Bortelag",
    gameType: "11v11",
    state: "not_started",
    currentPeriod: 1,
    periodLength: 35,
    extraPeriodLength: 10,
    periods: [],
  };
  return m;
}

function generateDemoMatch(): Match {
  const start = new Date("2021-09-01T19:00:00").toISOString();
  const m: Match = {
    id: "1",
    location: "Nadderud kunstgress",
    date: start.split("T")[0],
    time: start.split("T")[1].split(":").slice(0, 2).join(":"),
    homeTeam: "Stabæk",
    awayTeam: "Demo",
    gameType: "11v11",
    state: "finished",
    currentPeriod: 1,
    periodLength: 35,
    extraPeriodLength: 10,
    periods: [],
  };
  const s = new Date(start).getTime();
  console.log(s);
  m.periods = [0, 1].map((i) => {
    const events = Math.floor(Math.random() * 100 + 600);
    const period: Period = {
      home: {
        goals: [],
        shots: [],
        touches: [],
        corners: [],
        freekicks: [],
        penalties: [],
        yellowCards: [],
        redCards: [],
      },
      away: {
        goals: [],
        shots: [],
        touches: [],
        corners: [],
        freekicks: [],
        penalties: [],
        yellowCards: [],
        redCards: [],
      },
      start: s + i * (35 + 5) * 60 * 1000,
      stop: s + i * (35 + 5) * 60 * 1000 + 35 * 60 * 1000,
    };
    let last = 0;
    for (let j = 0; j < events; j++) {
      const eventTime = Math.floor(period.start + (j * 35 * 60 * 1000) / events);
      const event = Math.random();
      const t = Math.random();
      let team = period.home;
      if (t > 0.5 - last * 0.1) {
        team = period.away;
      }
      last = team == period.home ? -1 : 1;
      if (event < 0.005) {
        const player = ["PlayerA", "PlayerB"][Math.floor(Math.random() * 2)];

        team.goals.push([eventTime, player]);
      } else if (event >= 0.005 && event < 0.04) {
        team.shots.push(eventTime);
      } else if (event >= 0.04 && event < 0.06) {
        team.corners.push([eventTime, 0]);
      } else {
        team.touches.push([eventTime, 0]);
      }
    }
    return period;
  });
  m.periods[0].home.goals.push([m.periods[0].start + (m.periodLength + 1) * 60 * 1000, "PlayerA"]);
  console.log(m);
  return m;
}

export const useMatchStore = defineStore("match", () => {
  const matchIndex = ref([] as string[]);
  const loadedIndex = JSON.parse(window.localStorage.getItem("matchIndex") ?? "[]") as string[];
  loadedIndex.forEach((id) => {
    matchIndex.value.push(id);
  });
  const matches = ref(
    (window.location.hostname == "localhost"
      ? [generateDemoMatch(), generateDemoMatch2()]
      : []) as Match[],
  );
  loadedIndex.forEach((id) => {
    const data = window.localStorage.getItem("match-" + id);
    if (data) {
      const match = JSON.parse(data) as Match;
      if (!match.gameType) match.gameType = "9v9";
      if (!match.extraPeriodLength) match.extraPeriodLength = 10;
      matches.value.push(match);
    }
  });

  function getMatch(id: string): Match | undefined {
    const data = window.localStorage.getItem("match-" + id);
    if (data) {
      const m = JSON.parse(data) as Match;
      if (!m.gameType) m.gameType = "9v9";
      if (!m.extraPeriodLength) m.extraPeriodLength = 10;
      if (!m.tags) m.tags = [];
      return m;
    }
    return undefined;
  }

  function saveMatch(match: Match) {
    if (!matchIndex.value.includes(match.id)) {
      matchIndex.value.push(match.id);
      window.localStorage.setItem("matchIndex", JSON.stringify(matchIndex.value));
    }
    window.localStorage.setItem("match-" + match.id, JSON.stringify(match));
  }

  function newMatch() {
    matches.value.push({
      id: new Date().getTime().toString(),
      homeTeam: "Stabæk",
      awayTeam: "Motstander",
      gameType: "11v11",
      currentPeriod: -1,
      periods: [],
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString().split(":").slice(0, 2).join(":"),
      location: "Nadderud kunstgress",
      state: "not_started",
      periodLength: 35,
      extraPeriodLength: 10,
      tags: [],
    });
  }

  return { matches, newMatch, saveMatch, getMatch };
});
