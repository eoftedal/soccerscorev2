<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed } from "vue";
import { type Match } from "@/types";
import { RouterLink, useRouter } from "vue-router";

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
</script>

<template>
  <main>
    <h2>New matches</h2>
    <ul>
      <li v-for="m in notFinished" v-bind:key="m.id">
        <RouterLink :to="{ name: 'edit', params: { id: m.id } }">
          {{ formatDate(m.date) }} {{ m.time }} - {{ m.homeTeam }} - {{ m.awayTeam }}
        </RouterLink>
      </li>
    </ul>
    <button @click="newMatch()">Add new match</button>
    <h2>Finished matches</h2>
    <ul>
      <li v-for="m in finished" v-bind:key="m.id">
        <RouterLink :to="{ name: 'view', params: { id: m.id } }">
          {{ formatDate(m.date) }} {{ m.time }} - {{ m.homeTeam }} - {{ m.awayTeam }}
          {{ score(m) }}
        </RouterLink>
      </li>
    </ul>
    <button @click="router.push({ name: 'export' })">Export/import matches</button>
  </main>
</template>
<style scoped>
main {
  margin: 2em;
}
ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
  li {
    margin: 0.5em 0;
  }
}
</style>
