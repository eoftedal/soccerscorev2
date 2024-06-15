<script lang="ts" setup>
import { useMatchStore } from "@/stores/matches";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ActivityDisplay from "@/components/ActivityDisplay.vue";
import { goalScorers } from "@/match";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const { matches } = useMatchStore();
const match = computed(() => {
  return matches.find((m) => m.id == id);
});

const homeGoals = computed(() => {
  if (!match.value) return [];
  return match.value.periods.flatMap((x) => x.home.goals);
});
const awayGoals = computed(() => {
  if (!match.value) return [];
  return match.value.periods.flatMap((x) => x.away.goals);
});

const homeGoalScorers = computed(() => {
  if (!match.value) return [];
  return goalScorers(match.value, "home");
});
const awayGoalScorers = computed(() => {
  if (!match.value) return [];
  return goalScorers(match.value, "away");
});

const saveBlob = (function () {
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  return function (blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  };
})();

function download() {
  const data = JSON.stringify(match.value);
  const file = new Blob([data], { type: "application/json" });
  saveBlob(file, "data.json");
}
</script>

<template>
  <RouterLink :to="{ name: 'home' }">Back to list</RouterLink>
  <main v-if="match">
    <h3>{{ match.date }} {{ match.time }}</h3>
    <h3>{{ match.location }}</h3>
    <header class="matchview">
      <h1>
        <span>{{ match.homeTeam }}</span>
        <span class="goals">{{ homeGoals.length }}</span>
      </h1>
      <h1 class="divider">-</h1>
      <h1>
        <span class="goals">{{ awayGoals.length }}</span>
        <span>{{ match.awayTeam }}</span>
      </h1>
      <h2 class="home">
        <div v-for="[n, times] in homeGoalScorers" v-bind:key="n">
          {{ n }} {{ times.map((x) => x + "'").join(", ") }}
        </div>
      </h2>
      <div></div>
      <h2 class="away">
        <div v-for="[n, times] in awayGoalScorers" v-bind:key="n">
          {{ n }} {{ times.map((x) => x + "'").join(", ") }}
        </div>
      </h2>
    </header>
    <div class="activity">
      <div class="wrapper">
        <ActivityDisplay :match="match" />
      </div>
    </div>
  </main>
  <div class="buttons">
    <button @click="download()">Download</button>
    <button @click="router.push({ name: 'edit', params: { id } })">Edit</button>
    <button @click="router.push({ name: 'image', params: { id } })">Generate image</button>
  </div>
</template>
<style scoped>
main {
  margin: 0.5em;
}
.activity {
  margin-top: 2em;
  width: calc(100%);
  overflow: auto;
}
.wrapper {
  transform: scale(0.9);
  transform-origin: 0 0;
}
.matchview {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
.matchview h1 {
  display: grid;
  align-items: top;
  grid-template-columns: 1fr auto;
}
h1 {
  font-size: 140%;
}
h1 .goals {
  font-weight: bold;
}
h1.divider {
  width: 0.8em;
  text-align: center;
}

.matchview h2 {
  font-size: 90%;
}
.matchview h2.home div {
  text-align: right;
}
h3 {
  font-size: 100%;
  text-align: center;
  width: 100%;
}
.buttons {
  margin-bottom: 2em;
  display: flex;
  justify-content: space-between;
}
</style>
