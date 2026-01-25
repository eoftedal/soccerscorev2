<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, reactive, watch } from "vue";
import { type Match, type TeamId } from "@/models/types";
import { useRoute, useRouter } from "vue-router";
import TagList from "@/components/TagList.vue";
import { getGoals } from "../models/match";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const teamId = route.params.id as TeamId;
const isUnassigned = teamId === "unassigned";

const { newMatch } = useMatchStore();
const { matches, teams } = storeToRefs(useMatchStore());
const state = reactive({
  search: "",
  teamName: isUnassigned ? "Unassigned" : (teams.value[teamId]?.name ?? ""),
});

watch(teams, (newVal) => {
  if (!isUnassigned) {
    state.teamName = newVal[teamId]?.name ?? "";
  }
});

function score(match: Match) {
  if (match.state == "not_started") return "";
  return getGoals(match, "home") + " - " + getGoals(match, "away");
}

const sorted = computed(() => {
  const filterFn = isUnassigned ? (m: Match) => !m.belongsTo : (m: Match) => m.belongsTo == teamId;

  return matches.value
    .filter(filterFn)
    .slice()
    .sort((a, b) => {
      return (
        new Date(b.date + "T" + b.time + ":00").getTime() -
        new Date(a.date + "T" + a.time + ":00").getTime()
      );
    });
});
const notFinished = computed(() => {
  return sorted.value.filter((m) => m.state != "finished");
});
const finished = computed(() => {
  return sorted.value.filter((m) => m.state == "finished").filter(isMatch);
});
function formatDate(date: string) {
  return date.split("-").join(".");
}

function isMatch(m: Match) {
  return (
    m.homeTeam.toLowerCase().includes(state.search.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(state.search.toLowerCase()) ||
    m.tags?.some((t) => t.toLowerCase().includes(state.search.toLowerCase()))
  );
}
function editTeam() {
  if (!isUnassigned) {
    router.push({ name: "team-edit", params: { id: teamId } });
  }
}
</script>

<template>
  <main>
    <h1 @click="editTeam" :class="{ clickable: !isUnassigned }">{{ state.teamName }}</h1>
    <h2>New matches</h2>
    <ul class="matchList">
      <li
        v-for="m in notFinished"
        v-bind:key="m.id"
        @click="router.push({ name: 'edit', params: { id: m.id } })"
      >
        <div class="date">{{ formatDate(m.date) }} {{ m.time }}<TagList :tags="m.tags" /></div>
        <div class="scoring">
          <div class="home">{{ m.homeTeam }}</div>
          <div class="score">-</div>
          <div class="away">{{ m.awayTeam }}</div>
        </div>
      </li>
    </ul>
    <button v-if="!isUnassigned" @click="newMatch(teamId)">Add new match</button>
    <h2>Finished matches</h2>
    <input type="text" placeholder="Search" class="search" v-model="state.search" />
    <ul class="matchList">
      <li
        v-for="m in finished"
        v-bind:key="m.id"
        @click="router.push({ name: 'view', params: { id: m.id } })"
      >
        <div class="date">{{ formatDate(m.date) }} {{ m.time }}<TagList :tags="m.tags" /></div>
        <div class="scoring">
          <div class="home">{{ m.homeTeam }}</div>
          <div class="score">{{ score(m) }}</div>
          <div class="away">{{ m.awayTeam }}</div>
        </div>
      </li>
    </ul>
    <div class="buttonRow">
      <button @click="router.push({ name: 'export', params: { id: teamId } })">
        Export/import matches
      </button>
      <button @click="router.push({ name: 'match-select', params: { id: teamId } })">
        Generate match image
      </button>
    </div>
  </main>
</template>
<style scoped>
main {
  margin: 2em;
}
.date {
  display: flex;
  justify-content: space-between;
  font-size: 80%;
}
.scoring {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  .home {
    text-align: right;
  }
  .score {
    font-weight: bold;
    padding: 0 0.5em;
  }
}
ul.matchList {
  margin: 0;
  padding: 0;
  list-style-type: none;
  li {
    margin: 0.25em 0;
    padding: 0.25em 0;
    border-bottom: 1px solid var(--color-border);
    &:first-child {
      border-top: 1px solid var(--color-border);
    }
  }
}

input.search {
  width: 100%;
}

h1.clickable {
  cursor: pointer;
}
.buttonRow {
  display: flex;
}
</style>
