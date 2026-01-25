<script setup lang="ts">
import { type Match, type Period } from "../models/types";
import ActivityRow from "./ActivityRow.vue";
import { msToTimeString } from "../timeUtils";
import PeriodChart from "./PeriodChart.vue";
import {
  getPeriodAllEventsSorted,
  getPeriodPassStrings,
  getPeriodPossession,
  getMatchTotalStat,
  getMatchPossession,
  getMatchPassStrings,
  getMatchAveragePassStrings,
  getPeriodShots,
  getMatchShots,
  getMatchShotAccuracy,
  getPeriodShotAccuracy,
  getPeriodPasses,
  getMatchPasses,
  getPeriodPassAcc,
  getMatchPassAcc,
} from "../models/match";
import { computed, ref } from "vue";

const props = defineProps<{
  match: Match;
}>();

const window = ref(20);

const periodPaths = computed(() => {
  return props.match.periods.map((period, i) => {
    const total = period.stop
      ? period.stop - period.start
      : (i <= 1 ? props.match.periodLength : props.match.extraPeriodLength) * 60 * 1000;
    const allEvents = getPeriodAllEventsSorted(period);
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

function getLongestString(period: Period): [number, number] {
  const passStrings = getPeriodPassStrings(period);
  return [passStrings[0].length - 1, passStrings[1].length - 1];
}
function getLongestStringMatch(match: Match): [number, number] {
  const passStrings = getMatchPassStrings(match);
  return [passStrings[0].length - 1, passStrings[1].length - 1];
}
const sizeDivider = computed(() => {
  if (props.match.periods.length > 3) {
    return "calc(100vw/52)";
  } else if (props.match.periods.length > 2) {
    return "calc(100vw/42)";
  }
  return "calc(100vw/36)";
});
</script>

<template>
  <div class="outerWrapper">
    <div class="innerWrapper" :style="{ fontSize: sizeDivider }">
      <!--input type="range" v-model="window" min="1" max="50" step="1" /-->
      <div class="columns">
        <div class="column">
          <svg></svg>
          <div class="row">Goals</div>
          <div class="row">Shots</div>
          <div class="row">Shots %</div>
          <div class="row">Corners</div>
          <div class="row">Off-sides</div>
          <div class="row">Free kicks</div>
          <div class="row">Penalties</div>
          <div class="row">Possession</div>
          <div class="row">Poss.time</div>
          <div class="row">Touches</div>
          <div class="row">Pass %</div>
          <div class="row">Passes</div>
          <div class="row">3-strings</div>
          <div class="row">5-strings</div>
          <div class="row">7-strings</div>
          <div class="row">Longest string</div>
          <div class="row">Avg string</div>
          <div class="row">Yellow cards</div>
          <div class="row">Red cards</div>
        </div>
        <div class="column" v-for="(p, i) of periodPaths" v-bind:key="i">
          <!--svg height="100" width="100">
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
        </svg-->
          <PeriodChart :period="p[3]" :invert="!props.match.homeTeam.includes('Stabæk')" />
          <ActivityRow :values="[p[3].home.goals.length, p[3].away.goals.length]" />
          <ActivityRow :values="getPeriodShots(p[3])" />
          <ActivityRow
            :values="getPeriodShotAccuracy(p[3])"
            :formatter="(n) => n.toFixed(1)"
            :percentage="true"
          />
          <ActivityRow :values="[p[3].home.corners.length, p[3].away.corners.length]" />
          <ActivityRow
            :values="[p[3].home.offsides?.length ?? 0, p[3].away.offsides?.length ?? 0]"
          />
          <ActivityRow :values="[p[3].home.freekicks.length, p[3].away.freekicks.length]" />
          <ActivityRow :values="[p[3].home.penalties.length, p[3].away.penalties.length]" />
          <ActivityRow
            :values="firstTwo(getPeriodPossession(p[3]))"
            :percentage="true"
            :formatter="(n) => n.toFixed(1)"
          />
          <ActivityRow
            :values="firstTwo(chunk(getPeriodPossession(p[3]))[1])"
            :formatter="msToTimeString"
          />
          <ActivityRow :values="[p[3].home.touches.length, p[3].away.touches.length]" />
          <ActivityRow
            :values="getPeriodPassAcc(p[3])"
            :formatter="(n) => n.toFixed(1)"
            percentage
          />
          <ActivityRow :values="getPeriodPasses(p[3])" />
          <template v-for="(l, j) in [3, 5, 7]" v-bind:key="j">
            <ActivityRow
              :values="
                firstTwo(
                  getPeriodPassStrings(p[3])
                    .slice(0, 2)
                    .map((x) => (x as number[])[l]),
                )
              "
            />
          </template>
          <ActivityRow :values="getLongestString(p[3])" />
          <ActivityRow
            :values="getPeriodPassStrings(p[3]).slice(2, 4) as [number, number]"
            :formatter="(n) => n.toFixed(1)"
          />
          <ActivityRow :values="[p[3].home.yellowCards.length, p[3].away.yellowCards.length]" />
          <ActivityRow :values="[p[3].home.redCards.length, p[3].away.redCards.length]" />
        </div>

        <!-- Total -->
        <div class="column">
          <svg height="100" width="100"></svg>
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'goals'),
              getMatchTotalStat(props.match, 'away', 'goals'),
            ]"
          />
          <ActivityRow :values="getMatchShots(props.match)" />
          <ActivityRow
            :values="getMatchShotAccuracy(props.match)"
            :formatter="(n) => n.toFixed(1)"
            percentage
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'corners'),
              getMatchTotalStat(props.match, 'away', 'corners'),
            ]"
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'offsides'),
              getMatchTotalStat(props.match, 'away', 'offsides'),
            ]"
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'freekicks'),
              getMatchTotalStat(props.match, 'away', 'freekicks'),
            ]"
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'penalties'),
              getMatchTotalStat(props.match, 'away', 'penalties'),
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
              getMatchTotalStat(props.match, 'home', 'touches'),
              getMatchTotalStat(props.match, 'away', 'touches'),
            ]"
          />
          <ActivityRow
            :values="getMatchPassAcc(props.match)"
            percentage
            :formatter="(n) => n.toFixed(1)"
          />
          <ActivityRow :values="getMatchPasses(props.match)" />
          <template v-for="(l, j) in [3, 5, 7]" v-bind:key="j">
            <ActivityRow :values="firstTwo(getMatchPassStrings(props.match).map((x) => x[l]))" />
          </template>
          <ActivityRow :values="getLongestStringMatch(props.match)" />
          <ActivityRow
            :values="getMatchAveragePassStrings(props.match)"
            :formatter="(n) => n.toFixed(1)"
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'yellowCards'),
              getMatchTotalStat(props.match, 'away', 'yellowCards'),
            ]"
          />
          <ActivityRow
            :values="[
              getMatchTotalStat(props.match, 'home', 'redCards'),
              getMatchTotalStat(props.match, 'away', 'redCards'),
            ]"
          />
        </div>
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

.columns .column:first-child {
  background: var(--color-bg);
  position: sticky;
}
.column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.column svg {
  border-left: 1px dashed #999;
  flex-grow: 0;
  flex-shrink: 0;
  margin-bottom: 1em;
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

.outerWrapper {
  width: 100%;
  display: flex;
  overflow-x: auto;
  justify-content: space-around;
  margin-bottom: 2em;
}

.innerWrapper {
  display: inline-block;
  width: auto;
}

svg,
.placeholder {
  height: 8em;
}
svg,
.placeholder,
.row {
  width: 8em;
  overflow: hidden;
}
.row {
  display: flex;
}
.row span {
  text-align: right;
  width: 50%;
  padding: 0px 2px;
}
.row span:nth-child(2) {
  text-align: left;
}
.row span:first-child {
  border-right: 1px solid var(--color-border-hover);
}
</style>
