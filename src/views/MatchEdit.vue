<script setup lang="ts">
import { useMatchStore } from "@/stores/matches";
import { useLogos } from "@/composables/useLogos";
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { type Assister, type GoalScorer, type Period, type Timestamp } from "../models/types";
import { getGoalEvents, getGoals, swapSides } from "../models/match";
import ActivityDisplay from "@/components/ActivityDisplay.vue";
import ModalDialog from "../components/ModalDialog.vue";
import TagList from "@/components/TagList.vue";
import { now } from "@/timeUtils";
import PeriodPane from "./PeriodPane.vue";
import PenaltyRound from "./PenaltyRound.vue";
import { getMatchGoalEvents } from "@/models/match/getMatchGoalEvents";

const router = useRouter();
const route = useRoute();
const id = route.params.id;
const matchStore = useMatchStore();
const { saveMatch, getMatch, teams } = matchStore;
const { getLogoUrl } = useLogos();

const match = getMatch(id as string);

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
  saveTimeout: undefined as undefined | ReturnType<typeof setTimeout>,
  periodEvents: [] as [number, TouchType, SideType | "N"][],
  promptDialog: {
    title: "",
    data: "",
    onOk: undefined as undefined | (() => void),
  },
  scoreEditDialog : {
    goalScorer: "" as GoalScorer,
    assister: "" as Assister,
    onOk: undefined as undefined | (() => void),
  },
  confirm: {
    title: "",
    onOk: undefined as undefined | (() => void),
  },
  outOfPlayHold: false as boolean,
  showPenalties: false as boolean,
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
      start: now(),
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
function showPenalties() {
  if (!match) return;
  if (match.penaltyRound) {
    state.showPenalties = true;
    return;
  }
  if (!confirmModal.value) return;
  state.confirm.title = "Add penalty round?";
  state.confirm.onOk = () => {
    match.penaltyRound = match.penaltyRound ?? { start: "home", events: [] };
    state.showPenalties = true;
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
    period.stop = now();
    if (match) saveMatch(match);
  };
  confirmModal.value?.open();
}

const goalEvents = computed(() => {
  if (!openPeriod.value) return [];
  return getGoalEvents(openPeriod.value);
});

const goalEventsMatch = computed(() => {
  if (!match?.periods?.length) return [];
  return getMatchGoalEvents(match);
});

