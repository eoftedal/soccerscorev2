<script lang="ts" setup>
import HeaderColumn from "@/components/ActivityDisplay/HeaderColumn.vue";
import MatchColumn from "@/components/ActivityDisplay/MatchColumn.vue";
import type { Match, TeamId } from "@/models/types";
import { useMatchStore } from "@/stores/matches";
import { levenshteinDistance } from "@/stringutils";
import { storeToRefs } from "pinia";
import { computed, reactive, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const teamId = route.params.id as TeamId;

const { matches, teams } = storeToRefs(useMatchStore());

const state = reactive({
  search: "",
  teamName: teams.value[teamId]?.name ?? "",
  teamLogo: teams.value[teamId]?.logo,
  showSingle: false,
});

watch(teams, (newVal) => {
  state.teamName = newVal[teamId]?.name ?? "";
  state.teamLogo = teams.value[teamId]?.logo;
});

function isTextMatch(m: Match) {
  return (
    m.homeTeam.toLowerCase().includes(state.search.toLowerCase()) ||
    m.awayTeam.toLowerCase().includes(state.search.toLowerCase()) ||
    m.tags?.some((t) => t.toLowerCase().includes(state.search.toLowerCase()))
  );
}
function isHomeMatch(match: Match) {
  if (match.homeLogo && match.homeLogo == state.teamLogo) return true;
  if (match.awayLogo && match.awayLogo == state.teamLogo) return false;
  if (match.homeTeam == state.teamName) return true;
  if (match.awayTeam == state.teamName) return false;
  const hdist = levenshteinDistance(match.homeTeam, state.teamName);
  const adist = levenshteinDistance(match.awayTeam, state.teamName);
  if (hdist < adist) return true;
  return false;
}

const sorted = computed(() => {
  const filterFn = (m: Match) => m.belongsTo == teamId;

  return matches.value
    .filter(filterFn)
    .filter((m) => m.state == "finished")
    .filter(isTextMatch)
    .slice()
    .sort((a, b) => {
      return (
        new Date(b.date + "T" + b.time + ":00").getTime() -
        new Date(a.date + "T" + a.time + ":00").getTime()
      );
    })
    .map((m) => {
      return { ...m, isHomeMatch: isHomeMatch(m) };
    });
});
</script>
<template>
  <div :class="{ main: true, singleColumn: state.showSingle, doubleColumn: !state.showSingle }">
    <div class="top">
      <h3>{{ state.teamName }}</h3>

      <div class="icon" @click="state.showSingle = !state.showSingle">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <input type="text" placeholder="Search" class="search" v-model="state.search" />
    <div class="statsGrid">
      <HeaderColumn>
        <template #header>
          <div class="header"></div>
        </template>
      </HeaderColumn>
      <MatchColumn
        v-for="m in sorted.slice(0, 10)"
        :match="m"
        :key="m.id"
        :class="{ home: m.isHomeMatch, away: !m.isHomeMatch }"
      >
        <template #header>
          <div class="header">
            <div>{{ m.date }}</div>
            <span>{{ m.homeTeam }}</span
            ><span> - </span><span>{{ m.awayTeam }}</span>
          </div>
        </template>
      </MatchColumn>
    </div>
  </div>
</template>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
}

.icon {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 1.5em;
  height: 1.5em;
  gap: 0.1em;
}
.icon div {
  width: 100%;
  height: 3px;
  background: var(--color-text);
  border-radius: 1px;
}
.singleColumn .icon div:nth-child(2n) {
  background: var(--color-border-hover);
}

.main {
  padding: 0.5em;
  width: 100vw;
}
.doubleColumn .header span,
.doubleColumn :deep(.row span) {
  opacity: 0.5;
}

.doubleColumn .home .header span:first-of-type,
.doubleColumn .home :deep(.row span:first-of-type) {
  opacity: 1;
}
.doubleColumn .away .header span:nth-of-type(3),
.doubleColumn .away :deep(.row span:nth-of-type(2)) {
  opacity: 1;
}
.statsGrid {
  width: fit-content;
  display: grid;
  grid-template-columns: auto repeat(10, 1fr);
  font-size: 50%;
  padding: 0.5em;
  overflow: auto;
  width: 100%;
}
.singleColumn .header span {
  display: none;
}
.singleColumn :deep(.row span) {
  display: none;
  border: 0;
  text-align: right;
  width: 66%;
}
.singleColumn .away .header span:first-of-type {
  display: inline;
}
.singleColumn .home .header span:nth-of-type(3) {
  display: inline;
}
.singleColumn .home :deep(.row span:first-of-type) {
  display: inline;
}
.singleColumn .away :deep(.row span:nth-of-type(2)) {
  display: inline;
}
.singleColumn .column {
  border-right: 1px solid var(--color-border-hover);
}

.header {
  height: 5em;
  text-align: center;
  overflow: hidden;
}
</style>
