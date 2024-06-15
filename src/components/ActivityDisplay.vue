<script setup lang="ts">
import { type Match, type Period } from "../types";
import ActivityRow from "./ActivityRow.vue";
import { msToTimeString } from "../timeUtils";

import {
  getAllEventsSorted,
  getPassStrings,
  getPossession,
  getTotal,
  getMatchPossession,
  getMatchPassStrings,
  getMatchAveragePassStrings,
  getShots,
  getMatchShots,
} from "../match";
import { computed, ref } from "vue";

const props = defineProps<{
  match: Match;
}>();

const window = ref(20);

const periodPaths = computed(() => {
  return props.match.periods.map((period) => {
    const total = period.stop ? period.stop - period.start : props.match.periodLength * 60 * 1000;
    const allEvents = getAllEventsSorted(period);
    const events = allEvents.map((x, i) => {
      const eventsToLookAt = allEvents
        .slice(i - window.value, i)
        .filter((x) => x != undefined)
        .map((x) => x[0])
        .map((x) => (x == "H" ? 1 : -1))
        .reduce((a, b) => a + b, 0);
      return [x[1][0], eventsToLookAt];
    });
    const path = events.map((xx) => {
      const [eventTime, value] = xx;
      const x = ((eventTime - period.start) / total) * 100;
      const y = 50 - value * 2;
      return `${x} ${y}`;
    });
    const homeGoals = period.home.goals.map((x) => ((x[0] - period.start) / total) * 100);
    const awayGoals = period.away.goals.map((x) => ((x[0] - period.start) / total) * 100);
    return [`M 0 50 ${path.join(" ")} L 100 50`, homeGoals, awayGoals, period] as [
      string,
      number[],
      number[],
      Period,
    ];
  });
});

function firstTwo(data: number[]): [number, number] {
  return [data[0], data[1]];
}
function chunk(data: number[], chunkSize: number = 2) {
  const result = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    result.push(data.slice(i, i + chunkSize));
  }
  return result;
}

function getAllTouches(period: Period): [number, number] {
  return [
    period.home.touches.length + period.home.corners.length + period.home.freekicks.length,
    period.away.touches.length + period.away.corners.length + period.away.freekicks.length,
  ];
}
function getPassAcc(period: Period): [number, number] {
  const allTouches = getAllTouches(period);
  const allPasses = getPassStrings(period);
  return [(allPasses[0][1] / allTouches[0]) * 100, (allPasses[1][1] / allTouches[1]) * 100];
}

function getMatchPassAcc(match: Match): [number, number] {
  const allTouches = match.periods
    .map((p) => getAllTouches(p))
    .reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]);
  const allPasses = getMatchPassStrings(match);
  return [(allPasses[0][1] / allTouches[0]) * 100, (allPasses[1][1] / allTouches[1]) * 100];
}
</script>