function changeName(e: [number, GoalScorer, Assister?]) {
  /*const name = prompt("Scorer", e[1]);
  if (name == null || name == undefined) return;
  e[1] = name;*/
  state.scoreEditDialog.goalScorer = e[1];
  state.scoreEditDialog.assister = e[2] ?? "" as Assister;
  state.scoreEditDialog.onOk = () => {
    e[1] = state.scoreEditDialog.goalScorer;
    e[2] = state.scoreEditDialog.assister;
  };
  scoreModal.value?.open();
}
function swapGoalSide(e: [Timestamp, GoalScorer], side: "home" | "away", period: Period) {
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

function navigateToLogoUpload(side: "home" | "away") {
  if (!match) return;
  router.push({
    name: "logo-upload",
    params: {
      context: `match-${side}`,
      matchId: match.id,
    },
  });
}

function removeLogo(side: "home" | "away") {
  if (!match) return;
  if (side === "home") {
    match.homeLogo = undefined;
  } else {
    match.awayLogo = undefined;
  }
}

// Computed properties for reactive logo URLs
const homeLogoUrl = computed(() => getLogoUrl(match?.homeLogo));
const awayLogoUrl = computed(() => getLogoUrl(match?.awayLogo));
const showLogos = computed(() => homeLogoUrl.value && awayLogoUrl.value);

const scoreModal = ref<InstanceType<typeof ModalDialog> | null>(null);
const promptModal = ref<InstanceType<typeof ModalDialog> | null>(null);
const confirmModal = ref<InstanceType<typeof ModalDialog> | null>(null);
</script>

<template>
  <div v-if="match" class="match" :class="{ home: match?.homeTeam?.includes('Stabæk') }">
    <header :class="{ pending: state.saveTimeout != undefined }" v-if="openPeriod">
      <h1>
        <img v-if="showLogos" :src="homeLogoUrl" alt="Home logo" class="header-logo" />
        <span class="goalHeader">{{ getGoals(match, "home") }}</span
        ><span v-if="!showLogos">{{ match.homeTeam }}</span>
      </h1>
      <h1>
        <span class="time">{{ periodTime }}</span>
        <button @click="confirmEnd">End period</button>
      </h1>
      <h1>
        <img v-if="showLogos" :src="awayLogoUrl" alt="Away logo" class="header-logo" />
        <span class="goalHeader">{{ getGoals(match, "away") }}</span
        ><span v-if="!showLogos">{{ match.awayTeam }}</span>
      </h1>
    </header>
    <header :class="{ pending: state.saveTimeout != undefined }" v-if="!openPeriod">
      <h1>
        {{ match.homeTeam }}
      </h1>
      <h1>
        <span>{{ getGoals(match, "home") }} - {{ getGoals(match, "away") }}</span>
      </h1>
      <h1>
        {{ match.awayTeam }}
      </h1>
    </header>

    <PeriodPane :open-period="openPeriod" v-if="openPeriod" />
    <PenaltyRound
      :penaltyRound="match.penaltyRound"
      v-if="match.penaltyRound && state.showPenalties"
      @close="state.showPenalties = false"
    />

    <div
      class="pause"
      v-if="
        (match.periods.length == 0 || match.periods.every((x) => x.stop)) && !state.showPenalties
      "
    >
      <div class="form teamselect">
        <label>Team:</label>
        <select type="text" v-model="match.belongsTo">
          <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
        </select>
      </div>

      <div class="form swap-row">
        <button @click="swapSides(match)" class="swap">Swap sides</button>
      </div>

      <div class="form team-with-logo">
        <label>Home:</label>
        <input type="text" v-model="match.homeTeam" />
        <div class="logo-container" @click="!homeLogoUrl && navigateToLogoUpload('home')">
          <img v-if="homeLogoUrl" :src="homeLogoUrl" alt="Home logo" class="team-logo" />
          <svg
            v-else
            class="default-crest"
            viewBox="0 0 100 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 10 10 L 90 10 L 90 80 L 50 110 L 10 80 Z" />
          </svg>
          <span v-if="homeLogoUrl" class="remove-logo" @click.stop="removeLogo('home')">✕</span>
        </div>
      </div>

      <div class="form team-with-logo">
        <label>Away:</label>
        <input type="text" v-model="match.awayTeam" />
        <div class="logo-container" @click="!awayLogoUrl && navigateToLogoUpload('away')">
          <img v-if="awayLogoUrl" :src="awayLogoUrl" alt="Away logo" class="team-logo" />
          <svg
            v-else
            class="default-crest"
            viewBox="0 0 100 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 10 10 L 90 10 L 90 80 L 50 110 L 10 80 Z" />
          </svg>
          <span v-if="awayLogoUrl" class="remove-logo" @click.stop="removeLogo('away')">✕</span>
        </div>
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
        <span>{{ match.periodLength }} min</span>
        <input type="range" v-model="match.periodLength" min="10" max="45" />
      </div>
      <div class="form slider">
        <label>Extra time:</label>
        <span>{{ match.extraPeriodLength }} min</span>
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
        <button @click="showPenalties()">
          {{ match.penaltyRound != undefined ? "Show" : "Add" }} penalties
        </button>
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
            {{ e[0][1] }} {{ e[0][2] ? `(${e[0][2]})` : ""  }}</span
          >
          <button @click.prevent="swapGoalSide(e[0] as [Timestamp, GoalScorer], e[1], e[2])">
            Switch team
          </button>
        </div>
      </div>
    </div>

    <div class="goalEvents" v-if="openPeriod">
      <h2>Goals:</h2>
      <div v-for="(e, i) of goalEvents" v-bind:key="i" :class="e[1]">
        <span @click="changeName(e[0])"
          ><span class="time">{{ Math.ceil((e[0][0] - openPeriod.start) / 60000) }}'</span>
          {{ e[0][1] }} {{ e[0][2] ? `(${e[0][2]})` : ""  }}</span
        >
        <button @click.prevent="swapGoalSide(e[0] as [Timestamp, GoalScorer], e[1], e[2])">
          Switch team
        </button>
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
    ref="scoreModal"
    @ok="state.scoreEditDialog.onOk ? state.scoreEditDialog.onOk() : undefined"
  >
    <div class="goalDialog">
      <input type="text" v-model="state.scoreEditDialog.goalScorer" placeholder="Goal scorer" />
      <input type="text" v-model="state.scoreEditDialog.assister" placeholder="Assister" />
    </div>
    
  </ModalDialog>
  <ModalDialog
    v-if="match"
    ref="confirmModal"
    @ok="state.confirm.onOk ? state.confirm.onOk() : undefined"
  >
    {{ state.confirm.title }}
  </ModalDialog>
</template>
<style scoped>
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
  font-size: 120%;
  padding: 5px;
}
.match header h1:last-child {
  text-align: right;
}
.match header .time {
  display: inline-block;
  width: 100%;
  text-align: center;
  font-family: monospace;
}
.match header button {
  padding-left: 1em;
  padding-right: 1em;
}
.match header .header-logo {
  max-width: 56px;
  max-height: 56px;
  object-fit: contain;
  vertical-align: middle;
  margin-right: 0.5em;
}
.match header h1:last-child .header-logo {
  margin-right: 0;
  margin-left: 0.5em;
}

