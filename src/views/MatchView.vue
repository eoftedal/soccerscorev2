<script lang="ts" setup>
import { useMatchStore } from "@/stores/matches";
import { computed } from "vue";
import { useRoute } from "vue-router";
import ActivityDisplay from "@/components/ActivityDisplay.vue";

const route = useRoute();
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
  return goalScorers("home");
});
const awayGoalScorers = computed(() => {
  return goalScorers("away");
});
function goalScorers(side: "home" | "away") {
  const m = match.value;
  if (!m) return [];
  const result = {} as Record<string, number[]>;
  match.value.periods.forEach((p, i) => {
    p[side].goals.forEach((x) => {
      const goalTime = Math.ceil((x[0] - p.start + i * m.periodLength) / 60000);
      const name = x[1] || "Unknown";
      result[name] = result[name] ?? [];
      result[name].push(goalTime);
    });
  });
  const all = Object.entries(result);
  all.sort((a, b) => {
    return Math.min(...a[1]) - Math.min(...b[1]);
  });
  return all;
}

console.log(JSON.stringify(match.value).length);
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
      <ActivityDisplay :match="match" />
    </div>
  </main>
</template>
<style scoped>
main {
  margin: 2em;
}
.activity {
  margin-top: 2em;
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
</style>