<template>
  <div class="wrapper">
    <input type="range" v-model="window" min="1" max="50" step="1" />
    <div class="columns">
      <div class="column">
        <svg height="100" width="100"></svg>
        <div class="row">Goals</div>
        <div class="row">Shots</div>
        <div class="row">Shots %</div>
        <div class="row">Corners</div>
        <div class="row">Free kicks</div>
        <div class="row">Penalties</div>
        <div class="row">Possession</div>
        <div class="row">Poss.time</div>
        <div class="row">Touches</div>
        <div class="row">Pass %</div>
        <div class="row">Passes</div>
        <div class="row">Pass strings</div>
        <div class="row">Long strings</div>
        <div class="row">Avg string</div>
        <div class="row">Yellow cards</div>
        <div class="row">Red cards</div>
      </div>
      <div class="column" v-for="(p, i) of periodPaths" v-bind:key="i">
        <svg height="100" width="100">
          <line x1="0" y1="50" x2="100" y2="50" stroke="black" fill="black" />
          <path :d="p[0]" fill="red" />
          <line
            v-for="(g, i) in p[1]"
            v-bind:key="i"
            :x1="g"
            :x2="g"
            y1="10"
            y2="50"
            g
            fill="none"
            stroke="black"
          />
          <text v-for="(g, i) in p[1]" v-bind:key="i" :x="g" y="10" text-anchor="middle">
            &#x26BD;
          </text>
          <line
            v-for="(g, i) in p[2]"
            v-bind:key="i"
            :x1="g"
            :x2="g"
            y1="90"
            y2="50"
            g
            fill="none"
            stroke="black"
          />
          <text v-for="(g, i) in p[2]" v-bind:key="i" :x="g" y="90" text-anchor="middle">
            &#x26BD;
          </text>
        </svg>
        <ActivityRow :values="[p[3].home.goals.length, p[3].away.goals.length]" />
        <ActivityRow :values="getShots(p[3])" />
        <ActivityRow
          :values="[
            getShots(p[3])[0] == 0 ? 0 : (p[3].home.goals.length / getShots(p[3])[0]) * 100,
            getShots(p[3])[1] == 0 ? 0 : (p[3].away.goals.length / getShots(p[3])[1]) * 100,
          ]"
          :formatter="(n) => n.toFixed(1)"
          :percentage="true"
        />
        <ActivityRow :values="[p[3].home.corners.length, p[3].away.corners.length]" />
        <ActivityRow :values="[p[3].home.freekicks.length, p[3].away.freekicks.length]" />
        <ActivityRow :values="[p[3].home.penalties.length, p[3].away.penalties.length]" />
        <ActivityRow
          :values="firstTwo(getPossession(p[3]))"
          :percentage="true"
          :formatter="(n) => n.toFixed(1)"
        />
        <ActivityRow
          :values="firstTwo(chunk(getPossession(p[3]))[1])"
          :formatter="msToTimeString"
        />
        <ActivityRow :values="[p[3].home.touches.length, p[3].away.touches.length]" />
        <ActivityRow :values="getPassAcc(p[3])" :formatter="(n) => n.toFixed(1)" percentage />
        <template v-for="(l, j) in [1, 3, 7]" v-bind:key="j">
          <ActivityRow
            :values="
              firstTwo(
                getPassStrings(p[3])
                  .slice(0, 2)
                  .map((x) => (x as number[])[l]),
              )
            "
          />
        </template>
        <ActivityRow
          :values="getPassStrings(p[3]).slice(2, 4) as [number, number]"
          :formatter="(n) => n.toFixed(1)"
        />
        <ActivityRow :values="[p[3].home.yellowCards.length, p[3].away.yellowCards.length]" />
        <ActivityRow :values="[p[3].home.redCards.length, p[3].away.redCards.length]" />
      </div>

      <!-- Total -->
      <div class="column">
        <svg height="100" width="100"></svg>
        <ActivityRow
          :values="[getTotal(props.match, 'home', 'goals'), getTotal(props.match, 'away', 'goals')]"
        />
        <ActivityRow :values="getMatchShots(props.match)" />
        <ActivityRow
          :values="[
            (getTotal(props.match, 'home', 'goals') / getMatchShots(props.match)[0]) * 100,
            (getTotal(props.match, 'away', 'goals') / getMatchShots(props.match)[1]) * 100,
          ]"
          :formatter="(n) => n.toFixed(1)"
          percentage
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'corners'),
            getTotal(props.match, 'away', 'corners'),
          ]"
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'freekicks'),
            getTotal(props.match, 'away', 'freekicks'),
          ]"
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'penalties'),
            getTotal(props.match, 'away', 'penalties'),
          ]"
        />
        <ActivityRow
          :values="firstTwo(getMatchPossession(props.match))"
          :percentage="true"
          :formatter="(n) => n.toFixed(1)"
        />
        <ActivityRow
          :values="firstTwo(chunk(getMatchPossession(props.match))[1])"
          :formatter="msToTimeString"
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'touches'),
            getTotal(props.match, 'away', 'touches'),
          ]"
        />
        <ActivityRow
          :values="getMatchPassAcc(props.match)"
          percentage
          :formatter="(n) => n.toFixed(1)"
        />
        <template v-for="(l, j) in [1, 3, 7]" v-bind:key="j">
          <ActivityRow :values="firstTwo(getMatchPassStrings(props.match).map((x) => x[l]))" />
        </template>
        <ActivityRow
          :values="getMatchAveragePassStrings(props.match)"
          :formatter="(n) => n.toFixed(1)"
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'yellowCards'),
            getTotal(props.match, 'away', 'yellowCards'),
          ]"
        />
        <ActivityRow
          :values="[
            getTotal(props.match, 'home', 'redCards'),
            getTotal(props.match, 'away', 'redCards'),
          ]"
        />
      </div>
    </div>
  </div>
</template>
<style>
input[type="range"] {
  margin-left: 100px;
  width: 200px;
}
.columns {
  display: flex;
}
.column svg {
  border-left: 1px dashed #999;
}
.column:first-child svg {
  border-left: none;
}
.column:nth-child(2) svg {
  border-left: none;
}
.column:last-child svg {
  border-left: none;
}

svg,
.placeholder {
  width: 100px;
  height: 100px;
}
.row {
  width: 100%;
  display: flex;
}
.row span {
  text-align: right;
  width: 100%;
  padding: 0px 3px;
}
.row span:last-child {
  margin-right: 2px;
}
.row span:first-child {
  margin-left: 2px;
}
.row span:nth-child(2) {
  text-align: left;
}
.row span:first-child {
  border-right: 1px solid #ccc;
}
</style>
