<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import { type Assister, type Delta, type GoalScorer, type Period, type Timestamp } from "../models/types";
import UpDown from "./UpDown.vue";
import { CUTOFF, getPossession } from "../models/match";
import { setActive, setInactive } from "./buttonUtil";
import { delta, msToTimeString, now } from "../timeUtils";
import ModalDialog from "../components/ModalDialog.vue";

const touchTypes = ["touches", "corners", "freekicks", "penalties", "outofplay"] as const;
const side = ["home", "away"] as const;
type TouchType = (typeof touchTypes)[number];
type SideType = (typeof side)[number];

const props = defineProps<{
  openPeriod: Period;
}>();

const openPeriod = ref<Period>(props.openPeriod);

watch(
  () => props.openPeriod,
  (value: Period) => {
    openPeriod.value = value;
  },
);

const state = reactive({
  holdStart: undefined as undefined | Timestamp,
  periodEvents: [] as [number, TouchType, SideType | "N"][],
  outOfPlayHold: false as boolean,
  scoreDialog: {
    goalScorer: "" as GoalScorer,
    assister: "" as Assister,
    onOk: undefined as undefined | (() => void),
  },
  confirm: {
    title: "",
    onOk: undefined as undefined | (() => void),
  },
});

const scoreModal = ref<InstanceType<typeof ModalDialog> | null>(null);
const confirmModal = ref<InstanceType<typeof ModalDialog> | null>(null);

function isOutOfPlay() {
  if (state.outOfPlayHold) return true;
  if (
    state.periodEvents.slice(-1)[0] == undefined ||
    state.periodEvents.slice(-1)[0][1] == "outofplay"
  ) {
    return true;
  }
  const lastTouchEvent = state.periodEvents.slice(-1)[0];
  const lastGoal = (openPeriod.value.home.goals ?? [])
    .concat(openPeriod.value.away.goals ?? [])
    .sort((a, b) => a[0] - b[0])
    .slice(-1)[0];
  const lastOffside = (openPeriod.value.home.offsides ?? [])
    .concat(openPeriod.value.away.offsides ?? [])
    .sort((a, b) => a - b)
    .slice(-1)[0];
  const lastStoppage = Math.max(lastGoal?.[0] ?? 0, lastOffside ?? 0);
  if (lastStoppage == 0) return false;
  return lastStoppage > lastTouchEvent[0];
}

function addEventWithDelta(
  period: Period | undefined,
  team: "home" | "away",
  key: "corners" | "freekicks" | "penalties",
  time: Timestamp,
  delta: Delta,
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
  period[team][key]!.push(now());
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
  const t = now();
  //const name = prompt("Scorer");
  if (!state.scoreDialog) return;
  state.scoreDialog.assister = "" as Assister;
  state.scoreDialog.goalScorer = "" as GoalScorer;
  state.scoreDialog.onOk = () => {
    const name = state.scoreDialog.goalScorer;
    if (name == null || name == undefined) return;
    period[team].goals.push([t, name as GoalScorer, state.scoreDialog.assister as Assister]);
  };
  scoreModal.value?.open();
}
function removeGoal(period: Period, team: "home" | "away") {
  period[team].goals.pop();
}

function addOutOfPlayEvent() {
  if (state.periodEvents[state.periodEvents.length - 1]?.[1] == "outofplay") {
    state.periodEvents.pop();
    openPeriod.value.outOfPlay?.pop();
    return;
  }
  if (!openPeriod.value) return;
  openPeriod.value.outOfPlay = openPeriod.value.outOfPlay ?? [];
  const t = now();
  openPeriod.value.outOfPlay.push(t);
  state.periodEvents.push([t, "outofplay", "N"]);
}

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

const timeout = {
  pointer: null as null | number,
};

function beginTouch(event: TouchEvent) {
  //
  timeout.pointer = setTimeout(() => {
    state.outOfPlayHold = true;
  }, CUTOFF);
  state.holdStart = now();
  setActive(event);
}
function finishTouch(event: TouchEvent, side: "home" | "away") {
  if (timeout.pointer != null) clearTimeout(timeout.pointer);
  state.outOfPlayHold = false;
  if (openPeriod.value) addTouch(openPeriod.value, side);
  setInactive(event);
}

