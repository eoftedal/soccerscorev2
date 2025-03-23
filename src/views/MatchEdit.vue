<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { type Period } from "../types";
import UpDown from "./UpDown.vue";
import { getTotal, swapSides, getPossession } from "../match";
import { setActive, setInactive } from "./buttonUtil";
import ActivityDisplay from "@/components/ActivityDisplay.vue";
import { msToTimeString } from "../timeUtils";
import ModalDialog from "../components/ModalDialog.vue";
import TagList from "@/components/TagList.vue";

const router = useRouter();
const route = useRoute();
const id = route.params.id;
const { matches, saveMatch } = useMatchStore();
const match = matches.find((m) => m.id == id);

const touchTypes = ["touches", "corners", "freekicks", "penalties", "outofplay"] as const;
const side = ["home", "away"] as const;
type TouchType = (typeof touchTypes)[number];
type SideType = (typeof side)[number];

const lockState = ref<WakeLockSentinel | undefined>(undefined);

onMounted(async () => {
  try {
    const wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      console.log("Screen Wake Lock released:", wakeLock.released);
      lockState.value = undefined;
    });
    window.onbeforeunload = () => {
      if (lockState.value?.released === false) wakeLock.release();
      lockState.value = undefined;
    };
    lockState.value = wakeLock;
  } catch (err) {
    // the wake lock request fails - usually system related, such being low on battery
    console.log(err);
    lockState.value = undefined;
  }
});
onUnmounted(() => {
  if (lockState.value?.released === false) lockState.value?.release();
  lockState.value = undefined;
});

const state = reactive({
  holdStart: undefined as undefined | number,
  holdPoint: undefined as undefined | number,
  saveTimeout: undefined as undefined | ReturnType<typeof setTimeout>,
  periodEvents: [] as [number, TouchType, SideType | "N"][],
  promptDialog: {
    title: "",
    data: "",
    onOk: undefined as undefined | (() => void),
  },
  confirm: {
    title: "",
    onOk: undefined as undefined | (() => void),
  },
});

if (match) {
  console.log("I shall watch");
  watch(
    () => match,
    (m) => {
      if (!state.saveTimeout) {
        state.saveTimeout = setTimeout(() => {
          saveMatch(m);
          console.log(new Date().toISOString() + ": Saved match");
          state.saveTimeout = undefined;
        }, 2000);
      }
      //saveMatch(m);
    },
    { deep: true },
  );
}

const gameClock = ref<number>(Date.now());

setInterval(() => {
  if (!openPeriod.value) return;
  gameClock.value = Date.now();
}, 500);

function newPeriod() {
  if (!match) return;
  if (!confirmModal.value) return;
  state.confirm.title = "Start new period?";
  state.confirm.onOk = () => {
    state.periodEvents = [];
    match.periods.push({
      start: new Date().getTime(),
      stop: undefined,
      outOfPlay: [],
      home: {
        touches: [],
        goals: [],
        corners: [],
        shots: [],
        freekicks: [],
        penalties: [],
        redCards: [],
        yellowCards: [],
        offsides: [],
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
        offsides: [],
      },
    });
  };
  confirmModal.value?.open();
}
function endMatch() {
  if (!match) return;
  if (!confirmModal.value) return;
  state.confirm.title = "End match?";
  state.confirm.onOk = () => {
    match.state = "finished";
    router.replace({ name: "view", params: { id: match.id } });
  };
  confirmModal.value?.open();
}

const openPeriod = computed(() => {
  if (!match) return;
  return match.periods.find((p) => !p.stop);
});
function addTouch(period: Period, team: SideType) {
  const t = Date.now();
  const point = state.holdPoint;
  period[team].touches.push([t, state.holdStart ? t - state.holdStart : 0, point]);
  state.holdStart = undefined;
  state.holdPoint = undefined;
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
  key: "redCards" | "shots" | "yellowCards" | "offsides",
) {
  if (period[team][key] == undefined) {
    period[team][key] = [];
  }
  period[team][key]!.push(Date.now());
}
function removeEvent(
  period: Period,
  team: "home" | "away",
  key: "corners" | "freekicks" | "penalties" | "redCards" | "shots" | "yellowCards" | "offsides",
) {
  if (!period[team][key]) return;
  const event = period[team][key]!.pop();
  const eventTime = Array.isArray(event) ? event[0] : event;
  if (!event) return;
  const ix = state.periodEvents.findIndex((x) => x[1] == key && x[2] == team && x[0] == eventTime);
  if (ix > -1) {
    state.periodEvents.splice(ix, 1);
  }
}

