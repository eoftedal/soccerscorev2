<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed } from "vue";
import { type Match } from "@/types";
import { useRouter } from "vue-router";
import TagList from "@/components/TagList.vue";

const buildDate = import.meta.env.VITE_BUILD_DATE;

const router = useRouter();

const { matches, newMatch } = useMatchStore();

function score(match: Match) {
  if (match.state == "not_started") return "";
  return match.periods
    .reduce((c, p) => [c[0] + p.home.goals.length, c[1] + p.away.goals.length], [0, 0])
    .join(" - ");
}

const sorted = computed(() => {
  return matches.slice().sort((a, b) => {
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
  return sorted.value.filter((m) => m.state == "finished");
});
function formatDate(date: string) {
  return date.split("-").join(".");
}
function reload() {
  location.href = ".?" + new Date().getTime();
}
</script>

<template>
  <main>
    <h2>New matches</h2>
    <ul class="matchList">
      <li
        v-for="m in notFinished"
        v-bind:key="m.id"
        @click="router.push({ name: 'edit', params: { id: m.id } })"
      >
        <div class="date">{{ formatDate(m.date) }} <TagList :tags="m.tags" /></div>
        <div class="scoring">
          <div class="home">{{ m.homeTeam }}</div>
          <div class="score">-</div>
          <div class="away">{{ m.awayTeam }}</div>
        </div>
      </li>
    </ul>
    <button @click="newMatch()">Add new match</button>
    <h2>Finished matches</h2>
    <ul class="matchList">
      <li
        v-for="m in finished"
        v-bind:key="m.id"
        @click="router.push({ name: 'view', params: { id: m.id } })"
      >
        <div class="date">{{ formatDate(m.date) }} <TagList :tags="m.tags" /></div>
        <div class="scoring">
          <div class="home">{{ m.homeTeam }}</div>
          <div class="score">{{ score(m) }}</div>
          <div class="away">{{ m.awayTeam }}</div>
        </div>
      </li>
    </ul>
    <button @click="router.push({ name: 'export' })">Export/import matches</button>
    <footer @click="reload()">Version: {{ buildDate }}</footer>
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
footer {
  margin-top: 2em;
  font-size: 80%;
  text-align: center;
}
</style>