function addTouch(period: Period, team: SideType) {
  const t = now();
  period[team].touches.push([t, delta(t, state.holdStart)]);
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

const currentPossession = computed(() => {
  if (isOutOfPlay()) return null;
  return state.periodEvents.slice(-1)[0][2];
});
</script>
<template>
  <div
    :class="{
      grid: true,
      homePossession: currentPossession == 'home',
      awayPossession: currentPossession == 'away',
    }"
    v-if="openPeriod"
  >
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
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
    >
      Penalties
      <span>{{ openPeriod.home.penalties.length }}</span>
    </UpDown>
    <div></div>
    <UpDown
      @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'penalties', t, d)"
      @remove="removeEvent(openPeriod, 'away', 'penalties')"
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
    >
      Penalties
      <span>{{ openPeriod.away.penalties.length }}</span>
    </UpDown>

    <UpDown
      @add="(t, d) => addEventWithDelta(openPeriod, 'home', 'corners', t, d)"
      @remove="removeEvent(openPeriod, 'home', 'corners')"
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
    >
      Corners
      <span>{{ openPeriod.home.corners.length }}</span>
    </UpDown>
    <div></div>
    <UpDown
      @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'corners', t, d)"
      @remove="removeEvent(openPeriod, 'away', 'corners')"
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
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
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
    >
      Free kicks
      <span>{{ openPeriod.home.freekicks.length }}</span>
    </UpDown>
    <div></div>
    <UpDown
      @add="(t, d) => addEventWithDelta(openPeriod, 'away', 'freekicks', t, d)"
      @remove="removeEvent(openPeriod, 'away', 'freekicks')"
      @hold-start="state.outOfPlayHold = true"
      @hold-end="state.outOfPlayHold = false"
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
          wide: true,
          active: isOutOfPlay(),
        }"
      >
        <div>
          {{
            state.periodEvents[state.periodEvents.length - 1]?.[1] == "outofplay"
              ? "Undo Out of play"
              : "Out of play"
          }}
        </div>
      </button>
    </div>
    <div class="big button left">
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
    <ModalDialog
      v-if="openPeriod"
      ref="scoreModal"
      @ok="state.scoreDialog.onOk ? state.scoreDialog.onOk() : undefined"
    >
      <div class="goalsDialog">
      <input type="text" v-model="state.scoreDialog.goalScorer" placeholder="Goal scorer" />
      <input type="text" v-model="state.scoreDialog.assister" placeholder="Assister" />
      </div>
    </ModalDialog>
    <ModalDialog
      v-if="openPeriod"
      ref="confirmModal"
      @ok="state.confirm.onOk ? state.confirm.onOk() : undefined"
    >
      {{ state.confirm.title }}
    </ModalDialog>
  </div>
</template>
<style>
.grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
}
div.big {
  height: 38vh;
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
div.mid {
  width: 1em;
}
.goalsDialog input {
  width: 100%;
  padding: 0.25em;
  margin-bottom: 0.25em;
}

.button {
  display: flex;
  height: 5.5vh;
  justify-content: space-between;
}
button span {
  pointer-events: none;
}
button {
  display: flex;
  justify-content: space-between;
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
.homePossession .button.big.left button.plus:not(.active) {
  background: linear-gradient(
    to bottom,
    var(--color-text) 0px,
    var(--color-text) 8px,
    var(--button-color) 8px,
    var(--button-color) 100%
  );
}
.awayPossession .button.big.right button.plus:not(.active) {
  background: linear-gradient(
    to bottom,
    var(--color-text) 0px,
    var(--color-text) 8px,
    var(--button-color) 8px,
    var(--button-color) 100%
  );
}
div.wide {
  grid-column-start: 1;
  grid-column-end: 4;
  vertical-align: middle;
  text-align: center;
}
div.wide button {
  height: 8.5vh;
  width: 100%;
  display: inline-block;
}
</style>