function addGoal(period: Period, team: "home" | "away") {
  const t = Date.now();
  //const name = prompt("Scorer");
  if (!state.promptDialog) return;
  state.promptDialog.title = "Scorer";
  state.promptDialog.data = "";
  state.promptDialog.onOk = () => {
    const name = state.promptDialog.data;
    if (name == null || name == undefined) return;
    period[team].goals.push([t, name]);
  };
  promptModal.value?.open();
}
function removeGoal(period: Period, team: "home" | "away") {
  period[team].goals.pop();
}
const periodTime = computed(() => {
  if (!openPeriod.value) return "";
  const elapsed = gameClock.value - openPeriod.value.start;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed - minutes * 60000) / 1000);
  return `${("0" + minutes).slice(-2)}:${("0" + seconds).slice(-2)}`;
});

function confirmEnd() {
  if (!openPeriod.value) return;
  //if (!confirm("Stop the current period?")) return;
  state.confirm.title = "Stop the current period?";
  const period = openPeriod.value;
  state.confirm.onOk = () => {
    period.stop = Date.now();
    if (match) saveMatch(match);
  };
  confirmModal.value?.open();
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

function getAllTouches(period: Period): [number, number] {
  return [
    period.home.touches.length + period.home.corners.length + period.home.freekicks.length,
    period.away.touches.length + period.away.corners.length + period.away.freekicks.length,
  ];
}
function getPassAcc(period: Period): [number, number] {
  const allTouches = getAllTouches(period);
  return [
    allTouches[0] == 0 ? 0 : (homePasses.value / allTouches[0]) * 100,
    allTouches[1] == 0 ? 0 : (awayPasses.value / allTouches[1]) * 100,
  ];
}

const goalEvents = computed(() => {
  if (!openPeriod.value) return [];
  const events = openPeriod.value.home.goals
    .map((x) => [x, "home", openPeriod.value] as [[number, string], "home" | "away", Period])
    .concat(
      openPeriod.value.away.goals.map(
        (x) => [x, "away", openPeriod.value] as [[number, string], "home" | "away", Period],
      ),
    );
  return events.sort((a, b) => a[0][0] - b[0][0]);
});

const goalEventsMatch = computed(() => {
  if (!match?.periods?.length) return [];
  const events = match.periods.flatMap((p) =>
    p.home.goals
      .map((x) => [x, "home", p] as [[number, string], "home" | "away", Period])
      .concat(p.away.goals.map((x) => [x, "away", p])),
  );
  return events.sort((a, b) => a[0][0] - b[0][0]);
});

function changeName(e: [number, string]) {
  /*const name = prompt("Scorer", e[1]);
  if (name == null || name == undefined) return;
  e[1] = name;*/
  state.promptDialog.title = "Scorer";
  state.promptDialog.data = e[1];
  state.promptDialog.onOk = () => {
    e[1] = state.promptDialog.data;
  };
  promptModal.value?.open();
}
function swapGoalSide(e: [number, string], side: "home" | "away", period: Period) {
  const team: "homeTeam" | "awayTeam" = side == "home" ? "awayTeam" : "homeTeam";
  //if (!confirm("Move goal to " + match?.[team] + " ?")) return;
  state.confirm.title = "Move goal to " + match?.[team] + " ?";
  state.confirm.onOk = () => {
    const ix = period[side].goals.indexOf(e);
    if (ix == undefined || ix == -1) return;
    period[side].goals.splice(ix, 1);
    period[side == "home" ? "away" : "home"].goals.push(e);
  };
  confirmModal.value?.open();
}
function addOutOfPlayEvent() {
  if (!openPeriod.value) return;
  openPeriod.value.outOfPlay = openPeriod.value.outOfPlay ?? [];
  const t = Date.now();
  openPeriod.value.outOfPlay.push(t);
  state.periodEvents.push([t, "outofplay", "N"]);
}
function addTag(el: HTMLInputElement) {
  if (!match) return;
  match.tags = match.tags ?? [];
  match.tags.push(el.value);
  el.value = "";
  console.log(match.tags);
}
function removeTag(tag: string) {
  if (!match) return;
  match.tags = match.tags?.filter((x) => x != tag);
}
const promptModal = ref<InstanceType<typeof ModalDialog> | null>(null);
const confirmModal = ref<InstanceType<typeof ModalDialog> | null>(null);

function isOutOfPlay() {
  if (
    state.periodEvents.slice(-1)[0] == undefined ||
    state.periodEvents.slice(-1)[0][1] == "outofplay"
  ) {
    return true;
  }
  const lastTouchEvent = state.periodEvents.slice(-1)[0];
  const lastGoal = (openPeriod.value?.home.goals ?? [])
    .concat(openPeriod.value?.away.goals ?? [])
    .sort((a, b) => a[0] - b[0])
    .slice(-1)[0];
  if (lastGoal == undefined) return false;
  return lastGoal[0] > lastTouchEvent[0];
}
function beginTouch(event: TouchEvent) {
  //
  state.holdStart = Date.now();
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  state.holdPoint = (event.touches[0].clientY - rect.top) / rect.height;
  setActive(event);
}
function finishTouch(event: TouchEvent, side: "home" | "away") {
  if (openPeriod.value) addTouch(openPeriod.value, side);
  setInactive(event);
}
/*const nese = computed(() => {
  const v = Object.keys(window)
    .filter((k) => k.includes("Wakelock"))
    .map((k) => k + ":" + typeof (window as any)[k].postMessage("disable"))
    .join(",");
  return v;
});*/
</script>

<template>
  <div v-if="match" class="match" :class="{ home: match?.homeTeam?.includes('Stabæk') }">
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
        <button @click="swapSides(match)" class="swap">Swap sides</button>
      </div>
      <div class="form">
        <label>Away:</label>
        <input type="text" v-model="match.awayTeam" />
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
        <label>Gametype:</label>
        <select v-model="match.gameType">
          <option>11v11</option>
          <option>9v9</option>
          <option>7v7</option>
        </select>
      </div>
      <div class="form slider">
        <label>Half time:</label>
        {{ match.periodLength }} min
        <input type="range" v-model="match.periodLength" min="10" max="45" />
      </div>
      <div class="form slider">
        <label>Extra time:</label>
        {{ match.extraPeriodLength }} min
        <input type="range" v-model="match.extraPeriodLength" min="3" max="30" />
      </div>
      <div class="form tags">
        <label>Tags:</label>
        <input type="text" @keydown.enter.prevent="addTag($event.target as HTMLInputElement)" />
        <div class="tags">
          <TagList :tags="match.tags" @click="removeTag" />
        </div>
      </div>
      <div class="toolbar">
        <button @click="newPeriod()">Start new period</button>
        <button @click="endMatch()">End match</button>
      </div>
      <div class="activityScrollWrapper">
        <div class="activityWrapper">
          <ActivityDisplay :match="match" v-if="match.periods.length > 0" />
        </div>
      </div>
      <div class="goalEvents">
        <h2>Goals:</h2>
        <div v-for="(e, i) of goalEventsMatch" v-bind:key="i" :class="e[1]">
          <span @click="changeName(e[0])"
            ><span class="time">{{ Math.ceil((e[0][0] - e[2].start) / 60000) }}'</span>
            {{ e[0][1] }}</span
          >
          <button @click.prevent="swapGoalSide(e[0], e[1], e[2])">Switch team</button>
        </div>
      </div>
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
        @add="addEvent(openPeriod, 'home', 'offsides')"
        @remove="removeEvent(openPeriod, 'home', 'offsides')"
      >
        Off-sides
        <span>{{ openPeriod.home.offsides?.length ?? 0 }}</span>
      </UpDown>
      <div></div>
      <UpDown
        @add="addEvent(openPeriod, 'away', 'offsides')"
        @remove="removeEvent(openPeriod, 'away', 'offsides')"
      >
        Off-sides
        <span>{{ openPeriod.away.offsides?.length ?? 0 }}</span>
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
        Free kicks
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

      <div class="wide">
        <button
          v-if="openPeriod"
          @click="addOutOfPlayEvent"
          :class="{
            active: isOutOfPlay(),
          }"
          class="wide"
        >
          <div>Out of play</div>
        </button>
      </div>
      <div class="big button">
        <button
          class="plus"
          @touchstart.prevent="beginTouch($event)"
          @touchend.prevent="finishTouch($event, 'home')"
        >
          <span>First touch</span>
          <span class="num">{{ openPeriod.home.touches.length }}</span>

          <span>Passes</span>
          <span class="num">{{ homePasses }}</span>
          <span>Pass acc</span>
          <span class="num">{{ getPassAcc(openPeriod)[0].toFixed(1) }}%</span>
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
      <div class="big button right">
        <button
          class="plus"
          @touchstart.prevent="beginTouch($event)"
          @touchend.prevent="finishTouch($event, 'away')"
        >
          <span>First touch</span>
          <span class="num">{{ openPeriod.away.touches.length }}</span>
          <span>Passes</span>
          <span class="num">{{ awayPasses }}</span>
          <span>Pass acc</span>
          <span class="num">{{ getPassAcc(openPeriod)[1].toFixed(1) }}%</span>
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
    <div class="goalEvents" v-if="openPeriod">
      <h2>Goals:</h2>
      <div v-for="(e, i) of goalEvents" v-bind:key="i" :class="e[1]">
        <span @click="changeName(e[0])"
          ><span class="time">{{ Math.ceil((e[0][0] - openPeriod.start) / 60000) }}'</span>
          {{ e[0][1] }}</span
        >
        <button @click.prevent="swapGoalSide(e[0], e[1], e[2])">Switch team</button>
      </div>
    </div>
  </div>
  {{ lockState && !lockState.released ? "Wakelock is active" : "Wakelock not active" }}
  <ModalDialog
    v-if="match"
    ref="promptModal"
    @ok="state.promptDialog.onOk ? state.promptDialog.onOk() : undefined"
  >
    {{ state.promptDialog.title }}
    <input type="text" v-model="state.promptDialog.data" />
  </ModalDialog>
  <ModalDialog
    v-if="match"
    ref="confirmModal"
    @ok="state.confirm.onOk ? state.confirm.onOk() : undefined"
  >
    {{ state.confirm.title }}
  </ModalDialog>