.activityScrollWrapper {
  width: 100%;
}
.activityWrapper {
  margin-top: 1em;
}

.toolbar {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5em 0.5em 0em 0.5em;
}
.toolbar button {
  padding: 1em;
  width: 40%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.goalDialog input {
  width: 100%;
  padding: 0.25em;
  margin-bottom: 0.25em;
}

div.form {
  display: flex;
  width: 100%;
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
  margin-right: 0.5em;
  flex-grow: 1;
}

div.form.team > input {
  flex-grow: 0;
}

div.form > input[type="text"] {
  width: 42%;
}
div.form > input[type="date"] {
  width: 66%;
}

div.form.tags {
  display: block;
}
div.form.slider {
  display: flex;
}
div.form.slider span {
  width: 3.5em;
  text-align: right;
  display: inline-block;
}
div.form.slider input {
  margin-left: 1em;
  accent-color: var(--button-color);
  width: 40%;
}
div.form.tags > div {
  margin-left: 6.27em;
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

div.form.swap-row {
  justify-content: center;
  padding: 0.5em 0;
}

div.form.swap-row button {
  width: auto;
  padding: 0.5em 2em;
}

div.form.team-with-logo {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.25em;
}

div.form.team-with-logo input[type="text"] {
  flex-grow: 1;
  margin-left: 0em;
  margin-right: 0;
}

div.form.team-with-logo .logo-container {
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 4px;
  background: var(--color-background-soft);
  margin-left: 0;
  margin-right: 0.5em;
}

div.form.team-with-logo .logo-container:hover {
  background: var(--color-background-mute);
}

div.form.team-with-logo .team-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

div.form.team-with-logo .default-crest {
  width: 44px;
  height: 53px;
  fill: #ccc;
}

div.form.team-with-logo .remove-logo {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
  line-height: 1;
  padding: 0;
}

div.form.team-with-logo .remove-logo:hover {
  background: #c82333;
}

div.form.logo-upload input[type="file"] {
  flex-grow: 1;
}

div.form.logo-preview {
  align-items: center;
}

div.form.logo-preview img {
  max-width: 60px;
  max-height: 60px;
  object-fit: contain;
  margin-right: 0.5em;
}

div.form.logo-preview button {
  margin-left: auto;
}

h1 .goalHeader {
  float: left;
  font-weight: bold;
  shape-outside: margin-box;
  display: block;
  margin-right: 0.5em;
}
h1:first-child .goalHeader {
  float: right;
  margin-right: 0;
  margin-left: 0.5em;
}
header h1 {
  position: relative;
  display: flow-root;
  word-break: break-word;
  word-wrap: break-word;
}
</style>
