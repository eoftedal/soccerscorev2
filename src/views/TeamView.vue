<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, reactive, ref, watch } from "vue";
import { type Match, type TeamId } from "@/types";
import { useRoute, useRouter } from "vue-router";
import TagList from "@/components/TagList.vue";
import { getGoals } from "../match";
import { storeToRefs } from "pinia";
import ModalDialog from "../components/ModalDialog.vue";


const router = useRouter();
const route = useRoute();
const teamId = route.params.id as TeamId;

const { newMatch, saveTeam } = useMatchStore();
const { matches, teams } = storeToRefs(useMatchStore());
const state = reactive({
  search: "",
  teamName: teams.value[teamId].name ?? ""
});

watch(teams,
  (newVal) => {
    state.teamName = newVal[teamId].name
  }
);

function score(match: Match) {
  if (match.state == "not_started") return "";
  return getGoals(match, "home") + " - " + getGoals(match, "away");
}

const sorted = computed(() => {
  return matches.value.filter(m => m.belongsTo == teamId).slice().sort((a, b) => {
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
function saveTeamName() {
  const team = teams.value[teamId];
  if (!team) return;
  team.name = state.teamName;
  saveTeam(team);
}
const changeTeamNameModal = ref<InstanceType<typeof ModalDialog> | null>(null);
function openChangeTeamNameDialog() {
  const team = teams.value[teamId];
  if (!team) return;
  state.teamName = team.name;
  changeTeamNameModal.value?.open();
}
</script>

<template>
  <main>
    <h1 @click="openChangeTeamNameDialog">{{ state.teamName }}</h1>
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
    <button @click="newMatch(teamId)">Add new match</button>
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
    <button @click="router.push({ name: 'export' })">Export/import matches</button>
  </main>
  <ModalDialog
        ref="changeTeamNameModal"
        @ok="saveTeamName"
        >
        <h2>Change team name</h2>
    <input type="text" v-model="state.teamName" placeholder="Team name" />
  </ModalDialog>
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
</style>