</template>
<style>
.goalEvents h2 {
  text-align: center;
  font-size: 100%;
  border-bottom: 1px solid var(--color-border);
}
.goalEvents {
  padding: 0.5em;
  padding-bottom: 2em;
}
.goalEvents div {
  display: flex;
  justify-content: space-between;
}
.goalEvents div.away {
  flex-direction: row-reverse;
}
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
.match header button {
  padding-left: 1em;
  padding-right: 1em;
}

.grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
div.big {
  height: 41vh;
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
.activityScrollWrapper {
  width: 100%;
}
.activityWrapper {
  margin-top: 1em;
}

button {
  display: flex;
  justify-content: space-between;
}
.button {
  display: flex;
  height: 5.5vh;
  justify-content: space-between;
}
button span {
  pointer-events: none;
}

.button button {
  min-width: 10vw;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.button button.plus {
  min-width: 27vw;
}
.button:nth-child(3n),
.button:nth-child(3n) button {
  flex-direction: row-reverse;
}
.button.big.right,
.button.big.right button {
  flex-direction: row-reverse;
}
.button .minus {
  display: inline-block;
}
.toolbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5em 0.5em 0em 0.5em;
}
.toolbar button {
  padding: 1em;
}
div.mid {
  width: 1em;
}
div.form {
  display: flex;
}
div.form > * {
  margin-left: 0.5em;
  flex-grow: 0;
  flex-shrink: 0;
  display: inline-block;
  align-items: center;
  align-content: center;
}
div.form > input {
  height: 1.8em;
}

div.form.tags {
  display: block;
}
div.form.slider {
  display: flex;
}
div.form.slider input {
  margin-left: 1em;
  accent-color: var(--button-color);
}
div.form.tags > div {
  margin-left: 5.4em;
}
div.form > button {
  height: 2.4em;
  display: flex;
  vertical-align: middle;
}

.pause .form label {
  width: 5.5em;
  display: inline-block;
}
div.wide {
  grid-column-start: 1;
  grid-column-end: 4;
  vertical-align: middle;
  text-align: center;
  button {
    height: 5.5vh;
    width: 100%;
    display: inline-block;
  }
}
</style>
