<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, reactive, watch } from "vue";
import { type Match, type TeamId } from "@/models/types";
import { useRoute, useRouter } from "vue-router";
import TagList from "@/components/TagList.vue";
import { getMatchGoals } from "../models/match";
import { storeToRefs } from "pinia";
import StyledButton from "@/components/StyledButton.vue";
import MdiIcon from "@/components/MdiIcon.vue";

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
  return getMatchGoals(match, "home") + " - " + getMatchGoals(match, "away");
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
    <h1 @click="editTeam" :class="{ clickable: !isUnassigned }">
      <span>{{ state.teamName }}</span>
      <MdiIcon icon="mdiPencil" />
    </h1>
    <h2 class="header">
      <span>New matches</span>
      <!--
      <StyledButton v-if="!isUnassigned" @click="newMatch(teamId)">Add new match</StyledButton>
      -->
      <span v-if="!isUnassigned" @click="newMatch(teamId)" class="plus">&#x2795;</span>
    </h2>
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

    <h2 class="finished-header">
      <span>Finished matches</span>
      <MdiIcon icon="mdiViewColumnOutline"  @click="router.push({ name: 'team-stats', params: { id: teamId } })" />
    </h2>
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
      <StyledButton @click="router.push({ name: 'export', params: { id: teamId } })"
        icon="mdiDownloadMultipleOutline"
      >
        Export/import matches
      </StyledButton>
      <StyledButton @click="router.push({ name: 'match-select', params: { id: teamId } })"
      icon="mdiListBoxOutline"
      >
        Generate match list image
      </StyledButton>
    </div>
  </main>
</template>
<style scoped>
h1 {
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h1 svg {
  flex-shrink: 0;
  flex-grow: 0;
}
.plus {
  cursor: pointer;
}
.header {
  display: flex;
  justify-content: space-between;
}

.finished-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.finished-header .button {
  filter: grayscale(100%);
}
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
  margin: 0 0 1em 0;
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
  padding: 0.5em 1em;
}

h1.clickable {
  cursor: pointer;
}
.buttonRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5em;
}
</style>
