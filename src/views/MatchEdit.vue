<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { type Period, type TeamData } from "../types";
import UpDown from "./UpDown.vue";
import { getTotal, swapSides, getPossession } from "../match";
import { setActive, setInactive } from "./buttonUtil";
import ActivityDisplay from "@/components/ActivityDisplay.vue";
import { msToTimeString } from "../timeUtils";

const router = useRouter();
const route = useRoute();
const id = route.params.id;
const { matches, saveMatch } = useMatchStore();
const match = matches.find((m) => m.id == id);

const touchTypes = ["touches", "corners", "freekicks", "penalties"] as const;
const side = ["home", "away"] as const;
type TouchType = (typeof touchTypes)[number];
type SideType = (typeof side)[number];

const state = reactive({
  holdStart: undefined as undefined | number,
  time: Date.now() as number,
  saveTimeout: undefined as undefined | ReturnType<typeof setTimeout>,
  periodEvents: [] as [number, TouchType, SideType][],
});

if (match) {
  console.log("I shall watch");
  watch(
    () => match,
    (m) => {
      if (!state.saveTimeout) {
        state.saveTimeout = setTimeout(() => {
          saveMatch(m);
          state.saveTimeout = undefined;
        }, 2000);
      }
      saveMatch(m);
    },
    { deep: true },
  );
}

setInterval(() => {
  if (!openPeriod.value) return;
  state.time = Date.now();
}, 500);

function newPeriod() {
  if (!match) return;
  if (!confirm("Start new period?")) return;
  state.periodEvents = [];
  match.periods.push({
    start: new Date().getTime(),
    stop: undefined,
    home: {
      touches: [],
      goals: [],
      corners: [],
      shots: [],
      freekicks: [],
      penalties: [],
      redCards: [],
      yellowCards: [],
    },
    away: {
      touches: [],
      goals: [],
      corners: [],
      shots: [],
      freekicks: [],
      penalties: [],
      redCards: [],
      yellowCards: [],
    },
  });
}
function endMatch() {
  if (!match || !confirm("Are you sure you want to end the match?")) return;
  match.state = "finished";
  router.replace({ name: "view", params: { id: match.id } });
}

const openPeriod = computed(() => {
  if (!match) return;
  return match.periods.find((p) => !p.stop);
});
function addTouch(period: Period, team: SideType) {
  const t = Date.now();
  period[team].touches.push([t, state.holdStart ? t - state.holdStart : 0]);
  state.holdStart = undefined;
  state.periodEvents.push([t, "touches", team]);
}
function removeTouch(period: Period, team: SideType) {
  const event = period[team].touches.pop();
  if (!event) return;
  const ix = state.periodEvents.findIndex(
    (x) => x[1] == "touches" && x[2] == team && x[0] == event[0],
  );
  if (ix > -1) {
    state.periodEvents.splice(ix, 1);
  }
}

function addEventWithDelta(
  period: Period | undefined,
  team: "home" | "away",
  key: "corners" | "freekicks" | "penalties",
  time: number,
  delta: number,
) {
  if (!period) return;
  period[team][key].push([time, delta]);
  state.periodEvents.push([time, key, team]);
}
function addEvent(
  period: Period,
  team: "home" | "away",
  key: "redCards" | "shots" | "yellowCards",
) {
  period[team][key].push(Date.now());
}
function removeEvent(
  period: Period,
  team: "home" | "away",
  key: "corners" | "freekicks" | "penalties" | "redCards" | "shots" | "yellowCards",
) {
  const event = period[team][key].pop();
  const eventTime = Array.isArray(event) ? event[0] : event;
  if (!event) return;
  const ix = state.periodEvents.findIndex((x) => x[1] == key && x[2] == team && x[0] == eventTime);
  if (ix > -1) {
    state.periodEvents.splice(ix, 1);
  }
}

