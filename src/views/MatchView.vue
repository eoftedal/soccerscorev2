<script lang="ts" setup>
import { useMatchStore } from "@/stores/matches";
import { useLogoStore } from "@/stores/logos";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import ActivityDisplay from "@/components/ActivityDisplay.vue";
import { goalScorers, getPenaltyScore } from "@/match";
import { saveBlob } from "./viewUtils";
import { formatScoringTime } from "@/timeUtils";
import { storeToRefs } from "pinia";

const route = useRoute();
const router = useRouter();
const id = route.params.id;
const { matches } = useMatchStore();
const { teams } = storeToRefs(useMatchStore());
const logoStore = useLogoStore();
const { logos } = storeToRefs(logoStore);
const match = computed(() => {
  return matches.find((m) => m.id == id);
});

function getLogoUrl(logoRef: string | undefined): string | undefined {
  if (!logoRef) return undefined;
  if (logoRef.startsWith('team:')) {
    const teamId = logoRef.substring(5);
    const teamLogo = teams.value[teamId as any]?.logo;
    if (teamLogo) {
      return logos.value[teamLogo as any]?.dataUrl;
    }
    return undefined;
  }
  return logos.value[logoRef as any]?.dataUrl;
}

const homeLogo = computed(() => getLogoUrl(match.value?.homeLogo));
const awayLogo = computed(() => getLogoUrl(match.value?.awayLogo));
const showLogos = computed(() => homeLogo.value && awayLogo.value);

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

function download() {
  const data = JSON.stringify(match.value);
  const file = new Blob([data], { type: "application/json" });
  saveBlob(file, "data.json");
}
</script>

<template>
  <main v-if="match" :class="{ home: match?.homeTeam?.includes('Stabæk') }">
    <h3>{{ match.date }} {{ match.time }}</h3>
    <h3>{{ match.location }}</h3>
    <h3>{{ match.gameType }}</h3>
    <header class="matchview">
      <h1 v-if="!showLogos">
        <span>{{ match.homeTeam }}</span>
        <span class="goals">{{ homeGoals.length }}</span>
      </h1>
      <h1 v-if="showLogos" class="with-logo">
        <div class="logo-section">
          <img :src="homeLogo" alt="Home logo" class="team-logo" />
          <span class="team-name">{{ match.homeTeam }}</span>
        </div>
        <span class="goals">{{ homeGoals.length }}</span>
      </h1>
      <h1 class="divider">-</h1>
      <h1 v-if="!showLogos">
        <span class="goals">{{ awayGoals.length }}</span>
        <span>{{ match.awayTeam }}</span>
      </h1>
      <h1 v-if="showLogos" class="with-logo">
        <span class="goals">{{ awayGoals.length }}</span>
        <div class="logo-section">
          <img :src="awayLogo" alt="Away logo" class="team-logo" />
          <span class="team-name">{{ match.awayTeam }}</span>
        </div>
      </h1>
      <div class="penalties" v-if="match.penaltyRound">
        <div class="teamPenalties">
          <span
            v-for="(e, i) in match.penaltyRound.events"
            :key="i"
            :class="{ goal: e[0][0] }"
          ></span>
        </div>
        <div>Pen {{ getPenaltyScore(match)?.join("-") }}</div>
        <div class="teamPenalties">
          <span
            v-for="(e, i) in match.penaltyRound.events"
            :key="i"
            :class="{ goal: e[1][0] }"
          ></span>
        </div>
      </div>
      <h2 class="home">
        <div v-for="[n, times] in homeGoalScorers" v-bind:key="n">
          {{ n }}
          <span v-for="(x, i) in times" :key="i">
            {{ formatScoringTime(x[0], x[1], match!.periodLength, match!.extraPeriodLength) }}'{{
              x[2]
            }}<span class="buildup">{{ x[3] }}</span
            >{{ i < times.length - 1 ? ", " : "" }}
          </span>
        </div>
      </h2>
      <div></div>
      <h2 class="away">
        <div v-for="[n, times] in awayGoalScorers" v-bind:key="n">
          {{ n }}
          <span v-for="(x, i) in times" :key="i">
            {{ formatScoringTime(x[0], x[1], match!.periodLength, match!.extraPeriodLength) }}'{{
              x[2]
            }}<span class="buildup">{{ x[3] }}</span
            >{{ i < times.length - 1 ? ", " : "" }}
          </span>
        </div>
      </h2>
    </header>
    <div class="activity">
      <div class="wrapper" ref="wrapperOuter">
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

.penalties {
  width: 100%;
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: 0.5em;
}

.activity {
  margin-top: 2em;
  width: calc(100%);
  overflow: auto;
}
.activity > .wrapper {
  width: 100%;
}
.matchview {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
.matchview h1 {
  display: grid;
  align-items: center;
  grid-template-columns: 1fr auto;
}

.matchview h1.with-logo {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.5em;

}

.matchview h1.with-logo:first-child .logo-section {
  justify-self: center;
  grid-column: 1;
}

.matchview h1.with-logo:first-child .goals {
  grid-column: 2;
  justify-self: end;
}

.matchview h1.with-logo:last-of-type {
  grid-template-columns: auto 1fr;
}

.matchview h1.with-logo:last-of-type .goals {
  grid-column: 1;
  justify-self: start;
}

.matchview h1.with-logo:last-of-type .logo-section {
  grid-column: 2;
  justify-self: center;
}

.matchview h1.with-logo .logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25em;
}

.matchview h1.with-logo .team-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.matchview h1.with-logo .team-name {
  font-size: 50%;
  font-weight: normal;
  text-align: center;
  line-height: 1.2;
}

.matchview h2 {
  padding-top: 0.5em;
}

h1 {
  font-size: 140%;
}
h1 .goals {
  font-weight: bold;
  line-height: 1;
}
h1.divider {
  width: 0.8em;
  text-align: center;
  line-height: 1;
}
h1:last-child, span:last-child {
  text-align: right;
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
.buttons button {
  width: 30%;
  text-align: center;
  align-items: center;
  justify-content: center;
}
.penalties {
  display: flex;
  justify-content: center;
}
.teamPenalties span {
  display: inline-block;
  background: red;
  height: 0.6em;
  width: 0.6em;
  border-radius: 50%;
  margin: 0px 1px;
}
.teamPenalties span.goal {
  background: green;
}
.penalties > div {
  margin: 0em 0.25em;
}
span.buildup {
  color: #999;
  font-size: 70%;
}
</style>