function addGoal(period: Period, team: "home" | "away") {
  const name = prompt("Scorer");
  if (name == null || name == undefined) return;
  const t = Date.now();
  period[team].goals.push([t, name]);
}
function removeGoal(period: Period, team: "home" | "away") {
  period[team].goals.pop();
}
const periodTime = computed(() => {
  if (!openPeriod.value) return "";
  const elapsed = state.time - openPeriod.value.start;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed - minutes * 60000) / 1000);
  return `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
});

function confirmEnd() {
  if (!openPeriod.value) return;
  if (!confirm("Stop the current period?")) return;
  openPeriod.value.stop = Date.now();
}
const homePasses = computed(() => {
  return state.periodEvents.filter((x, i) => {
    if (x[1] != "touches" || x[2] != "home") return false;
    const previous = state.periodEvents[i - 1];
    if (!previous || previous[2] != "home") return false;
    return true;
  }).length;
});
const awayPasses = computed(() => {
  return state.periodEvents.filter((x, i) => {
    if (x[1] != "touches" || x[2] != "away") return false;
    const previous = state.periodEvents[i - 1];
    if (!previous || previous[2] != "away") return false;
    return true;
  }).length;
});
const possession = computed(() => {
  if (!openPeriod.value) return [0, 0, 0, 0];
  return getPossession(openPeriod.value);
});
</script>

<template>
  <div v-if="match" class="match">
    <header :class="{ pending: state.saveTimeout != undefined }">
      <h1>{{ match.homeTeam }}</h1>
      <h1>
        <span class="time" v-if="openPeriod">{{ periodTime }}</span>
        <button v-if="openPeriod" @click="confirmEnd">End period</button>
        <span v-if="!openPeriod"
          >{{ getTotal(match, "home", "goals") }} - {{ getTotal(match, "away", "goals") }}</span
        >
      </h1>
      <h1>{{ match.awayTeam }}</h1>
    </header>
    <div class="pause" v-if="match.periods.length == 0 || match.periods.every((x) => x.stop)">
      <div class="form">
        <label>Home:</label>
        <input type="text" v-model="match.homeTeam" />
      </div>
      <div class="form">
        <label>Away:</label>
        <input type="text" v-model="match.awayTeam" />
        <button @click="swapSides(match)">Swap home/away</button>
      </div>
      <div class="form">
        <label>Date:</label>
        <input type="date" v-model="match.date" />
      </div>
      <div class="form">
        <label>Time:</label>
        <input type="time" v-model="match.time" />
      </div>
      <div class="form">
        <label>Location:</label>
        <input type="text" v-model="match.location" />
      </div>
      <div class="form">
        <label>Period duration:</label>
        {{ match.periodLength }}
        <input type="range" v-model="match.periodLength" min="10" max="45" />
      </div>
      <div class="toolbar">
        <button @click="newPeriod()">Start new period</button>
        <button @click="endMatch()">End match</button>
      </div>
      <ActivityDisplay :match="match" v-if="match.periods.length > 0" />
    </div>
    <div class="grid" v-if="openPeriod">
      <UpDown
        @add="addEvent(openPeriod, 'home', 'redCards')"
        @remove="removeEvent(openPeriod, 'home', 'redCards')"
      >
        Red cards
        <span>{{ openPeriod.home.redCards.length }}</span>
      </UpDown>
      <div class="mid"></div>
      <UpDown
        @add="addEvent(openPeriod, 'away', 'redCards')"
        @remove="removeEvent(openPeriod, 'away', 'redCards')"
      >
        Red cards
        <span>{{ openPeriod.away.redCards.length }}</span>
      </UpDown>

      <UpDown
        @add="addEvent(openPeriod, 'home', 'yellowCards')"
        @remove="removeEvent(openPeriod, 'home', 'yellowCards')"
      >
        Yellow cards
        <span>{{ openPeriod.home.yellowCards.length }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="addEvent(openPeriod, 'away', 'yellowCards')"
        @remove="removeEvent(openPeriod, 'away', 'yellowCards')"
      >
        Yellow cards
        <span>{{ openPeriod.away.yellowCards.length }}</span>
      </UpDown>

      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'home', 'penalties', t, d)"
        @remove="removeEvent(openPeriod, 'home', 'penalties')"
      >
        Penalties
        <span>{{ openPeriod.home.penalties.length }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'penalties', t, d)"
        @remove="removeEvent(openPeriod, 'away', 'penalties')"
      >
        Penalties
        <span>{{ openPeriod.away.penalties.length }}</span>
      </UpDown>

      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'home', 'corners', t, d)"
        @remove="removeEvent(openPeriod, 'home', 'corners')"
      >
        Corners
        <span>{{ openPeriod.home.corners.length }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'corners', t, d)"
        @remove="removeEvent(openPeriod, 'away', 'corners')"
      >
        Corners
        <span>{{ openPeriod.away.corners.length }}</span>
      </UpDown>

      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'home', 'freekicks', t, d)"
        @remove="removeEvent(openPeriod, 'home', 'freekicks')"
      >
        Free kicks
        <span>{{ openPeriod.home.freekicks.length }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'freekicks', t, d)"
        @remove="removeEvent(openPeriod, 'away', 'freekicks')"
      >
        Free kicsk
        <span>{{ openPeriod.away.freekicks.length }}</span>
      </UpDown>

      <UpDown @add="addGoal(openPeriod, 'home')" @remove="removeGoal(openPeriod, 'home')">
        Goals
        <span>{{ openPeriod.home.goals.length }}</span>
      </UpDown>
      <div></div>
      <UpDown @add="addGoal(openPeriod, 'away')" @remove="removeGoal(openPeriod, 'away')">
        Goals
        <span>{{ openPeriod.away.goals.length }}</span>
      </UpDown>

      <UpDown
        @add="addEvent(openPeriod, 'home', 'shots')"
        @remove="removeEvent(openPeriod, 'home', 'shots')"
      >
        Shots
        <span>{{ openPeriod.home.shots.length }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="addEvent(openPeriod, 'away', 'shots')"
        @remove="removeEvent(openPeriod, 'away', 'shots')"
      >
        Shots
        <span>{{ openPeriod.away.shots.length }}</span>
      </UpDown>

      <div class="big button">
        <button
          class="plus"
          @touchstart.prevent="
            state.holdStart = Date.now();
            setActive($event);
          "
          @touchend.prevent="
            addTouch(openPeriod, 'home');
            setInactive($event);
          "
        >
          <span>First touch</span>
          <span class="num">{{ openPeriod.home.touches.length }}</span>

          <span>Passes</span>
          <span class="num">{{ homePasses }}</span>

          <span>Possession </span>
          <span class="num">{{ possession[0].toFixed(1) }}%</span>
          <span>Poss. time</span>
          <span class="num">{{ msToTimeString(possession[2]) }}</span>
        </button>
        <button
          class="minus"
          @touchstart.prevent="setActive($event)"
          @touchend.prevent="
            setInactive($event);
            removeTouch(openPeriod, 'home');
          "
        >
          -
        </button>
      </div>
      <div></div>
      <div class="big button">
        <button
          class="plus"
          @touchstart.prevent="
            state.holdStart = Date.now();
            setActive($event);
          "
          @touchend.prevent="
            addTouch(openPeriod, 'away');
            setInactive($event);
          "
        >
          <span>First touch</span>
          <span class="num">{{ openPeriod.away.touches.length }}</span>
          <span>Passes</span>
          <span class="num">{{ awayPasses }}</span>
          <span>Possession</span>
          <span class="num">{{ possession[1].toFixed(1) }}%</span>
          <span>Poss. time</span>
          <span class="num">{{ msToTimeString(possession[3]) }}</span>
        </button>
        <button
          class="minus"
          @touchstart.prevent="setActive($event)"
          @touchend.prevent="
            removeTouch(openPeriod, 'away');
            setInactive($event);
          "
        >
          -
        </button>
      </div>
    </div>
  </div>
</template>
<style>
.match header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  border-top: 1px solid #fff;
}
.match header.pending {
  border-color: #44f;
}
.match header h1 {
  font-size: 140%;
  padding: 5px;
}
.match header h1:last-child {
  text-align: right;
}
.match header .time {
  display: inline-block;
  width: 3.5em;
  text-align: center;
}
.grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
div.big {
  height: 50vh;
  width: 100%;
}
div.big .plus {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 1fr auto;
  text-align: left;
}
div.big .plus .num {
  text-align: right;
}
button {
  display: flex;
  justify-content: space-between;
}
.button {
  display: flex;
  height: 5vh;
  justify-content: space-between;
}
.button button {
  min-width: 10vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.button button.plus {
  min-width: 25vw;
}
.button:nth-child(3n) {
  flex-direction: row-reverse;
}
.button:nth-child(3n) button {
  flex-direction: row-reverse;
}
.button .minus {
  display: inline-block;
}
.toolbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 0.5em;
}
.toolbar button {
  padding: 1em;
}
div.mid {
  width: 1em;
}
.pause .form label {
  width: 8em;
  display: inline-block;
}
</style>
